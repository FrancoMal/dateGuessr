import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  AnioDrillOptions,
  DrillInfo,
  DrillQuestion,
  MONTH_CODES,
  MONTH_NAMES,
  generateDrillQuestion,
  getDrillInfo
} from '../../../core/engine/date-engine';
import { DrillStatsService, DrillStatsSummary } from '../../../core/services/drill-stats.service';
import { safeSetItem } from '../../../core/services/safe-storage';

interface SessionStats {
  attempts: number;
  correct: number;
  streak: number;
  bestStreak: number;
  totalTimeMs: number;
}

interface YearPreset {
  label: string;
  min: number;
  max: number;
}

/** Rango de años del drill `anio` persistido como JSON {min, max}. */
const ANIO_RANGE_KEY = 'dg.drills.anio.range';
const ANIO_DEFAULT_MIN = 1900;
const ANIO_DEFAULT_MAX = 2099;

const HELP_TEXT: Record<string, string[]> = {
  dia: [
    'Cualquier día del mes (1–31) se reduce a un número de 0 a 6 restando múltiplos de 7.',
    'Restale el múltiplo más grande que entre: 28, 21, 14 o 7. Por ejemplo: 26 − 21 = 5.',
    'Si el día ya es menor que 7 (como el 5), no hay nada que restar: queda igual.'
  ],
  mes: [
    'Cada mes tiene un código fijo de 0 a 6 que hay que memorizar.',
    'Agrupalos para recordarlos: Enero y Octubre valen 0 · Febrero, Marzo y Noviembre valen 3 · Abril y Julio valen 6 · Septiembre y Diciembre valen 5 · Mayo 1, Junio 4, Agosto 2.'
  ],
  anio: [
    'El Número del año junta tres piezas: A (últimas 2 cifras del año), Q (los cuartos: A ÷ 4 sin resto) y C (código del siglo).',
    'La clave es reducir cada pieza mod 7 apenas la calculás, para trabajar siempre con números chicos.',
    'Ejemplo con 1987: A = 87 → 87 − 84 = 3 · Q = 87÷4 = 21 → 21 − 21 = 0 · C(19xx) = 0 → N = 3 + 0 + 0 = 3.',
    'Códigos de siglo: 1600s→6, 1700s→4, 1800s→2, 1900s→0, y el patrón se repite: 2000s→6, 2100s→4…'
  ],
  bisiesto: [
    'Se resta 1 sólo si se cumplen LAS DOS condiciones: el año es bisiesto Y el mes es enero o febrero.',
    'Bisiesto: divisible por 4, salvo los divisibles por 100 que no lo sean por 400. 1900 no fue bisiesto; 2000 sí.',
    'La trampa típica: año bisiesto pero mes de marzo en adelante → NO se ajusta.'
  ],
  mod7: [
    'Para reducir un número mod 7, restale el múltiplo de 7 más cercano por debajo: 7, 14, 21, 28, 35, 42, 49 o 56.',
    'Ejemplo: 38 − 35 = 3. Con práctica, salen solos.',
    'Este paso es el remate de la fórmula cuando no redujiste antes.'
  ]
};

/**
 * Player genérico `/entrenar/:id`: juega cualquiera de los 5 drills.
 * Enunciado grande, number-pad 0–6 o Sí/No, feedback con desglose del motor,
 * stats de sesión + persistentes y teclado (0–6, S/N, Enter = siguiente).
 */
@Component({
  selector: 'app-drill-player',
  templateUrl: './drill-player.component.html',
  styleUrls: ['./drill-player.component.css']
})
export class DrillPlayerComponent implements OnInit, OnDestroy {
  readonly monthNames = MONTH_NAMES;
  readonly monthCodes = MONTH_CODES;

  drill: DrillInfo | undefined;
  question: DrillQuestion | null = null;
  phase: 'answering' | 'feedback' = 'answering';
  selected: number | null = null;
  isCorrect = false;
  lastTimeMs = 0;
  showHelp = false;

  readonly YEAR_MIN = 1600;
  readonly YEAR_MAX = 2399;

  readonly anioPresets: YearPreset[] = [
    { label: '1900–2099', min: 1900, max: 2099 },
    { label: 'Todos (1600–2399)', min: 1600, max: 2399 }
  ];

  /** Sólo para el drill `anio`: rango de años configurable (persistido). */
  anioMin = ANIO_DEFAULT_MIN;
  anioMax = ANIO_DEFAULT_MAX;

  session: SessionStats = this.emptySession();
  persisted!: DrillStatsSummary;

  private questionStart = 0;
  private sub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private drillStats: DrillStatsService
  ) {}

  ngOnInit(): void {
    this.sub = this.route.paramMap.subscribe(params => {
      this.drill = getDrillInfo(params.get('id') ?? '');
      this.session = this.emptySession();
      this.loadAnioRange();
      this.showHelp = false;
      if (this.drill) {
        this.persisted = this.drillStats.getSummary(this.drill.id);
        this.next();
      } else {
        this.question = null;
      }
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  get accentColor(): string {
    return this.drill ? `var(--c-${this.drill.piece})` : 'var(--primary)';
  }

  get helpParagraphs(): string[] {
    return this.drill ? HELP_TEXT[this.drill.id] ?? [] : [];
  }

  get sessionAvgMs(): number {
    return this.session.attempts > 0
      ? Math.round(this.session.totalTimeMs / this.session.attempts)
      : 0;
  }

  get keysHint(): string {
    if (!this.question) {
      return '';
    }
    return this.question.answerType === 'yesno'
      ? 'Teclas: S = Sí · N = No · Enter = siguiente'
      : 'Teclas: 0–6 · Enter = siguiente';
  }

  private emptySession(): SessionStats {
    return { attempts: 0, correct: 0, streak: 0, bestStreak: 0, totalTimeMs: 0 };
  }

  private anioOptions(): AnioDrillOptions | undefined {
    if (this.drill?.id !== 'anio') {
      return undefined;
    }
    return { minYear: this.anioMin, maxYear: this.anioMax };
  }

  next(): void {
    if (!this.drill) {
      return;
    }
    this.question = generateDrillQuestion(this.drill.id, this.anioOptions());
    this.phase = 'answering';
    this.selected = null;
    this.questionStart = Date.now();
  }

  answer(value: number): void {
    if (!this.drill || !this.question || this.phase !== 'answering') {
      return;
    }
    this.lastTimeMs = Date.now() - this.questionStart;
    this.selected = value;
    this.isCorrect = value === this.question.answer;
    this.phase = 'feedback';

    // Sesión
    this.session.attempts++;
    this.session.totalTimeMs += this.lastTimeMs;
    if (this.isCorrect) {
      this.session.correct++;
      this.session.streak++;
      if (this.session.streak > this.session.bestStreak) {
        this.session.bestStreak = this.session.streak;
      }
    } else {
      this.session.streak = 0;
    }

    // Persistente
    this.drillStats.registerAnswer(this.drill.id, this.isCorrect, this.lastTimeMs);
    this.persisted = this.drillStats.getSummary(this.drill.id);
  }

  /**
   * Cambio en los inputs Desde/Hasta: normaliza (vacío/NaN → defaults,
   * clamp a 1600–2399, si desde > hasta se intercambian), persiste y
   * regenera la pregunta actual si todavía no fue respondida.
   */
  onAnioRangeChange(): void {
    // Input vacío o inválido: ngModel entrega null en runtime → restaurar los
    // defaults (Number(null) es 0, no NaN, así que hay que detectarlo antes).
    const rawMin = this.anioMin as number | null;
    const rawMax = this.anioMax as number | null;
    let min = rawMin == null ? ANIO_DEFAULT_MIN : Math.floor(Number(rawMin));
    let max = rawMax == null ? ANIO_DEFAULT_MAX : Math.floor(Number(rawMax));
    if (!Number.isFinite(min)) {
      min = ANIO_DEFAULT_MIN;
    }
    if (!Number.isFinite(max)) {
      max = ANIO_DEFAULT_MAX;
    }
    min = Math.min(Math.max(min, this.YEAR_MIN), this.YEAR_MAX);
    max = Math.min(Math.max(max, this.YEAR_MIN), this.YEAR_MAX);
    if (min > max) {
      const t = min;
      min = max;
      max = t;
    }
    this.anioMin = min;
    this.anioMax = max;
    this.saveAnioRange();
    if (this.phase === 'answering') {
      this.next();
    }
  }

  applyAnioPreset(preset: YearPreset): void {
    this.anioMin = preset.min;
    this.anioMax = preset.max;
    this.saveAnioRange();
    if (this.phase === 'answering') {
      this.next();
    }
  }

  /** Lee el rango persistido; datos corruptos o fuera de rango → defaults silenciosos. */
  private loadAnioRange(): void {
    this.anioMin = ANIO_DEFAULT_MIN;
    this.anioMax = ANIO_DEFAULT_MAX;
    try {
      const raw = localStorage.getItem(ANIO_RANGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as { min?: unknown; max?: unknown } | null;
      const min = Number(parsed?.min);
      const max = Number(parsed?.max);
      if (Number.isInteger(min) && Number.isInteger(max)
        && min >= this.YEAR_MIN && max <= this.YEAR_MAX && min <= max) {
        this.anioMin = min;
        this.anioMax = max;
      }
    } catch {
      // datos corruptos → seguir con los defaults
    }
  }

  private saveAnioRange(): void {
    safeSetItem(ANIO_RANGE_KEY, JSON.stringify({ min: this.anioMin, max: this.anioMax }));
  }

  answerLabel(value: number): string {
    if (this.question?.answerType === 'yesno') {
      return value === 1 ? 'Sí' : 'No';
    }
    return `${value}`;
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }
    if (this.showHelp) {
      if (event.key === 'Escape') {
        this.showHelp = false;
      }
      return;
    }
    const target = event.target as HTMLElement | null;
    const tag = target ? target.tagName : '';
    // Con el foco en un campo de entrada (los inputs Desde/Hasta del rango,
    // incluido type=number) el teclado es del campo: tipear dígitos, Espacio
    // o Enter no debe responder la pregunta ni avanzar.
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
      return;
    }
    if (!this.drill || !this.question) {
      return;
    }

    if (this.phase === 'feedback' && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      this.next();
      return;
    }
    if (this.phase !== 'answering') {
      return;
    }
    if (this.question.answerType === 'number' && /^[0-6]$/.test(event.key)) {
      event.preventDefault();
      this.answer(+event.key);
    } else if (this.question.answerType === 'yesno') {
      const key = event.key.toLowerCase();
      if (key === 's') {
        event.preventDefault();
        this.answer(1);
      } else if (key === 'n') {
        event.preventDefault();
        this.answer(0);
      }
    }
  }
}

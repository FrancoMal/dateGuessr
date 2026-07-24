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

interface SessionStats {
  attempts: number;
  correct: number;
  streak: number;
  bestStreak: number;
  totalTimeMs: number;
}

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

  /** Sólo para el drill `anio`: rango extendido 1600–2399. */
  allCenturies = false;

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
      this.allCenturies = false;
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
    return this.allCenturies ? { minYear: 1600, maxYear: 2399 } : undefined;
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

  onRangeToggle(): void {
    if (this.phase === 'answering') {
      this.next();
    }
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
    const inputType = tag === 'INPUT' ? (target as HTMLInputElement).type : '';
    const isCheckbox = inputType === 'checkbox' || inputType === 'radio';
    // Solo la entrada de texto retiene el teclado; el checkbox de rango
    // enfocado no debe dejar muertos los atajos 0–6 / S/N / Enter.
    if (tag === 'TEXTAREA' || tag === 'SELECT' || (tag === 'INPUT' && !isCheckbox)) {
      return;
    }
    // Espacio con el checkbox enfocado: dejar que actúe el toggle nativo.
    if (isCheckbox && event.key === ' ') {
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

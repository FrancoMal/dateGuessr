import { Component, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DateBreakdown, getDateBreakdown, WEEKDAY_NAMES } from '../../core/engine/date-engine';
import { ScoreService } from '../../core/services/score.service';
import { HistoryService } from '../../core/services/history.service';
import { HistoricalDatesService } from '../../core/services/historical-dates.service';
import { HistoricalDate } from '../../data/historical-dates';
import { ScoreStripComponent } from '../../shared/components/score-strip/score-strip.component';

interface YearPreset {
  label: string;
  min: number;
  max: number;
}

/**
 * Práctica completa `/practica`:
 * fecha aleatoria por rango (o histórica), cronómetro, consejo con la fórmula
 * reducida del motor, botonera de días con atajos de teclado, feedback con
 * desglose (ambos caminos), puntos y registro en history/score services.
 */
@Component({
  selector: 'app-practice-page',
  templateUrl: './practice-page.component.html',
  styleUrls: ['./practice-page.component.css']
})
export class PracticePageComponent implements OnDestroy {
  readonly YEAR_MIN = 1600;
  readonly YEAR_MAX = 2399;

  readonly presets: YearPreset[] = [
    { label: '1900–2000', min: 1900, max: 2000 },
    { label: '2000–2100', min: 2000, max: 2100 },
    { label: 'Todos (1600–2399)', min: 1600, max: 2399 }
  ];

  /** Atajos de teclado → índice de día (0=Domingo … 6=Sábado). */
  private readonly keyToDay: Record<string, number> = {
    D: 0, L: 1, M: 2, X: 3, J: 4, V: 5, S: 6,
    '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6
  };

  // --- Configuración ---
  minYear = 1900;
  maxYear = 2100;
  historicalMode = false;
  showHints = false;

  // --- Estado de la pregunta ---
  currentDate: Date | null = null;
  breakdown: DateBreakdown | null = null;
  historicalEvent: HistoricalDate | null = null;
  answered = false;
  selectedIndex: number | null = null;
  isCorrect = false;
  pointsEarned = 0;
  responseTimeMs = 0;
  elapsedMs = 0;

  private questionStart = 0;
  private timerId: ReturnType<typeof setInterval> | null = null;

  @ViewChild(ScoreStripComponent) private scoreStrip?: ScoreStripComponent;

  constructor(
    private scoreService: ScoreService,
    private historyService: HistoryService,
    private historicalService: HistoricalDatesService,
    private datePipe: DatePipe
  ) {}

  ngOnDestroy(): void {
    this.stopTimer();
  }

  // -------------------------------------------------------------------------
  // Configuración
  // -------------------------------------------------------------------------

  applyPreset(preset: YearPreset): void {
    this.minYear = preset.min;
    this.maxYear = preset.max;
  }

  /** Normaliza el rango: enteros dentro de 1600–2399, min ≤ max. */
  clampRange(): void {
    // Input vacío o inválido: ngModel entrega null en runtime → restaurar los
    // defaults (Number(null) es 0, no NaN, así que hay que detectarlo antes).
    const rawMin = this.minYear as number | null;
    const rawMax = this.maxYear as number | null;
    let min = rawMin == null ? 1900 : Math.floor(Number(rawMin));
    let max = rawMax == null ? 2100 : Math.floor(Number(rawMax));
    if (!Number.isFinite(min)) {
      min = 1900;
    }
    if (!Number.isFinite(max)) {
      max = 2100;
    }
    min = Math.min(Math.max(min, this.YEAR_MIN), this.YEAR_MAX);
    max = Math.min(Math.max(max, this.YEAR_MIN), this.YEAR_MAX);
    if (min > max) {
      const t = min;
      min = max;
      max = t;
    }
    this.minYear = min;
    this.maxYear = max;
  }

  /** Cambio del toggle histórico: si hay pregunta sin responder, regenera. */
  setHistoricalMode(value: boolean): void {
    this.historicalMode = value;
    if (this.currentDate && !this.answered) {
      this.newDate();
    }
  }

  // -------------------------------------------------------------------------
  // Ciclo de juego
  // -------------------------------------------------------------------------

  /** Genera la siguiente fecha (aleatoria por rango o histórica). */
  newDate(): void {
    this.historicalEvent = null;

    if (this.historicalMode) {
      const historical = this.historicalService.getRandomDate();
      if (!historical) {
        return;
      }
      this.historicalEvent = historical; // se revela recién al responder
      this.currentDate = historical.date;
    } else {
      this.clampRange();
      this.currentDate = this.randomDate(this.minYear, this.maxYear);
    }

    const d = this.currentDate;
    this.breakdown = getDateBreakdown(d.getDate(), d.getMonth() + 1, d.getFullYear());
    this.answered = false;
    this.selectedIndex = null;
    this.isCorrect = false;
    this.pointsEarned = 0;
    this.responseTimeMs = 0;
    this.startTimer();
  }

  onDaySelected(index: number): void {
    if (this.answered || !this.breakdown) {
      return;
    }
    this.stopTimer();
    this.responseTimeMs = Date.now() - this.questionStart;
    this.elapsedMs = this.responseTimeMs;
    this.selectedIndex = index;
    this.answered = true;
    this.isCorrect = index === this.breakdown.resultIndex;

    const result = this.scoreService.registerAnswer(this.isCorrect, this.responseTimeMs);
    this.pointsEarned = result.pointsEarned;

    this.historyService.addRecord({
      date: this.datePipe.transform(this.currentDate, 'dd/MM/yyyy') || '',
      userAnswer: WEEKDAY_NAMES[index],
      correctAnswer: this.breakdown.resultName,
      isCorrect: this.isCorrect,
      responseTimeMs: this.responseTimeMs
    });

    if (this.historicalMode && this.historicalEvent) {
      this.historicalService.markAsPlayed(this.historicalEvent.id);
    }

    this.scoreStrip?.refresh();
  }

  // -------------------------------------------------------------------------
  // Teclado: L,M,X,J,V,S,D para responder; Enter/Espacio para seguir
  // -------------------------------------------------------------------------

  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }
    // Diálogo de "Reiniciar puntaje" abierto: ningún atajo aplica
    // (Escape lo maneja el propio score-strip).
    if (this.scoreStrip && this.scoreStrip.showResetDialog) {
      return;
    }
    const target = event.target as HTMLElement | null;
    const tag = target ? target.tagName : '';
    const inputType = tag === 'INPUT' ? (target as HTMLInputElement).type : '';
    const isCheckbox = inputType === 'checkbox' || inputType === 'radio';
    // Solo la entrada de texto retiene el teclado; un checkbox enfocado
    // (los toggles) no debe dejar muertos los atajos.
    if (tag === 'TEXTAREA' || tag === 'SELECT' || (tag === 'INPUT' && !isCheckbox)) {
      return;
    }
    // Espacio con un checkbox enfocado: dejar que actúe el toggle nativo.
    if (isCheckbox && event.key === ' ') {
      return;
    }

    const isAdvanceKey = event.key === 'Enter' || event.key === ' ';

    // Sin pregunta activa o ya respondida: Enter/Espacio genera la siguiente.
    if (!this.currentDate || this.answered) {
      if (isAdvanceKey) {
        // Si el foco está en un botón/link, dejamos que actúe él solo.
        if (tag === 'BUTTON' || tag === 'A') {
          return;
        }
        event.preventDefault();
        this.newDate();
      }
      return;
    }

    // Pregunta activa: atajos de días.
    const index = this.keyToDay[event.key.toUpperCase()];
    if (index !== undefined) {
      event.preventDefault();
      this.onDaySelected(index);
    }
  }

  // -------------------------------------------------------------------------
  // Internos
  // -------------------------------------------------------------------------

  private randomDate(minYear: number, maxYear: number): Date {
    const year = this.randInt(minYear, maxYear);
    const month = this.randInt(1, 12);
    const daysInMonth = new Date(year, month, 0).getDate();
    const day = this.randInt(1, daysInMonth);
    return new Date(year, month - 1, day);
  }

  private randInt(min: number, max: number): number {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  private startTimer(): void {
    this.stopTimer();
    this.questionStart = Date.now();
    this.elapsedMs = 0;
    this.timerId = setInterval(() => {
      this.elapsedMs = Date.now() - this.questionStart;
    }, 200);
  }

  private stopTimer(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}

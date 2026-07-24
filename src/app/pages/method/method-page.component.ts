import { Component } from '@angular/core';
import {
  CENTURY_PATTERN,
  DateBreakdown,
  MONTH_CODES,
  MONTH_NAMES,
  WEEKDAY_NAMES,
  getDateBreakdown
} from '../../core/engine/date-engine';

interface CenturyRow {
  range: string;
  code: number;
}

const MIN_YEAR = 1600;
const MAX_YEAR = 2399;

/**
 * Guía del método `/metodo`: la fórmula con sus tablas, la técnica de restar
 * los 7 temprano (ancla `#tecnica`), el ajuste bisiesto y un ejemplo
 * interactivo con desglose en vivo del motor.
 */
@Component({
  selector: 'app-method-page',
  templateUrl: './method-page.component.html',
  styleUrls: ['./method-page.component.css']
})
export class MethodPageComponent {
  readonly monthNames = MONTH_NAMES;
  readonly monthCodes = MONTH_CODES;
  readonly weekdays = WEEKDAY_NAMES;
  readonly minYear = MIN_YEAR;
  readonly maxYear = MAX_YEAR;

  /** Filas de la tabla de siglos 1600–2399 (el patrón 6-4-2-0 cicla cada 4). */
  readonly centuryRows: CenturyRow[] = (() => {
    const rows: CenturyRow[] = [];
    for (let c = 16; c <= 23; c++) {
      rows.push({ range: `${c}00–${c}99`, code: CENTURY_PATTERN[(c - 16) % 4] });
    }
    return rows;
  })();

  /** Ejemplo guía de la técnica: 20/07/1969. */
  readonly exampleBreakdown: DateBreakdown = getDateBreakdown(20, 7, 1969);

  // --- Ejemplo interactivo ---
  day: number;
  month: number;
  year: number;
  liveBreakdown: DateBreakdown | null = null;
  liveError: string | null = null;

  constructor() {
    const today = new Date();
    this.day = today.getDate();
    this.month = today.getMonth() + 1;
    this.year = today.getFullYear();
    this.recompute();
  }

  recompute(): void {
    this.liveBreakdown = null;
    this.liveError = null;

    const day = Math.floor(Number(this.day));
    const month = Math.floor(Number(this.month));
    const year = Math.floor(Number(this.year));

    if (!day || !month || !year) {
      this.liveError = 'Completá día, mes y año.';
      return;
    }
    if (year < MIN_YEAR || year > MAX_YEAR) {
      this.liveError = `Ingresá un año entre ${MIN_YEAR} y ${MAX_YEAR}.`;
      return;
    }
    if (month < 1 || month > 12) {
      this.liveError = 'El mes tiene que estar entre 1 y 12.';
      return;
    }
    const maxDay = new Date(year, month, 0).getDate();
    if (day < 1 || day > maxDay) {
      this.liveError = `${MONTH_NAMES[month - 1]} de ${year} tiene ${maxDay} días.`;
      return;
    }
    this.liveBreakdown = getDateBreakdown(day, month, year);
  }
}

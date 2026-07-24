import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WEEKDAY_NAMES } from '../../../core/engine/date-engine';

/**
 * Botonera reutilizable de los 7 días de la semana.
 * Estados por botón: normal / correcto / incorrecto / deshabilitado.
 * Muestra opcionalmente las teclas de atajo (D L M X J V S) en desktop.
 */
@Component({
  selector: 'app-weekday-pad',
  templateUrl: './weekday-pad.component.html',
  styleUrls: ['./weekday-pad.component.css']
})
export class WeekdayPadComponent {
  readonly days: readonly string[] = WEEKDAY_NAMES;
  /** Teclas de atajo, en el mismo orden que WEEKDAY_NAMES (0=Domingo … 6=Sábado). */
  readonly keys: readonly string[] = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

  /** Deshabilita toda la botonera (tras responder). */
  @Input() disabled = false;
  /** Índice del día correcto a resaltar (null = todavía sin resolver). */
  @Input() correctIndex: number | null = null;
  /** Índice elegido por el usuario (se marca incorrecto si difiere del correcto). */
  @Input() selectedIndex: number | null = null;
  /** Muestra las teclas de atajo sobre cada botón (solo desktop, vía CSS). */
  @Input() showKeys = false;

  @Output() daySelected = new EventEmitter<number>();

  pick(index: number): void {
    if (!this.disabled) {
      this.daySelected.emit(index);
    }
  }

  stateOf(index: number): 'correct' | 'incorrect' | 'normal' {
    if (this.correctIndex !== null && index === this.correctIndex) {
      return 'correct';
    }
    if (
      this.selectedIndex !== null &&
      index === this.selectedIndex &&
      this.selectedIndex !== this.correctIndex
    ) {
      return 'incorrect';
    }
    return 'normal';
  }
}

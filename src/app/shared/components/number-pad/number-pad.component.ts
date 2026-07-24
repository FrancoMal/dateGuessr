import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface PadOption {
  value: number;
  label: string;
  aria: string;
}

const NUMBER_OPTIONS: PadOption[] = [0, 1, 2, 3, 4, 5, 6].map(n => ({
  value: n,
  label: `${n}`,
  aria: `Responder ${n}`
}));

const YESNO_OPTIONS: PadOption[] = [
  { value: 1, label: 'Sí', aria: 'Responder Sí' },
  { value: 0, label: 'No', aria: 'Responder No' }
];

/**
 * Botonera de respuesta para los drills: 0–6 (`mode="number"`)
 * o Sí/No (`mode="yesno"`).
 *
 * En feedback: pasá `correctValue` (resalta el botón correcto) y
 * `selectedValue` (marca en rojo la elección incorrecta).
 * El color de acento se hereda por la variable CSS `--accent` del contenedor.
 */
@Component({
  selector: 'app-number-pad',
  templateUrl: './number-pad.component.html',
  styleUrls: ['./number-pad.component.css']
})
export class NumberPadComponent {
  @Input() mode: 'number' | 'yesno' = 'number';
  @Input() disabled = false;
  /** Valor correcto a resaltar durante el feedback (null = sin feedback). */
  @Input() correctValue: number | null = null;
  /** Valor elegido por el usuario (para marcar el error). */
  @Input() selectedValue: number | null = null;
  @Output() pick = new EventEmitter<number>();

  get options(): PadOption[] {
    return this.mode === 'yesno' ? YESNO_OPTIONS : NUMBER_OPTIONS;
  }

  get groupLabel(): string {
    return this.mode === 'yesno' ? 'Respuesta: Sí o No' : 'Respuesta: 0 a 6';
  }

  onPick(value: number): void {
    if (!this.disabled) {
      this.pick.emit(value);
    }
  }
}

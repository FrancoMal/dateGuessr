import { Component, Input } from '@angular/core';
import { BreakdownLine, DateBreakdown } from '../../../core/engine/date-engine';

/**
 * Desglose paso a paso coloreado por pieza de la fórmula.
 * - `breakdown`: fecha completa → muestra AMBOS caminos (reducido resaltado como recomendado).
 * - `lines`: lista simple de pasos (para los drills).
 */
@Component({
  selector: 'app-breakdown-panel',
  templateUrl: './breakdown-panel.component.html',
  styleUrls: ['./breakdown-panel.component.css']
})
export class BreakdownPanelComponent {
  @Input() breakdown: DateBreakdown | null = null;
  @Input() lines: BreakdownLine[] | null = null;
  @Input() title = 'Desglose';
}

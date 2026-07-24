import { Component, Input } from '@angular/core';

/**
 * Tarjeta de modo o drill: ícono, título, descripción y acento de color.
 * Contenido extra (badges, stats) por ng-content.
 */
@Component({
  selector: 'app-mode-card',
  templateUrl: './mode-card.component.html',
  styleUrls: ['./mode-card.component.css']
})
export class ModeCardComponent {
  @Input() icon = '';
  @Input() title = '';
  @Input() description = '';
  /** Color de acento (cualquier valor CSS, ej. 'var(--c-dia)'). */
  @Input() accent = 'var(--primary)';
  /** Destino routerLink; si es null la tarjeta no es clickeable. */
  @Input() link: string | any[] | null = null;
}

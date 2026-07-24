import { Component, Input } from '@angular/core';

/** Chip compacto de estadística: etiqueta + valor (+ ícono y acento opcionales). */
@Component({
  selector: 'app-stat-chip',
  template: `
    <div class="stat-chip" [style.--accent]="accent">
      <span class="chip-icon" *ngIf="icon" aria-hidden="true">{{ icon }}</span>
      <span class="chip-value">{{ value }}</span>
      <span class="chip-label">{{ label }}</span>
    </div>
  `,
  styles: [`
    .stat-chip {
      --accent: var(--primary);
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 10px 16px;
      min-width: 84px;
    }
    .chip-icon {
      font-size: 1rem;
      line-height: 1;
    }
    .chip-value {
      font-family: var(--font-mono);
      font-size: 1.15rem;
      font-weight: 600;
      color: var(--accent);
      line-height: 1.2;
    }
    .chip-label {
      font-size: 0.7rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted);
    }
  `]
})
export class StatChipComponent {
  @Input() label = '';
  @Input() value: string | number = '';
  @Input() icon = '';
  /** Color del valor (cualquier valor CSS). */
  @Input() accent = 'var(--primary)';
}

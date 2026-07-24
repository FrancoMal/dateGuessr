import { Component, Input } from '@angular/core';

/** Racha con llamita: apagada en 0, encendida y animada cuando hay racha. */
@Component({
  selector: 'app-streak-flame',
  template: `
    <div class="streak-flame" [class.lit]="streak > 0" [attr.aria-label]="label + ': ' + streak">
      <span class="flame" aria-hidden="true">🔥</span>
      <span class="streak-value">{{ streak }}</span>
      <span class="streak-label">{{ label }}</span>
    </div>
  `,
  styles: [`
    .streak-flame {
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
    .flame {
      font-size: 1rem;
      line-height: 1;
      filter: grayscale(1);
      opacity: 0.45;
      transition: filter var(--transition-normal), opacity var(--transition-normal),
        transform var(--transition-normal);
    }
    .lit .flame {
      filter: none;
      opacity: 1;
      animation: pop 0.3s ease;
    }
    .streak-value {
      font-family: var(--font-mono);
      font-size: 1.15rem;
      font-weight: 600;
      color: var(--text);
      line-height: 1.2;
    }
    .lit .streak-value {
      color: var(--c-resultado);
    }
    .streak-label {
      font-size: 0.7rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted);
    }
  `]
})
export class StreakFlameComponent {
  @Input() streak = 0;
  @Input() label = 'Racha';
}

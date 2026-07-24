import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ScoreData, ScoreService } from '../../../core/services/score.service';

/**
 * Franja de puntaje: puntaje / racha / mejor racha / aciertos,
 * banner de nuevo récord y botón "Reiniciar" con confirmación.
 * El reinicio por defecto usa resetSession() (preserva la mejor racha);
 * "Borrar todo" es la acción secundaria dentro del diálogo.
 */
@Component({
  selector: 'app-score-strip',
  templateUrl: './score-strip.component.html',
  styleUrls: ['./score-strip.component.css']
})
export class ScoreStripComponent implements OnInit, OnDestroy {
  scoreData!: ScoreData;
  showRecordBanner = false;
  showResetDialog = false;

  private sub!: Subscription;
  private bannerTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private scoreService: ScoreService) {}

  ngOnInit(): void {
    this.scoreData = this.scoreService.get();
    this.sub = this.scoreService.newRecord$.subscribe(() => {
      this.refresh();
      this.showRecordBanner = true;
      if (this.bannerTimer) {
        clearTimeout(this.bannerTimer);
      }
      this.bannerTimer = setTimeout(() => {
        this.showRecordBanner = false;
      }, 3000);
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    if (this.bannerTimer) {
      clearTimeout(this.bannerTimer);
    }
  }

  /** Refresca los datos desde el servicio (llamar tras registrar una respuesta). */
  refresh(): void {
    this.scoreData = this.scoreService.get();
  }

  get accuracyPercent(): number {
    if (this.scoreData.totalAnswered === 0) {
      return 0;
    }
    return Math.round((this.scoreData.totalCorrect / this.scoreData.totalAnswered) * 100);
  }

  /** Escape cierra el diálogo (mismo patrón que la ayuda del drill-player). */
  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.showResetDialog) {
      this.cancelReset();
    }
  }

  openResetDialog(): void {
    this.showResetDialog = true;
  }

  cancelReset(): void {
    this.showResetDialog = false;
  }

  /** Acción principal: reinicia sesión preservando la mejor racha. */
  confirmResetSession(): void {
    this.scoreService.resetSession();
    this.refresh();
    this.showResetDialog = false;
  }

  /** Acción secundaria: borra todo, incluida la mejor racha. */
  confirmResetAll(): void {
    this.scoreService.reset();
    this.refresh();
    this.showResetDialog = false;
  }
}

import { Injectable } from '@angular/core';
import { DrillId } from '../engine/date-engine';
import { safeRemoveItem, safeSetItem } from './safe-storage';

export interface DrillStats {
  attempts: number;
  correct: number;
  streak: number;
  bestStreak: number;
  totalTimeMs: number;
}

export interface DrillStatsSummary extends DrillStats {
  /** Porcentaje de aciertos (0–100), 0 si no hay intentos. */
  accuracy: number;
  /** Tiempo promedio de respuesta en ms, 0 si no hay intentos. */
  avgTimeMs: number;
}

const EMPTY_STATS: DrillStats = {
  attempts: 0,
  correct: 0,
  streak: 0,
  bestStreak: 0,
  totalTimeMs: 0
};

/**
 * Métricas persistentes por drill. Claves localStorage: `dg.drills.<id>`.
 */
@Injectable({
  providedIn: 'root'
})
export class DrillStatsService {

  private key(id: DrillId): string {
    return `dg.drills.${id}`;
  }

  get(id: DrillId): DrillStats {
    try {
      const raw = localStorage.getItem(this.key(id));
      if (raw) {
        return { ...EMPTY_STATS, ...JSON.parse(raw) };
      }
    } catch {
      // datos corruptos → empezar de cero
    }
    return { ...EMPTY_STATS };
  }

  getSummary(id: DrillId): DrillStatsSummary {
    const stats = this.get(id);
    return {
      ...stats,
      accuracy: stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0,
      avgTimeMs: stats.attempts > 0 ? Math.round(stats.totalTimeMs / stats.attempts) : 0
    };
  }

  registerAnswer(id: DrillId, isCorrect: boolean, responseTimeMs: number): DrillStats {
    const stats = this.get(id);
    stats.attempts++;
    stats.totalTimeMs += Math.max(0, responseTimeMs);
    if (isCorrect) {
      stats.correct++;
      stats.streak++;
      if (stats.streak > stats.bestStreak) {
        stats.bestStreak = stats.streak;
      }
    } else {
      stats.streak = 0;
    }
    safeSetItem(this.key(id), JSON.stringify(stats));
    return { ...stats };
  }

  reset(id: DrillId): void {
    safeRemoveItem(this.key(id));
  }
}

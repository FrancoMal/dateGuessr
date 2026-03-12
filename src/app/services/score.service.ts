import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ScoreData {
  score: number;
  streak: number;
  bestStreak: number;
  totalAnswered: number;
  totalCorrect: number;
}

@Injectable({
  providedIn: 'root'
})
export class ScoreService {
  private readonly STORAGE_KEY = 'dateGuessr_score';

  private data: ScoreData = this.load();

  /** Emits when the user beats their best streak record */
  newRecord$ = new Subject<number>();

  private load(): ScoreData {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
    return { score: 0, streak: 0, bestStreak: 0, totalAnswered: 0, totalCorrect: 0 };
  }

  private save(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
  }

  get(): ScoreData {
    return { ...this.data };
  }

  getBestStreak(): number {
    return this.data.bestStreak;
  }

  registerAnswer(isCorrect: boolean, responseTimeMs: number): { pointsEarned: number } {
    this.data.totalAnswered++;

    if (isCorrect) {
      this.data.totalCorrect++;
      this.data.streak++;

      const previousBest = this.data.bestStreak;
      if (this.data.streak > this.data.bestStreak) {
        this.data.bestStreak = this.data.streak;
      }

      // Puntos base + bonus por racha + bonus por velocidad
      let points = 10;
      points += Math.min(this.data.streak - 1, 10) * 5; // max +50 por racha
      if (responseTimeMs < 5000) {
        points += 10;
      } else if (responseTimeMs < 10000) {
        points += 5;
      }

      this.data.score += points;
      this.save();

      // Notify if new record was set
      if (this.data.streak > previousBest && previousBest > 0) {
        this.newRecord$.next(this.data.bestStreak);
      }

      return { pointsEarned: points };
    } else {
      this.data.streak = 0;
      this.save();
      return { pointsEarned: 0 };
    }
  }

  resetSession(): void {
    this.data = { score: 0, streak: 0, bestStreak: this.data.bestStreak, totalAnswered: 0, totalCorrect: 0 };
    this.save();
  }

  reset(): void {
    this.data = { score: 0, streak: 0, bestStreak: 0, totalAnswered: 0, totalCorrect: 0 };
    this.save();
  }
}

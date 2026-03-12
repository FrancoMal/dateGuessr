import { Injectable } from '@angular/core';
import { HistoricalDate, HISTORICAL_DATES } from '../data/historical-dates';

const PLAYED_IDS_KEY = 'dateGuessr_historicalPlayedIds';

@Injectable({
  providedIn: 'root'
})
export class HistoricalDatesService {
  private playedIds: number[] = [];

  constructor() {
    this.loadPlayedIds();
  }

  private loadPlayedIds(): void {
    try {
      const stored = localStorage.getItem(PLAYED_IDS_KEY);
      this.playedIds = stored ? JSON.parse(stored) : [];
    } catch {
      this.playedIds = [];
    }
  }

  private savePlayedIds(): void {
    localStorage.setItem(PLAYED_IDS_KEY, JSON.stringify(this.playedIds));
  }

  markAsPlayed(id: number): void {
    if (!this.playedIds.includes(id)) {
      this.playedIds.push(id);
      this.savePlayedIds();
    }
  }

  getRandomDate(): HistoricalDate | null {
    const unplayed = this.getUnplayed(this.playedIds);
    if (unplayed.length === 0) {
      // Reset if all played
      this.playedIds = [];
      this.savePlayedIds();
      return this.getRandomFromArray(HISTORICAL_DATES);
    }
    return this.getRandomFromArray(unplayed);
  }

  getByCategory(category: string): HistoricalDate[] {
    return HISTORICAL_DATES.filter(d => d.category === category);
  }

  getUnplayed(playedIds: number[]): HistoricalDate[] {
    return HISTORICAL_DATES.filter(d => !playedIds.includes(d.id));
  }

  getCategories(): string[] {
    return [...new Set(HISTORICAL_DATES.map(d => d.category))];
  }

  private getRandomFromArray(arr: HistoricalDate[]): HistoricalDate | null {
    if (arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

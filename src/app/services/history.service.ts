import { Injectable } from '@angular/core';
import { GameRecord } from '../models/game-record.model';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private readonly STORAGE_KEY = 'dateGuessr_gameHistory';

  addRecord(record: Omit<GameRecord, 'id' | 'timestamp'>): void {
    const records = this.getAll();
    const newRecord: GameRecord = {
      ...record,
      id: Date.now(),
      timestamp: new Date()
    };
    records.push(newRecord);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
  }

  getAll(): GameRecord[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  getFiltered(onlyErrors: boolean): GameRecord[] {
    const records = this.getAll();
    if (onlyErrors) {
      return records.filter(r => !r.isCorrect);
    }
    return records;
  }

  clearHistory(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  getStats(): { day: string; percentage: number; total: number }[] {
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const records = this.getAll();

    return daysOfWeek.map(day => {
      const dayRecords = records.filter(r => r.correctAnswer === day);
      const correct = dayRecords.filter(r => r.isCorrect).length;
      const total = dayRecords.length;
      return {
        day,
        percentage: total > 0 ? Math.round((correct / total) * 100) : -1,
        total
      };
    });
  }
}

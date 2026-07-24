import { Injectable } from '@angular/core';
import { GameRecord } from '../models/game-record.model';
import { safeRemoveItem, safeSetItem } from './safe-storage';

/**
 * Tope de partidas persistidas: al superarlo se descartan las más viejas.
 * Evita que el historial crezca sin límite (costo lineal por respuesta y
 * riesgo de QuotaExceededError cerca de la cuota de ~5 MB de localStorage).
 */
const MAX_RECORDS = 1000;

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private readonly STORAGE_KEY = 'dateGuessr_gameHistory';

  addRecord(record: Omit<GameRecord, 'id' | 'timestamp'>): void {
    let records = this.getAll();
    const newRecord: GameRecord = {
      ...record,
      id: Date.now(),
      timestamp: new Date()
    };
    records.push(newRecord);
    if (records.length > MAX_RECORDS) {
      records = records.slice(-MAX_RECORDS);
    }
    safeSetItem(this.STORAGE_KEY, JSON.stringify(records));
  }

  getAll(): GameRecord[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      const parsed = data ? JSON.parse(data) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // datos corruptos → historial vacío (no se pisa hasta el próximo addRecord)
      return [];
    }
  }

  getFiltered(onlyErrors: boolean): GameRecord[] {
    const records = this.getAll();
    if (onlyErrors) {
      return records.filter(r => !r.isCorrect);
    }
    return records;
  }

  clearHistory(): void {
    safeRemoveItem(this.STORAGE_KEY);
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

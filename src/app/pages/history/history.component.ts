import { Component, HostListener, OnInit } from '@angular/core';
import { HistoryService } from '../../core/services/history.service';
import { ScoreService } from '../../core/services/score.service';
import { DrillStatsService, DrillStatsSummary } from '../../core/services/drill-stats.service';
import { DRILLS, DrillInfo } from '../../core/engine/date-engine';
import { GameRecord } from '../../core/models/game-record.model';

interface DayStat {
  day: string;
  percentage: number;
  total: number;
}

interface DrillRow {
  info: DrillInfo;
  stats: DrillStatsSummary;
}

/**
 * Historial `/historial`: resumen general, aciertos por día de la semana,
 * stats por drill, tabla de partidas con filtro "solo errores" y
 * borrado del historial con confirmación.
 */
@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  displayRecords: GameRecord[] = [];
  stats: DayStat[] = [];
  drillRows: DrillRow[] = [];
  onlyErrors = false;
  showClearDialog = false;

  totalGames = 0;
  totalCorrect = 0;
  accuracy = 0;
  avgTimeMs = 0;
  bestStreak = 0;

  constructor(
    private historyService: HistoryService,
    private scoreService: ScoreService,
    private drillStats: DrillStatsService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const all = this.historyService.getAll();

    this.totalGames = all.length;
    this.totalCorrect = all.filter(r => r.isCorrect).length;
    this.accuracy = this.totalGames > 0
      ? Math.round((this.totalCorrect / this.totalGames) * 100)
      : 0;
    this.avgTimeMs = this.totalGames > 0
      ? Math.round(all.reduce((sum, r) => sum + r.responseTimeMs, 0) / this.totalGames)
      : 0;
    this.bestStreak = this.scoreService.get().bestStreak;

    this.stats = this.historyService.getStats();
    this.displayRecords = (this.onlyErrors ? all.filter(r => !r.isCorrect) : all)
      .slice()
      .reverse();
    this.drillRows = DRILLS.map(info => ({
      info,
      stats: this.drillStats.getSummary(info.id)
    }));
  }

  toggleFilter(): void {
    this.onlyErrors = !this.onlyErrors;
    this.loadData();
  }

  /** Escape cierra el diálogo (mismo patrón que la ayuda del drill-player). */
  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.showClearDialog) {
      this.cancelClear();
    }
  }

  openClearDialog(): void {
    this.showClearDialog = true;
  }

  cancelClear(): void {
    this.showClearDialog = false;
  }

  confirmClear(): void {
    this.historyService.clearHistory();
    this.showClearDialog = false;
    this.onlyErrors = false;
    this.loadData();
  }

  accent(info: DrillInfo): string {
    return `var(--c-${info.piece})`;
  }

  barClass(stat: DayStat): string {
    if (stat.percentage === -1) {
      return 'stat-none';
    }
    if (stat.percentage >= 75) {
      return 'stat-good';
    }
    if (stat.percentage >= 50) {
      return 'stat-medium';
    }
    return 'stat-bad';
  }

  get hasDrillData(): boolean {
    return this.drillRows.some(row => row.stats.attempts > 0);
  }
}

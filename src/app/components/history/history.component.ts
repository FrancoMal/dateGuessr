import { Component, OnInit } from '@angular/core';
import { HistoryService } from '../../services/history.service';
import { GameRecord } from '../../models/game-record.model';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  records: GameRecord[] = [];
  stats: { day: string; percentage: number; total: number }[] = [];
  onlyErrors = false;

  constructor(private historyService: HistoryService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.records = this.historyService.getFiltered(this.onlyErrors);
    this.stats = this.historyService.getStats();
  }

  toggleFilter(): void {
    this.onlyErrors = !this.onlyErrors;
    this.loadData();
  }

  clearHistory(): void {
    this.historyService.clearHistory();
    this.loadData();
  }
}

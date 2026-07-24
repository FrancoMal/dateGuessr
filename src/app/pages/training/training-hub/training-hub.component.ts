import { Component, OnInit } from '@angular/core';
import { DRILLS, DrillInfo } from '../../../core/engine/date-engine';
import { DrillStatsService, DrillStatsSummary } from '../../../core/services/drill-stats.service';

interface DrillCard {
  info: DrillInfo;
  stats: DrillStatsSummary;
}

/** Hub de entrenamiento `/entrenar`: una tarjeta por drill con sus stats persistentes. */
@Component({
  selector: 'app-training-hub',
  templateUrl: './training-hub.component.html',
  styleUrls: ['./training-hub.component.css']
})
export class TrainingHubComponent implements OnInit {
  cards: DrillCard[] = [];

  constructor(private drillStats: DrillStatsService) {}

  ngOnInit(): void {
    this.cards = DRILLS.map(info => ({
      info,
      stats: this.drillStats.getSummary(info.id)
    }));
  }

  accent(info: DrillInfo): string {
    return `var(--c-${info.piece})`;
  }
}

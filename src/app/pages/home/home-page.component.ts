import { Component, OnInit } from '@angular/core';
import { DRILLS, DrillInfo } from '../../core/engine/date-engine';
import { ScoreData, ScoreService } from '../../core/services/score.service';

/** Landing `/` — hero, tarjetas de modos y stats globales del puntaje. */
@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
  readonly drills: readonly DrillInfo[] = DRILLS;
  score!: ScoreData;

  constructor(private scoreService: ScoreService) {}

  ngOnInit(): void {
    this.score = this.scoreService.get();
  }

  get accuracyPercent(): number {
    if (this.score.totalAnswered === 0) {
      return 0;
    }
    return Math.round((this.score.totalCorrect / this.score.totalAnswered) * 100);
  }
}

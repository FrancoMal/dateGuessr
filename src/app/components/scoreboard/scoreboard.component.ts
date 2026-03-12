import { Component, OnInit, OnDestroy } from '@angular/core';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
import { ScoreService, ScoreData } from '../../services/score.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.css'],
  animations: [
    trigger('newRecord', [
      state('idle', style({ transform: 'scale(1)' })),
      state('celebrate', style({ transform: 'scale(1)' })),
      transition('idle => celebrate', [
        animate('600ms ease-out', keyframes([
          style({ transform: 'scale(1)', offset: 0 }),
          style({ transform: 'scale(1.4)', offset: 0.3 }),
          style({ transform: 'scale(0.9)', offset: 0.6 }),
          style({ transform: 'scale(1.1)', offset: 0.8 }),
          style({ transform: 'scale(1)', offset: 1 }),
        ]))
      ])
    ]),
    trigger('streakPulse', [
      transition(':increment', [
        animate('300ms ease-out', keyframes([
          style({ transform: 'scale(1)', offset: 0 }),
          style({ transform: 'scale(1.2)', offset: 0.5 }),
          style({ transform: 'scale(1)', offset: 1 }),
        ]))
      ])
    ])
  ]
})
export class ScoreboardComponent implements OnInit, OnDestroy {
  scoreData!: ScoreData;
  recordState = 'idle';
  showRecordBanner = false;

  private sub!: Subscription;

  constructor(private scoreService: ScoreService) {}

  ngOnInit(): void {
    this.scoreData = this.scoreService.get();
    this.sub = this.scoreService.newRecord$.subscribe((newBest) => {
      this.showRecordBanner = true;
      this.recordState = 'celebrate';
      setTimeout(() => {
        this.showRecordBanner = false;
        this.recordState = 'idle';
      }, 3000);
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  refresh(): void {
    this.scoreData = this.scoreService.get();
  }

  get accuracyPercent(): number {
    if (this.scoreData.totalAnswered === 0) return 0;
    return Math.round((this.scoreData.totalCorrect / this.scoreData.totalAnswered) * 100);
  }

  resetScore(): void {
    this.scoreService.reset();
    this.scoreData = this.scoreService.get();
  }
}

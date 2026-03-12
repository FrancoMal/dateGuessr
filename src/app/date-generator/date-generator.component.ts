import { Component, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HistoricalDatesService } from '../services/historical-dates.service';
import { HistoricalDate } from '../data/historical-dates';
import { HistoryService } from '../services/history.service';
import { ScoreService } from '../services/score.service';
import { ScoreboardComponent } from '../components/scoreboard/scoreboard.component';

@Component({
  selector: 'app-date-generator',
  templateUrl: './date-generator.component.html',
  styleUrls: ['./date-generator.component.css'],
})
export class DateGeneratorComponent {
  @ViewChild('scoreboard') scoreboard!: ScoreboardComponent;

  public randomDate: Date | undefined;
  public date1: number = 1900;
  public date2: number = 2100;
  public selectedDay: string = '';
  public elapsedTime: number = 0;
  public resultMessage: string = '';
  private startTime: number = 0;
  private timer: any;
  public answered: boolean = false;

  lastPointsEarned: number = 0;
  showProcedure: boolean = false;
  showHints: boolean = false;
  hintsNumbers: { [day: string]: number[] } = {
    Domingo: [0, 7, 14, 21, 28, 35, 42, 49],
    Lunes: [1, 8, 15, 22, 29, 36, 43, 50],
    Martes: [2, 9, 16, 23, 30, 37, 44, 51],
    Miércoles: [3, 10, 17, 24, 31, 38, 45, 52],
    Jueves: [4, 11, 18, 25, 32, 39, 46, 53],
    Viernes: [5, 12, 19, 26, 33, 40, 47, 54],
    Sábado: [6, 13, 20, 27, 34, 41, 48, 55]
  };

  correctDay: string = '';

  // Modo histórico
  historicalMode: boolean = false;
  currentHistoricalDate: HistoricalDate | null = null;
  showEventName: boolean = false;

  hintText: string = '';
  private questionStartTime: number = 0;

  constructor(
    private datePipe: DatePipe,
    private historicalDatesService: HistoricalDatesService,
    private historyService: HistoryService,
    private scoreService: ScoreService
  ) {}

  public generateRandomDate(): void {
    // Validar rango de años
    if (!this.historicalMode && this.date1 > this.date2) {
      [this.date1, this.date2] = [this.date2, this.date1];
    }

    // Reseteamos las variables
    this.selectedDay = '';
    this.resultMessage = '';
    this.elapsedTime = 0;
    this.answered = false;
    this.showEventName = false;
    this.currentHistoricalDate = null;

    if (this.historicalMode) {
      const historical = this.historicalDatesService.getRandomDate();
      if (historical) {
        this.currentHistoricalDate = historical;
        this.randomDate = new Date(historical.date);
      }
    } else {
      const start = new Date(this.date1, 0, 1);
      const end = new Date(this.date2, 11, 31);
      const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
      this.randomDate = new Date(randomTime);
    }

    this.startTimer();
    this.questionStartTime = Date.now();

    // Calcular hint rápido para mostrar junto a la fecha
    if (this.randomDate) {
      const nuMes = [0, 3, 3, 6, 1, 4, 6, 2, 5, 0, 3, 5];
      const year = this.randomDate.getFullYear();
      const day = this.randomDate.getDate();
      const month = this.randomDate.getMonth() + 1;
      const last2Dig = year % 100;
      const century = Math.floor(year / 100);
      const qua = Math.floor(last2Dig / 4);
      let leap = 0;
      if ((year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) && ((month === 1) || (month === 2))) {
        leap = -1;
      }
      const hintDay = day % 7;
      const hintMonth = nuMes[month - 1];
      const hintYear = (qua + last2Dig + century) % 7;
      this.hintText = `${hintDay} + ${hintMonth} + ${hintYear} - ${leap}`;
    }
  }

  private startTimer(): void {
    this.startTime = performance.now();
    this.timer = setInterval(() => {
      this.elapsedTime = Math.round((performance.now() - this.startTime) / 1000 * 100) / 100;
    }, 10);
  }

  public stopTimer(): void {
    clearInterval(this.timer);
  }

  public formatShortDate(date: Date): string {
    return this.datePipe.transform(date, 'dd/MM/yyyy') ?? '';
  }

  public formatLongDate(date: Date): string {
    return this.datePipe.transform(date, "d 'de' MMMM 'de' yyyy") ?? '';
  }

  public checkAnswer(day: string): void {
    if (!this.randomDate || !this.startTime || this.answered) {
      return;
    }

    this.selectedDay = day;
    this.answered = true;

    // Obtenemos el día de la semana seleccionado por el usuario
    const selectedDayIndex = this.getDayIndex(day);

    // Obtenemos el día de la semana de la fecha aleatoria generada
    const randomDayIndex = this.randomDate.getDay();

    // Comparamos los días de la semana
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    this.correctDay = daysOfWeek[randomDayIndex];
    if (selectedDayIndex === randomDayIndex) {
      this.resultMessage = `¡Correcto! Tardaste ${this.elapsedTime} segundos.`;
    } else {
      this.resultMessage = `¡Incorrecto! Tardaste ${this.elapsedTime} segundos. El día correcto era ${this.correctDay}.`;
    }
    this.stopTimer();

    // Registrar en historial
    const responseTimeMs = Date.now() - this.questionStartTime;
    this.historyService.addRecord({
      date: this.formatShortDate(this.randomDate),
      userAnswer: day,
      correctAnswer: daysOfWeek[randomDayIndex],
      isCorrect: selectedDayIndex === randomDayIndex,
      responseTimeMs
    });

    // Actualizar puntuación
    const result = this.scoreService.registerAnswer(selectedDayIndex === randomDayIndex, responseTimeMs);
    this.lastPointsEarned = result.pointsEarned;
    this.scoreboard.refresh();

    this.startTime = 0;

    // En modo histórico, revelar el evento y marcar como jugado
    if (this.historicalMode && this.currentHistoricalDate) {
      this.showEventName = true;
      this.historicalDatesService.markAsPlayed(this.currentHistoricalDate.id);
    }
  }

  private getDayIndex(day: string): number {
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return daysOfWeek.indexOf(day);
  }
  toggleProcedure() {
    this.showProcedure = !this.showProcedure;
  }
  toggleHints() {
    this.showHints = !this.showHints
  }
  toggleHistoricalMode() {
    this.historicalMode = !this.historicalMode;
    // Reset game state when switching modes
    this.randomDate = undefined;
    this.resultMessage = '';
    this.showEventName = false;
    this.currentHistoricalDate = null;
  }
}

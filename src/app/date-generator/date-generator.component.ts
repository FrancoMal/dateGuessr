import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ProcedureComponent } from '../procedure/procedure.component';

@Component({
  selector: 'app-date-generator',
  templateUrl: './date-generator.component.html',
  styleUrls: ['./date-generator.component.css'],
})
export class DateGeneratorComponent {
  public randomDate: Date | undefined;
  public date1: number = 1900;
  public date2: number = 2100;
  public selectedDay: string = '';
  public elapsedTime: number = 0;
  public resultMessage: string = '';
  private startTime: number = 0;
  private timer: any;
  showProcedure: boolean = false;
  constructor(private datePipe: DatePipe) {}

  public generateRandomDate(): void {
    const start = new Date(this.date1, 0, 1);
    const end = new Date(this.date2, 11, 31);
    const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
    this.randomDate = new Date(randomTime);

    // Reseteamos las variables
    this.selectedDay = '';
    this.resultMessage = '';
    this.elapsedTime = 0;
    this.startTimer();

    console.log(`Fecha aleatoria generada: ${this.randomDate}`);

    // Llamada a handleGenerateProc del componente ProcedureComponent
    const procedureComponent = new ProcedureComponent();
    procedureComponent.handleGenerateProc(this.randomDate!);
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
    if (!this.randomDate || !this.startTime) {
      return;
    }

    // Obtenemos el día de la semana seleccionado por el usuario
    const selectedDayIndex = this.getDayIndex(day);

    // Obtenemos el día de la semana de la fecha aleatoria generada
    const randomDayIndex = this.randomDate.getDay();

    // Comparamos los días de la semana
    if (selectedDayIndex === randomDayIndex) {
      this.resultMessage = `¡Correcto! Tardaste ${this.elapsedTime} segundos.`;
    } else {
      const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      this.resultMessage = `¡Incorrecto! Tardaste ${this.elapsedTime} segundos. El día correcto era ${daysOfWeek[randomDayIndex]}.`;
    }
    this.stopTimer();
    this.startTime = 0;
  }

  private getDayIndex(day: string): number {
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return daysOfWeek.indexOf(day);
  }
  toggleProcedure() {
    this.showProcedure = !this.showProcedure;
  }
  
}

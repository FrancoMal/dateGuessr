import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
@Component({
  selector: 'app-procedure',
  templateUrl: './procedure.component.html',
  styleUrls: ['./procedure.component.css']
})
export class ProcedureComponent implements OnChanges {
  @Input() randomDate: Date | undefined;
  @Input() showProcedure: boolean = false;

  step1Html: string = '';
  step2Html: string = '';
  step3Html: string = '';
  step4Html: string = '';
  step5Html: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['randomDate'] && this.randomDate) {
      this.handleGenerateProc(this.randomDate);
    }
  }

  handleGenerateProc(randomDate: Date) {
    const nuMes = [0, 3, 3, 6, 1, 4, 6, 2, 5, 0, 3, 5];
    const nuSiglo = [6, 4, 2, 0, 6];
    const year = randomDate.getFullYear();
    const day = randomDate.getDate();
    const month = randomDate.getMonth() + 1;
    const last2Dig = year % 100;
    const century = Math.floor(year / 100);
    let leap = 0;
    if ((year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) && ((month === 1) || (month === 2 && day <= (year % 4 === 0 ? 29 : 28)))) {
      leap = -1;
    }

    const qua = Math.floor(last2Dig / 4);
    const sumDia = day + nuMes[month - 1] + last2Dig + qua + nuSiglo[(century - 16) % 5] + leap;
    const d = sumDia % 7;
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const diaSem = days[d];

    const hintDay = day % 7;
    const hintMonth = nuMes[month - 1];
    const hintYear = (qua + last2Dig + century) % 7;

    this.step1Html = `N° Mes = <span class="nmes">${nuMes[month - 1]}</span> N°Siglo = <span class="ncen">${nuSiglo[century % 5]}</span>`;
    this.step2Html = `<span class="text-danger">X</span> = <span class="text-info day">${day}</span> + <span class="nmes">${nuMes[month - 1]}</span> + <span class="text-primary last2Dig">${last2Dig.toString().padStart(2, "0")}</span> + <span class="text-primary qua">${qua.toString().padStart(2, "0")}</span> + <span class="ncen">${nuSiglo[century % 5]}</span> <span class="text-danger leap">- ${leap}</span>`;
    this.step3Html = `<span class="text-warning">S</span> = <span class="text-danger sumDia">${sumDia}</span> % 7 = <span class="text-warning d">${d}</span>`;
    this.step4Html = `<span class="text-warning">S</span> = <span class="text-warning diaSem">${diaSem}</span>`;
    this.step5Html = `${hintDay} + ${hintMonth} + ${hintYear} - ${leap}`;
  }
}

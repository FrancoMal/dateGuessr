import { Component, Input } from '@angular/core';
@Component({
  selector: 'app-procedure',
  templateUrl: './procedure.component.html',
  styleUrls: ['./procedure.component.css']
})
export class ProcedureComponent {
  @Input() randomDate: Date | undefined;
  private date: Date = new Date();
  @Input() showProcedure: boolean = false;
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
 
    const x = `<span class="text-danger">X</span> = <span class="text-info day">${day}</span> + <span class="nmes">${nuMes[month - 1]}</span> + <span class="text-primary last2Dig">${last2Dig.toString().padStart(2, "0")}</span> + <span class="text-primary qua">${qua.toString().padStart(2, "0")}</span> + <span class="ncen">${nuSiglo[century % 5]}</span> <span class="text-danger leap">- ${leap}</span>`;
    const s = `<span class="text-warning">S</span> = <span class="text-danger sumDia">${sumDia}</span> % 7 = <span class="text-warning d">${d}</span>`;
    const sem = `<span class="text-warning">S</span> = <span class="text-warning diaSem">${diaSem}</span>`;
    const hintDay = day % 7;
    const hintMonth = nuMes[month - 1];
    const hintYear = (qua + last2Dig + century) % 7;
    document.getElementById("step1")!.innerHTML = `N° Mes = <span class="nmes">${nuMes[month - 1]}</span> N°Siglo = <span class="ncen">${nuSiglo[century % 5]}</span>`;
    document.getElementById("step2")!.innerHTML = x;
    document.getElementById("step3")!.innerHTML = s;
    document.getElementById("step4")!.innerHTML = sem;
    document.getElementById("step5")!.innerHTML = `${hintDay} + ${hintMonth} + ${hintYear} - ${leap}`;
  }
}  

import {
  CENTURY_PATTERN,
  MONTH_CODES,
  MONTH_NAMES,
  WEEKDAY_NAMES,
  centuryCode,
  computeWeekdayIndex,
  computeWeekdayName,
  generateDrillQuestion,
  getDateBreakdown,
  getDrillInfo,
  getReducedHint,
  isLeapYear,
  leapAdjustment,
  mod7,
  monthCode,
  reduceStep,
  yearNumber
} from './date-engine';

/** Fechas deterministas repartidas en 1400–2399 (2 por año = 2000 fechas). */
function sampleDates(): { day: number; month: number; year: number }[] {
  const dates: { day: number; month: number; year: number }[] = [];
  for (let year = 1400; year <= 2399; year++) {
    dates.push({ day: ((year * 7) % 28) + 1, month: (year % 12) + 1, year });
    dates.push({ day: ((year * 13) % 28) + 1, month: ((year + 6) % 12) + 1, year });
  }
  return dates;
}

/** Fechas clave: históricas, bisiestos límite y bordes de rango. */
const KEY_DATES: { day: number; month: number; year: number }[] = [
  { day: 12, month: 10, year: 1492 },  // modo histórico, siglo < 16
  { day: 6, month: 6, year: 1543 },
  { day: 1, month: 1, year: 1400 },
  { day: 31, month: 12, year: 2399 },
  { day: 29, month: 2, year: 2000 },
  { day: 28, month: 2, year: 1900 },
  { day: 29, month: 2, year: 2024 },
  { day: 1, month: 1, year: 2000 },
  { day: 20, month: 7, year: 1969 },   // ejemplo guía de la spec
  { day: 17, month: 3, year: 2004 },
  { day: 1, month: 3, year: 2100 }
];

describe('date-engine', () => {

  describe('aritmética base', () => {
    it('mod7 siempre devuelve 0–6, incluso con negativos', () => {
      expect(mod7(0)).toBe(0);
      expect(mod7(14)).toBe(0);
      expect(mod7(-1)).toBe(6);
      expect(mod7(-8)).toBe(6);
      expect(mod7(38)).toBe(3);
    });

    it('reduceStep muestra el múltiplo de 7 restado', () => {
      expect(reduceStep(26).text).toBe('26 − 21 = 5');
      expect(reduceStep(38).text).toBe('38 − 35 = 3');
      expect(reduceStep(5).text).toBe('5 (ya es menor que 7)');
      expect(reduceStep(5).reduced).toBe(5);
      expect(reduceStep(14).reduced).toBe(0);
    });
  });

  describe('tabla de meses', () => {
    it('coincide con la spec: Ene 0, Feb 3, Mar 3, Abr 6, May 1, Jun 4, Jul 6, Ago 2, Sep 5, Oct 0, Nov 3, Dic 5', () => {
      expect(MONTH_CODES).toEqual([0, 3, 3, 6, 1, 4, 6, 2, 5, 0, 3, 5]);
      expect(monthCode(1)).toBe(0);
      expect(monthCode(7)).toBe(6);
      expect(monthCode(12)).toBe(5);
      expect(MONTH_NAMES.length).toBe(12);
    });
  });

  describe('tabla de siglos', () => {
    it('sigue el patrón cíclico [6,4,2,0] desde 1600', () => {
      expect(CENTURY_PATTERN).toEqual([6, 4, 2, 0]);
      expect(centuryCode(1600)).toBe(6);
      expect(centuryCode(1700)).toBe(4);
      expect(centuryCode(1800)).toBe(2);
      expect(centuryCode(1900)).toBe(0);
      expect(centuryCode(2000)).toBe(6);
      expect(centuryCode(2100)).toBe(4);
      expect(centuryCode(2200)).toBe(2);
      expect(centuryCode(2300)).toBe(0);
    });

    it('soporta siglos < 16 con módulo positivo (1492, 1543)', () => {
      expect(centuryCode(1492)).toBe(2);  // siglo 14 → patron[2]
      expect(centuryCode(1543)).toBe(0);  // siglo 15 → patron[3]
      expect(centuryCode(1400)).toBe(2);
      expect(Number.isNaN(computeWeekdayIndex(12, 10, 1492))).toBeFalse();
    });
  });

  describe('bisiestos', () => {
    it('aplica la regla 4/100/400', () => {
      expect(isLeapYear(1900)).toBeFalse();
      expect(isLeapYear(2000)).toBeTrue();
      expect(isLeapYear(2024)).toBeTrue();
      expect(isLeapYear(2100)).toBeFalse();
      expect(isLeapYear(1996)).toBeTrue();
      expect(isLeapYear(1999)).toBeFalse();
      expect(isLeapYear(1600)).toBeTrue();
    });

    it('el ajuste −1 solo aplica en enero/febrero de bisiestos', () => {
      expect(leapAdjustment(1, 2024)).toBe(-1);
      expect(leapAdjustment(2, 2024)).toBe(-1);
      expect(leapAdjustment(3, 2024)).toBe(0);
      expect(leapAdjustment(2, 1900)).toBe(0);
      expect(leapAdjustment(1, 2000)).toBe(-1);
      expect(leapAdjustment(7, 1900)).toBe(0);
    });
  });

  describe('fórmula vs Date.getDay() — verificación masiva', () => {
    it('coincide con Date.getDay() en ~2000 fechas de 1400–2399', () => {
      const dates = sampleDates().concat(KEY_DATES);
      expect(dates.length).toBeGreaterThanOrEqual(2000);
      for (const { day, month, year } of dates) {
        const expected = new Date(year, month - 1, day).getDay();
        const actual = computeWeekdayIndex(day, month, year);
        expect(actual)
          .withContext(`${day}/${month}/${year}`)
          .toBe(expected);
      }
    });

    it('resuelve el ejemplo guía 20/07/1969 → Domingo', () => {
      expect(computeWeekdayName(20, 7, 1969)).toBe('Domingo');
      const parts = yearNumber(1969);
      expect(parts.a).toBe(69);
      expect(parts.q).toBe(17);
      expect(parts.c).toBe(0);
      expect(parts.n).toBe(2);
    });

    it('resuelve 12/10/1492 sin NaN', () => {
      const idx = computeWeekdayIndex(12, 10, 1492);
      expect(idx).toBe(new Date(1492, 9, 12).getDay());
      expect(WEEKDAY_NAMES[idx]).toBeDefined();
    });
  });

  describe('desglose (breakdown)', () => {
    it('el camino reducido llega al mismo resultado que el largo (2000 fechas)', () => {
      for (const { day, month, year } of sampleDates()) {
        const dPrime = mod7(day);
        const m = monthCode(month);
        const { n } = yearNumber(year);
        const adjust = leapAdjustment(month, year);
        const reducedResult = mod7(dPrime + m + n + adjust);
        expect(reducedResult)
          .withContext(`${day}/${month}/${year}`)
          .toBe(computeWeekdayIndex(day, month, year));
      }
    });

    it('genera ambos caminos con resultado y colores por pieza', () => {
      const b = getDateBreakdown(20, 7, 1969);
      expect(b.resultIndex).toBe(0);
      expect(b.resultName).toBe('Domingo');
      expect(b.long.length).toBeGreaterThan(0);
      expect(b.reduced.length).toBeGreaterThan(0);
      expect(b.long.some(l => l.piece === 'dia')).toBeTrue();
      expect(b.reduced.some(l => l.piece === 'anio')).toBeTrue();
      expect(b.reduced.some(l => l.piece === 'resultado')).toBeTrue();
      // Reducción temprana visible: D′ = 20 − 14 = 6
      expect(b.reduced[0].text).toContain('20 − 14 = 6');
    });

    it('solo muestra la línea de ajuste cuando corresponde (nada de "− 0" ni "− -1")', () => {
      const con = getDateBreakdown(29, 2, 2024);
      const sin = getDateBreakdown(17, 3, 2004);
      expect(con.long.some(l => l.piece === 'ajuste')).toBeTrue();
      expect(sin.long.some(l => l.piece === 'ajuste')).toBeFalse();
      const allText = sin.long.concat(sin.reduced).map(l => l.text).join(' ');
      expect(allText).not.toContain('− 0');
      expect(allText).not.toContain('- -1');
    });

    it('explica el wrap +7 cuando la suma reducida da negativa (07/01/1928)', () => {
      // D′=0, M(Ene)=0, N=0, ajuste −1 → S cruda = −1 → −1 + 7 = 6 (Sábado)
      const b = getDateBreakdown(7, 1, 1928);
      expect(b.resultIndex).toBe(6);
      expect(b.resultName).toBe('Sábado');
      const sLine = b.reduced[b.reduced.length - 1];
      expect(sLine.piece).toBe('resultado');
      expect(sLine.text).toContain('-1 + 7 = 6');
      expect(sLine.text).not.toContain('menor que 7');
    });

    it('la fórmula reducida del hint usa valores ya reducidos', () => {
      const hint = getReducedHint(20, 7, 1969);
      expect(hint.dPrime).toBe(6);
      expect(hint.m).toBe(6);
      expect(hint.n).toBe(2);
      expect(hint.adjust).toBe(0);
      expect(hint.text).toBe('6 + 6 + 2');
      const conAjuste = getReducedHint(15, 2, 2024);
      expect(conAjuste.adjust).toBe(-1);
      expect(conAjuste.text).toContain('− 1');
    });
  });

  describe('registro de drills', () => {
    it('expone los 6 drills canónicos', () => {
      for (const id of ['dia', 'mes', 'diames', 'anio', 'bisiesto', 'mod7']) {
        const info = getDrillInfo(id);
        expect(info).withContext(id).toBeDefined();
        expect(info!.nombre.length).toBeGreaterThan(0);
      }
      expect(getDrillInfo('inexistente')).toBeUndefined();
    });
  });

  describe('generador drill "dia"', () => {
    it('genera días 1–31 con respuesta D mod 7', () => {
      for (let i = 0; i < 200; i++) {
        const q = generateDrillQuestion('dia');
        const day = q.meta.day!;
        expect(day).toBeGreaterThanOrEqual(1);
        expect(day).toBeLessThanOrEqual(31);
        expect(q.answer).toBe(mod7(day));
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThanOrEqual(6);
        expect(q.breakdown.length).toBe(1);
      }
    });
  });

  describe('generador drill "mes"', () => {
    it('la respuesta coincide con la tabla de códigos', () => {
      for (let i = 0; i < 100; i++) {
        const q = generateDrillQuestion('mes');
        const idx = q.meta.monthIndex!;
        expect(q.prompt).toBe(MONTH_NAMES[idx]);
        expect(q.answer).toBe(MONTH_CODES[idx]);
      }
    });
  });

  describe('generador drill "diames"', () => {
    /** Días máximos sin año: febrero fijo en 28. */
    const MAX_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    it('genera día válido para el mes y responde (D′ + M) mod 7 (300 preguntas)', () => {
      for (let i = 0; i < 300; i++) {
        const q = generateDrillQuestion('diames');
        const day = q.meta.day!;
        const idx = q.meta.monthIndex!;
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThanOrEqual(11);
        expect(day).toBeGreaterThanOrEqual(1);
        expect(day).withContext(q.prompt).toBeLessThanOrEqual(MAX_DAYS[idx]);
        expect(q.prompt).toBe(`${day} de ${MONTH_NAMES[idx]}`);
        expect(q.answerType).toBe('number');
        expect(q.answer).withContext(q.prompt).toBe(mod7(mod7(day) + MONTH_CODES[idx]));
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThanOrEqual(6);
        expect(q.breakdown.length).toBe(3);
        expect(q.breakdown.map(l => l.piece)).toEqual(['dia', 'mes', 'resultado']);
      }
    });

    it('resuelve el caso fijo 26 de Junio → 2 con las tablas del motor', () => {
      // Verificado a mano: D′ = 26 − 21 = 5 · M (Junio) = 4 → 5 + 4 = 9 → 9 − 7 = 2
      expect(mod7(26)).toBe(5);
      expect(monthCode(6)).toBe(4);
      expect(mod7(mod7(26) + monthCode(6))).toBe(2);
    });
  });

  describe('generador drill "anio"', () => {
    it('respeta el rango por defecto 1900–2099 y responde N', () => {
      for (let i = 0; i < 300; i++) {
        const q = generateDrillQuestion('anio');
        const year = q.meta.year!;
        expect(year).toBeGreaterThanOrEqual(1900);
        expect(year).toBeLessThanOrEqual(2099);
        expect(q.answer).toBe(yearNumber(year).n);
      }
    });

    it('respeta un rango configurado (1980–1999) con respuesta recomputable', () => {
      for (let i = 0; i < 200; i++) {
        const q = generateDrillQuestion('anio', { minYear: 1980, maxYear: 1999 });
        const year = q.meta.year!;
        expect(year).toBeGreaterThanOrEqual(1980);
        expect(year).toBeLessThanOrEqual(1999);
        expect(q.prompt).toBe(`${year}`);
        expect(q.answer).withContext(q.prompt).toBe(yearNumber(year).n);
      }
    });

    it('funciona con un rango de un solo año (2000–2000)', () => {
      for (let i = 0; i < 20; i++) {
        const q = generateDrillQuestion('anio', { minYear: 2000, maxYear: 2000 });
        expect(q.meta.year).toBe(2000);
        expect(q.prompt).toBe('2000');
        expect(q.answer).toBe(yearNumber(2000).n);
      }
    });

    it('acepta rango "todos los siglos" 1600–2399', () => {
      let sawOutside1900s = false;
      for (let i = 0; i < 300; i++) {
        const q = generateDrillQuestion('anio', { minYear: 1600, maxYear: 2399 });
        const year = q.meta.year!;
        expect(year).toBeGreaterThanOrEqual(1600);
        expect(year).toBeLessThanOrEqual(2399);
        expect(q.answer).toBe(yearNumber(year).n);
        if (year < 1900 || year > 2099) {
          sawOutside1900s = true;
        }
      }
      expect(sawOutside1900s).toBeTrue();
    });
  });

  describe('generador drill "bisiesto"', () => {
    it('la respuesta es correcta y el balance Sí queda entre 25% y 75%', () => {
      let yes = 0;
      const total = 400;
      for (let i = 0; i < total; i++) {
        const q = generateDrillQuestion('bisiesto');
        const year = q.meta.year!;
        const month = q.meta.monthIndex! + 1;
        const expected = leapAdjustment(month, year) === -1 ? 1 : 0;
        expect(q.answer).withContext(q.prompt).toBe(expected);
        expect(q.answerType).toBe('yesno');
        if (q.answer === 1) {
          yes++;
        }
      }
      const ratio = yes / total;
      expect(ratio).toBeGreaterThanOrEqual(0.25);
      expect(ratio).toBeLessThanOrEqual(0.75);
    });

    it('incluye casos trampa (bisiesto con mes que no aplica) y centenarios', () => {
      let trap = false;
      let centenary = false;
      for (let i = 0; i < 600 && !(trap && centenary); i++) {
        const q = generateDrillQuestion('bisiesto');
        const year = q.meta.year!;
        const month = q.meta.monthIndex! + 1;
        if (isLeapYear(year) && month > 2) {
          trap = true;
        }
        if (year % 100 === 0) {
          centenary = true;
        }
      }
      expect(trap).toBeTrue();
      expect(centenary).toBeTrue();
    });
  });

  describe('generador drill "mod7"', () => {
    it('genera números 7–60 con respuesta n mod 7', () => {
      for (let i = 0; i < 200; i++) {
        const q = generateDrillQuestion('mod7');
        const value = q.meta.value!;
        expect(value).toBeGreaterThanOrEqual(7);
        expect(value).toBeLessThanOrEqual(60);
        expect(q.answer).toBe(mod7(value));
      }
    });
  });
});

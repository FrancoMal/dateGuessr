/**
 * DateGuessr — Motor único de cálculo.
 *
 * ÚNICO lugar con la fórmula del día de la semana, las tablas de mes y siglo,
 * la regla de bisiestos, los pasos de cálculo (camino largo Y camino reducido)
 * y los generadores de preguntas de los 5 drills.
 *
 * Fórmula:
 *   X = D + M + A + Q + C + ajuste
 *   S = X mod 7   (0=Domingo … 6=Sábado)
 *
 * Técnica central: "restar los múltiplos de 7 lo antes posible":
 *   D′ = D mod 7
 *   N  = (A + Q + C) mod 7   ← el "Número del año"
 *   S  = (D′ + M + N + ajuste) mod 7
 */

// ---------------------------------------------------------------------------
// Tablas y constantes
// ---------------------------------------------------------------------------

export const WEEKDAY_NAMES: readonly string[] = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
];

export const MONTH_NAMES: readonly string[] = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/** Códigos de mes: Ene 0, Feb 3, Mar 3, Abr 6, May 1, Jun 4, Jul 6, Ago 2, Sep 5, Oct 0, Nov 3, Dic 5 */
export const MONTH_CODES: readonly number[] = [0, 3, 3, 6, 1, 4, 6, 2, 5, 0, 3, 5];

/** Patrón cíclico de siglos cada 4 siglos desde 1600: 16xx→6, 17xx→4, 18xx→2, 19xx→0, … */
export const CENTURY_PATTERN: readonly number[] = [6, 4, 2, 0];

/** Pieza semántica de la fórmula (mapea a los colores --c-* de styles.css). */
export type FormulaPiece = 'dia' | 'mes' | 'anio' | 'siglo' | 'ajuste' | 'resultado' | 'neutro';

// ---------------------------------------------------------------------------
// Aritmética base
// ---------------------------------------------------------------------------

/** Módulo 7 siempre positivo (soporta sumas con ajuste −1 y siglos < 16). */
export function mod7(n: number): number {
  return ((n % 7) + 7) % 7;
}

/** Bisiesto: divisible por 4, salvo divisible por 100 que no lo sea por 400. */
export function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

/** Código del mes (month 1–12). */
export function monthCode(month: number): number {
  return MONTH_CODES[month - 1];
}

/**
 * Código del siglo con módulo SIEMPRE positivo:
 * patron[((siglo − 16) mod 4 + 4) mod 4] — funciona también para siglos < 16
 * (p. ej. 1492 → siglo 14 → código 2).
 */
export function centuryCode(year: number): number {
  const century = Math.floor(year / 100);
  const idx = (((century - 16) % 4) + 4) % 4;
  return CENTURY_PATTERN[idx];
}

/** Ajuste bisiesto: −1 si el año es bisiesto Y el mes es enero o febrero. */
export function leapAdjustment(month: number, year: number): number {
  return isLeapYear(year) && month <= 2 ? -1 : 0;
}

/** Piezas del "Número del año" N = (A + Q + C) mod 7, con reducciones tempranas. */
export interface YearNumberParts {
  /** Últimas 2 cifras del año (0–99). */
  a: number;
  /** Cuartos: parte entera de A ÷ 4. */
  q: number;
  /** Código del siglo. */
  c: number;
  /** A mod 7 (reducción temprana). */
  aReduced: number;
  /** Q mod 7 (reducción temprana). */
  qReduced: number;
  /** N = (A + Q + C) mod 7. */
  n: number;
}

export function yearNumber(year: number): YearNumberParts {
  const a = year % 100;
  const q = Math.floor(a / 4);
  const c = centuryCode(year);
  return {
    a,
    q,
    c,
    aReduced: mod7(a),
    qReduced: mod7(q),
    n: mod7(a + q + c)
  };
}

/** Índice del día de la semana (0=Domingo … 6=Sábado) para una fecha. */
export function computeWeekdayIndex(day: number, month: number, year: number): number {
  const { a, q, c } = yearNumber(year);
  return mod7(day + monthCode(month) + a + q + c + leapAdjustment(month, year));
}

/** Nombre del día de la semana para una fecha. */
export function computeWeekdayName(day: number, month: number, year: number): string {
  return WEEKDAY_NAMES[computeWeekdayIndex(day, month, year)];
}

// ---------------------------------------------------------------------------
// Reducción temprana ("restar los múltiplos de 7 lo antes posible")
// ---------------------------------------------------------------------------

export interface ReductionStep {
  /** Valor original. */
  value: number;
  /** Múltiplo de 7 restado (0 si el valor ya es < 7). */
  multiple: number;
  /** Resultado reducido (value mod 7). */
  reduced: number;
  /** Texto listo para mostrar: "26 − 21 = 5" o "5 (ya es menor que 7)". */
  text: string;
}

/** Reduce un número no negativo mod 7 mostrando el múltiplo de 7 restado. */
export function reduceStep(value: number): ReductionStep {
  const reduced = mod7(value);
  const multiple = value - reduced;
  const text = multiple > 0
    ? `${value} − ${multiple} = ${reduced}`
    : `${value} (ya es menor que 7)`;
  return { value, multiple, reduced, text };
}

// ---------------------------------------------------------------------------
// Desglose (breakdown) — camino largo y camino reducido
// ---------------------------------------------------------------------------

export interface BreakdownLine {
  /** Pieza semántica → color en la UI. */
  piece: FormulaPiece;
  /** Etiqueta corta ("D", "M", "N", "S", …). */
  label: string;
  /** Texto del paso, listo para mostrar. */
  text: string;
}

/** Valores ya reducidos para el consejo "fórmula reducida": D′ + M + N (− 1). */
export interface ReducedHint {
  dPrime: number;
  m: number;
  n: number;
  adjust: number;
  /** Ej.: "6 + 6 + 2" o "3 + 3 + 1 − 1". */
  text: string;
}

export interface DateBreakdown {
  day: number;
  month: number;
  year: number;
  /** Camino largo: sumar todo y dividir al final. */
  long: BreakdownLine[];
  /** Camino reducido (recomendado): restar 7s temprano. */
  reduced: BreakdownLine[];
  /** Consejo con los valores ya reducidos. */
  hint: ReducedHint;
  resultIndex: number;
  resultName: string;
}

export function getReducedHint(day: number, month: number, year: number): ReducedHint {
  const dPrime = mod7(day);
  const m = monthCode(month);
  const { n } = yearNumber(year);
  const adjust = leapAdjustment(month, year);
  const text = `${dPrime} + ${m} + ${n}${adjust !== 0 ? ' − 1' : ''}`;
  return { dPrime, m, n, adjust, text };
}

/** Desglose completo paso a paso, con AMBOS caminos, para una fecha. */
export function getDateBreakdown(day: number, month: number, year: number): DateBreakdown {
  const monthName = MONTH_NAMES[month - 1];
  const century = Math.floor(year / 100);
  const parts = yearNumber(year);
  const m = monthCode(month);
  const adjust = leapAdjustment(month, year);
  const resultIndex = computeWeekdayIndex(day, month, year);
  const resultName = WEEKDAY_NAMES[resultIndex];

  // --- Camino largo ---
  const longSum = day + m + parts.a + parts.q + parts.c + adjust;
  const long: BreakdownLine[] = [
    { piece: 'dia', label: 'D', text: `D = ${day}` },
    { piece: 'mes', label: 'M', text: `M (${monthName}) = ${m}` },
    { piece: 'anio', label: 'A', text: `A = ${parts.a}` },
    { piece: 'anio', label: 'Q', text: `Q = ${parts.a} ÷ 4 = ${parts.q}` },
    { piece: 'siglo', label: 'C', text: `C (${century}xx) = ${parts.c}` }
  ];
  if (adjust !== 0) {
    long.push({ piece: 'ajuste', label: 'Ajuste', text: `Bisiesto y ${monthName} → restá 1` });
  }
  const longTerms = [day, m, parts.a, parts.q, parts.c].join(' + ') + (adjust !== 0 ? ' − 1' : '');
  long.push({ piece: 'neutro', label: 'X', text: `X = ${longTerms} = ${longSum}` });
  long.push({
    piece: 'resultado',
    label: 'S',
    text: `S = ${longSum} mod 7 = ${resultIndex} → ${resultName}`
  });

  // --- Camino reducido (restar 7s temprano) ---
  const dStep = reduceStep(day);
  const aStep = reduceStep(parts.a);
  const qStep = reduceStep(parts.q);
  const nRaw = aStep.reduced + qStep.reduced + parts.c;
  const nStep = reduceStep(nRaw);
  const reduced: BreakdownLine[] = [
    { piece: 'dia', label: 'D′', text: `D′ = ${dStep.text}` },
    { piece: 'mes', label: 'M', text: `M (${monthName}) = ${m}` },
    { piece: 'anio', label: 'A', text: `A = ${aStep.text}` },
    { piece: 'anio', label: 'Q', text: `Q = ${parts.a}÷4 = ${parts.q}${qStep.multiple > 0 ? ` → ${qStep.text}` : ''}` },
    { piece: 'siglo', label: 'C', text: `C (${century}xx) = ${parts.c}` },
    {
      piece: 'anio',
      label: 'N',
      text: `N = ${aStep.reduced} + ${qStep.reduced} + ${parts.c} = ${nRaw}` +
        (nStep.multiple > 0 ? ` → ${nStep.text}` : '')
    }
  ];
  if (adjust !== 0) {
    reduced.push({ piece: 'ajuste', label: 'Ajuste', text: `Bisiesto y ${monthName} → restá 1` });
  }
  const sRaw = dStep.reduced + m + nStep.reduced + adjust;
  let sText = `S = ${dStep.reduced} + ${m} + ${nStep.reduced}${adjust !== 0 ? ' − 1' : ''} = ${sRaw}`;
  if (sRaw < 0) {
    // Puede dar −1 (ej. 07/01/1928: 0 + 0 + 0 − 1): se suma 7 para volver a 0–6.
    sText += ` → ${sRaw} + 7 = ${resultIndex}`;
  } else {
    const sStep = reduceStep(sRaw);
    if (sStep.multiple > 0) {
      sText += ` → ${sStep.text}`;
    }
  }
  reduced.push({
    piece: 'resultado',
    label: 'S',
    text: `${sText} → ${resultName}`
  });

  return {
    day,
    month,
    year,
    long,
    reduced,
    hint: getReducedHint(day, month, year),
    resultIndex,
    resultName
  };
}

// ---------------------------------------------------------------------------
// Drills — registro y generadores
// ---------------------------------------------------------------------------

export type DrillId = 'dia' | 'mes' | 'anio' | 'bisiesto' | 'mod7';

export const DRILL_IDS: readonly DrillId[] = ['dia', 'mes', 'anio', 'bisiesto', 'mod7'];

export interface DrillInfo {
  id: DrillId;
  nombre: string;
  descripcion: string;
  /** Ícono (emoji). */
  icono: string;
  /** Pieza semántica → color del drill. */
  piece: FormulaPiece;
  answerType: 'number' | 'yesno';
}

export const DRILLS: readonly DrillInfo[] = [
  {
    id: 'dia',
    nombre: 'Día exprés',
    descripcion: 'Reducí el día del mes (1–31) a 0–6: restale 28, 21, 14 o 7.',
    icono: '📅',
    piece: 'dia',
    answerType: 'number'
  },
  {
    id: 'mes',
    nombre: 'Código del mes',
    descripcion: 'Memorizá el código 0–6 de cada mes.',
    icono: '🗓️',
    piece: 'mes',
    answerType: 'number'
  },
  {
    id: 'anio',
    nombre: 'Número del año',
    descripcion: 'Año, cuartos y siglo, juntos: N = (A + Q + C) mod 7.',
    icono: '🔢',
    piece: 'anio',
    answerType: 'number'
  },
  {
    id: 'bisiesto',
    nombre: 'El ajuste −1',
    descripcion: '¿Hay que restar 1? Solo si el año es bisiesto y el mes es enero o febrero.',
    icono: '➖',
    piece: 'ajuste',
    answerType: 'yesno'
  },
  {
    id: 'mod7',
    nombre: 'Mod 7 exprés',
    descripcion: 'Restá el múltiplo de 7 más cercano a un número de 7 a 60.',
    icono: '➗',
    piece: 'resultado',
    answerType: 'number'
  }
];

export function getDrillInfo(id: string): DrillInfo | undefined {
  return DRILLS.find(d => d.id === id);
}

export interface DrillQuestion {
  drill: DrillId;
  /** Enunciado principal (se muestra GRANDE). */
  prompt: string;
  /** Aclaración secundaria opcional. */
  detail?: string;
  answerType: 'number' | 'yesno';
  /** 0–6 para drills numéricos; 1 = Sí, 0 = No para bisiesto. */
  answer: number;
  /** Desglose a mostrar tras responder. */
  breakdown: BreakdownLine[];
  /** Datos crudos para la UI (resaltar mes en la tabla, etc.). */
  meta: { day?: number; monthIndex?: number; year?: number; value?: number };
}

export interface AnioDrillOptions {
  /** Default 1900. Con "todos los siglos": 1600. */
  minYear?: number;
  /** Default 2099. Con "todos los siglos": 2399. */
  maxYear?: number;
}

/** Entero aleatorio en [min, max] inclusive. */
function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function generateDia(): DrillQuestion {
  const day = randInt(1, 31);
  const step = reduceStep(day);
  return {
    drill: 'dia',
    prompt: `${day}`,
    detail: '¿Cuánto queda al restar los 7s?',
    answerType: 'number',
    answer: step.reduced,
    breakdown: [{ piece: 'dia', label: 'D′', text: step.text }],
    meta: { day }
  };
}

function generateMes(): DrillQuestion {
  const monthIndex = randInt(0, 11);
  const code = MONTH_CODES[monthIndex];
  return {
    drill: 'mes',
    prompt: MONTH_NAMES[monthIndex],
    detail: '¿Cuál es su código?',
    answerType: 'number',
    answer: code,
    breakdown: [{ piece: 'mes', label: 'M', text: `${MONTH_NAMES[monthIndex]} → código ${code}` }],
    meta: { monthIndex }
  };
}

function generateAnio(opts?: AnioDrillOptions): DrillQuestion {
  const min = opts?.minYear ?? 1900;
  const max = opts?.maxYear ?? 2099;
  const year = randInt(min, max);
  const parts = yearNumber(year);
  const century = Math.floor(year / 100);
  const aStep = reduceStep(parts.a);
  const qStep = reduceStep(parts.q);
  const nRaw = aStep.reduced + qStep.reduced + parts.c;
  const nStep = reduceStep(nRaw);
  return {
    drill: 'anio',
    prompt: `${year}`,
    detail: '¿Cuál es el Número del año?',
    answerType: 'number',
    answer: parts.n,
    breakdown: [
      { piece: 'anio', label: 'A', text: `A = ${aStep.text}` },
      { piece: 'anio', label: 'Q', text: `Q = ${parts.a}÷4 = ${parts.q}${qStep.multiple > 0 ? ` → ${qStep.text}` : ''}` },
      { piece: 'siglo', label: 'C', text: `C (${century}xx) = ${parts.c}` },
      {
        piece: 'anio',
        label: 'N',
        text: `N = ${aStep.reduced} + ${qStep.reduced} + ${parts.c} = ${nRaw}` +
          (nStep.multiple > 0 ? ` → ${nStep.text}` : '')
      }
    ],
    meta: { year }
  };
}

/** Años centenarios dentro del rango soportado (1600–2399). */
const CENTURY_YEARS: readonly number[] = [1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300];

/** Un año bisiesto NO centenario al azar en 1601–2399. */
function randomLeapYear(): number {
  for (;;) {
    const year = 4 * randInt(401, 599); // 1604–2396, siempre divisible por 4
    if (isLeapYear(year) && year % 100 !== 0) {
      return year;
    }
  }
}

/** Un año NO bisiesto (y no centenario) al azar en 1601–2399. */
function randomNonLeapYear(): number {
  for (;;) {
    const year = randInt(1601, 2399);
    if (!isLeapYear(year) && year % 100 !== 0) {
      return year;
    }
  }
}

function leapRuleLine(year: number): BreakdownLine {
  let text: string;
  if (year % 100 === 0) {
    text = year % 400 === 0
      ? `${year} es divisible por 400 → bisiesto`
      : `${year} es divisible por 100 pero no por 400 → NO bisiesto`;
  } else {
    text = year % 4 === 0
      ? `${year} es divisible por 4 → bisiesto`
      : `${year} no es divisible por 4 → NO bisiesto`;
  }
  return { piece: 'ajuste', label: 'Año', text };
}

/**
 * Distribución del drill `bisiesto` (spec-pedagogia §3: "~50% de casos donde
 * la respuesta es Sí o donde el año ES bisiesto pero el mes no aplica").
 * Se interpreta como UNIÓN: P(año bisiesto) ≈ 50%. Pesos exactos (replicar
 * igual en la app Android):
 *   0.35 bisiesto + Ene/Feb (Sí) · 0.20 bisiesto + mes≥3 (trampa, No)
 *   0.35 no bisiesto + Ene/Feb (No) · 0.10 centenarios (2 de 8 son bisiestos)
 * ⇒ P(bisiesto) ≈ 0.575 · P(Sí) ≈ 0.37 (dentro del assert 25–75% del spec).
 */
function generateBisiesto(): DrillQuestion {
  const r = Math.random();
  let year: number;
  let monthIndex: number; // 0-based
  if (r < 0.35) {
    // Bisiesto + Ene/Feb → Sí
    year = randomLeapYear();
    monthIndex = randInt(0, 1);
  } else if (r < 0.55) {
    // Bisiesto pero el mes no aplica (trampa típica) → No
    year = randomLeapYear();
    monthIndex = randInt(2, 11);
  } else if (r < 0.9) {
    // No bisiesto + Ene/Feb → No
    year = randomNonLeapYear();
    monthIndex = randInt(0, 1);
  } else {
    // Centenarios (1900 no bisiesto, 2000 sí)
    year = CENTURY_YEARS[randInt(0, CENTURY_YEARS.length - 1)];
    monthIndex = Math.random() < 0.7 ? randInt(0, 1) : randInt(2, 11);
  }

  const month = monthIndex + 1;
  const monthName = MONTH_NAMES[monthIndex];
  const adjusts = leapAdjustment(month, year) === -1;
  const leap = isLeapYear(year);

  const breakdown: BreakdownLine[] = [leapRuleLine(year)];
  if (leap) {
    breakdown.push({
      piece: 'ajuste',
      label: 'Mes',
      text: month <= 2
        ? `${monthName} es enero o febrero → restá 1`
        : `pero ${monthName} no es enero ni febrero → no se ajusta`
    });
  } else {
    breakdown.push({ piece: 'ajuste', label: 'Mes', text: 'No es bisiesto → no se ajusta' });
  }

  return {
    drill: 'bisiesto',
    prompt: `${monthName} de ${year}`,
    detail: '¿Hay que restar 1?',
    answerType: 'yesno',
    answer: adjusts ? 1 : 0,
    breakdown,
    meta: { monthIndex, year }
  };
}

function generateMod7(): DrillQuestion {
  const value = randInt(7, 60);
  const step = reduceStep(value);
  return {
    drill: 'mod7',
    prompt: `${value}`,
    detail: '¿Cuánto es mod 7?',
    answerType: 'number',
    answer: step.reduced,
    breakdown: [{ piece: 'resultado', label: 'mod 7', text: step.text }],
    meta: { value }
  };
}

/** Genera una pregunta para el drill indicado. */
export function generateDrillQuestion(drill: DrillId, opts?: AnioDrillOptions): DrillQuestion {
  switch (drill) {
    case 'dia': return generateDia();
    case 'mes': return generateMes();
    case 'anio': return generateAnio(opts);
    case 'bisiesto': return generateBisiesto();
    case 'mod7': return generateMod7();
  }
}

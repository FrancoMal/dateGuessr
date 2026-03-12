export interface HistoricalDate {
  id: number;
  date: Date;
  event: string;
  category: string;
}

export const HISTORICAL_DATES: HistoricalDate[] = [
  // Independencias y revoluciones
  { id: 1, date: new Date(1776, 6, 4), event: 'Declaración de Independencia de EE.UU.', category: 'Independencias' },
  { id: 2, date: new Date(1789, 6, 14), event: 'Toma de la Bastilla - Revolución Francesa', category: 'Independencias' },
  { id: 3, date: new Date(1810, 4, 25), event: 'Revolución de Mayo - Argentina', category: 'Independencias' },
  { id: 4, date: new Date(1816, 6, 9), event: 'Independencia de Argentina', category: 'Independencias' },
  { id: 5, date: new Date(1821, 8, 15), event: 'Independencia de México', category: 'Independencias' },
  { id: 6, date: new Date(1818, 1, 12), event: 'Independencia de Chile', category: 'Independencias' },
  { id: 7, date: new Date(1811, 4, 14), event: 'Independencia de Paraguay', category: 'Independencias' },
  { id: 8, date: new Date(1825, 7, 6), event: 'Independencia de Bolivia', category: 'Independencias' },
  { id: 9, date: new Date(1822, 8, 7), event: 'Independencia de Brasil', category: 'Independencias' },
  { id: 10, date: new Date(1903, 10, 3), event: 'Independencia de Panamá', category: 'Independencias' },

  // Descubrimientos y ciencia
  { id: 11, date: new Date(1492, 9, 12), event: 'Cristóbal Colón llega a América', category: 'Descubrimientos' },
  { id: 12, date: new Date(1969, 6, 20), event: 'Llegada del hombre a la Luna (Apollo 11)', category: 'Descubrimientos' },
  { id: 13, date: new Date(1905, 5, 30), event: 'Einstein publica la Teoría de la Relatividad Especial', category: 'Descubrimientos' },
  { id: 14, date: new Date(1953, 3, 25), event: 'Watson y Crick descubren la estructura del ADN', category: 'Descubrimientos' },
  { id: 15, date: new Date(1928, 8, 28), event: 'Alexander Fleming descubre la penicilina', category: 'Descubrimientos' },
  { id: 16, date: new Date(2012, 6, 4), event: 'Descubrimiento del Bosón de Higgs en el CERN', category: 'Descubrimientos' },
  { id: 17, date: new Date(1961, 3, 12), event: 'Yuri Gagarin: primer humano en el espacio', category: 'Descubrimientos' },
  { id: 18, date: new Date(1543, 4, 24), event: 'Copérnico publica modelo heliocéntrico', category: 'Descubrimientos' },

  // Guerras y conflictos
  { id: 19, date: new Date(1914, 5, 28), event: 'Asesinato del Archiduque Francisco Fernando - Inicio WWI', category: 'Guerras' },
  { id: 20, date: new Date(1918, 10, 11), event: 'Fin de la Primera Guerra Mundial', category: 'Guerras' },
  { id: 21, date: new Date(1939, 8, 1), event: 'Inicio de la Segunda Guerra Mundial', category: 'Guerras' },
  { id: 22, date: new Date(1945, 4, 8), event: 'Fin de la Segunda Guerra Mundial en Europa (Día V-E)', category: 'Guerras' },
  { id: 23, date: new Date(1945, 7, 6), event: 'Bomba atómica sobre Hiroshima', category: 'Guerras' },
  { id: 24, date: new Date(1944, 5, 6), event: 'Desembarco de Normandía (Día D)', category: 'Guerras' },
  { id: 25, date: new Date(1982, 3, 2), event: 'Inicio de la Guerra de Malvinas', category: 'Guerras' },

  // Eventos políticos y sociales
  { id: 26, date: new Date(1989, 10, 9), event: 'Caída del Muro de Berlín', category: 'Política' },
  { id: 27, date: new Date(1963, 10, 22), event: 'Asesinato de John F. Kennedy', category: 'Política' },
  { id: 28, date: new Date(1968, 3, 4), event: 'Asesinato de Martin Luther King Jr.', category: 'Política' },
  { id: 29, date: new Date(1991, 11, 25), event: 'Disolución de la Unión Soviética', category: 'Política' },
  { id: 30, date: new Date(1994, 3, 27), event: 'Nelson Mandela elegido presidente de Sudáfrica', category: 'Política' },
  { id: 31, date: new Date(2001, 8, 11), event: 'Atentados del 11 de septiembre en EE.UU.', category: 'Política' },
  { id: 32, date: new Date(1917, 10, 7), event: 'Revolución Rusa de Octubre', category: 'Política' },

  // Deportes
  { id: 33, date: new Date(1930, 6, 30), event: 'Uruguay gana la primera Copa Mundial de Fútbol', category: 'Deportes' },
  { id: 34, date: new Date(1986, 5, 22), event: 'Maradona marca "La Mano de Dios" vs Inglaterra', category: 'Deportes' },
  { id: 35, date: new Date(2014, 6, 13), event: 'Alemania golea 7-1 a Brasil en el Mundial', category: 'Deportes' },
  { id: 36, date: new Date(2022, 11, 18), event: 'Argentina campeona del mundo en Qatar 2022', category: 'Deportes' },
  { id: 37, date: new Date(1936, 7, 1), event: 'Jesse Owens gana 4 oros en Olimpiadas de Berlín', category: 'Deportes' },
  { id: 38, date: new Date(2008, 7, 8), event: 'Usain Bolt bate récord de 100m en Beijing', category: 'Deportes' },
  { id: 39, date: new Date(1950, 6, 16), event: 'El Maracanazo: Uruguay vence a Brasil en el Mundial', category: 'Deportes' },
  { id: 40, date: new Date(1978, 5, 25), event: 'Argentina gana su primer Mundial de Fútbol', category: 'Deportes' },

  // Tecnología
  { id: 41, date: new Date(1969, 9, 29), event: 'Primer mensaje enviado por ARPANET (precursor de Internet)', category: 'Tecnología' },
  { id: 42, date: new Date(1976, 3, 1), event: 'Fundación de Apple por Jobs, Wozniak y Wayne', category: 'Tecnología' },
  { id: 43, date: new Date(2007, 0, 9), event: 'Steve Jobs presenta el primer iPhone', category: 'Tecnología' },
  { id: 44, date: new Date(1991, 7, 6), event: 'Tim Berners-Lee lanza la World Wide Web', category: 'Tecnología' },
  { id: 45, date: new Date(2004, 1, 4), event: 'Mark Zuckerberg lanza Facebook', category: 'Tecnología' },

  // Cultura y arte
  { id: 46, date: new Date(1977, 4, 25), event: 'Estreno de Star Wars: Episodio IV', category: 'Cultura' },
  { id: 47, date: new Date(1980, 11, 8), event: 'Asesinato de John Lennon', category: 'Cultura' },
  { id: 48, date: new Date(1969, 7, 15), event: 'Inicio del Festival de Woodstock', category: 'Cultura' },

  // Desastres y eventos naturales
  { id: 49, date: new Date(1912, 3, 15), event: 'Hundimiento del Titanic', category: 'Desastres' },
  { id: 50, date: new Date(1986, 3, 26), event: 'Desastre nuclear de Chernóbil', category: 'Desastres' },
  { id: 51, date: new Date(2011, 2, 11), event: 'Terremoto y tsunami de Fukushima, Japón', category: 'Desastres' },
  { id: 52, date: new Date(2020, 2, 11), event: 'OMS declara pandemia de COVID-19', category: 'Desastres' },
];

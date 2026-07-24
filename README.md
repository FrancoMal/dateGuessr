# DateGuessr

https://dateguessr.netlify.app/

Aplicación web para aprender a **calcular mentalmente el día de la semana de cualquier fecha**, con un simulador de práctica y entrenamientos por componente de la fórmula.

## La fórmula

```
X = Día + N°Mes + Año + Año/4 + N°Siglo (− 1 si es bisiesto en enero/febrero)
S = X mod 7        →  0=Domingo, 1=Lunes, …, 6=Sábado
```

La técnica central que enseña la app: **restar los múltiplos de 7 lo antes posible**. En lugar de sumar todo y dividir al final, cada pieza se reduce mod 7 apenas se conoce (el día, y el "número del año" = año + año/4 + siglo juntos), así los números se mantienen chicos.

## Modos

- **Práctica completa** (`/practica`): fecha aleatoria por rango de años o fecha histórica real; respondés con los 7 días, con cronómetro, consejo de fórmula reducida opcional y desglose paso a paso al responder (camino largo y camino reducido). Atajos de teclado: `L M X J V S D` y `Enter` para la siguiente.
- **Entrenamiento por partes** (`/entrenar`): 5 drills individuales, cada uno con desglose, racha y estadísticas propias:
  - **Día exprés** — día del mes → mod 7 (`26 − 21 = 5`)
  - **Código del mes** — memorización de la tabla de meses
  - **Número del año** — año + año/4 + siglo calculados juntos con reducción temprana
  - **Bisiesto** — ¿se resta 1? (con trampas: año bisiesto pero mes que no aplica, centenarios)
  - **Mod 7 exprés** — la división final, para velocidad
- **Método** (`/metodo`): la guía completa con tablas, la técnica y un ejemplo interactivo en vivo.
- **Historial** (`/historial`): partidas, precisión por día de la semana y estadísticas por drill.

Todo el progreso se guarda localmente en el navegador (sin cuentas ni backend).

## Desarrollo

```bash
npm install
npm start        # ng serve
npm run build    # producción → dist/date-guessr
npm test         # tests del motor de cálculo (Karma + ChromeHeadless)
```

- **Stack**: Angular 15 + TypeScript, sin frameworks de UI (sistema de diseño propio con CSS custom properties, tema oscuro/claro).
- **Motor único**: toda la lógica de fórmula, tablas, bisiestos, desgloses y generadores de drills vive en `src/app/core/engine/date-engine.ts`, verificada masivamente contra `Date` en los tests.
- **Deploy**: Netlify construye con `npm run build` y publica `dist/date-guessr` (ver `netlify.toml`); `dist/` ya no se versiona.

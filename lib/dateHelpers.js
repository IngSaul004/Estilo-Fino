import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  isSameDay,
  isSameWeek,
  isSameMonth,
  format,
  parseISO,
  parse,
  isValid,
  subDays,
} from "date-fns";
import { es } from "date-fns/locale";

// Convierte el texto de fecha guardado en la hoja a un objeto Date real.
// Soporta dos formatos a propósito:
//   - "2026-08-14"  → ISO, lo que manda el formulario y lo que ahora se
//                      guarda como texto plano (ver lib/sheets.js).
//   - "14/8/2026"   → d/M/yyyy, el formato en el que Google Sheets
//                      reescribía la fecha ANTES del fix. Se deja este
//                      "fallback" para que las filas viejas que ya quedaron
//                      guardadas así sigan funcionando sin que tengas que
//                      editarlas a mano en la hoja.
function parseFecha(fecha) {
  if (!fecha) return null;

  const iso = parseISO(fecha);
  if (isValid(iso)) return iso;

  const dmy = parse(fecha, "d/M/yyyy", new Date());
  if (isValid(dmy)) return dmy;

  return null;
}

// Convierte "monto" positivo/negativo según tipo, para sumar directo.
function signedAmount(t) {
  return t.tipo === "ingreso" ? t.monto : -t.monto;
}

export function totalsFor(transactions, referenceDate = new Date()) {
  const conFecha = transactions
    .map((t) => ({ ...t, _fecha: parseFecha(t.fecha) }))
    .filter((t) => t._fecha);

  const hoy = conFecha.filter((t) => isSameDay(t._fecha, referenceDate));
  const semana = conFecha.filter((t) =>
    isSameWeek(t._fecha, referenceDate, { weekStartsOn: 1 })
  );
  const mes = conFecha.filter((t) => isSameMonth(t._fecha, referenceDate));

  const sum = (arr) => arr.reduce((acc, t) => acc + signedAmount(t), 0);
  const sumIngresos = (arr) =>
    arr.filter((t) => t.tipo === "ingreso").reduce((a, t) => a + t.monto, 0);
  const sumGastos = (arr) =>
    arr.filter((t) => t.tipo === "gasto").reduce((a, t) => a + t.monto, 0);

  return {
    hoy: { neto: sum(hoy), ingresos: sumIngresos(hoy), gastos: sumGastos(hoy) },
    semana: { neto: sum(semana), ingresos: sumIngresos(semana), gastos: sumGastos(semana) },
    mes: { neto: sum(mes), ingresos: sumIngresos(mes), gastos: sumGastos(mes) },
  };
}

// Serie de los últimos N días para la gráfica (ganancia neta por día)
export function dailySeries(transactions, days = 14) {
  const today = startOfDay(new Date());
  const buckets = [];

  const conFecha = transactions
    .map((t) => ({ ...t, _fecha: parseFecha(t.fecha) }))
    .filter((t) => t._fecha);

  for (let i = days - 1; i >= 0; i--) {
    const day = subDays(today, i);
    const dayTx = conFecha.filter((t) => isSameDay(t._fecha, day));
    const ingresos = dayTx
      .filter((t) => t.tipo === "ingreso")
      .reduce((a, t) => a + t.monto, 0);
    const gastos = dayTx.filter((t) => t.tipo === "gasto").reduce((a, t) => a + t.monto, 0);

    buckets.push({
      label: format(day, "dd MMM", { locale: es }),
      ingresos,
      gastos,
      neto: ingresos - gastos,
    });
  }

  return buckets;
}

// Serie de los últimos N meses (para tendencia mensual)
export function monthlySeries(transactions, months = 6) {
  const today = startOfMonth(new Date());
  const buckets = [];

  const conFecha = transactions
    .map((t) => ({ ...t, _fecha: parseFecha(t.fecha) }))
    .filter((t) => t._fecha);

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthTx = conFecha.filter((t) => isSameMonth(t._fecha, d));
    const ingresos = monthTx
      .filter((t) => t.tipo === "ingreso")
      .reduce((a, t) => a + t.monto, 0);
    const gastos = monthTx.filter((t) => t.tipo === "gasto").reduce((a, t) => a + t.monto, 0);

    buckets.push({
      label: format(d, "MMM yyyy", { locale: es }),
      ingresos,
      gastos,
      neto: ingresos - gastos,
    });
  }

  return buckets;
}

export function formatMoney(n) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(n || 0);
}
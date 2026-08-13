import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  isSameDay,
  isSameWeek,
  isSameMonth,
  format,
  parseISO,
  subDays,
} from "date-fns";
import { es } from "date-fns/locale";

// Convierte "monto" positivo/negativo según tipo, para sumar directo.
function signedAmount(t) {
  return t.tipo === "ingreso" ? t.monto : -t.monto;
}

export function totalsFor(transactions, referenceDate = new Date()) {
  const hoy = transactions.filter((t) => isSameDay(parseISO(t.fecha), referenceDate));
  const semana = transactions.filter((t) =>
    isSameWeek(parseISO(t.fecha), referenceDate, { weekStartsOn: 1 })
  );
  const mes = transactions.filter((t) => isSameMonth(parseISO(t.fecha), referenceDate));

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

  for (let i = days - 1; i >= 0; i--) {
    const day = subDays(today, i);
    const dayTx = transactions.filter((t) => isSameDay(parseISO(t.fecha), day));
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

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthTx = transactions.filter((t) => isSameMonth(parseISO(t.fecha), d));
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

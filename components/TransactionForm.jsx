"use client";

import { useState } from "react";
import { todayCDMXString } from "@/lib/dateHelpers";

const CATEGORIAS_INGRESO = ["Corte", "Barba", "Corte + Barba", "Producto", "Otro"];
const CATEGORIAS_GASTO = ["Renta", "Insumos", "Servicios", "Nómina", "Otro"];

export default function TransactionForm({ onCreated }) {
  const [tipo, setTipo] = useState("ingreso");
  // Siempre la fecha de HOY en hora de Ciudad de México, sin importar la
  // zona horaria del dispositivo que abra la app (ver lib/dateHelpers.js).
  const [fecha, setFecha] = useState(todayCDMXString);
  const [categoria, setCategoria] = useState(CATEGORIAS_INGRESO[0]);
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  // "cantidad" es nuevo: por defecto 1, así el formulario se comporta EXACTAMENTE
  // igual que antes si nadie la toca. Solo cuando es mayor a 1 (ej. "5 cortes")
  // se multiplica por el precio unitario para armar el total.
  const [cantidad, setCantidad] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categorias = tipo === "ingreso" ? CATEGORIAS_INGRESO : CATEGORIAS_GASTO;
  const cantidadNum = Number(cantidad) || 0;
  const montoNum = Number(monto) || 0;
  const total = cantidadNum * montoNum;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!monto || montoNum <= 0) {
      setError("Ingresa un precio válido, mayor a cero.");
      return;
    }
    if (!cantidad || cantidadNum < 1) {
      setError("La cantidad debe ser al menos 1.");
      return;
    }

    // "Monto" que se manda es el TOTAL ya multiplicado (cantidad × precio
    // unitario). "Cantidad" ahora tiene su propia columna en la hoja
    // (Fecha|Tipo|Categoria|Descripcion|Cantidad|Monto), así que ya no
    // hace falta anotarla dentro de la descripción.
    setLoading(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fecha,
          tipo,
          categoria,
          descripcion,
          cantidad: cantidadNum,
          monto: total,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "No se pudo guardar el movimiento.");

      setMonto("");
      setDescripcion("");
      setCantidad("1");
      onCreated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gold/60 bg-white p-5 shadow-sm dark:border-gold/40 dark:bg-charcoal/60 dark:shadow-none sm:p-6"
    >
      <h3 className="display text-sm uppercase tracking-[0.2em] text-slate-600 dark:text-chrome mb-4">
        Registrar movimiento
      </h3>

      <div className="mb-4 flex rounded-full border border-chrome/30 p-1 text-sm">
        <button
          type="button"
          onClick={() => {
            setTipo("ingreso");
            setCategoria(CATEGORIAS_INGRESO[0]);
          }}
          className={`flex-1 rounded-full py-2.5 transition-colors sm:py-2 ${
            tipo === "ingreso" ? "bg-gold text-ink font-semibold" : "text-slate-600 dark:text-chrome"
          }`}
        >
          Ingreso
        </button>
        <button
          type="button"
          onClick={() => {
            setTipo("gasto");
            setCategoria(CATEGORIAS_GASTO[0]);
          }}
          className={`flex-1 rounded-full py-2.5 transition-colors sm:py-2 ${
            tipo === "gasto" ? "bg-pole-red text-ivory font-semibold" : "text-slate-600 dark:text-chrome"
          }`}
        >
          Gasto
        </button>
      </div>

      {/* "grid-cols-1" como base evita que los campos se amontonen en una
          sola fila en pantallas chicas (ver nota en SummaryCards.jsx).
          A partir de "sm" pasan a 2 columnas. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-chrome">
          Fecha
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="mt-1 w-full rounded-lg border border-chrome/30 bg-transparent p-2 text-sm figure"
            required
          />
        </label>

        <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-chrome">
          Categoría
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="mt-1 w-full rounded-lg border border-chrome/30 bg-transparent p-2 text-sm"
          >
            {categorias.map((c) => (
              <option key={c} value={c} className="text-ink">
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-chrome sm:col-span-2">
          Descripción (opcional)
          <input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej. Corte cliente frecuente"
            className="mt-1 w-full rounded-lg border border-chrome/30 bg-transparent p-2 text-sm"
          />
        </label>

        <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-chrome">
          Cantidad
          <input
            type="number"
            inputMode="numeric"
            step="1"
            min="1"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            className="mt-1 w-full rounded-lg border border-chrome/30 bg-transparent p-2 text-lg figure"
            required
          />
        </label>

        <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-chrome">
          {cantidadNum > 1 ? "Precio unitario" : "Monto"}
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="0.00"
            className="mt-1 w-full rounded-lg border border-chrome/30 bg-transparent p-2 text-lg figure"
            required
          />
        </label>
      </div>

      {/* Solo aparece cuando cantidad > 1, para no estorbar en el uso normal
          de "un movimiento a la vez" que ya tenías. */}
      {cantidadNum > 1 && montoNum > 0 && (
        <p className="mt-3 text-sm text-slate-600 dark:text-chrome">
          {cantidadNum} × ${montoNum.toFixed(2)} ={" "}
          <span className="figure font-semibold text-gold">${total.toFixed(2)}</span>
        </p>
      )}

      {error && <p className="mt-3 text-sm text-pole-red">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-5 w-full rounded-full bg-ink py-3 text-sm font-semibold uppercase tracking-widest text-ivory transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-gold dark:text-ink"
      >
        {loading ? "Guardando..." : "Guardar movimiento"}
      </button>
    </form>
  );
}
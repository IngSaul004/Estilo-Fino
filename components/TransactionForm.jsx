"use client";

import { useState } from "react";

const CATEGORIAS_INGRESO = ["Corte", "Barba", "Corte + Barba", "Producto", "Otro"];
const CATEGORIAS_GASTO = ["Renta", "Insumos", "Servicios", "Nómina", "Otro"];

export default function TransactionForm({ onCreated }) {
  const [tipo, setTipo] = useState("ingreso");
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [categoria, setCategoria] = useState(CATEGORIAS_INGRESO[0]);
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categorias = tipo === "ingreso" ? CATEGORIAS_INGRESO : CATEGORIAS_GASTO;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!monto || Number(monto) <= 0) {
      setError("Ingresa un monto válido, mayor a cero.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fecha, tipo, categoria, descripcion, monto }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "No se pudo guardar el movimiento.");

      setMonto("");
      setDescripcion("");
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

        <label className="text-xs uppercase tracking-widest text-slate-600 dark:text-chrome sm:col-span-2">
          Monto
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
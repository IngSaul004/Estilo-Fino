"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/dateHelpers";

export default function TransactionList({ transactions, onDeleted }) {
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const recientes = [...transactions]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 10);

  async function handleDelete(id, etiqueta) {
    const confirmado = window.confirm(
      `¿Eliminar "${etiqueta}"? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    setError("");
    setDeletingId(id);
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "No se pudo eliminar el movimiento.");
      onDeleted?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-chrome/20 dark:bg-charcoal/60 dark:shadow-none">
      <h3 className="display text-sm uppercase tracking-[0.2em] text-slate-600 dark:text-chrome mb-4">
        Movimientos recientes
      </h3>

      {error && <p className="mb-3 text-sm text-pole-red">{error}</p>}

      {recientes.length === 0 ? (
        <p className="text-sm text-slate-600 dark:text-chrome">
          Aún no hay movimientos registrados. Agrega el primero en el formulario.
        </p>
      ) : (
        <ul className="divide-y divide-chrome/10">
          {recientes.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <div className="min-w-0">
                <p className="font-medium">{t.categoria}</p>
                <p className="truncate text-xs text-slate-600 dark:text-chrome">
                  {t.fecha}
                  {t.cantidad > 1 ? ` · ${t.cantidad}x` : ""}
                  {t.descripcion ? ` · ${t.descripcion}` : ""}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`figure font-semibold ${
                    t.tipo === "ingreso" ? "text-gold" : "text-pole-red"
                  }`}
                >
                  {t.tipo === "ingreso" ? "+" : "-"}
                  {formatMoney(t.monto)}
                </span>

                <button
                  type="button"
                  onClick={() => handleDelete(t.id, `${t.categoria} · ${t.fecha}`)}
                  disabled={deletingId === t.id}
                  aria-label={`Eliminar movimiento: ${t.categoria} del ${t.fecha}`}
                  className="rounded-full p-1.5 text-chrome/70 transition-colors hover:bg-pole-red/10 hover:text-pole-red disabled:opacity-40"
                >
                  {deletingId === t.id ? (
                    <span className="block h-4 w-4 text-center text-[10px] leading-4">…</span>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.75 1A1.75 1.75 0 007 2.75V3H4.25a.75.75 0 000 1.5h.3l.815 10.15A2.75 2.75 0 007.56 17h4.88a2.75 2.75 0 002.745-2.35L15.95 4.5h.3a.75.75 0 000-1.5H13.5V2.75A1.75 1.75 0 0011.75 1h-3zM8.5 2.75a.25.25 0 01.25-.25h3a.25.25 0 01.25.25V3h-3.5v-.25zM6.5 6a.75.75 0 011.5 0v7a.75.75 0 01-1.5 0V6zm4-.75a.75.75 0 00-.75.75v7a.75.75 0 001.5 0V6a.75.75 0 00-.75-.75z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
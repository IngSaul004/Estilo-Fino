"use client";

import { useEffect, useState, useCallback } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import SummaryCards from "@/components/SummaryCards";
import { DailyChart, MonthlyTrendChart } from "@/components/Charts";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import { totalsFor, dailySeries, monthlySeries } from "@/lib/dateHelpers";

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/transactions");
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setTransactions(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totals = totalsFor(transactions);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-10">
      {/* Franja de poste de barbería como firma visual del encabezado */}
      <div className="barber-stripe mb-6 h-1.5 w-24 rounded-full" />

      <header className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-600 dark:text-chrome">Estilo Fino</p>
          <h1 className="display text-4xl leading-none sm:text-6xl">Control de Caja</h1>
        </div>
        <ThemeToggle />
      </header>

      {error && (
        <div className="mb-6 rounded-xl border border-pole-red/50 bg-pole-red/10 p-4 text-sm text-pole-red">
          No se pudo conectar con Google Sheets: {error}
          <br />
          Revisa la guía en el README para configurar tus credenciales.
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-600 dark:text-chrome">Cargando movimientos...</p>
      ) : (
        <>
          {/* Registro hasta arriba: es lo que más se usa día a día,
              sobre todo desde el celular, así que va primero. */}
          <TransactionForm onCreated={load} />

          <div className="mt-6">
            <SummaryCards totals={totals} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <DailyChart data={dailySeries(transactions)} />
            <MonthlyTrendChart data={monthlySeries(transactions)} />
          </div>

          <div className="mt-6">
            <TransactionList transactions={transactions} onDeleted={load} />
          </div>
        </>
      )}

      <footer className="mt-16 pb-6 text-center text-xs text-slate-600 dark:text-chrome">
        CREADO POR{" "}
        <a
          href="https://www.quttadev.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-gold hover:text-gold/80"
        >
          QUTTADEV.COM
        </a>
      </footer>
    </main>
  );
}
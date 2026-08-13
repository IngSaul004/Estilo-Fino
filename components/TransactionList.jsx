import { formatMoney } from "@/lib/dateHelpers";

export default function TransactionList({ transactions }) {
  const recientes = [...transactions]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 10);

  return (
    <div className="rounded-2xl border border-chrome/20 bg-white/60 p-6 dark:bg-charcoal/60">
      <h3 className="display text-sm uppercase tracking-[0.2em] text-chrome mb-4">
        Movimientos recientes
      </h3>

      {recientes.length === 0 ? (
        <p className="text-sm text-chrome">
          Aún no hay movimientos registrados. Agrega el primero en el formulario.
        </p>
      ) : (
        <ul className="divide-y divide-chrome/10">
          {recientes.map((t) => (
            <li key={t.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-medium">{t.categoria}</p>
                <p className="text-xs text-chrome">
                  {t.fecha} {t.descripcion ? `· ${t.descripcion}` : ""}
                </p>
              </div>
              <span
                className={`figure font-semibold ${
                  t.tipo === "ingreso" ? "text-gold" : "text-pole-red"
                }`}
              >
                {t.tipo === "ingreso" ? "+" : "-"}
                {formatMoney(t.monto)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

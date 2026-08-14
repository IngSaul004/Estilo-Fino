"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("estilo-fino-theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      className="flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-xs uppercase tracking-widest text-slate-600 hover:border-gold hover:text-gold transition-colors dark:border-chrome/40 dark:text-chrome dark:hover:border-gold dark:hover:text-gold"
    >
      <span className={`h-2 w-2 rounded-full ${isDark ? "bg-gold" : "bg-pole-red"}`} />
      {isDark ? "Modo oscuro" : "Modo claro"}
    </button>
  );
}
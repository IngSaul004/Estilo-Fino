import { Bebas_Neue, Inter, Space_Mono } from "next/font/google";
import "./globals.css";

const display = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

export const metadata = {
  title: "Estilo Fino — Control de Caja",
  description: "Control de ganancias diarias, semanales y mensuales de Estilo Fino.",
};

// Script inline: aplica el tema guardado ANTES de pintar la página,
// para que no haya parpadeo (flash) de tema claro antes del oscuro.
const themeScript = `
  (function () {
    try {
      var saved = localStorage.getItem('estilo-fino-theme');
      var theme = saved ? saved : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      if (theme === 'dark') document.documentElement.classList.add('dark');
    } catch (e) {}
  })();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${display.variable} ${body.variable} ${mono.variable} bg-ivory text-ink dark:bg-ink dark:text-ivory transition-colors duration-300`}
      >
        {children}
      </body>
    </html>
  );
}

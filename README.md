# Estilo Fino — Control de Caja

SPA (Next.js 14, App Router) para llevar el control de ganancias diarias,
semanales y mensuales de la barbería, con Google Sheets como base de datos
y tema claro/oscuro.

## 1. Por qué esta arquitectura (y no otra)

Para conectar una app web con Google Sheets hay 3 caminos posibles. Te explico
por qué elegí el tercero:

| Opción                                          | Cómo funciona                                                                                                               | Problema                                                                                                                      |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| A. Google Sheets API directo desde el navegador | El navegador llama a Google con OAuth                                                                                       | Expondrías credenciales en el código público y cada usuario tendría que iniciar sesión con Google. Mala idea para un negocio. |
| B. Google Apps Script como "API"                | Publicas un script de Apps Script como Web App                                                                              | Rápido de armar, pero es lento, tiene límites de cuota bajos y es más difícil de asegurar.                                    |
| C. Backend propio con Service Account (elegido) | Next.js API Routes (funciones serverless en Vercel) usan una **cuenta de servicio** de Google para leer/escribir en la hoja | Las credenciales nunca llegan al navegador, es rápido, y es el patrón que usarías en producción real.                         |

**Por eso esta app es un proyecto Next.js completo (no solo HTML/JS suelto):**
las carpetas `app/api/` son funciones que corren en el servidor de Vercel,
no en tu navegador. Ahí es donde viven tus credenciales de Google, protegidas.

## 2. Estructura del proyecto

```
estilo-fino/
├── app/
│   ├── layout.js          # fuentes, tema oscuro/claro sin parpadeo
│   ├── page.js             # el dashboard (junta todo)
│   ├── globals.css         # estilos base + paleta de marca
│   └── api/transactions/route.js   # backend: GET (leer) y POST (crear)
├── components/
│   ├── ThemeToggle.jsx
│   ├── SummaryCards.jsx
│   ├── Charts.jsx
│   ├── TransactionForm.jsx
│   └── TransactionList.jsx
├── lib/
│   ├── sheets.js            # autenticación y llamadas a Google Sheets
│   └── dateHelpers.js       # cálculo de totales día/semana/mes
└── .env.example
```

## 3. Configurar tu Google Sheet

1. Crea un Google Sheet nuevo. Ponle por ejemplo el nombre "Estilo Fino - Caja".
2. Renombra la primera pestaña (hoja) a **Movimientos** — el nombre importa,
   el código lo busca exactamente así (ver `lib/sheets.js`, constante `SHEET_NAME`).
3. En la fila 1, agrega estos encabezados, una columna por celda:

   ```
   Fecha | Tipo | Categoria | Descripcion | Monto
   ```

   El código empieza a leer desde la fila 2 (`SHEET_RANGE = "Movimientos!A2:E"`),
   así que la fila 1 queda libre para tus encabezados.

## 4. Crear la cuenta de servicio (Service Account) de Google

Esto es lo que le da permiso a tu app para leer y escribir en la hoja sin
pedirte iniciar sesión cada vez.

1. Ve a [Google Cloud Console](https://console.cloud.google.com/).
2. Crea un proyecto nuevo (o usa uno existente).
3. En el buscador escribe **"Google Sheets API"** y actívala (Enable).
4. Ve a **APIs y servicios → Credenciales → Crear credenciales → Cuenta de servicio**.
5. Dale un nombre (ej. `estilo-fino-sheets`) y termina el asistente.
6. Entra a la cuenta de servicio creada → pestaña **Claves (Keys)** →
   **Agregar clave → Crear clave nueva → tipo JSON**. Se descargará un archivo `.json`.
7. Abre ese archivo. Necesitas dos valores:
   - `client_email` → esto es tu `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → esto es tu `GOOGLE_PRIVATE_KEY`
8. **Paso clave que mucha gente olvida:** vuelve a tu Google Sheet, dale clic
   en **Compartir**, y comparte la hoja con el correo `client_email` del paso
   anterior, dándole permiso de **Editor**. Sin este paso, la API rechazará
   las peticiones aunque las credenciales sean correctas.

## 5. Variables de entorno

Copia `.env.example` a `.env.local` para probar en tu computadora:

```bash
cp .env.example .env.local
```

Rellena:

- `GOOGLE_SHEET_ID`: lo sacas de la URL de tu hoja:
  `https://docs.google.com/spreadsheets/d/AQUI_VA_EL_ID/edit`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: el `client_email` del JSON.
- `GOOGLE_PRIVATE_KEY`: el `private_key` del JSON, **entre comillas dobles**,
  dejando los `\n` tal como aparecen en el archivo.

## 6. Probar en local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## 7. Desplegar en Vercel

Como mencionaste que tú te encargas del despliegue, aquí el resumen rápido:

1. Sube esta carpeta a un repositorio de GitHub.
2. En [vercel.com](https://vercel.com), importa el repositorio.
3. En **Settings → Environment Variables**, agrega las 3 variables:
   `GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`
   (los mismos valores de tu `.env.local`).
4. Deploy. Vercel detecta Next.js automáticamente, no necesitas configuración
   adicional.

**Nota sobre `GOOGLE_PRIVATE_KEY` en Vercel:** pégala completa, incluyendo
`-----BEGIN PRIVATE KEY-----` y `-----END PRIVATE KEY-----`, con los `\n`
literales (como texto, no como saltos de línea reales). El código en
`lib/sheets.js` los convierte automáticamente a saltos de línea reales.

## 8. Cómo funciona el tema claro/oscuro (por si quieres modificarlo)

- El estado del tema se guarda en `localStorage` bajo la llave `estilo-fino-theme`.
- Un script pequeño en `app/layout.js` se ejecuta **antes** de que React pinte
  la página, para aplicar la clase `dark` al `<html>` de inmediato. Así se evita
  el parpadeo (flash) de tema claro antes de cambiar a oscuro, un error común
  cuando el tema se aplica solo desde React.
- Tailwind está configurado con `darkMode: "class"` en `tailwind.config.js`,
  por eso puedes usar clases como `dark:bg-ink` en cualquier componente.

## 9. Paleta y tipografía (identidad visual)

Pensada para una barbería, no genérica:

- **Colores:** rojo poste `#B3272D`, azul poste `#1E3A5F`, dorado `#C9A227`
  (ganancias), tinta `#151922` (fondo oscuro), marfil `#F5F1E8` (fondo claro).
- **Tipografía:** Bebas Neue para títulos (estilo rótulo de barbería clásica),
  Inter para texto, Space Mono para todas las cifras de dinero (para que
  los números alineen como en una lista de precios).
- **Elemento firma:** la franja diagonal roja/blanca/azul (`.barber-stripe`),
  inspirada en el poste giratorio de barbería, usada como acento en el
  encabezado y en las tarjetas de resumen.

## 10. Siguientes pasos que te recomiendo

- Agregar autenticación simple (ej. una contraseña) si vas a dejar la app
  pública, ya que ahora mismo cualquiera con el link puede escribir datos.
- Agregar filtro por rango de fechas personalizado.
- Agregar categorías configurables por ti en vez de la lista fija en
  `TransactionForm.jsx`.

```
estilo-fino
├─ app
│  ├─ api
│  │  └─ transactions
│  │     └─ route.js
│  ├─ globals.css
│  ├─ layout.js
│  └─ page.js
├─ components
│  ├─ Charts.jsx
│  ├─ SummaryCards.jsx
│  ├─ ThemeToggle.jsx
│  ├─ TransactionForm.jsx
│  └─ TransactionList.jsx
├─ jsconfig.json
├─ lib
│  ├─ dateHelpers.js
│  └─ sheets.js
├─ next.config.js
├─ package-lock.json
├─ package.json
├─ postcss.config.js
├─ README.md
└─ tailwind.config.js

```

# Fix — totales/gráficas en $0.00 y reordenamiento móvil

**Fecha:** 2026-08-14

## Síntoma reportado

Los movimientos se guardaban en Google Sheets, pero los totales (Hoy/Semana/Mes)
mostraban siempre $0.00 y las gráficas aparecían vacías, aunque la lista de
"Movimientos recientes" sí mostraba los registros.

## Causa raíz

`lib/sheets.js` guardaba la fecha con `valueInputOption: "USER_ENTERED"`, lo que
hacía que Google Sheets interpretara `"2026-08-14"` como una fecha real y la
reformateara al leerla como `"14/8/2026"` (locale es-MX). `lib/dateHelpers.js`
usaba `parseISO()` de date-fns, que solo entiende formato ISO — con `"14/8/2026"`
devolvía `Invalid Date`, por lo que todas las comparaciones (`isSameDay`,
`isSameWeek`, `isSameMonth`) daban `false` y los totales/series de gráficas
quedaban siempre en cero.

## Fix aplicado

1. `lib/sheets.js`: se antepone un apóstrofo (`"'" + fecha`) al escribir la
   fecha, forzando a Sheets a guardarla como texto plano, sin reformateo.
2. `lib/dateHelpers.js`: se agregó `parseFecha()`, un parser defensivo que
   intenta `parseISO` primero y cae a formato `d/M/yyyy` como fallback, para
   que las filas ya guardadas con el formato roto sigan funcionando sin
   editarlas a mano en la hoja.
3. Bug secundario encontrado: `SummaryCards.jsx`, `TransactionForm.jsx` y
   `page.js` usaban `grid` sin una clase `grid-cols-1` base, lo que rompía el
   layout en pantallas chicas (Tailwind no define columnas por defecto).
   Se agregó `grid-cols-1` como base en los tres archivos.
4. Por pedido del usuario: se movió `TransactionForm` (registro de
   movimiento) hasta arriba de la página, antes de las tarjetas resumen y
   las gráficas, ya que es la acción más usada día a día desde el celular.

## Nota de seguridad

El usuario pegó su `GOOGLE_PRIVATE_KEY` completa en el chat dentro de
`.env.local`. Se le recomendó rotar la clave de la cuenta de servicio en
Google Cloud Console y actualizarla en Vercel.

## Archivos entregados (vía SendUserFile)

`lib/sheets.js`, `lib/dateHelpers.js`, `app/page.js`,
`components/SummaryCards.jsx`, `components/TransactionForm.jsx`

## Pendiente / siguiente paso del usuario

Reemplazar estos 5 archivos en su repo de GitHub y hacer redeploy en Vercel
(o hacer push, si tiene auto-deploy conectado).

# Fix — totales/gráficas en $0.00, layout móvil y contraste en tema claro

**Fecha:** 2026-08-14

## Ronda 1 — Síntoma: totales/gráficas en $0.00

Causa raíz: `lib/sheets.js` guardaba la fecha con `valueInputOption:
"USER_ENTERED"`, Google Sheets la convertía a fecha real y la devolvía
reformateada (`"14/8/2026"`), rompiendo `parseISO()` en `lib/dateHelpers.js`
(devolvía `Invalid Date`, todas las comparaciones daban `false`).

Fix: apóstrofo inicial al escribir la fecha (fuerza texto plano) +
`parseFecha()` defensivo en dateHelpers.js que soporta ISO y `d/M/yyyy`
(compatibilidad con filas viejas ya guardadas mal).

También en esta ronda: se movió `TransactionForm` hasta arriba de la página
(pedido del usuario), y se corrigió `grid` sin `grid-cols-1` base en
`SummaryCards.jsx`/`TransactionForm.jsx`/`page.js` (rompía el layout en
pantallas chicas).

## Ronda 2 — Síntoma: "fallas de diseño en tema claro"

Diagnóstico con capturas de pantalla + `tailwind.config.js`:

1. **Contraste insuficiente de `text-chrome`** (`#8B93A1`): ~2.75:1 contra
   `ivory` (`#F5F1E8`), falla WCAG AA (necesita 4.5:1 texto normal / 3:1
   texto grande). Contra `ink` (`#151922`, fondo oscuro) da ~5.9:1, por eso
   en oscuro se veía bien y en claro las etiquetas casi no se leían. Fix:
   `text-slate-600 dark:text-chrome` en todas las etiquetas/textos
   secundarios (page.js, SummaryCards.jsx, TransactionForm.jsx,
   TransactionList.jsx, ThemeToggle.jsx, Charts.jsx). Para los ejes de las
   gráficas (SVG, no soportan `dark:`), se agregaron variables CSS
   `--chart-tick` / `--chart-grid` en `globals.css`, redefinidas bajo `.dark`.
2. **Tarjetas sin separación visual del fondo**: `bg-white/60` sobre
   `bg-ivory` (`#F5F1E8`) se veía casi idéntico al fondo de página. Fix:
   `bg-white` (opaco) + `border-slate-200` + `shadow-sm` en modo claro,
   manteniendo `dark:bg-charcoal/60` sin sombra en oscuro.
3. **Tarjeta "Hoy" con bug de tema**: en `SummaryCards.jsx`, `Card` featured
   usaba `bg-charcoal text-ivory` SIN condicional de tema (el `dark:bg-charcoal`
   que tenía era redundante/no-op). Resultado: en modo claro se veía como un
   recuadro oscuro suelto entre tarjetas claras. Fix: `bg-gold/10` en modo
   claro (tinte dorado suave, coherente con el acento de "ganancia") y
   `dark:bg-charcoal` en oscuro; el texto ahora hereda `text-ink dark:text-ivory`
   del body en vez de forzar `text-ivory` siempre.

## Nota de seguridad (pendiente, ronda 1)

El usuario pegó su `GOOGLE_PRIVATE_KEY` completa en el chat. Se le recomendó
rotarla en Google Cloud Console y actualizarla en Vercel.

## Archivos entregados en total (vía SendUserFile)

`lib/sheets.js`, `lib/dateHelpers.js`, `app/page.js`, `app/globals.css`,
`components/SummaryCards.jsx`, `components/TransactionForm.jsx`,
`components/TransactionList.jsx`, `components/Charts.jsx`,
`components/ThemeToggle.jsx`

## Pendiente / siguiente paso del usuario

Reemplazar los archivos en su repo de GitHub, commit + push (o redeploy
manual en Vercel), y confirmar visualmente en tema claro y oscuro.

# Historial de fixes — Estilo Fino Control de Caja

## Ronda 1 — Síntoma: totales/gráficas en $0.00

Causa raíz: `lib/sheets.js` guardaba la fecha con `valueInputOption:
"USER_ENTERED"`, Google Sheets la convertía a fecha real y la devolvía
reformateada (`"14/8/2026"`), rompiendo `parseISO()` en `lib/dateHelpers.js`.

Fix: apóstrofo inicial al escribir la fecha (fuerza texto plano) +
`parseFecha()` defensivo en dateHelpers.js (soporta ISO y `d/M/yyyy` para
filas viejas). También: `TransactionForm` movido hasta arriba de la página
(pedido del usuario) y fix de `grid` sin `grid-cols-1` base (rompía layout
en pantallas chicas).

## Ronda 2 — Síntoma: fallas de diseño en tema claro

1. `text-chrome` (#8B93A1) da ~2.75:1 de contraste contra `ivory`
   (#F5F1E8), falla WCAG AA. Fix: `text-slate-600 dark:text-chrome` en
   labels/textos secundarios; variables CSS `--chart-tick`/`--chart-grid`
   en globals.css para los ejes SVG de las gráficas (no soportan `dark:`).
2. Tarjetas `bg-white/60` sobre `bg-ivory` casi invisibles. Fix: `bg-white`
   sólido + `border-slate-200` + `shadow-sm` en claro.
3. Tarjeta "Hoy" tenía `bg-charcoal text-ivory` SIN condicional de tema (bug,
   no diseño intencional) — se veía como recuadro oscuro suelto en modo
   claro. Fix: `bg-gold/10` en claro, `dark:bg-charcoal` en oscuro, texto
   hereda del body.

## Ronda 3 — Nuevas funciones pedidas por el cliente

1. **Borrar movimientos**: `lib/sheets.js` → `deleteTransaction(id)` usa
   `values.clear` (vacía la fila, no la borra físicamente — las filas vacías
   ya se filtran solas en `readTransactions`). Nueva ruta
   `app/api/transactions/[id]/route.js` con `DELETE`. `TransactionList.jsx`
   tiene botón de borrar con `window.confirm()` antes de eliminar. Limitación
   conocida: solo se pueden borrar los 10 movimientos más recientes (los
   únicos que muestra la lista).
2. **Registro por cantidad** ("5 cortes" en vez de 5 registros): campo nuevo
   `Cantidad` en `TransactionForm.jsx` (default 1, no rompe el flujo
   anterior). Si cantidad > 1, se multiplica por el precio unitario
   client-side y se guarda UN solo movimiento con el total, más una nota
   "Nx" en la descripción. Sin cambios de esquema en la hoja ni en el
   backend — decisión explícita para minimizar piezas nuevas.

## Ronda 4 — Fecha por defecto debe ser siempre CDMX

Bug: `new Date().toISOString().slice(0,10)` convierte a UTC; después de las
6pm hora CDMX (UTC-6) ya "es" el día siguiente en UTC, así que el formulario
ponía la fecha de mañana por las tardes/noches.

Fix en `lib/dateHelpers.js`: `cdmxParts()` usa
`Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" })` para
obtener año/mes/día de CDMX sin depender de la zona horaria del
dispositivo. Nuevas funciones exportadas: `todayCDMXString()` (para el
input de fecha del formulario) y `nowCDMX()` (Date object, usado como
`referenceDate` por defecto en `totalsFor`, y como base de "hoy" en
`dailySeries`/`monthlySeries`) — así "Hoy" siempre significa "hoy en CDMX"
en toda la app, no solo en el formulario.

## Nota de seguridad (pendiente desde ronda 1)

El usuario pegó su `GOOGLE_PRIVATE_KEY` completa en el chat. Se le
recomendó rotarla en Google Cloud Console y actualizarla en Vercel — no
hay confirmación de que ya lo haya hecho.

## Estructura de rutas API (importante para el usuario)

```
app/api/transactions/
├── route.js          ← GET y POST
└── [id]/
    └── route.js       ← DELETE (entregado como "id-route.js", debe
                           renombrarse a "route.js" dentro de esa carpeta)
```

## Archivos entregados en total (vía SendUserFile)

`lib/sheets.js`, `lib/dateHelpers.js`, `app/page.js`, `app/globals.css`,
`app/api/transactions/[id]/route.js`, `components/SummaryCards.jsx`,
`components/TransactionForm.jsx`, `components/TransactionList.jsx`,
`components/Charts.jsx`, `components/ThemeToggle.jsx`

## Pendiente / siguiente paso del usuario

Reemplazar los archivos en su repo de GitHub (ojo con la carpeta `[id]/`
nueva), commit + push, redeploy en Vercel, y probar: borrar un movimiento
de prueba, registrar con cantidad > 1, y verificar que la fecha por defecto
sea la de hoy en CDMX sin importar la hora del día.

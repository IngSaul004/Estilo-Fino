import { google } from "googleapis";

// Nombre de la hoja (pestaña) dentro del Google Sheet donde viven los movimientos.
export const SHEET_NAME = "Movimientos";
// Rango de columnas: Fecha | Tipo | Categoria | Descripcion | Cantidad | Monto
// "Monto" es siempre el TOTAL de la fila (ya multiplicado por Cantidad si
// aplica); "Cantidad" es solo informativa, para tus reportes.
export const SHEET_RANGE = `${SHEET_NAME}!A2:F`;

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  // Las variables de entorno no soportan saltos de línea reales,
  // así que la clave privada se guarda con "\n" escapado y aquí se restaura.
  const key = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

  if (!email || !key) {
    throw new Error(
      "Faltan las credenciales de Google. Revisa GOOGLE_SERVICE_ACCOUNT_EMAIL y GOOGLE_PRIVATE_KEY en tus variables de entorno."
    );
  }

  return new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function getSheetId() {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) {
    throw new Error("Falta GOOGLE_SHEET_ID en tus variables de entorno.");
  }
  return id;
}

export async function getSheetsClient() {
  const auth = getAuth();
  await auth.authorize();
  return google.sheets({ version: "v4", auth });
}

export async function readTransactions() {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSheetId(),
    range: SHEET_RANGE,
  });

  const rows = res.data.values || [];

  return rows
    .map((row, i) => ({
      id: i + 2, // fila real en la hoja (para referencia futura y para poder borrarla)
      fecha: row[0] || "",
      tipo: row[1] || "",
      categoria: row[2] || "",
      descripcion: row[3] || "",
      // Filas viejas (antes de esta columna) tienen la celda vacía -> 1 por defecto.
      cantidad: parseFloat(row[4]) || 1,
      monto: parseFloat(row[5]) || 0,
    }))
    .filter((r) => r.fecha && r.tipo);
}

export async function appendTransaction({
  fecha,
  tipo,
  categoria,
  descripcion,
  cantidad,
  monto,
}) {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: getSheetId(),
    range: SHEET_RANGE,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      // El apóstrofo inicial ("'" + fecha) fuerza a Google Sheets a guardar
      // la fecha como TEXTO plano, sin reformatearla (ver dateHelpers.js).
      values: [["'" + fecha, tipo, categoria, descripcion, cantidad, monto]],
    },
  });
}

// Borra un movimiento SIN eliminar la fila físicamente: solo vacía su
// contenido (A:F de esa fila). readTransactions() ya filtra las filas sin
// fecha/tipo, así que una fila vacía simplemente deja de aparecer en la app.
// Se eligió este enfoque en vez de borrar la fila de verdad porque no
// requiere averiguar el "sheetId" interno de la pestaña (una llamada extra
// a la API) y es más seguro si dos personas editan la hoja al mismo tiempo.
export async function deleteTransaction(id) {
  const rowNumber = Number(id);

  if (!Number.isInteger(rowNumber) || rowNumber < 2) {
    throw new Error("ID de movimiento inválido.");
  }

  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.clear({
    spreadsheetId: getSheetId(),
    range: `${SHEET_NAME}!A${rowNumber}:F${rowNumber}`,
  });
}
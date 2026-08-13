import { google } from "googleapis";

// Nombre de la hoja (pestaña) dentro del Google Sheet donde viven los movimientos.
export const SHEET_NAME = "Movimientos";
// Rango de columnas: Fecha | Tipo | Categoria | Descripcion | Monto
export const SHEET_RANGE = `${SHEET_NAME}!A2:E`;

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
      id: i + 2, // fila real en la hoja (para referencia futura)
      fecha: row[0] || "",
      tipo: row[1] || "",
      categoria: row[2] || "",
      descripcion: row[3] || "",
      monto: parseFloat(row[4]) || 0,
    }))
    .filter((r) => r.fecha && r.tipo);
}

export async function appendTransaction({ fecha, tipo, categoria, descripcion, monto }) {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: getSheetId(),
    range: SHEET_RANGE,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [[fecha, tipo, categoria, descripcion, monto]],
    },
  });
}

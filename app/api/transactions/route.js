import { NextResponse } from "next/server";
import { readTransactions, appendTransaction } from "@/lib/sheets";

// GET /api/transactions -> devuelve todos los movimientos de la hoja
export async function GET() {
  try {
    const data = await readTransactions();
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}

// POST /api/transactions -> agrega un nuevo movimiento (ingreso o gasto)
export async function POST(request) {
  try {
    const body = await request.json();
    const { fecha, tipo, categoria, descripcion, monto, cantidad } = body;

    if (!fecha || !tipo || !monto) {
      return NextResponse.json(
        { ok: false, error: "Faltan campos obligatorios: fecha, tipo o monto." },
        { status: 400 }
      );
    }
    if (tipo !== "ingreso" && tipo !== "gasto") {
      return NextResponse.json(
        { ok: false, error: "El tipo debe ser 'ingreso' o 'gasto'." },
        { status: 400 }
      );
    }

    await appendTransaction({
      fecha,
      tipo,
      categoria: categoria || "General",
      descripcion: descripcion || "",
      // Si no mandan cantidad (o mandan algo inválido), se guarda 1.
      cantidad: Number(cantidad) > 0 ? Number(cantidad) : 1,
      monto: Number(monto),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
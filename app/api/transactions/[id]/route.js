import { NextResponse } from "next/server";
import { deleteTransaction } from "@/lib/sheets";

// DELETE /api/transactions/:id  ->  borra un movimiento por su id (fila en la hoja)
export async function DELETE(request, { params }) {
  try {
    await deleteTransaction(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}

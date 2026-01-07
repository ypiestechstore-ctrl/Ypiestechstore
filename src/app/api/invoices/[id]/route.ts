import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        await prisma.invoice.delete({ where: { id } });
        return NextResponse.json({ message: "Invoice deleted" });
    } catch (error) {
        console.error("Failed to delete invoice:", error);
        return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json();
        const { status, dueDate } = body;

        const updatedInvoice = await prisma.invoice.update({
            where: { id },
            data: {
                status,
                dueDate: dueDate ? new Date(dueDate) : undefined
            }
        });

        return NextResponse.json(updatedInvoice);
    } catch (error) {
        console.error("Failed to update invoice:", error);
        return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
    }
}

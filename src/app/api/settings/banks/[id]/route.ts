import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { bankName, accountName, accountNumber, branchCode, isVisible } = body;

        const updatedBank = await prisma.bankDetail.update({
            where: { id },
            data: {
                bankName,
                accountName,
                accountNumber,
                branchCode,
                isVisible
            }
        });

        return NextResponse.json(updatedBank);
    } catch (error) {
        console.error("Failed to update bank:", error);
        return NextResponse.json({ error: "Failed to update bank" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.bankDetail.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Bank deleted successfully" });
    } catch (error) {
        console.error("Failed to delete bank:", error);
        return NextResponse.json({ error: "Failed to delete bank" }, { status: 500 });
    }
}

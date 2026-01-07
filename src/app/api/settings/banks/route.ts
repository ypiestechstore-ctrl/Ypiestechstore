import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const banks = await prisma.bankDetail.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(banks);
    } catch (error) {
        console.error("Failed to fetch banks:", error);
        return NextResponse.json({ error: "Failed to fetch banks" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { bankName, accountName, accountNumber, branchCode } = body;

        const newBank = await prisma.bankDetail.create({
            data: {
                bankName,
                accountName,
                accountNumber,
                branchCode
            }
        });

        return NextResponse.json(newBank, { status: 201 });
    } catch (error) {
        console.error("Failed to create bank:", error);
        return NextResponse.json({ error: "Failed to create bank" }, { status: 500 });
    }
}

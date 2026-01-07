import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const serials = await prisma.serialNumber.findMany({
            where: { productId: id },
            orderBy: { createdAt: 'desc' },
            take: 50 // Limit for performance
        });
        return NextResponse.json(serials);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch serials" }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json();
        const { serial } = body;

        if (!serial) {
            return NextResponse.json({ error: "Serial is required" }, { status: 400 });
        }

        // Check duplicate
        const existing = await prisma.serialNumber.findUnique({
            where: { serial }
        });

        if (existing) {
            return NextResponse.json({ error: "Serial already exists" }, { status: 400 });
        }

        // Transaction to add serial and increment stock
        const result = await prisma.$transaction([
            prisma.serialNumber.create({
                data: {
                    serial,
                    productId: id,
                    status: "IN_STOCK"
                }
            }),
            prisma.product.update({
                where: { id },
                data: { stock: { increment: 1 } }
            })
        ]);

        return NextResponse.json(result[0]);

    } catch (error) {
        console.error("Add serial error", error);
        return NextResponse.json({ error: "Failed to add serial" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const serialId = searchParams.get("serialId");

    if (!serialId) {
        return NextResponse.json({ error: "Serial ID required" }, { status: 400 });
    }

    try {
        // Transaction to delete serial and decrement stock
        // Only if status was IN_STOCK we decrement? 
        // Logic: If we delete a record, we should probably align stock ONLY if it was counted as stock.

        const serial = await prisma.serialNumber.findUnique({
            where: { id: serialId }
        });

        if (!serial) return NextResponse.json({ error: "Not found" }, { status: 404 });

        if (serial.status === "IN_STOCK") {
            await prisma.$transaction([
                prisma.serialNumber.delete({ where: { id: serialId } }),
                prisma.product.update({
                    where: { id },
                    data: { stock: { decrement: 1 } }
                })
            ]);
        } else {
            // Just delete record if it was SOLD/etc (rare case to delete sold record)
            await prisma.serialNumber.delete({ where: { id: serialId } });
        }

        return NextResponse.json({ message: "Deleted" });

    } catch (error) {
        console.error("Delete serial error", error);
        return NextResponse.json({ error: "Failed to delete serial" }, { status: 500 });
    }
}

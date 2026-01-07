import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const quote = await prisma.quote.findUnique({
            where: { id },
            include: {
                items: true,
                user: true
            }
        });

        if (!quote) {
            return NextResponse.json({ error: "Quote not found" }, { status: 404 });
        }

        return NextResponse.json(quote);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch quote" }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json();
        const { items, total } = body;

        // Transaction: Update quote total and replace items
        const updatedQuote = await prisma.$transaction(async (tx) => {
            // 1. Delete existing items
            await tx.quoteItem.deleteMany({
                where: { quoteId: id }
            });

            // 2. Create new items
            await tx.quoteItem.createMany({
                data: items.map((item: any) => ({
                    quoteId: id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    isCustom: item.isCustom || false,
                    warranty: item.warranty,
                    productId: item.productId // Optional link
                }))
            });

            // 3. Update quote details
            return await tx.quote.update({
                where: { id },
                data: { total },
                include: { items: true }
            });
        });

        return NextResponse.json(updatedQuote);

    } catch (error) {
        console.error("Update quote error", error);
        return NextResponse.json({ error: "Failed to update quote" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        await prisma.quote.delete({
            where: { id }
        });
        return NextResponse.json({ message: "Quote deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete quote" }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    let serialNumbers: Record<string, string[]> = {};

    try {
        if (request.body) {
            const body = await request.json().catch(() => ({}));
            if (body.serialNumbers) serialNumbers = body.serialNumbers;
        }

        const quote = await prisma.quote.findUnique({
            where: { id },
            include: { items: true }
        });

        if (!quote) {
            return NextResponse.json({ error: "Quote not found" }, { status: 404 });
        }

        if (quote.status === "Invoiced") {
            return NextResponse.json({ error: "Quote already invoiced" }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Invoice
            const invoice = await tx.invoice.create({
                data: {
                    total: quote.total,
                    status: "Unpaid",
                    quoteId: quote.id,
                    customerName: quote.customerName,
                    customerEmail: quote.customerEmail,
                    userId: quote.userId
                }
            });

            // 2. Update Quote Status
            await tx.quote.update({
                where: { id },
                data: { status: "Invoiced" }
            });

            // 3. Deduct Stock & Assign Serials
            for (const item of quote.items) {
                if (item.productId) {
                    // Decrement Stock
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { decrement: item.quantity } }
                    });

                    // Assign Serials
                    // Frontend should send map: { [quoteItemId]: ["SN1", "SN2"] }
                    const itemSerials = serialNumbers[item.id];
                    if (itemSerials && Array.isArray(itemSerials)) {
                        for (const serial of itemSerials) {
                            // Verify existence/status could be done here, but trusting inputs for now or letting it fail if invalid
                            await tx.serialNumber.update({
                                where: { serial },
                                data: {
                                    status: "SOLD",
                                    soldAt: new Date(),
                                    invoiceId: invoice.id
                                }
                            });
                        }
                    }
                }
            }

            return invoice;
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Failed to convert quote:", error);
        return NextResponse.json({ error: "Failed to convert quote" }, { status: 500 });
    }
}

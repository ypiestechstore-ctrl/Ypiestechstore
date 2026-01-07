import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    try {
        const where: Prisma.InvoiceWhereInput = {};
        if (userId) {
            where.userId = userId;
        }

        const invoices = await prisma.invoice.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: {
                salesPerson: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                quote: {
                    select: {
                        id: true,
                        items: true
                    }
                }
            }
        });
        return NextResponse.json(invoices);
    } catch (error) {
        console.error("Failed to fetch invoices:", error);
        return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
    }
}

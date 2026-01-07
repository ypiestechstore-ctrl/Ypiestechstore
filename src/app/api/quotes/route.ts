import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { Prisma } from "@prisma/client";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, items, total, customerName, customerEmail, salesPersonId } = body;

        // Create the quote and its items
        const newQuote = await prisma.quote.create({
            data: {
                userId,
                customerName,
                customerEmail,
                salesPersonId, // Link to admin user
                total,
                status: "Draft",
                items: {
                    create: items.map((item: { name: string; price: number; quantity: number; isCustom?: boolean; warranty?: string; productId?: string }) => ({
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        isCustom: item.isCustom || false,
                        warranty: item.warranty,
                        productId: item.productId // Optional link
                    }))
                }
            },
            include: {
                items: true,
                user: true,
                salesPerson: true
            }
        });

        return NextResponse.json(newQuote, { status: 201 });

    } catch (error) {
        console.error("Failed to create quote:", error);
        return NextResponse.json({ error: "Failed to create quote" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    try {
        const where: Prisma.QuoteWhereInput = {};
        if (userId) {
            where.userId = userId;
        }

        const quotes = await prisma.quote.findMany({
            where,
            include: {
                user: true,
                items: true,
                salesPerson: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(quotes);
    } catch (error) {
        console.error("Failed to fetch quotes:", error);
        return NextResponse.json({ error: "Failed to fetch quotes" }, { status: 500 });
    }
}

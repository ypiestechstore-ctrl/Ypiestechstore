import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            items,
            total,
            customerName,
            customerEmail,
            shippingAddress,
            paymentMethod
        } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }

        const newOrder = await prisma.order.create({
            data: {
                total,
                status: "Pending",
                customerName,
                customerEmail,
                shippingAddress,
                paymentMethod,
                items: {
                    create: items.map((item: { id: string; quantity: number; price: number }) => ({
                        productId: item.id,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }
            }
        });

        return NextResponse.json(newOrder, { status: 201 });
    } catch (error) {
        console.error("Failed to create order:", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}

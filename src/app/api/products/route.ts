import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: "desc" },
            include: { images: true }
        });
        return NextResponse.json(products);
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description, price, category, image, stock, sku, isFeatured, costPrice, warrantyPeriod, condition, shortDescription } = body;

        if (!name || !price || !category) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newProduct = await prisma.product.create({
            data: {
                name,
                description: description || "",
                shortDescription: shortDescription || "",
                price: parseFloat(price),
                category,
                image: image || "/placeholder.png",
                stock: parseInt(stock) || 0,
                sku: sku || null,
                isFeatured: isFeatured || false,
                costPrice: parseFloat(costPrice) || 0,
                warrantyPeriod: warrantyPeriod || null,
                condition: condition || "New",

                categories: body.categoryIds && Array.isArray(body.categoryIds) ? {
                    connect: body.categoryIds.map((id: string) => ({ id }))
                } : undefined,

                images: {
                    create: (body.additionalImages || []).map((url: string) => ({ url }))
                }
            },
            include: {

                images: true
            }
        });

        return NextResponse.json(newProduct, { status: 201 });
    } catch (error) {
        console.error("Failed to create product:", error);
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}

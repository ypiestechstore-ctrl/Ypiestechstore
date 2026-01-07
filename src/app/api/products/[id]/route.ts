import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: { images: true }
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json();
        const { name, description, price, category, image, stock, sku, isFeatured, costPrice, warrantyPeriod, condition, shortDescription, additionalImages } = body;

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                shortDescription,
                price: parseFloat(price),
                category,
                image,
                stock: parseInt(stock),
                sku: sku || null,
                isFeatured,
                costPrice: parseFloat(costPrice),
                warrantyPeriod,
                condition,
                images: {
                    deleteMany: {},
                    create: (additionalImages || []).map((url: string) => ({ url }))
                }
            },
        });

        return NextResponse.json(updatedProduct);
    } catch (error) {
        console.error("Failed to update product:", error);
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        await prisma.product.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Product deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }
}

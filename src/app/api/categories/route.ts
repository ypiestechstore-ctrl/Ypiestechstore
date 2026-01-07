import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: "asc" }
        });
        return NextResponse.json(categories);
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, isFeatured, parentId } = body;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const newCategory = await prisma.category.create({
            data: { name, isFeatured: isFeatured || false, parentId: parentId || null }
        });

        return NextResponse.json(newCategory, { status: 201 });
    } catch (error) {
        console.error("Failed to create category:", error);
        // Handle unique constraint error
        if ((error as { code: string }).code === 'P2002') {
            return NextResponse.json({ error: "Category already exists" }, { status: 409 });
        }
        return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
    }
}

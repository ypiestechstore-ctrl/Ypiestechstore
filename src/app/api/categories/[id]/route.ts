import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json();
        const { name, isFeatured, parentId } = body;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        if (parentId === id) {
            return NextResponse.json({ error: "Category cannot be its own parent" }, { status: 400 });
        }

        const updatedCategory = await prisma.category.update({
            where: { id },
            data: { name, isFeatured, parentId: parentId || null }
        });

        return NextResponse.json(updatedCategory);
    } catch (error) {
        console.error("Failed to update category:", error);
        if ((error as { code: string }).code === 'P2002') {
            return NextResponse.json({ error: "Category name already exists" }, { status: 409 });
        }
        return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        await prisma.category.delete({
            where: { id }
        });
        return NextResponse.json({ message: "Category deleted" });
    } catch (error) {
        console.error("Failed to delete category:", error);
        return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
    }
}

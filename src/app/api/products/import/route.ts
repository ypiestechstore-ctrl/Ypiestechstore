

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { products } = body;

        if (!Array.isArray(products)) {
            return NextResponse.json({ error: "Invalid input: products must be an array" }, { status: 400 });
        }

        let created = 0;
        let updated = 0;

        // Filter out products without SKUs as we can't key them reliably for updates
        const validProducts = products.filter((p: any) => p.sku && p.sku.trim() !== "");

        for (const p of validProducts) {
            // Processing Categories Logic
            // Expected format: "Cat1/Sub1/SubSub1; Cat2/Sub2"
            const categoryPaths = (p.category || "").split(';').map((s: string) => s.trim()).filter((s: string) => s !== "");
            const leafCategoryIds: string[] = [];

            for (const path of categoryPaths) {
                const parts = path.split('/').map((s: string) => s.trim()).filter((s: string) => s !== "");
                let currentParentId: string | null = null;

                for (const partName of parts) {
                    // Find or create category with this name and parent
                    let cat = await prisma.category.findFirst({
                        where: { name: partName }
                    });

                    if (!cat) {
                        try {
                            cat = await prisma.category.create({
                                data: {
                                    name: partName,
                                    parentId: currentParentId
                                }
                            });
                        } catch (e) {
                            // Race condition fallback
                            cat = await prisma.category.findFirst({ where: { name: partName } });
                        }
                    }
                    if (cat) {
                        currentParentId = cat.id;
                    }
                }

                if (currentParentId) {
                    leafCategoryIds.push(currentParentId);
                }
            }

            // Remove duplicates
            const uniqueCategoryIds = Array.from(new Set(leafCategoryIds));

            const existing = await prisma.product.findUnique({
                where: { sku: p.sku }
            });

            const productData = {
                name: p.name,
                price: p.price,
                stock: p.stock,
                category: p.category, // Keep string for legacy
                description: p.description || (existing ? existing.description : "") || "",
                image: p.image || (existing ? existing.image : "") || "",
                isSupplierStock: p.isSupplierStock ?? true,
                categories: {
                    connect: uniqueCategoryIds.map(id => ({ id }))
                }
            };

            if (existing) {
                await prisma.product.update({
                    where: { id: existing.id },
                    data: {
                        name: p.name,
                        price: p.price,
                        stock: p.stock,
                        category: p.category,
                        description: p.description || existing.description || "",
                        image: p.image || existing.image || "",
                        isSupplierStock: p.isSupplierStock ?? true,
                        updatedAt: new Date(),
                        categories: {
                            set: uniqueCategoryIds.map(id => ({ id }))
                        },
                        images: p.images && p.images.length > 0 ? {
                            deleteMany: {},
                            create: p.images.map((url: string) => ({ url }))
                        } : undefined
                    }
                });
                updated++;
            } else {
                await prisma.product.create({
                    data: {
                        sku: p.sku,
                        name: p.name,
                        price: p.price,
                        stock: p.stock,
                        category: p.category,
                        description: p.description || "",
                        image: p.image || "",
                        isSupplierStock: p.isSupplierStock ?? true,
                        categories: {
                            connect: uniqueCategoryIds.map(id => ({ id }))
                        },
                        images: {
                            create: (p.images || []).map((url: string) => ({ url }))
                        }
                    }
                });
                created++;
            }
        }


        return NextResponse.json({
            created,
            updated,
            message: `Processed ${validProducts.length} items`
        });

    } catch (error) {
        console.error("Import error:", error);
        // Write error to a file we can read
        const logPath = path.join(process.cwd(), 'import_error.txt');
        fs.writeFileSync(logPath, JSON.stringify(error, Object.getOwnPropertyNames(error), 2));

        return NextResponse.json({ error: "Internal Server Error during import" }, { status: 500 });
    }
}

import { ProductList } from "@/components/catalog/ProductList";
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export default async function CatalogPage({
    searchParams,
}: {
    searchParams: Promise<{ category?: string; search?: string; minPrice?: string; maxPrice?: string; stockStatus?: string }>;
}) {
    const { category, search, minPrice, maxPrice, stockStatus } = await searchParams;
    const trimmedCategory = category?.trim();

    const where: Prisma.ProductWhereInput = {};

    // Stock Status Logic — only filter when explicitly requested
    if (stockStatus) {
        if (stockStatus === 'in_stock') {
            where.stock = { gt: 0 };
        } else if (stockStatus === 'out_of_stock') {
            where.stock = { lte: 0 };
        } else if (stockStatus === 'supplier') {
            where.isSupplierStock = true;
        }
        // 'all' or no stockStatus = show everything
    }

    if (trimmedCategory) {
        // Find category and its children IDs
        const cat = await prisma.category.findFirst({
            where: { name: { equals: trimmedCategory } },
            include: { children: { include: { children: true } } }
        });

        if (cat) {
            const catIds = [cat.id];
            const catNames = [cat.name];
            // Add Level 1 children
            cat.children.forEach((c) => {
                catIds.push(c.id);
                catNames.push(c.name);
                // Add Level 2 children
                if (c.children) {
                    c.children.forEach((cc) => {
                        catIds.push(cc.id);
                        catNames.push(cc.name);
                    });
                }
            });

            // Use OR to match either the relational link OR the legacy string field
            where.OR = [
                { categories: { some: { id: { in: catIds } } } },
                { category: { in: catNames } }
            ];
        } else {
            // Fallback: try legacy string match if relation lookup failed
            where.category = { equals: trimmedCategory };
        }
    }

    if (search) {
        where.OR = [
            { name: { contains: search } },
            { description: { contains: search } },
            { sku: { contains: search } }
        ];
    }

    if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = parseFloat(minPrice);
        if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const products = await prisma.product.findMany({
        where,
        orderBy: { isFeatured: 'desc' } // Nice touch: featured first
    });

    // Fetch hierarchical categories for the sidebar
    // We fetch root categories (parentId: null) and their children
    const categories = await prisma.category.findMany({
        where: { parentId: null },
        include: {
            children: {
                include: {
                    children: true
                },
                orderBy: { name: 'asc' }
            }
        },
        orderBy: { name: 'asc' }
    });

    const sanitizedProducts = products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        image: p.image,
        category: p.category,
        isFeatured: p.isFeatured,
        stock: p.stock,
        isSupplierStock: p.isSupplierStock,
        sku: p.sku || undefined,
    }));

    return (
        <div className="container py-10">
            <ProductList
                products={sanitizedProducts}
                category={category}
                categories={categories} // Now passing full objects
            />
        </div>
    );
}

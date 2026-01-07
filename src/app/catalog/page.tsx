import { ProductList } from "@/components/catalog/ProductList";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export default async function CatalogPage({
    searchParams,
}: {
    searchParams: Promise<{ category?: string; search?: string; minPrice?: string; maxPrice?: string; stockStatus?: string }>;
}) {
    const { category, search, minPrice, maxPrice, stockStatus } = await searchParams;

    // Default to hiding out-of-stock unless specifically requested or filtering by 'out_of_stock'
    const where: Prisma.ProductWhereInput = {};

    // Stock Status Logic
    if (stockStatus) {
        if (stockStatus === 'in_stock') {
            where.stock = { gt: 0 };
        } else if (stockStatus === 'out_of_stock') {
            where.stock = { lte: 0 };
        } else if (stockStatus === 'supplier') {
            where.isSupplierStock = true;
        } else if (stockStatus === 'all') {
            // No stock filter
        }
    } else {
        // Default behavior: show only in-stock items
        where.stock = { gt: 0 };
    }

    if (category) {
        // Find category and its children IDs
        // We look up by name as the URL param is likely a name slug, but ideally should be ID or slug.
        // Using name for backward compatibility with current implementation.
        const cat = await prisma.category.findFirst({
            where: { name: category },
            include: { children: { include: { children: true } } }
        });

        if (cat) {
            const catIds = [cat.id];
            // Add Level 1 children
            cat.children.forEach((c) => {
                catIds.push(c.id);
                // Add Level 2 children
                if (c.children) {
                    c.children.forEach((cc) => catIds.push(cc.id));
                }
            });

            where.categories = {
                some: { id: { in: catIds } }
            };
        } else {
            // Fallback: try legacy string match if relation lookup failed
            where.category = category;
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

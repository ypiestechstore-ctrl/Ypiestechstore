import { prisma } from "@/lib/prisma";
import { ProductsTable } from "./ProductsTable";
import { Prisma } from "@prisma/client";

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { search, category, stockStatus, page } = await searchParams;

    // Pagination
    const PAGE_SIZE = 30;
    const currentPage = typeof page === 'string' ? parseInt(page) : 1;
    const skip = (currentPage - 1) * PAGE_SIZE;

    const where: Prisma.ProductWhereInput = {};

    if (search && typeof search === 'string') {
        where.OR = [
            { name: { contains: search } },
            { sku: { contains: search } },
            { description: { contains: search } },
        ];
    }

    if (category && typeof category === 'string' && category !== 'all') {
        where.categories = {
            some: {
                name: category
            }
        };
    }

    if (stockStatus && typeof stockStatus === 'string' && stockStatus !== 'all') {
        if (stockStatus === 'in_stock') {
            where.stock = { gt: 0 };
        } else if (stockStatus === 'out_of_stock') {
            where.stock = { lte: 0 };
        } else if (stockStatus === 'supplier') {
            where.isSupplierStock = true;
        }
    }

    const [products, totalCount, categories] = await Promise.all([
        prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: { categories: true },
            skip,
            take: PAGE_SIZE,
        }),
        prisma.product.count({ where }),
        prisma.category.findMany({
            orderBy: { name: 'asc' }
        })
    ]);

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

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
        <ProductsTable
            initialProducts={sanitizedProducts}
            categories={categories}
            totalPages={totalPages}
            currentPage={currentPage}
        />
    );
}

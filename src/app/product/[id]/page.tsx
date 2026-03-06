
import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { prisma } from "@/lib/prisma";

import { ProductGallery } from "@/components/product/ProductGallery";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const productRaw = await prisma.product.findUnique({
        where: { id },
        include: { images: true }
    });

    if (!productRaw) {
        notFound();
    }

    const product = {
        ...productRaw,
        sku: productRaw.sku || undefined,
        images: productRaw.images.map(img => img.url),
    };

    return (
        <div className="container py-10">
            <div className="grid gap-8 md:grid-cols-2">
                <ProductGallery
                    mainImage={product.image}
                    additionalImages={product.images}
                    productName={product.name}
                />
                <div className="flex flex-col gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">{product.name}</h1>
                        <p className="text-lg text-muted-foreground">{product.category}</p>
                    </div>
                    <div className="text-3xl font-bold text-primary">
                        {formatCurrency(product.price)}
                    </div>

                    <div className="flex items-center gap-2">
                        {product.stock > 0 ? (
                            <>
                                <span className={`font-medium ${product.isSupplierStock ? "text-blue-600" : "text-green-600"}`}>
                                    {product.isSupplierStock ? "In Stock at Warehouse" : "In Stock"}
                                </span>
                                <span className="text-muted-foreground">({product.stock} available)</span>
                            </>
                        ) : (
                            <span className="font-medium text-destructive">Out of Stock</span>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 text-sm">
                        <div className="rounded-md bg-secondary px-3 py-1">
                            <span className="font-semibold">Condition:</span> {product.condition}
                        </div>
                        {product.warrantyPeriod && (
                            <div className="rounded-md bg-secondary px-3 py-1">
                                <span className="font-semibold">Warranty:</span> {product.warrantyPeriod}
                            </div>
                        )}
                        {product.sku && (
                            <div className="rounded-md bg-secondary px-3 py-1">
                                <span className="font-semibold">SKU:</span> {product.sku}
                            </div>
                        )}
                    </div>

                    {product.shortDescription && (
                        <p className="text-base text-stone-700 leading-relaxed">{product.shortDescription}</p>
                    )}

                    <div className="flex gap-4 pt-4">
                        <AddToCartButton
                            product={product}
                            className="w-full md:w-auto"
                            disabled={product.stock <= 0}
                        />
                    </div>

                    <div className="pt-8 border-t space-y-3">
                        <h3 className="font-semibold text-lg">Product Details</h3>
                        <div 
                            className="text-muted-foreground leading-relaxed prose prose-sm max-w-none dark:prose-invert"
                            dangerouslySetInnerHTML={{ __html: product.description }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

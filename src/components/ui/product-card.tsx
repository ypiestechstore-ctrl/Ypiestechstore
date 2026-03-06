"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@/lib/types";
import { useStore } from "@/context/store-context";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const { addToCart } = useStore();

    return (
        <Card className="overflow-hidden flex flex-col h-full">
            <Link href={`/product/${product.id}`} className="relative aspect-video block">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform hover:scale-105"
                    unoptimized
                />
            </Link>
            <CardHeader>
                <Link href={`/product/${product.id}`}>
                    <CardTitle className="line-clamp-1 hover:underline">{product.name}</CardTitle>
                </Link>
                <CardDescription 
                    className="line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                />
            </CardHeader>
            <CardContent className="flex-1">
                <p className="text-xl font-bold text-primary">
                    {formatCurrency(product.price)}
                </p>
                <div className="mt-2 text-sm">
                    {product.stock > 0 ? (
                        <div className="flex items-center gap-2">
                            <span className={`font-medium ${product.isSupplierStock ? "text-blue-600" : "text-green-600"}`}>
                                {product.isSupplierStock ? "In Stock at Warehouse" : "In Stock"}
                            </span>
                            <span className="text-muted-foreground">({product.stock} available)</span>
                        </div>
                    ) : (
                        <span className="font-medium text-destructive">Out of Stock</span>
                    )}
                </div>
            </CardContent>
            <CardFooter className="gap-2">
                <Button
                    className="flex-1"
                    onClick={() => addToCart(product)}
                >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                </Button>
            </CardFooter>
        </Card>
    );
}

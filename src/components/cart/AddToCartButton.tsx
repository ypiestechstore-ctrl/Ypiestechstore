"use client";

import { Button } from "@/components/ui/button";
import { useStore } from "@/context/store-context";
import { Product } from "@/lib/types";
import { ShoppingCart } from "lucide-react";

interface AddToCartButtonProps {
    product: Product;
    className?: string;
    disabled?: boolean;
}

export function AddToCartButton({ product, className, disabled }: AddToCartButtonProps) {
    const { addToCart } = useStore();

    return (
        <Button
            size="lg"
            className={className}
            onClick={() => addToCart(product)}
            disabled={disabled}
        >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
        </Button>
    );
}

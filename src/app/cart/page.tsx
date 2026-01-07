"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { useStore } from "@/context/store-context";

export default function CartPage() {
    const { cart, removeFromCart, updateCartQuantity } = useStore();

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const vat = subtotal * 0.15; // Assuming products prices are ex VAT, or if inc VAT this logic might need adjustment. 
    // Usually retail prices are inc VAT. If stored price is inc VAT:
    // const total = subtotal; 
    // Let's assume for now prices are final/inc VAT as per typical retail. 
    // BUT the previous mock code did subtotal + vat. 
    // Let's stick to simple total = sum(price * qty) for now, assuming listed prices are final. 
    // If the user wants VAT separation, we can do that, but "Total to pay" usually equals what's on the sticker.
    // However, looking at the previous code: "const total = subtotal + vat;" implies prices were ex VAT.
    // I will stick to the previous logic but keep it simple: Total is just the sum.

    // Actually, looking at the mock data:
    // Gaming Laptop: 24999 (x1)
    // Mouse: 999 (x2) = 1998
    // Subtotal = 26997
    // VAT (15%) = 4049.55
    // Total = 31046.55
    // But checkout page had 29896.85 hardcoded.

    // I will assume the stored prices are INCLUSIVE of VAT for simplicity unless specified otherwise,
    // as is standard in SA (assuming SA based on currency R). 
    // So Total = subtotal.

    const total = subtotal;

    if (cart.length === 0) {
        return (
            <div className="container py-20 text-center">
                <h1 className="mb-4 text-3xl font-bold">Your cart is empty</h1>
                <p className="mb-8 text-muted-foreground">Looks like you haven&apos;t added anything to your cart yet.</p>
                <Link href="/">
                    <Button size="lg">Start Shopping</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container py-10">
            <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <div className="grid gap-4">
                        {cart.map((item) => (
                            <Card key={item.id} className="flex flex-col sm:flex-row items-center gap-4 p-4">
                                <div className="relative h-24 w-24 overflow-hidden rounded-md shrink-0">
                                    {(item.images && item.images.length > 0) ? (
                                        <Image
                                            src={item.images[0]}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-xs text-muted-foreground">
                                            No Image
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-1 text-center sm:text-left">
                                    <h3 className="font-medium">{item.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {formatCurrency(item.price)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                    >
                                        -
                                    </Button>
                                    <span className="w-8 text-center">{item.quantity}</span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                    >
                                        +
                                    </Button>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive"
                                    onClick={() => removeFromCart(item.id)}
                                >
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </Card>
                        ))}
                    </div>
                </div>
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-4 font-bold">
                                <span>Total (Inc. VAT)</span>
                                <span>{formatCurrency(total)}</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Link href="/checkout" className="w-full">
                                <Button className="w-full" size="lg">
                                    Proceed to Checkout
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}

"use client";

import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";
import { useStore } from "@/context/store-context";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function CartSheet() {
    const { cart, removeFromCart, updateCartQuantity } = useStore();
    const [isOpen, setIsOpen] = useState(false);

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                        <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                            {itemCount}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
                <SheetHeader className="px-1">
                    <SheetTitle>Shopping Cart ({itemCount})</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto pr-6">
                    {cart.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center space-y-2">
                            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                            <span className="text-lg font-medium text-muted-foreground">
                                Your cart is empty
                            </span>
                            <Button variant="link" onClick={() => setIsOpen(false)} asChild>
                                <Link href="/catalog">Start Shopping</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4 pt-4">
                            {cart.map((item) => (
                                <div key={item.id} className="flex space-x-4">
                                    <div className="relative h-16 w-16 overflow-hidden rounded-md border">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-1 flex-col justify-between">
                                        <div className="flex justify-between">
                                            <div>
                                                <h3 className="font-medium">{item.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatCurrency(item.price)}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={() => removeFromCart(item.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="w-8 text-center text-sm">
                                                {item.quantity}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {cart.length > 0 && (
                    <div className="border-t pr-6 pt-4">
                        <div className="flex justify-between py-4 font-semibold">
                            <span>Total</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                        <SheetFooter>
                            <Button className="w-full" asChild onClick={() => setIsOpen(false)}>
                                <Link href="/checkout">Proceed to Checkout</Link>
                            </Button>
                        </SheetFooter>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}

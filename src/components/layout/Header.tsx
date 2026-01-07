"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, Menu, User, LogIn, LayoutDashboard, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { CartSheet } from "@/components/cart/CartSheet";

export function Header() {
    const { user, logout } = useAuth();
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        fetch("/api/categories")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setCategories(data);
                }
            })
            .catch(err => console.error("Failed to load header categories", err));
    }, []);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
                <div className="mr-4 hidden md:flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <Image
                            src="/logo.png"
                            alt="Ypie's Tech Store"
                            width={150}
                            height={40}
                            className="h-10 w-auto"
                            priority
                        />
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center transition-colors hover:text-foreground/80 text-foreground/60 outline-none">
                                Catalog <ChevronDown className="ml-1 h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem asChild>
                                    <Link href="/catalog" className="font-semibold">All Products</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {categories.length > 0 ? (
                                    categories.map(cat => (
                                        <DropdownMenuItem key={cat.id} asChild>
                                            <Link href={`/catalog?category=${encodeURIComponent(cat.name)}`}>
                                                {cat.name}
                                            </Link>
                                        </DropdownMenuItem>
                                    ))
                                ) : (
                                    <DropdownMenuItem disabled>Loading categories...</DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Link
                            href="/about"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            About
                        </Link>
                        <Link
                            href="/contact"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            Contact
                        </Link>
                        <Link
                            href="/sell"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            Sell to Us
                        </Link>
                        <Link
                            href="/warranty"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            Warranty Check
                        </Link>
                    </nav>
                </div>
                <Button
                    variant="ghost"
                    className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
                >
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products..."
                                className="pl-8 md:w-[300px] lg:w-[300px]"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        const query = e.currentTarget.value;
                                        if (query.trim()) {
                                            window.location.href = `/catalog?search=${encodeURIComponent(query)}`;
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <nav className="flex items-center gap-2">
                        <CartSheet />

                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full">
                                        <User className="h-5 w-5" />
                                        <span className="sr-only">User menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {(user.role === "admin" || user.role === "super-admin") && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin">
                                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                                Admin Panel
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard">
                                            <User className="mr-2 h-4 w-4" />
                                            Dashboard
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={logout} className="text-red-600">
                                        <LogIn className="mr-2 h-4 w-4 rotate-180" />
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link href="/login">
                                <Button variant="default" size="sm" className="gap-2">
                                    <LogIn className="h-4 w-4" />
                                    Login
                                </Button>
                            </Link>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}

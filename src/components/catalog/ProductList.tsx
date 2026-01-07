"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Product } from "@/lib/types";
import { ProductCard } from "@/components/ui/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
    id: string;
    name: string;
    children?: Category[];
}

interface ProductListProps {
    products: Product[];
    category?: string;
    categories: Category[]; // Updated to accept objects
}

export function ProductList({ products, category, categories = [] }: ProductListProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize state
    const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
    const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
    const currentStockStatus = searchParams.get("stockStatus") || "in_stock";

    // Helper to check if a category or its children is active
    const isCategoryActive = (cat: Category): boolean => {
        if (cat.name === category) return true;
        if (cat.children) {
            return cat.children.some(child => isCategoryActive(child));
        }
        return false;
    };

    const handleApplyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (minPrice) params.set("minPrice", minPrice);
        else params.delete("minPrice");

        if (maxPrice) params.set("maxPrice", maxPrice);
        else params.delete("maxPrice");

        router.push(`/catalog?${params.toString()}`);
    };

    const handleClearFilters = () => {
        setMinPrice("");
        setMaxPrice("");
        router.push("/catalog");
    };

    const handleStockStatusChange = (status: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (status === "in_stock") params.delete("stockStatus"); // Clean URL for default
        else params.set("stockStatus", status);

        router.push(`/catalog?${params.toString()}`);
    };

    const CategoryItem = ({ cat, level = 0 }: { cat: Category, level?: number }) => {
        const [isExpanded, setIsExpanded] = useState(isCategoryActive(cat));
        const isActive = cat.name === category;
        const hasChildren = cat.children && cat.children.length > 0;

        return (
            <div className="space-y-1">
                <div className={cn("flex items-center w-full group", level > 0 && "ml-3")}>
                    {hasChildren && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                setIsExpanded(!isExpanded);
                            }}
                            className="p-1 hover:bg-muted rounded-sm mr-1"
                        >
                            {isExpanded ? (
                                <ChevronDown className="h-3 w-3 text-muted-foreground" />
                            ) : (
                                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                            )}
                        </button>
                    )}

                    <Link
                        href={`/catalog?category=${encodeURIComponent(cat.name)}`}
                        className="flex-1"
                    >
                        <Button
                            variant={isActive ? "secondary" : "ghost"}
                            size="sm"
                            className={cn(
                                "w-full justify-start h-8 px-2 font-normal",
                                isActive && "font-medium",
                                !hasChildren && "pl-6" // Indent if no expand button
                            )}
                        >
                            {cat.name}
                        </Button>
                    </Link>
                </div>

                {hasChildren && isExpanded && (
                    <div className="border-l ml-3 pl-1 space-y-1">
                        {cat.children!.map(child => (
                            <CategoryItem key={child.id} cat={child} level={level + 1} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Filters */}
            <div className="w-full md:w-64 space-y-8 flex-shrink-0">

                {/* Categories */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Categories</h3>
                    <div className="flex flex-col space-y-1">
                        <Link href="/catalog">
                            <Button
                                variant={!category ? "secondary" : "ghost"}
                                className="w-full justify-start h-8 px-2 font-normal"
                            >
                                All Products
                            </Button>
                        </Link>
                        {categories.map((cat) => (
                            <CategoryItem key={cat.id} cat={cat} />
                        ))}
                    </div>
                </div>

                {/* Stock Status */}
                <div className="pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-4">Availability</h3>
                    <RadioGroup
                        value={currentStockStatus}
                        onValueChange={handleStockStatusChange}
                        className="space-y-3"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="in_stock" id="st-in-stock" />
                            <Label htmlFor="st-in-stock" className="font-normal cursor-pointer">In Stock</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="supplier" id="st-supplier" />
                            <Label htmlFor="st-supplier" className="font-normal cursor-pointer">Warehouse / Supplier</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="all" id="st-all" />
                            <Label htmlFor="st-all" className="font-normal cursor-pointer">Show All</Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* Price Range */}
                <div className="pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-4">Price Range</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <Label htmlFor="min-price" className="text-xs">Min</Label>
                                <Input
                                    id="min-price"
                                    type="number"
                                    placeholder="0"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    className="h-8"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="max-price" className="text-xs">Max</Label>
                                <Input
                                    id="max-price"
                                    type="number"
                                    placeholder="Max"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    className="h-8"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Button size="sm" onClick={handleApplyFilters}>Apply Price</Button>
                            {(minPrice || maxPrice || category || currentStockStatus !== 'in_stock') && (
                                <Button size="sm" variant="outline" onClick={handleClearFilters}>
                                    Clear All Filters
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {category ? `${category}` : "All Products"}
                    </h1>
                    <p className="text-muted-foreground">
                        {products.length} products found
                    </p>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-10 bg-muted/20 rounded-lg">
                        <p className="text-muted-foreground text-lg mb-2">No products found.</p>
                        <p className="text-sm">Try adjusting your filters or category.</p>
                        <Button variant="link" onClick={handleClearFilters} className="mt-4">
                            Clear all filters
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

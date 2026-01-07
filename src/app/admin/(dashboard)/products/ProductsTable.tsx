"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Edit, Trash2, Plus, Save, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/lib/types";
import { updateProductStock, deleteProduct, deleteProducts } from "@/lib/actions";
import { useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";

interface Category {
    id: string;
    name: string;
}

interface ProductsTableProps {
    initialProducts: Product[];
    categories: Category[];
    totalPages: number;
    currentPage: number;
}

export function ProductsTable({ initialProducts, categories, totalPages, currentPage }: ProductsTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State for local UI
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [editingStockId, setEditingStockId] = useState<string | null>(null);
    const [tempStock, setTempStock] = useState<number>(0);

    // Filters State
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "all");
    const [stockFilter, setStockFilter] = useState(searchParams.get("stockStatus") || "all");

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (searchParams.get("search") || "")) {
                updateFilters(search, categoryFilter, stockFilter, 1); // Reset to page 1 on search
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const updateFilters = (s: string, c: string, st: string, p: number) => {
        const params = new URLSearchParams();
        if (s) params.set("search", s);
        if (c && c !== "all") params.set("category", c);
        if (st && st !== "all") params.set("stockStatus", st);
        if (p > 1) params.set("page", p.toString());

        router.push(`?${params.toString()}`);
    };

    const handleCategoryChange = (val: string) => {
        setCategoryFilter(val);
        updateFilters(search, val, stockFilter, 1);
    };

    const handleStockChange = (val: string) => {
        setStockFilter(val);
        updateFilters(search, categoryFilter, val, 1);
    };

    const handlePageChange = (newPage: number) => {
        updateFilters(search, categoryFilter, stockFilter, newPage);
    };

    const startEditing = (id: string, currentStock: number) => {
        setEditingStockId(id);
        setTempStock(currentStock);
    };

    const saveStock = async (id: string) => {
        await updateProductStock(id, tempStock);
        setEditingStockId(null);
        router.refresh();
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this product?")) {
            await deleteProduct(id);
            router.refresh();
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === initialProducts.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(initialProducts.map(p => p.id));
        }
    };

    const toggleSelect = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedIds.length) return;
        if (confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) {
            await deleteProducts(selectedIds);
            setSelectedIds([]);
            router.refresh();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-3xl font-bold">Products</h1>
                <Link href="/admin/products/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-end bg-card p-4 rounded-lg border">
                <div className="w-full md:w-1/3 space-y-2">
                    <label className="text-sm font-medium">Search</label>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="w-full md:w-1/4 space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-full md:w-1/4 space-y-2">
                    <label className="text-sm font-medium">Stock Status</label>
                    <Select value={stockFilter} onValueChange={handleStockChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Any Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Any Status</SelectItem>
                            <SelectItem value="in_stock">In Stock</SelectItem>
                            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                            <SelectItem value="supplier">Supplier Stock</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {selectedIds.length > 0 && (
                    <Button variant="destructive" onClick={handleBulkDelete}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete ({selectedIds.length})
                    </Button>
                )}
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12 text-center">
                                <Checkbox
                                    checked={initialProducts.length > 0 && selectedIds.length === initialProducts.length}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No products found matching your filters.
                                </TableCell>
                            </TableRow>
                        ) : (
                            initialProducts.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="text-center">
                                        <Checkbox
                                            checked={selectedIds.includes(product.id)}
                                            onCheckedChange={() => toggleSelect(product.id)}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{product.name}</span>
                                            {product.sku && <span className="text-xs text-muted-foreground">SKU: {product.sku}</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>{product.category}</TableCell>
                                    <TableCell>R {product.price.toLocaleString("en-US")}</TableCell>
                                    <TableCell>
                                        {editingStockId === product.id ? (
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    className="w-20 h-8"
                                                    value={tempStock}
                                                    onChange={(e) => setTempStock(parseInt(e.target.value))}
                                                />
                                                <Button size="sm" variant="ghost" onClick={() => saveStock(product.id)}>
                                                    <Save className="h-4 w-4 text-green-600" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div
                                                className="cursor-pointer hover:underline flex items-center gap-2"
                                                onClick={() => startEditing(product.id, product.stock)}
                                            >
                                                {product.stock}
                                                <Edit className="h-3 w-3 text-muted-foreground opacity-50" />
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/admin/products/${product.id}`}>
                                            <Button variant="ghost" size="icon">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(product.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    <div className="text-sm font-medium">
                        Page {currentPage} of {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}

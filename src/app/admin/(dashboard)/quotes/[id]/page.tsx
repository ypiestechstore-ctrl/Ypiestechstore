"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { QuoteItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Trash2, Search, Download } from "lucide-react";
import { generateQuotePDF } from "@/lib/pdf-generator";

interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    sku?: string | null;
    category: string;
    condition: string;
    warrantyPeriod?: string;
}

export default function EditQuotePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Quote Data
    const [quoteData, setQuoteData] = useState<any>(null);
    const [items, setItems] = useState<QuoteItem[]>([]);

    // Item adding state
    const [selectedProductId, setSelectedProductId] = useState<string>("");
    const [productSearch, setProductSearch] = useState("");

    // Filters
    const [filterCategory, setFilterCategory] = useState("All");
    const [filterCondition, setFilterCondition] = useState("All");
    const [filterStock, setFilterStock] = useState("All");

    const [customItemName, setCustomItemName] = useState("");
    const [customItemPrice, setCustomItemPrice] = useState("");
    const [customItemWarranty, setCustomItemWarranty] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [isCustom, setIsCustom] = useState(false);

    useEffect(() => {
        if (id) {
            Promise.all([fetchQuote(id), fetchProducts()]);
        }
    }, [id]);

    const fetchQuote = async (quoteId: string) => {
        try {
            const res = await fetch(`/api/quotes/${quoteId}`);
            if (res.ok) {
                const data = await res.json();
                setQuoteData(data);
                setItems(data.items.map((item: any) => ({
                    ...item,
                    isCustom: item.isCustom ?? false // Ensure boolean
                })));
            } else {
                alert("Failed to load quote");
            }
        } catch (error) {
            console.error("Failed to fetch quote", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/products");
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
        }
    };

    const handleAddItem = () => {
        if (isCustom) {
            if (!customItemName || !customItemPrice) return;
            const newItem: QuoteItem = {
                id: Math.random().toString(36).substring(7),
                name: customItemName,
                price: parseFloat(customItemPrice),
                quantity: quantity,
                isCustom: true,
                warranty: customItemWarranty || undefined,
            };
            setItems([...items, newItem]);
            setCustomItemName("");
            setCustomItemPrice("");
            setCustomItemWarranty("");
        } else {
            const product = products.find(p => p.id === selectedProductId);
            if (!product) return;

            const newItem: QuoteItem = {
                id: Math.random().toString(36).substring(7),
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: quantity,
                isCustom: false,
                warranty: product.warrantyPeriod,
            };
            setItems([...items, newItem]);
            setSelectedProductId("");
            // Keep filters active
        }
        setQuantity(1);
    };

    const handleUpdateItemQuantity = (index: number, newQty: number) => {
        if (isNaN(newQty) || newQty < 1) return;
        const newItems = [...items];
        newItems[index].quantity = newQty;
        setItems(newItems);
    };

    const handleUpdateItemField = (index: number, field: keyof QuoteItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleSerialChange = (itemIndex: number, serialIndex: number, value: string) => {
        const newItems = [...items];
        const serials = [...(newItems[itemIndex].serialNumbers || [])];
        serials[serialIndex] = value;
        newItems[itemIndex] = { ...newItems[itemIndex], serialNumbers: serials };
        setItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const handleUpdateQuote = async () => {
        if (items.length === 0) return;
        setIsSaving(true);

        try {
            const res = await fetch(`/api/quotes/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items,
                    total: calculateTotal(),
                })
            });

            if (res.ok) {
                router.push("/admin/quotes");
                router.refresh();
            } else {
                alert("Failed to update quote");
            }
        } catch (error) {
            console.error("Error updating quote:", error);
            alert("An error occurred.");
        } finally {
            setIsSaving(false);
        }
    };

    // Filter products
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
            (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()));

        const matchesCategory = filterCategory === "All" || p.category === filterCategory;
        const matchesCondition = filterCondition === "All" || (p.condition || "New") === filterCondition;

        let matchesStock = true;
        if (filterStock === "In Stock") matchesStock = p.stock > 0;
        if (filterStock === "Out of Stock") matchesStock = p.stock <= 0;

        return matchesSearch && matchesCategory && matchesCondition && matchesStock;
    });

    if (isLoading) return <div className="p-10 text-center">Loading quote...</div>;
    if (!quoteData) return <div className="p-10 text-center">Quote not found</div>;

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Edit Quote #{id.substring(0, 8)}</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => generateQuotePDF({ ...quoteData, items })}>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                    </Button>
                    <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Customer Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-2">
                        <div><span className="font-semibold">Name:</span> {quoteData.customerName}</div>
                        <div><span className="font-semibold">Email:</span> {quoteData.customerEmail}</div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Add Item</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-4 mb-4">
                            <Button
                                variant={!isCustom ? "default" : "outline"}
                                onClick={() => setIsCustom(false)}
                                className="flex-1"
                            >
                                Select Product
                            </Button>
                            <Button
                                variant={isCustom ? "default" : "outline"}
                                onClick={() => setIsCustom(true)}
                                className="flex-1"
                            >
                                Custom Item
                            </Button>
                        </div>

                        {!isCustom ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Filter & Search (Showing {filteredProducts.length} items)</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="relative col-span-2">
                                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search name or SKU..."
                                                value={productSearch}
                                                onChange={e => setProductSearch(e.target.value)}
                                                className="pl-8"
                                            />
                                        </div>
                                        <select
                                            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={filterCategory}
                                            onChange={e => setFilterCategory(e.target.value)}
                                        >
                                            <option value="All">All Categories</option>
                                            <option value="Prebuilt PCs">Prebuilt PCs</option>
                                            <option value="Components">Components</option>
                                            <option value="Peripherals">Peripherals</option>
                                            <option value="Laptops">Laptops</option>
                                            <option value="Services">Services</option>
                                        </select>
                                        <select
                                            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={filterCondition}
                                            onChange={e => setFilterCondition(e.target.value)}
                                        >
                                            <option value="All">All Conditions</option>
                                            <option value="New">New</option>
                                            <option value="Refurbished - Excellent">Refurb Ex</option>
                                            <option value="Refurbished - Good">Refurb Good</option>
                                            <option value="Used">Used</option>
                                        </select>
                                        <select
                                            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm col-span-2"
                                            value={filterStock}
                                            onChange={e => setFilterStock(e.target.value)}
                                        >
                                            <option value="All">All Stock Status</option>
                                            <option value="In Stock">In Stock Only</option>
                                            <option value="Out of Stock">Out of Stock Only</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Select Product (Click to select)</Label>
                                    <div className="max-h-[300px] overflow-y-auto space-y-2 border rounded-md p-2 bg-muted/10">
                                        {filteredProducts.map(p => (
                                            <div
                                                key={p.id}
                                                className={`p-3 border rounded-md cursor-pointer flex justify-between items-center transition-colors ${selectedProductId === p.id ? 'bg-primary/10 border-primary ring-1 ring-primary' : 'bg-background hover:bg-muted'}`}
                                                onClick={() => setSelectedProductId(p.id)}
                                            >
                                                <div>
                                                    <div className="font-medium text-sm">{p.name}</div>
                                                    <div className="text-xs text-muted-foreground">{p.sku || "No SKU"} • {p.category}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-sm">R {p.price}</div>
                                                    <div className="flex gap-2 text-[10px] justify-end mt-1">
                                                        <span className={`px-1.5 py-0.5 rounded-full ${p.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                            {p.stock > 0 ? `${p.stock} Left` : 'No Stock'}
                                                        </span>
                                                        <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-full border border-gray-200">
                                                            {p.condition}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {filteredProducts.length === 0 && (
                                            <div className="text-center py-8 text-muted-foreground text-sm">
                                                No products found matching filters.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label>Item Name</Label>
                                    <Input
                                        value={customItemName}
                                        onChange={(e) => setCustomItemName(e.target.value)}
                                        placeholder="Service / Custom Part"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Warranty</Label>
                                    <Input
                                        value={customItemWarranty}
                                        onChange={(e) => setCustomItemWarranty(e.target.value)}
                                        placeholder="e.g. 6 Months"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Price (R)</Label>
                                    <Input
                                        type="number"
                                        value={customItemPrice}
                                        onChange={(e) => setCustomItemPrice(e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <Label>Quantity</Label>
                            <Input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value))}
                            />
                        </div>

                        <Button onClick={handleAddItem} className="w-full">
                            Add to Quote
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quote Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={index} className="border rounded-lg p-3 space-y-2 bg-muted/20">
                                    <div className="flex items-start gap-2">
                                        <div className="flex-1 min-w-0">
                                            {item.isCustom ? (
                                                <Input
                                                    value={item.name}
                                                    onChange={(e) => handleUpdateItemField(index, "name", e.target.value)}
                                                    className="h-8 w-full font-medium"
                                                    placeholder="Item name"
                                                />
                                            ) : (
                                                <p className="font-medium text-sm truncate">{item.name}</p>
                                            )}
                                            <span className="text-xs text-muted-foreground">{item.isCustom ? 'Custom' : 'Product'}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveItem(index)}
                                            className="text-red-500 hover:text-red-700 shrink-0"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div>
                                            <span className="text-xs text-muted-foreground block">Warranty</span>
                                            {item.isCustom ? (
                                                <Input
                                                    value={item.warranty || ""}
                                                    onChange={(e) => handleUpdateItemField(index, "warranty", e.target.value)}
                                                    className="h-7 text-xs"
                                                    placeholder="-"
                                                />
                                            ) : (
                                                <span>{item.warranty || "-"}</span>
                                            )}
                                        </div>
                                        <div>
                                            <span className="text-xs text-muted-foreground block">Price</span>
                                            {item.isCustom ? (
                                                <div className="flex items-center">
                                                    <span className="mr-1 text-xs">R</span>
                                                    <Input
                                                        type="number"
                                                        value={item.price}
                                                        onChange={(e) => handleUpdateItemField(index, "price", parseFloat(e.target.value))}
                                                        className="h-7 text-xs"
                                                    />
                                                </div>
                                            ) : (
                                                <span>R {item.price.toLocaleString()}</span>
                                            )}
                                        </div>
                                        <div>
                                            <span className="text-xs text-muted-foreground block">Qty</span>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => handleUpdateItemQuantity(index, parseInt(e.target.value))}
                                                className="h-7 w-16 text-xs"
                                            />
                                        </div>
                                    </div>

                                    <div className="text-xs font-medium text-right text-primary">
                                        Total: R {(item.price * item.quantity).toLocaleString()}
                                    </div>

                                    {item.productId && (
                                        <div className="border-t pt-2 space-y-1">
                                            <span className="text-xs font-medium text-muted-foreground">Serial Numbers (optional — {(item.serialNumbers?.filter(s => s?.trim()).length || 0)}/{item.quantity} entered)</span>
                                            <div className="grid grid-cols-2 gap-1">
                                                {Array.from({ length: item.quantity }).map((_, idx) => (
                                                    <Input
                                                        key={idx}
                                                        placeholder={`Serial #${idx + 1}`}
                                                        value={item.serialNumbers?.[idx] || ""}
                                                        onChange={(e) => handleSerialChange(index, idx, e.target.value)}
                                                        className="h-7 text-xs font-mono"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {items.length > 0 && (
                                <div className="text-right font-bold text-lg border-t pt-3">
                                    Total: R {calculateTotal().toLocaleString()}
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <Button onClick={handleUpdateQuote} disabled={isSaving || items.length === 0}>
                                {isSaving ? "Updating..." : "Save Quote"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

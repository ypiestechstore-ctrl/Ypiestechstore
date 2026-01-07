"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Search } from "lucide-react";
import { useAuth } from "@/context/auth-context";

interface Customer {
    id: string;
    name: string | null;
    email: string;
    contactNumber: string | null;
}

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

export default function CreateQuotePage() {
    const router = useRouter();
    const { user } = useAuth();

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Customer Selection State
    const [customerMode, setCustomerMode] = useState("existing"); // existing | new
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

    // New Customer State
    const [newCustomerName, setNewCustomerName] = useState("");
    const [newCustomerEmail, setNewCustomerEmail] = useState("");
    const [newCustomerPhone, setNewCustomerPhone] = useState("");
    const [newCustomerAddress, setNewCustomerAddress] = useState("");

    const [items, setItems] = useState<QuoteItem[]>([]);

    // Item adding state
    const [selectedProductId, setSelectedProductId] = useState<string>("");
    const [productSearch, setProductSearch] = useState("");

    // Filters
    const [filterCategory, setFilterCategory] = useState("All");
    const [filterCondition, setFilterCondition] = useState("All");
    const [filterStock, setFilterStock] = useState("All");
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

    const [customItemName, setCustomItemName] = useState("");
    const [customItemPrice, setCustomItemPrice] = useState("");
    const [customItemWarranty, setCustomItemWarranty] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [isCustom, setIsCustom] = useState(false);

    useEffect(() => {
        fetchCustomers();
        fetchProducts();
        const fetchCategories = async () => {
            try {
                const res = await fetch("/api/categories");
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                }
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };
        fetchCategories();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await fetch("/api/customers");
            if (res.ok) {
                const data = await res.json();
                setCustomers(data);
            }
        } catch (error) {
            console.error("Failed to fetch customers", error);
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

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const handleSaveQuote = async () => {
        if (items.length === 0) return;

        setIsLoading(true);
        let userId = selectedCustomerId;
        let finalName = "";
        let finalEmail = "";

        try {
            // 1. If new customer, create them first
            if (customerMode === "new") {
                if (!newCustomerEmail || !newCustomerPhone) {
                    alert("Email and Phone are required for new customers.");
                    setIsLoading(false);
                    return;
                }

                const res = await fetch("/api/customers", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: newCustomerName,
                        email: newCustomerEmail,
                        contactNumber: newCustomerPhone,
                        address: newCustomerAddress
                    })
                });

                if (!res.ok) {
                    const err = await res.json();
                    alert(err.error || "Failed to create customer");
                    setIsLoading(false);
                    return;
                }

                const newCustomer = await res.json();
                userId = newCustomer.id;
                finalName = newCustomer.name;
                finalEmail = newCustomer.email;
            } else {
                const customer = customers.find(c => c.id === userId);
                if (customer) {
                    finalName = customer.name || "Unknown";
                    finalEmail = customer.email;
                }
            }

            if (!userId) {
                alert("Please select or create a customer.");
                setIsLoading(false);
                return;
            }

            // 2. Create the Quote
            const quoteRes = await fetch("/api/quotes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    items,
                    total: calculateTotal(),
                    customerName: finalName,
                    customerEmail: finalEmail,
                    salesPersonId: user?.id
                })
            });

            if (quoteRes.ok) {
                router.push("/admin/quotes");
                router.refresh();
            } else {
                alert("Failed to create quote");
            }

        } catch (error) {
            console.error("Error saving quote:", error);
            alert("An error occurred.");
        } finally {
            setIsLoading(false);
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

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Create New Quote</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="existing" onValueChange={setCustomerMode}>
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="existing">Existing Customer</TabsTrigger>
                                <TabsTrigger value="new">New Customer</TabsTrigger>
                            </TabsList>

                            <TabsContent value="existing" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Select Customer</Label>
                                    <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a customer..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customers.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.name || c.email} ({c.contactNumber || "No Phone"})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </TabsContent>

                            <TabsContent value="new" className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="newName">Full Name</Label>
                                    <Input
                                        id="newName"
                                        value={newCustomerName}
                                        onChange={(e) => setNewCustomerName(e.target.value)}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newEmail">Email <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="newEmail"
                                        type="email"
                                        value={newCustomerEmail}
                                        onChange={(e) => setNewCustomerEmail(e.target.value)}
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPhone">Contact Number <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="newPhone"
                                        type="tel"
                                        value={newCustomerPhone}
                                        onChange={(e) => setNewCustomerPhone(e.target.value)}
                                        placeholder="082 123 4567"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newAddress">Address (Optional)</Label>
                                    <Input
                                        id="newAddress"
                                        value={newCustomerAddress}
                                        onChange={(e) => setNewCustomerAddress(e.target.value)}
                                        placeholder="123 Main St"
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

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
                                            {categories.map((c) => (
                                                <option key={c.id} value={c.name}>{c.name}</option>
                                            ))}
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
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Warranty</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Qty</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>
                                            {item.isCustom ? (
                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Custom</span>
                                            ) : (
                                                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Product</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{item.warranty || "-"}</TableCell>
                                        <TableCell>R {item.price.toLocaleString()}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>R {(item.price * item.quantity).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveItem(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {items.length > 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-right font-bold text-lg">Total:</TableCell>
                                        <TableCell className="font-bold text-lg">R {calculateTotal().toLocaleString()}</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        <div className="mt-6 flex justify-end gap-4">
                            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                            <Button
                                onClick={handleSaveQuote}
                                disabled={items.length === 0 || isLoading || (customerMode === 'existing' && !selectedCustomerId)}
                            >
                                {isLoading ? "Saving..." : "Save Quote"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div >
    );
}

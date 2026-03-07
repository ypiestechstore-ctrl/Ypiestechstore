"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, FileText, Pencil, Trash2, ArrowRightLeft, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { generateQuotePDF } from "@/lib/pdf-generator";

import { Quote } from "@/lib/types";

export default function QuotesPage() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Convert Sheet State
    const [isConvertSheetOpen, setIsConvertSheetOpen] = useState(false);
    const [convertingQuote, setConvertingQuote] = useState<Quote | null>(null);
    const [serialInputs, setSerialInputs] = useState<Record<string, string[]>>({});
    const [isConverting, setIsConverting] = useState(false);

    useEffect(() => {
        fetchQuotes();
    }, []);

    const fetchQuotes = async () => {
        try {
            const res = await fetch("/api/quotes");
            if (res.ok) {
                const data = await res.json();
                setQuotes(data);
            }
        } catch (error) {
            console.error("Failed to fetch quotes", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this quote?")) return;
        try {
            const res = await fetch(`/api/quotes/${id}`, { method: "DELETE" });
            if (res.ok) {
                setQuotes(prev => prev.filter(q => q.id !== id));
            }
        } catch (error) {
            alert("Failed to delete quote");
        }
    };

    const openConvertSheet = async (id: string) => {
        // Fetch full quote details to get items
        try {
            const res = await fetch(`/api/quotes/${id}`);
            if (res.ok) {
                const quote = await res.json();
                setConvertingQuote(quote);
                // Pre-fill serial inputs from saved serial numbers on each item
                const preFilled: Record<string, string[]> = {};
                if (quote.items) {
                    for (const item of quote.items) {
                        if (item.productId && item.serialNumbers && item.serialNumbers.length > 0) {
                            preFilled[item.id] = [...item.serialNumbers];
                        }
                    }
                }
                setSerialInputs(preFilled);
                setIsConvertSheetOpen(true);
            } else {
                alert("Failed to fetch quote details");
            }
        } catch (error) {
            console.error(error);
            alert("Error fetching quote details");
        }
    };

    const handleSerialChange = (itemId: string, index: number, value: string) => {
        setSerialInputs(prev => {
            const currentSerials = prev[itemId] ? [...prev[itemId]] : [];
            currentSerials[index] = value;
            return {
                ...prev,
                [itemId]: currentSerials
            };
        });
    };

    const handleConfirmConvert = async () => {
        if (!convertingQuote) return;

        // Check for missing serials and warn (but don't block)
        if (convertingQuote.items) {
            const missingSerials: string[] = [];
            for (const item of convertingQuote.items) {
                if (item.productId) {
                    const serials = serialInputs[item.id] || [];
                    const filledSerials = serials.filter(s => s && s.trim() !== "");
                    if (filledSerials.length < item.quantity) {
                        missingSerials.push(`${item.name} (${filledSerials.length}/${item.quantity} serials entered)`);
                    }
                }
            }
            if (missingSerials.length > 0) {
                const proceed = confirm(
                    `Warning: The following items are missing serial numbers:\n\n${missingSerials.join("\n")}\n\nYou can still convert — serial numbers can be assigned later. Continue?`
                );
                if (!proceed) return;
            } else {
                if (!confirm("Confirm conversion to Invoice? This will deduct stock.")) return;
            }
        } else {
            if (!confirm("Confirm conversion to Invoice? This will deduct stock.")) return;
        }

        setIsConverting(true);
        try {
            const res = await fetch(`/api/quotes/${convertingQuote.id}/convert`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ serialNumbers: serialInputs })
            });

            if (res.ok) {
                alert("Quote converted to invoice!");
                setIsConvertSheetOpen(false);
                setConvertingQuote(null);
                fetchQuotes(); // Refresh list
            } else {
                const err = await res.json();
                alert(err.error || "Failed to convert quote");
            }
        } catch (error) {
            console.error("Error converting quote:", error);
            alert("An error occurred");
        } finally {
            setIsConverting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Quotes</h1>
                <Link href="/admin/quotes/create">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Quote
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Quote ID</TableHead>
                            <TableHead>Created By</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">Loading quotes...</TableCell>
                            </TableRow>
                        ) : quotes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No quotes found. Create one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            quotes.map((quote) => (
                                <TableRow key={quote.id}>
                                    <TableCell className="font-medium">{quote.id.substring(0, 8)}...</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{quote.salesPerson?.name || "System"}</span>
                                            <span className="text-xs text-muted-foreground">{quote.salesPerson?.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{quote.customerName}</span>
                                            <span className="text-xs text-muted-foreground">{quote.customerEmail}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{new Date(quote.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>R {quote.total.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${quote.status === 'Invoiced' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {quote.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {quote.status !== 'Invoiced' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    title="Convert to Invoice"
                                                    onClick={() => openConvertSheet(quote.id)}
                                                >
                                                    <ArrowRightLeft className="h-4 w-4 text-blue-500" />
                                                </Button>
                                            )}
                                            <Link href={`/admin/quotes/${quote.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(quote.id)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                title="Download PDF"
                                                onClick={() => generateQuotePDF(quote)}
                                            >
                                                <Download className="h-4 w-4 text-gray-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Convert Sheet */}
            <Sheet open={isConvertSheetOpen} onOpenChange={setIsConvertSheetOpen}>
                <SheetContent className="sm:max-w-xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Convert Quote to Invoice</SheetTitle>
                        <SheetDescription>
                            Review items and assign serial numbers for tracked products.
                        </SheetDescription>
                    </SheetHeader>

                    {convertingQuote && (
                        <div className="py-6 space-y-6">
                            <div className="space-y-4">
                                {convertingQuote.items?.map((item) => {
                                    const filledCount = (serialInputs[item.id] || []).filter(s => s?.trim()).length;
                                    const allFilled = item.productId ? filledCount >= item.quantity : true;
                                    return (
                                        <div key={item.id} className={`p-4 border rounded-lg ${item.productId && !allFilled ? 'bg-amber-50 border-amber-200' : 'bg-slate-50'}`}>
                                            <div className="flex justify-between mb-2">
                                                <span className="font-medium">{item.name}</span>
                                                <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                                            </div>

                                            {item.productId ? (
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-xs text-muted-foreground">Serial Numbers (optional)</Label>
                                                        <span className={`text-xs font-medium ${allFilled ? 'text-green-600' : 'text-amber-600'}`}>
                                                            {filledCount}/{item.quantity} entered
                                                        </span>
                                                    </div>
                                                    {Array.from({ length: item.quantity }).map((_, idx) => (
                                                        <Input
                                                            key={`${item.id}-${idx}`}
                                                            placeholder={`Serial Number #${idx + 1} (optional)`}
                                                            value={serialInputs[item.id]?.[idx] || ""}
                                                            onChange={(e) => handleSerialChange(item.id, idx, e.target.value)}
                                                            className="h-8 font-mono text-sm"
                                                        />
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-muted-foreground italic">No serials required (Custom Item)</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <SheetFooter>
                        <Button variant="outline" onClick={() => setIsConvertSheetOpen(false)}>Cancel</Button>
                        <Button onClick={handleConfirmConvert} disabled={isConverting}>
                            {isConverting ? "Converting..." : "Confirm & Convert"}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
}

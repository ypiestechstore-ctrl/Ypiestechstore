"use client";

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Pencil } from "lucide-react";
import { generateInvoicePDF } from "@/lib/pdf-generator";
import { useAuth } from "@/context/auth-context";

import { Invoice } from "@/lib/types";

export default function InvoicesPage() {
    const { user } = useAuth();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const isSuperAdmin = user?.role === "super-admin";

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const res = await fetch("/api/invoices");
            if (res.ok) {
                const data = await res.json();
                setInvoices(data);
            }
        } catch (error) {
            console.error("Failed to fetch invoices", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadPDF = async (invoice: Invoice) => {
        const invoiceWithItems = {
            ...invoice,
            items: (invoice as any).quote?.items || []
        };
        await generateInvoicePDF(invoiceWithItems);
    };

    const handleDelete = async (id: string) => {
        if (!isSuperAdmin) return;
        if (!confirm("Are you sure you want to delete this invoice?")) return;

        try {
            const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
            if (res.ok) {
                setInvoices(prev => prev.filter(i => i.id !== id));
            } else {
                alert("Failed to delete invoice");
            }
        } catch (error) {
            console.error("Error deleting invoice:", error);
        }
    };

    const handleEditStatus = async (id: string, currentStatus: string) => {
        if (!isSuperAdmin) return;
        // Simple toggle for now, or prompt
        const newStatus = currentStatus === "Paid" ? "Unpaid" : "Paid";
        if (!confirm(`Change status to ${newStatus}?`)) return;

        try {
            const res = await fetch(`/api/invoices/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                fetchInvoices();
            } else {
                alert("Failed to update status");
            }
        } catch (error) {
            console.error("Error updating invoice:", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
                {!isSuperAdmin && (
                    <p className="text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                        View Only Access
                    </p>
                )}
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Date Created</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">Loading invoices...</TableCell>
                            </TableRow>
                        ) : invoices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No invoices found. Convert a quote to generate an invoice.
                                </TableCell>
                            </TableRow>
                        ) : (
                            invoices.map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{invoice.id.substring(0, 8)}...</span>
                                            {invoice.quoteId && <span className="text-xs text-muted-foreground">Qt: {invoice.quoteId.substring(0, 8)}...</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{invoice.customerName || "Guest"}</span>
                                            <span className="text-xs text-muted-foreground">{invoice.customerEmail}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>R {invoice.total.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${invoice.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {invoice.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleDownloadPDF(invoice)}>
                                                <Download className="h-4 w-4" />
                                            </Button>

                                            {isSuperAdmin && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditStatus(invoice.id, invoice.status)}
                                                        title="Toggle Payment Status"
                                                    >
                                                        <Pencil className="h-4 w-4 text-blue-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(invoice.id)}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

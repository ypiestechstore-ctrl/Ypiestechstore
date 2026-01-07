"use client";

import { useAuth } from "@/context/auth-context";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, User, LogOut, FileText, Receipt } from "lucide-react";
import { redirect } from "next/navigation";
import { Quote, Invoice } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

import { generateQuotePDF, generateInvoicePDF } from "@/lib/pdf-generator";
import { Download } from "lucide-react";

export default function DashboardPage() {
    const { user, logout, isLoading } = useAuth();
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loadingData, setLoadingData] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            setLoadingData(true);
            try {
                const [quotesRes, invoicesRes] = await Promise.all([
                    fetch(`/api/quotes?userId=${user?.id}`),
                    fetch(`/api/invoices?userId=${user?.id}`)
                ]);

                if (quotesRes.ok) setQuotes(await quotesRes.json());
                if (invoicesRes.ok) {
                    const rawInvoices = await invoicesRes.json();
                    // Ensure items are available on the top level for the PDF generator
                    const processed = rawInvoices.map((inv: Invoice) => ({
                        ...inv,
                        items: inv.items && inv.items.length > 0 ? inv.items : (inv.quote?.items || []) // Accessing optional property safely
                    }));
                    setInvoices(processed);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoadingData(false);
            }
        };

        if (!isLoading && !user) {
            redirect("/login");
        } else if (user) {
            fetchUserData();
        }
    }, [user, isLoading]);

    if (isLoading || !user) {
        return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
    }

    return (
        <div className="container py-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Account</h1>
                    <p className="text-muted-foreground">Welcome back, {user.name}</p>
                </div>
                <Button variant="destructive" onClick={logout} className="gap-2">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </Button>
            </div>

            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile" className="gap-2">
                        <User className="h-4 w-4" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="orders" className="gap-2">
                        <Package className="h-4 w-4" />
                        Order History
                    </TabsTrigger>
                    <TabsTrigger value="quotes" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Quotes
                    </TabsTrigger>
                    <TabsTrigger value="invoices" className="gap-2">
                        <Receipt className="h-4 w-4" />
                        Invoices
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>
                                Update your personal details and shipping address.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" defaultValue={user.name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" defaultValue={user.email} disabled />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" placeholder="+27 12 345 6789" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Shipping Address</Label>
                                <Input id="address" placeholder="123 Tech Street, Sandton, Johannesburg" />
                            </div>
                            <Button>Save Changes</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="orders">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order History</CardTitle>
                            <CardDescription>
                                View your recent orders and their status.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-6 text-muted-foreground">
                                No orders found.
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="quotes">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Quotes</CardTitle>
                            <CardDescription>
                                View quotes prepared for you.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingData ? (
                                <div className="text-center py-4">Loading quotes...</div>
                            ) : quotes.length === 0 ? (
                                <div className="text-center py-6 text-muted-foreground">
                                    You have no active quotes.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {quotes.map((quote) => (
                                        <div key={quote.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                            <div>
                                                <p className="font-medium">Quote #{quote.id.slice(0, 8).toUpperCase()}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Created on {new Date(quote.createdAt).toLocaleDateString()}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {quote.items.length} items
                                                </p>
                                            </div>
                                            <div className="text-right flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="font-medium">R {quote.total.toFixed(2)}</p>
                                                    <Badge variant={quote.status === "Draft" ? "secondary" : "default"}>
                                                        {quote.status}
                                                    </Badge>
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => generateQuotePDF(quote)}>
                                                    <Download className="h-4 w-4 mr-2" />
                                                    PDF
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="invoices">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Invoices</CardTitle>
                            <CardDescription>
                                View and download your invoices.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingData ? (
                                <div className="text-center py-4">Loading invoices...</div>
                            ) : invoices.length === 0 ? (
                                <div className="text-center py-6 text-muted-foreground">
                                    You have no invoices yet.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {invoices.map((inv) => (
                                        <div key={inv.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                            <div>
                                                <p className="font-medium">Invoice #{inv.id.slice(0, 8).toUpperCase()}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Due on {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>
                                            <div className="text-right flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="font-medium">R {inv.total.toFixed(2)}</p>
                                                    <Badge variant={inv.status === "Paid" ? "default" : "destructive"}>
                                                        {inv.status}
                                                    </Badge>
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => generateInvoicePDF(inv)}>
                                                    <Download className="h-4 w-4 mr-2" />
                                                    PDF
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

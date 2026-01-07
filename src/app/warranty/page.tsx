"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, CheckCircle, XCircle, AlertCircle, Calendar } from "lucide-react";

interface WarrantyResult {
    serial: string;
    productName: string;
    status: string; // "IN_STOCK" | "SOLD" | "NOT_FOUND"
    soldAt?: string;
    warrantyPeriod?: string;
    warrantyExpiry?: string;
    isExpired?: boolean;
}

export default function WarrantyCheckPage() {
    const [serial, setSerial] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<WarrantyResult | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!serial) return;

        setLoading(true);
        setResult(null);
        setHasSearched(false);

        try {
            const res = await fetch(`/api/warranty?serial=${encodeURIComponent(serial)}`);
            if (res.ok) {
                const data = await res.json();
                setResult(data);
            } else {
                setResult({ serial, productName: "Unknown", status: "NOT_FOUND" });
            }
        } catch (error) {
            console.error("Warranty check failed", error);
            setResult({ serial, productName: "Error", status: "NOT_FOUND" });
        } finally {
            setLoading(false);
            setHasSearched(true);
        }
    };

    return (
        <div className="container max-w-2xl mx-auto py-12 px-4">
            <h1 className="text-4xl font-bold mb-2 text-center text-primary">Warranty Check</h1>
            <p className="text-center text-muted-foreground mb-8">
                Enter your product serial number to check its warranty status.
            </p>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Check Warranty</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Enter Serial Number (e.g. SN-12345)"
                                value={serial}
                                onChange={(e) => setSerial(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button type="submit" disabled={loading || !serial}>
                            {loading ? "Checking..." : "Check"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {hasSearched && result && (
                <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
                    {result.status === "NOT_FOUND" ? (
                        <Card className="border-destructive/50 bg-destructive/5">
                            <CardContent className="pt-6 text-center">
                                <XCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
                                <h3 className="text-xl font-bold text-destructive mb-2">Serial Number Not Found</h3>
                                <p className="text-muted-foreground">
                                    We could not find any product with serial number <strong>{result.serial}</strong>.
                                    <br />Please check the number and try again.
                                </p>
                            </CardContent>
                        </Card>
                    ) : result.status === "IN_STOCK" ? (
                        <Card className="border-blue-200 bg-blue-50">
                            <CardContent className="pt-6 text-center">
                                <AlertCircle className="mx-auto h-12 w-12 text-blue-500 mb-4" />
                                <h3 className="text-xl font-bold text-blue-700 mb-2">Item Still in Stock</h3>
                                <p className="text-blue-600 mb-4">
                                    Product: <strong>{result.productName}</strong>
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    This item has not been marked as sold yet. Warranty starts from the date of purchase.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className={`border-${result.isExpired ? 'orange' : 'green'}-200 bg-${result.isExpired ? 'orange' : 'green'}-50`}>
                            <CardContent className="pt-6">
                                <div className="text-center mb-6">
                                    {result.isExpired ? (
                                        <AlertCircle className="mx-auto h-12 w-12 text-orange-500 mb-4" />
                                    ) : (
                                        <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
                                    )}
                                    <h3 className={`text-xl font-bold mb-2 ${result.isExpired ? 'text-orange-700' : 'text-green-800'}`}>
                                        {result.isExpired ? "Warranty Expired" : "Warranty Active"}
                                    </h3>
                                    <p className="text-lg font-medium">{result.productName}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
                                    <div>
                                        <p className="text-muted-foreground">Purchase Date</p>
                                        <p className="font-medium flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            {result.soldAt ? new Date(result.soldAt).toLocaleDateString() : 'Unknown'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-muted-foreground">Warranty Period</p>
                                        <p className="font-medium">{result.warrantyPeriod || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Expiration Date</p>
                                        <p className={`font-medium ${result.isExpired ? 'text-destructive' : ''}`}>
                                            {result.warrantyExpiry ? new Date(result.warrantyExpiry).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-muted-foreground">Status</p>
                                        <p className="font-medium">{result.status}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}

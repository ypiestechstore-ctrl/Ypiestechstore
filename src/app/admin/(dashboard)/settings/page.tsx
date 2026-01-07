"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, Save, Pencil, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";

interface BankDetail {
    id: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    branchCode: string;
    isVisible: boolean;
}

export default function SettingsPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const [banks, setBanks] = useState<BankDetail[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form State
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [newBank, setNewBank] = useState({
        bankName: "",
        accountName: "",
        accountNumber: "",
        branchCode: ""
    });

    useEffect(() => {
        if (!isAuthLoading) {
            if (!user || user.role !== "super-admin") {
                router.push("/admin"); // Redirect if not super admin
                return;
            }
            fetchBanks();
        }
    }, [user, isAuthLoading, router]);

    const fetchBanks = async () => {
        try {
            const res = await fetch("/api/settings/banks");
            if (res.ok) {
                const data = await res.json();
                setBanks(data);
            }
        } catch (error) {
            console.error("Failed to fetch banks", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddBank = async () => {
        if (!newBank.bankName || !newBank.accountNumber) return;
        try {
            const res = await fetch("/api/settings/banks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newBank)
            });
            if (res.ok) {
                setNewBank({ bankName: "", accountName: "", accountNumber: "", branchCode: "" });
                fetchBanks();
            }
        } catch (error) {
            console.error("Failed to add bank", error);
        }
    };

    const handleDeleteBank = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await fetch(`/api/settings/banks/${id}`, { method: "DELETE" });
            setBanks(prev => prev.filter(b => b.id !== id));
        } catch (error) {
            console.error("Failed to delete bank", error);
        }
    };

    const handleToggleVisibility = async (id: string, currentStatus: boolean) => {
        try {
            // Optimistic update
            setBanks(prev => prev.map(b => b.id === id ? { ...b, isVisible: !currentStatus } : b));

            await fetch(`/api/settings/banks/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isVisible: !currentStatus })
            });
        } catch (error) {
            console.error("Failed to update bank visibility", error);
            fetchBanks(); // Revert on error
        }
    }

    if (isAuthLoading || isLoading) {
        return <div className="p-8">Loading settings...</div>;
    }

    if (!user || user.role !== "super-admin") {
        return null; // Should redirect via useEffect
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Banking Details</CardTitle>
                    <CardDescription>Manage the bank accounts displayed on checkout and invoices.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Add New Bank */}
                    <div className="grid gap-4 md:grid-cols-5 items-end border p-4 rounded-md bg-slate-50">
                        <div className="space-y-2">
                            <Label>Bank Name</Label>
                            <Input
                                placeholder="e.g. FNB"
                                value={newBank.bankName}
                                onChange={(e) => setNewBank({ ...newBank, bankName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Account Name</Label>
                            <Input
                                placeholder="Business Name"
                                value={newBank.accountName}
                                onChange={(e) => setNewBank({ ...newBank, accountName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Account Number</Label>
                            <Input
                                placeholder="123456789"
                                value={newBank.accountNumber}
                                onChange={(e) => setNewBank({ ...newBank, accountNumber: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Branch Code</Label>
                            <Input
                                placeholder="250655"
                                value={newBank.branchCode}
                                onChange={(e) => setNewBank({ ...newBank, branchCode: e.target.value })}
                            />
                        </div>
                        <Button onClick={handleAddBank} disabled={!newBank.bankName}>
                            <Plus className="mr-2 h-4 w-4" /> Add Bank
                        </Button>
                    </div>

                    {/* List Banks */}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Bank</TableHead>
                                <TableHead>Account Name</TableHead>
                                <TableHead>Account Number</TableHead>
                                <TableHead>Branch</TableHead>
                                <TableHead>Visible</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {banks.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                                        No banking details added yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                banks.map((bank) => (
                                    <TableRow key={bank.id}>
                                        <TableCell className="font-medium">{bank.bankName}</TableCell>
                                        <TableCell>{bank.accountName}</TableCell>
                                        <TableCell>{bank.accountNumber}</TableCell>
                                        <TableCell>{bank.branchCode}</TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={bank.isVisible}
                                                onCheckedChange={() => handleToggleVisibility(bank.id, bank.isVisible)}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteBank(bank.id)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

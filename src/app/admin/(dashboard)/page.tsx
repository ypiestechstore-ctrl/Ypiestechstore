"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, Users, ShoppingCart, FileText, FileClock, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { useSearchParams } from "next/navigation";
import { getDashboardStats } from "@/app/actions/getDashboardStats";
import { DashboardFilter } from "./DashboardFilter";

import { Suspense } from "react";

function DashboardContent() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const searchParams = useSearchParams();
    const period = (searchParams.get("period") as "30" | "60" | "all") || "30";

    const [stats, setStats] = useState<any>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    useEffect(() => {
        if (!isAuthLoading && user) {
            fetchStats();
        }
    }, [user, isAuthLoading, period]);

    const fetchStats = async () => {
        if (!user) return;
        setIsLoadingStats(true);
        try {
            const data = await getDashboardStats(user.id, user.role, period);
            setStats(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingStats(false);
        }
    };

    if (isAuthLoading || isLoadingStats) {
        return <div className="p-8 text-center text-muted-foreground">Loading dashboard stats...</div>;
    }

    if (!user || !stats) {
        return <div className="p-8 text-center text-red-500">Failed to load stats.</div>;
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <DashboardFilter />
            </div>

            {user.role === "super-admin" ? (
                /* SUPER ADMIN VIEW */
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.revenue)}</div>
                            <p className="text-xs text-muted-foreground">
                                {period === "all" ? "All time" : `Last ${period} days`}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Sales</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{stats.salesCount}</div>
                            <p className="text-xs text-muted-foreground">
                                Paid invoices
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Customers</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{stats.activeUsers}</div>
                            <p className="text-xs text-muted-foreground">
                                Total registered
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.activeProducts}</div>
                            <p className="text-xs text-muted-foreground">
                                In stock now
                            </p>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                /* ADMIN / SALES VIEW */
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">My Quotes</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalQuotes}</div>
                            <p className="text-xs text-muted-foreground">
                                Created {period === "all" ? "all time" : `in last ${period} days`}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">My Invoices</CardTitle>
                            <FileClock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalInvoices}</div>
                            <p className="text-xs text-muted-foreground">
                                Generated {period === "all" ? "all time" : `in last ${period} days`}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Quotes</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pendingQuotes}</div>
                            <p className="text-xs text-muted-foreground">
                                Not yet invoiced
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Potential Revenue</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.potentialRevenue)}</div>
                            <p className="text-xs text-muted-foreground">
                                Value of pending quotes
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">My Sales</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.totalSales)}</div>
                            <p className="text-xs text-muted-foreground">
                                Value of paid invoices
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}


export default function AdminDashboard() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading dashboard...</div>}>
            <DashboardContent />
        </Suspense>
    );
}

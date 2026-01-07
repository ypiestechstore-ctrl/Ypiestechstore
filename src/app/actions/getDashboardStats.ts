"use server";

import { prisma } from "@/lib/prisma";

type DashboardPeriod = "30" | "60" | "all";
type UserRole = "super-admin" | "admin" | "customer" | null;

export async function getDashboardStats(
    userId: string,
    role: UserRole,
    period: DashboardPeriod
) {
    // 1. Calculate Date Filter
    let dateFilter: Date | undefined;
    if (period === "30") {
        dateFilter = new Date();
        dateFilter.setDate(dateFilter.getDate() - 30);
    } else if (period === "60") {
        dateFilter = new Date();
        dateFilter.setDate(dateFilter.getDate() - 60);
    }
    // "all" leaves dateFilter undefined

    try {
        if (role === "super-admin") {
            // --- SUPER ADMIN STATS ---

            // Total Revenue (Paid Invoices)
            const revenueResult = await prisma.invoice.aggregate({
                _sum: { total: true },
                where: {
                    status: "Paid",
                    createdAt: dateFilter ? { gte: dateFilter } : undefined,
                },
            });

            // Active Users (Role: customer)
            // Note: "Active" usually implies login activity, but we only have createdAt/updatedAt.
            // Using total customers for now, filtered by creation date if period applies?
            // Usually "Active Users" metric in simple dashboards means "Total Registered Customers".
            const activeUsers = await prisma.user.count({
                where: {
                    role: "customer",
                    createdAt: dateFilter ? { gte: dateFilter } : undefined,
                },
            });

            // Sales (Paid Invoices Count)
            const salesCount = await prisma.invoice.count({
                where: {
                    status: "Paid",
                    createdAt: dateFilter ? { gte: dateFilter } : undefined,
                },
            });

            // Active Products (Stock > 0)
            // Inventory snapshots aren't tracked historically, so this is always "current" state.
            // We ignore date filter for this specific stat as it's a current snapshot.
            const activeProducts = await prisma.product.count({
                where: {
                    stock: { gt: 0 },
                },
            });

            return {
                revenue: revenueResult._sum.total || 0,
                activeUsers,
                salesCount,
                activeProducts,
            };

        } else if (role === "admin") {
            // --- ADMIN (SALES) STATS ---

            // Total Quotes (Created by this user)
            const totalQuotes = await prisma.quote.count({
                where: {
                    salesPersonId: userId,
                    createdAt: dateFilter ? { gte: dateFilter } : undefined,
                },
            });

            // Total Invoices (Created by this user)
            const totalInvoices = await prisma.invoice.count({
                where: {
                    salesPersonId: userId,
                    createdAt: dateFilter ? { gte: dateFilter } : undefined,
                },
            });

            // Pending Quotes (Not Invoiced)
            const pendingQuotes = await prisma.quote.count({
                where: {
                    salesPersonId: userId,
                    status: { not: "Invoiced" },
                    createdAt: dateFilter ? { gte: dateFilter } : undefined,
                },
            });

            // Calculate "Uninvoiced Amount" potential?
            const pendingAmount = await prisma.quote.aggregate({
                _sum: { total: true },
                where: {
                    salesPersonId: userId,
                    status: { not: "Invoiced" },
                    createdAt: dateFilter ? { gte: dateFilter } : undefined,
                },
            });

            // Calculate "Total Sales" (Paid Invoices Sum)
            const totalSales = await prisma.invoice.aggregate({
                _sum: { total: true },
                where: {
                    salesPersonId: userId,
                    status: "Paid",
                    createdAt: dateFilter ? { gte: dateFilter } : undefined,
                },
            });

            return {
                totalQuotes,
                totalInvoices,
                pendingQuotes,
                potentialRevenue: pendingAmount._sum.total || 0,
                totalSales: totalSales._sum.total || 0,
            };
        }

        return null;
    } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        throw new Error("Failed to fetch dashboard stats");
    }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const serial = searchParams.get("serial");

    if (!serial) {
        return NextResponse.json({ error: "Serial number required" }, { status: 400 });
    }

    try {
        const serialRecord = await prisma.serialNumber.findUnique({
            where: { serial },
            include: {
                product: true,
                invoice: true // To get sold date if soldAt is not reliable, but we added soldAt
            }
        });

        if (!serialRecord) {
            return NextResponse.json(null, { status: 404 });
        }

        const isSold = serialRecord.status === "SOLD";

        let soldAt = serialRecord.soldAt;
        // Fallback to invoice date if soldAt missing but linked to invoice
        if (!soldAt && serialRecord.invoice) {
            soldAt = serialRecord.invoice.createdAt;
        }

        let warrantyExpiry = null;
        let isExpired = false;

        if (isSold && soldAt && serialRecord.product.warrantyPeriod) {
            const period = serialRecord.product.warrantyPeriod.toLowerCase();
            const date = new Date(soldAt);

            // Simple parsing of "1 Year", "6 Months", "90 Days"
            if (period.includes("year")) {
                const years = parseInt(period) || 1;
                date.setFullYear(date.getFullYear() + years);
            } else if (period.includes("month")) {
                const months = parseInt(period) || 1;
                date.setMonth(date.getMonth() + months);
            } else if (period.includes("day")) {
                const days = parseInt(period) || 1;
                date.setDate(date.getDate() + days);
            }

            warrantyExpiry = date.toISOString();
            isExpired = new Date() > date;
        }

        return NextResponse.json({
            serial: serialRecord.serial,
            productName: serialRecord.product.name,
            status: serialRecord.status,
            soldAt: soldAt,
            warrantyPeriod: serialRecord.product.warrantyPeriod,
            warrantyExpiry,
            isExpired
        });

    } catch (error) {
        console.error("Warranty lookup error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

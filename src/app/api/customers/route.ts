import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function GET() {
    try {
        const customers = await prisma.user.findMany({
            where: { role: "customer" },
            orderBy: { name: "asc" },
            select: {
                id: true,
                name: true,
                email: true,
                contactNumber: true,
                address: true,
            }
        });
        return NextResponse.json(customers);
    } catch (error) {
        console.error("Failed to fetch customers:", error);
        return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, contactNumber, address } = body;

        if (!email || !contactNumber) {
            return NextResponse.json(
                { error: "Email and Contact Number are required" },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Customer with this email already exists" },
                { status: 409 }
            );
        }

        // Use invite flow
        const resetToken = crypto.randomUUID();
        const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const newCustomer = await prisma.user.create({
            data: {
                name,
                email,
                contactNumber,
                address, // Capture address
                password: null,
                role: "customer",
                resetToken,
                resetTokenExpiry
            },
        });

        console.log("==========================================");
        console.log(`INVITE LINK for ${email}:`);
        console.log(`http://localhost:3000/set-password?token=${resetToken}`);
        console.log("==========================================");

        return NextResponse.json(newCustomer, { status: 201 });

    } catch (error) {
        console.error("Failed to create customer:", error);
        return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
    }
}



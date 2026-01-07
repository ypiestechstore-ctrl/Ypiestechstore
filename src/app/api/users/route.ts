import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from 'crypto';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const role = searchParams.get("role");

        const whereClause = role ? { role } : {};

        const users = await prisma.user.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                // Don't return password
            }
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password, role } = body;

        if (!email || !role) {
            return NextResponse.json({ error: "Email and Role are required" }, { status: 400 });
        }

        // Check duplicate
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: "User already exists with this email" }, { status: 409 });
        }

        // If no password provided, generate invite token
        let resetToken = null;
        let resetTokenExpiry = null;
        let finalPassword = password;

        if (!password) {
            // Generate simple token (UUID)
            resetToken = crypto.randomUUID();
            resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
            finalPassword = null;
        }

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: finalPassword,
                role,
                resetToken,
                resetTokenExpiry
            }
        });

        // Mock Sending Email
        if (resetToken) {
            console.log("==========================================");
            console.log(`INVITE LINK for ${email}:`);
            console.log(`http://localhost:3000/set-password?token=${resetToken}`);
            console.log("==========================================");
        }

        const { password: _, ...userWithoutPassword } = newUser;

        return NextResponse.json(userWithoutPassword, { status: 201 });
    } catch (error) {
        console.error("Failed to create user:", error);
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }
}

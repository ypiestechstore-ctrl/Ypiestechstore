import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        console.log("Login attempt for:", email);
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.log("User not found:", email);
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // Check if password matches
        if (user.password !== password) {
            console.log("Password mismatch for:", email);
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        console.log("Login successful for:", email, "Role:", user.role);

        // Return user info (excluding password)
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({ user: userWithoutPassword });

    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

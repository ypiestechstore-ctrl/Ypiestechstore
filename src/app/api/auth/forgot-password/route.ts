import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (user) {
            console.log(`[Mock Email Service] Sending password reset link to ${email}`);
            // Logic to send email would go here:
            // 1. Generate token
            // 2. Save token to DB (optional, or stateless JWT)
            // 3. Send email with link /reset-password?token=...
        }

        // Always return success to UI
        return NextResponse.json({ message: "If an account exists, a reset link has been sent." });

    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

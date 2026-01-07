import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Return OK to avoid enumerating users (security best practice), or error if preferred. 
            // For this internal tool, I'll return OK but log nothing.
            return NextResponse.json({ message: "If account exists, link sent." });
        }

        // Generate new token
        const resetToken = crypto.randomUUID();
        const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry
            }
        });

        // Log the link
        console.log("==========================================");
        console.log(`ACTIVATION / RESET LINK for ${email}:`);
        console.log(`http://localhost:3000/set-password?token=${resetToken}`);
        console.log("==========================================");

        return NextResponse.json({ message: "Link sent" });

    } catch (error) {
        console.error("Activation error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

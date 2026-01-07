import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const sn = searchParams.get("sn");

    if (!sn) {
        return NextResponse.json({ error: "Serial number required" }, { status: 400 });
    }

    try {
        const serialRecord = await prisma.serialNumber.findUnique({
            where: { serial: sn },
            include: {
                product: true,
                orderItem: {
                    include: {
                        order: {
                            include: {
                                invoice: true,
                                user: {
                                    select: { name: true, email: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!serialRecord) {
            return NextResponse.json({ found: false, message: "Serial number not found" });
        }

        return NextResponse.json({
            found: true,
            data: serialRecord
        });

    } catch (error) {
        console.error("Lookup error:", error);
        return NextResponse.json({ error: "DB Error" }, { status: 500 });
    }
}

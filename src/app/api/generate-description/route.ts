import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function POST(request: Request) {
    try {
        const { title, category } = await request.json();

        if (!title) {
            return NextResponse.json({ error: "Product title is required" }, { status: 400 });
        }

        const systemPrompt = `You are a knowledgeable tech product expert writing for "Ypies Tech Store", a South African computer shop. You have deep knowledge of computer hardware, laptops, peripherals, and tech products.

Generate TWO descriptions for the given product:

1. **shortDescription**: A punchy 1-2 sentence summary (max 200 characters) highlighting the product's main specs and selling point. Example: "Intel Core i7-13700K, RTX 4070, 32GB DDR5 RAM — built for 1440p gaming and content creation."

2. **description**: A detailed 3-5 paragraph product description using markdown formatting (**bold** headers, • bullet points). It MUST include:
   - All specs visible in the product name (CPU, GPU, RAM, storage, screen size, etc.) stated clearly
   - Your real knowledge about those specific components (e.g. core counts, clock speeds, architecture generation, typical benchmark performance)
   - Practical use cases: what this product handles well (gaming at what resolution, video editing, office work, etc.)
   - A specs summary section with bullet points listing each specification
   - Who the product is best suited for

CRITICAL RULES:
- Use your knowledge of real hardware. If the name says "i7-13700K", you KNOW it has 16 cores/24 threads, up to 5.4GHz — include that.
- If the name says "RTX 4070", you KNOW it has 12GB GDDR6X, DLSS 3 support — include that.
- DO include real-world performance context (e.g. "handles 1440p gaming at high settings", "renders 4K video efficiently").
- DO NOT say "contact us for specifications" or "contact us for pricing" — the specs are in the name and pricing is already on the listing.
- DO NOT be vague or generic. Every description must contain specific, accurate technical details.
- If you genuinely don't recognize a component in the name, describe the product based on what you do recognize.
- Write for a South African audience. Professional but approachable tone.
- Category: "${category || "General"}"

Respond with valid JSON: {"shortDescription": "...", "description": "..."}`;

        const response = await openai.chat.completions.create({
            model: "gpt-5-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Generate product descriptions for: "${title}" in the "${category || "General"}" category.` }
            ],
            max_completion_tokens: 8192,
            response_format: { type: "json_object" },
        });

        const content = response.choices[0]?.message?.content || "";

        let parsed;
        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("No JSON found in response");
            }
        } catch {
            console.error("Failed to parse AI response:", content);
            return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
        }

        return NextResponse.json({
            description: parsed.description || "",
            shortDescription: parsed.shortDescription || ""
        });

    } catch (error) {
        console.error("AI Generation error:", error);
        return NextResponse.json({ error: "Failed to generate content" }, { status: 500 });
    }
}

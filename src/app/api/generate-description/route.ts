import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { title, category } = await request.json();

        if (!title) {
            return NextResponse.json({ error: "Product title is required" }, { status: 400 });
        }

        // Mock AI Generation - simulating an LLM response
        // In a real app, this would fetch from OpenAI/Gemini/Anthropic

        // Mock AI Generation - simulating a more advanced LLM response
        // SEO-friendly, detailed descriptions

        let description = "";
        let shortDescription = "";

        // Keywords for SEO injection
        const keywords = {
            prebuilt: "gaming PC, desktop computer, high FPS, custom rig, workstation",
            laptop: "gaming laptop, portable workstation, ultrabook, notebook",
            component: "PC parts, upgrade, hardware, performance, custom build",
            peripheral: "gaming gear, accessories, input device, ergonomic"
        };

        if (category === "Prebuilt PCs") {
            shortDescription = `Dominate the competition with the ${title}, a high-performance gaming PC designed for serious gamers and creators.`;

            description = `**Unleash Ultimate Performance**
The ${title} is meticulously engineered to deliver top-tier performance for both gaming and professional workloads. Whether you're aiming for high frame rates in the latest AAA titles or rendering complex 3D scenes, this system handles it all with ease. Built with premium components and optimized for longevity, it's more than just a computer—it's your command center.

**Superior Cooling & Aesthetics**
Aesthetics meet function with a chassis designed for optimal airflow. Keep your components cool under pressure while enjoying a stunning visual experience through the tempered glass side panel. The customizable RGB lighting allows you to match your setup's vibe instantly.

**Future-Proof Design**
Stay ahead of the curve. The ${title} is built with upgradability in mind, ensuring that as technology evolves, your system can evolve with it.

**Key Features:**
• **High-Performance CPU & GPU:** Ready for 1440p and 4K gaming.
• **Optimized Airflow:** Keeps your system cool and quiet.
• **Premium Build Quality:** Assembled by experts with neat cable management.
• **Plug & Play:** Comes with Windows pre-installed and drivers updated.`;

        } else if (category === "Laptops") {
            shortDescription = `Experience power on the go with the ${title}. Sleek, portable, and ready for anything.`;

            description = `**Power Meets Portability**
Take your gaming and productivity anywhere with the ${title}. This laptop combines raw processing power with a sleek, portable chassis, making it the perfect companion for students, professionals, and gamers on the move. Don't compromise on performance just because you're away from your desk.

**Stunning Display**
Immerse yourself in vibrant colors and smooth motion. The display is calibrated for accuracy and features a fast refresh rate, giving you a competitive edge in fast-paced games and a delightful viewing experience for media consumption.

**Built for Endurance**
With an advanced battery management system and efficient cooling, the ${title} lets you stay in the game longer. The ergonomic keyboard ensures comfort during long typing or gaming sessions.

**Key Features:**
• **High-Refresh Rate Display:** Smooth visuals for gaming and work.
• **Efficient Cooling:** Prevents thermal throttling during intense tasks.
• **Long Battery Life:** Stay productive unplugged.
• **Modern Connectivity:** Wi-Fi 6 and fast I/O ports.`;

        } else if (category === "Components") {
            shortDescription = `Upgrade your rig with the ${title}, engineered for maximum reliability and speed.`;

            description = `**Enhance Your Build**
Push your system to its limits with the ${title}. Designed for enthusiasts who demand the best, this component offers superior reliability, stability, and performance. whether you are building a new PC or breathing new life into an old one, this is the upgrade you've been looking for.

**Precision Engineering**
Manufactured to the highest standards, the ${title} undergoes rigorous testing to ensure it meets the demands of modern computing. Experience seamless compatibility and effortless installation.

**Key Features:**
• **High Durability:** Built to last with premium materials.
• **Optimized Performance:** maximizing the potential of your hardware.
• **Easy Installation:** User-friendly design.`;

        } else {
            shortDescription = `Discover the ${title}, a premium addition to your tech arsenal combining style and functionality.`;

            description = `**Premium Quality & Design**
The ${title} stands out with its exceptional build quality and user-centric design. Perfect for enhancing your daily digital interactions, it offers a blend of style, comfort, and durability that is hard to match in its class.

**Reliable Performance**
Count on consistent results. This product is tested to ensure it performs flawlessly day in and day out, giving you peace of mind and a frustration-free experience.

**Key Features:**
• **Ergonomic Design:** Built for comfort and ease of use.
• **Durable Construction:** withstands daily wear and tear.
• **High Value:** Excellent performance for the price.`;
        }


        // Simulate network delay for realism
        await new Promise(resolve => setTimeout(resolve, 1500));

        return NextResponse.json({ description, shortDescription });

    } catch (error) {
        console.error("AI Generation error:", error);
        return NextResponse.json({ error: "Failed to generate content" }, { status: 500 });
    }
}

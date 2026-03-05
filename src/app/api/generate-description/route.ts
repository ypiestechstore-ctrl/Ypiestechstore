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

        // Helper to extract specs from title
        const extractSpecs = (name: string) => {
            const specs: string[] = [];
            
            // CPU detection
            if (/i3|i5|i7|i9/i.test(name)) specs.push(`Powered by Intel Core ${name.match(/i[3579]-?\d+\w*/i)?.[0] || 'processor'}`);
            if (/Ryzen [3579]/i.test(name)) specs.push(`Powered by AMD Ryzen ${name.match(/Ryzen [3579]-?\d+\w*/i)?.[0] || 'processor'}`);
            
            // GPU detection
            if (/RTX|GTX/i.test(name)) specs.push(`Graphics: NVIDIA GeForce ${name.match(/(RTX|GTX)\s?\d+\d*(\s?Ti|Super)?/i)?.[0]}`);
            if (/Radeon|RX/i.test(name)) specs.push(`Graphics: AMD Radeon ${name.match(/RX\s?\d+\d*(\s?XT)?/i)?.[0]}`);
            
            // RAM detection
            if (/\d+GB/i.test(name)) {
                const ram = name.match(/(\d+)GB/i);
                if (ram && parseInt(ram[1]) <= 128) specs.push(`Memory: ${ram[0]} High-Speed RAM`);
            }
            
            // Storage detection
            if (/\d+TB/i.test(name)) specs.push(`Storage: ${name.match(/\d+TB/i)?.[0]} NVMe SSD`);
            if (/\d+GB\sSSD/i.test(name)) specs.push(`Storage: ${name.match(/\d+GB/i)?.[0]} SSD`);

            return specs;
        }

        const specs = extractSpecs(title);
        const specList = specs.length > 0 ? specs.map(s => `• **${s.split(':')[0]}:**${s.split(':')[1] || s}`).join('\n') : "• **High-Performance Components:** Optimized for modern workloads.\n• **Reliable Build:** Tested for stability and longevity.";

        if (category === "Prebuilt PCs") {
            shortDescription = `${title}: A professional-grade gaming and workstation PC featuring ${specs[0] || 'high-end components'} for ultimate performance.`;

            description = `**Unleash Extreme Performance**
The ${title} is a powerhouse designed for elite gaming, streaming, and professional content creation. Every component is selected to eliminate bottlenecks, ensuring smooth 4K gaming and lightning-fast render times.

**Thermal Management & Design**
Built in a premium chassis with optimized airflow patterns to keep your hardware running at peak clocks even during marathon sessions. The tempered glass showcase and synchronized RGB lighting make it the centerpiece of any setup.

**Technical Specifications & Features:**
${specList}
• **Motherboard:** High-stability chipset with modern connectivity.
• **Cooling:** Advanced thermal solution for silent operation.
• **Power Supply:** 80+ Gold certified efficiency.
• **Warranty:** Fully backed by our local technical support.`;

        } else if (category === "Laptops") {
            shortDescription = `Portable power redefined. The ${title} delivers desktop-class performance in a sleek, mobile form factor.`;

            description = `**Desktop Power, Mobile Freedom**
The ${title} brings uncompromising performance to your backpack. Whether you're a pro-gamer on the circuit or a creative professional on site, this machine provides the raw horsepower needed for demanding applications without the bulk.

**Pro-Grade Display**
Features a high-accuracy, high-refresh rate panel that brings your content to life with vivid colors and ultra-smooth motion. Perfect for competitive gaming and color-critical creative work.

**Hardware Highlights:**
${specList}
• **Display:** High-refresh rate, low-latency panel.
• **Keyboard:** Tactile, backlit keys designed for precision.
• **Battery:** Optimized for extended use away from the outlet.
• **I/O:** Full suite of modern ports for all your peripherals.`;

        } else if (category === "Components") {
            shortDescription = `Upgrade your system with the ${title}. Precision-engineered for maximum speed and compatibility.`;

            description = `**The Heart of Your Next Upgrade**
Push your system to its next level with the ${title}. This component represents the pinnacle of hardware engineering, offering the stability and speed required by overclockers and professionals alike.

**Reliability by Design**
Each unit undergoes rigorous stress testing to ensure it meets our strict quality standards. Compatible with all modern platforms and designed for easy integration into your existing setup.

**Key Specifications:**
${specList}
• **Efficiency:** Optimized power delivery and low heat output.
• **Durability:** Built with high-grade capacitors and PCB materials.
• **Compatibility:** Verified across major motherboard and system platforms.`;

        } else {
            shortDescription = `Enhance your tech setup with the ${title}, where premium build quality meets everyday reliability.`;

            description = `**Premium Quality & Functional Design**
The ${title} is designed to improve your workflow and digital experience. Combining ergonomic features with a durable build, it's the perfect addition to any modern tech environment.

**Performance You Can Trust**
Tested for consistent, daily use. This product delivers a frustration-free experience with a focus on long-term reliability and user comfort.

**Product Features:**
${specList}
• **Build Quality:** Premium materials for a professional feel.
• **Ease of Use:** Plug-and-play compatibility.
• **Value:** The perfect balance of performance and price.`;
        }


        // Simulate network delay for realism
        await new Promise(resolve => setTimeout(resolve, 1500));

        return NextResponse.json({ description, shortDescription });

    } catch (error) {
        console.error("AI Generation error:", error);
        return NextResponse.json({ error: "Failed to generate content" }, { status: 500 });
    }
}

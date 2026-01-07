import Image from "next/image";

export default function AboutPage() {
    return (
        <div className="container py-10 space-y-12">
            <div className="flex flex-col items-center text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">About Us</h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                    Where Quality Meets Your Budget
                </p>
            </div>

            <div className="grid gap-10 md:grid-cols-2 items-center">
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold">Who We Are</h2>
                    <div className="text-lg text-muted-foreground space-y-4">
                        <p>
                            Founded by a dedicated team of tech enthusiasts and PC builders, Ypiestechstore was born from a passion to deliver the ultimate computing experience. We understand that whether you're dominating a game on a cutting-edge gaming rig or tackling a deadline on a reliable standard PC, performance and reliability are paramount.
                        </p>
                        <p>
                            We are a team of passionate gamers dedicated to making high-quality gaming accessible to everyone in South Africa. We leverage our love for gaming and technical expertise to source, build, and deliver powerful, yet budget-friendly machines.
                        </p>
                        <p className="font-medium text-primary">
                            In short, we are gamers building for gamers, ensuring that everyone can join the PC master race without breaking the bank.
                        </p>
                    </div>
                </div>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-muted shadow-xl">
                    {/* Placeholder for about us image - using a generic office/gaming setup */}
                    <Image
                        src="https://images.unsplash.com/photo-1593640408163-097f2878d2b2?auto=format&fit=crop&q=80&w=1000"
                        alt="Gaming Setup"
                        fill
                        className="object-cover"
                    />
                </div>
            </div>

            <div className="space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold">Why Choose Us?</h2>
                    <p className="text-muted-foreground mt-2">The Instore Difference</p>
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                    <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                        <h3 className="font-semibold text-xl mb-2">Certified Refurbished</h3>
                        <p className="text-muted-foreground">
                            High-performance gaming desktops, standard office PCs, and business-grade laptops, all brought back to life and backed by our quality guarantee.
                        </p>
                    </div>
                    <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                        <h3 className="font-semibold text-xl mb-2">Expert Knowledge</h3>
                        <p className="text-muted-foreground">
                            Our team is always available to answer your questions, help you compare machines, and provide personalized, jargon-free recommendations.
                        </p>
                    </div>
                    <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                        <h3 className="font-semibold text-xl mb-2">Immediate Satisfaction</h3>
                        <p className="text-muted-foreground">
                            You can walk in, browse the latest deals, get hands-on with a machine, test it out, and leave with your purchase the same day.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-primary/5 rounded-2xl p-8 md:p-12 text-center space-y-6">
                <h2 className="text-3xl font-bold">Our Mission</h2>
                <p className="text-xl max-w-3xl mx-auto">
                    To provide top-quality refurbished and pre-owned technology that performs exceptionally well but costs significantly less than buying new. We believe that accessing powerful, reliable tech shouldn't require a premium price tag.
                </p>
            </div>
        </div>
    );
}

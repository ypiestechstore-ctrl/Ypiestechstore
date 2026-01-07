import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InteractiveHero } from "@/components/interactive/InteractiveHero";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { SocialMediaFeed } from "@/components/home/SocialMediaFeed";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const featuredProducts = await prisma.product.findMany({
    where: {
      isFeatured: true,
      stock: { gt: 0 }
    }
  });

  const featuredCategories = await prisma.category.findMany({
    where: {
      isFeatured: true
    },
    take: 8 // Limit to 8 featured categories to keep design clean
  });

  const sanitizedProducts = featuredProducts.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    image: p.image,
    category: p.category,
    isFeatured: p.isFeatured,
    stock: p.stock,
    isSupplierStock: p.isSupplierStock,
    sku: p.sku || undefined,
  }));

  return (
    <div className="flex flex-col gap-10 pb-10">
      {/* Interactive Hero Section */}
      <InteractiveHero />

      {/* Featured Products */}
      <section className="container">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
          <Link href="/catalog">
            <Button variant="link" className="text-primary">
              View All &rarr;
            </Button>
          </Link>
        </div>
        <FeaturedProducts products={sanitizedProducts} />
      </section>

      {/* Reviews Section */}
      <ReviewsSection />

      {/* Categories Section */}
      <section className="container py-10">
        <h2 className="mb-8 text-3xl font-bold tracking-tight">
          Shop by Category
        </h2>
        {featuredCategories.length === 0 ? (
          <p className="text-muted-foreground">No featured categories yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {featuredCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/catalog?category=${cat.name}`}
                className="group relative overflow-hidden rounded-lg bg-muted p-6 hover:bg-muted/80 transition-colors"
              >
                <h3 className="text-xl font-bold">{cat.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Explore {cat.name}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Social Media Feed */}
      <SocialMediaFeed />
    </div>
  );
}

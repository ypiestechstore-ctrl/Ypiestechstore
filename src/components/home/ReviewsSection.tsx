"use client";

import { useEffect, useState } from "react";
import { Star, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Link from "next/link";

interface Review {
    id?: string;
    author_name: string;
    rating: number;
    text: string;
    relative_time_description: string;
    profile_photo_url?: string | null;
}

interface ReviewStats {
    rating: number;
    user_ratings_total: number;
}

export function ReviewsSection() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<ReviewStats>({ rating: 5.0, user_ratings_total: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchReviews() {
            try {
                const res = await fetch("/api/reviews");
                const data = await res.json();

                if (data.reviews) {
                    setReviews(data.reviews);
                    setStats({
                        rating: data.rating,
                        user_ratings_total: data.user_ratings_total
                    });
                }
            } catch (error) {
                console.error("Failed to fetch reviews", error);
            } finally {
                setLoading(false);
            }
        }

        fetchReviews();
    }, []);

    if (loading) {
        return (
            <section className="bg-muted/30 py-16">
                <div className="container flex justify-center">
                    <div className="animate-pulse flex flex-col items-center gap-4">
                        <div className="h-8 w-64 bg-muted-foreground/20 rounded"></div>
                        <div className="h-4 w-40 bg-muted-foreground/20 rounded"></div>
                        <div className="w-full max-w-5xl h-64 bg-muted-foreground/10 rounded mt-8"></div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-muted/30 py-16">
            <div className="container">
                <div className="text-center mb-10 space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">What Our Customers Say</h2>
                    <div className="flex items-center justify-center">
                        <Link
                            href="https://www.google.com/search?q=ypies+tech+store+reviews"
                            target="_blank"
                            className="flex items-center gap-2 group hover:opacity-80 transition-opacity"
                        >
                            <span className="flex items-center font-semibold text-lg">
                                {stats.rating.toFixed(1)} <Star className="h-5 w-5 fill-primary text-primary ml-1" />
                            </span>
                            <span className="text-muted-foreground group-hover:text-primary transition-colors">
                                from {stats.user_ratings_total}+ Google Reviews
                            </span>
                        </Link>
                    </div>
                </div>

                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full max-w-5xl mx-auto"
                >
                    <CarouselContent className="-ml-4">
                        {reviews.map((review, index) => (
                            <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                                <div className="h-full">
                                    <Card className="h-full border-none shadow-sm bg-card/50 hover:bg-card transition-colors">
                                        <CardContent className="p-6 space-y-4">
                                            <div className="flex gap-1">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-4 w-4 ${i < review.rating
                                                            ? "fill-primary text-primary"
                                                            : "fill-muted text-muted-foreground/20"
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-muted-foreground text-sm leading-relaxed min-h-[80px] line-clamp-4">
                                                &quot;{review.text}&quot;
                                            </p>
                                            <div className="flex items-center justify-between pt-4 border-t">
                                                <div className="flex items-center gap-2">
                                                    {review.profile_photo_url ? (
                                                        /* eslint-disable-next-line @next/next/no-img-element */
                                                        <img
                                                            src={review.profile_photo_url}
                                                            alt={review.author_name}
                                                            className="h-8 w-8 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <User className="h-4 w-4 text-primary" />
                                                        </div>
                                                    )}
                                                    <div className="font-semibold text-sm truncate max-w-[120px]">{review.author_name}</div>
                                                </div>
                                                <div className="text-xs text-muted-foreground whitespace-nowrap">{review.relative_time_description}</div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden md:flex" />
                    <CarouselNext className="hidden md:flex" />
                </Carousel>
            </div>
        </section>
    );
}

import { NextResponse } from "next/server";

// Fallback data in case API is not configured or fails
const FALLBACK_REVIEWS = [
    {
        id: "1",
        author_name: "Juan Venter",
        rating: 5,
        text: "Absolutely fantastic service! They helped me pick out the perfect parts for my budget and the build quality is top notch. Highly recommend Ypies Tech Store for any gaming needs.",
        relative_time_description: "2 months ago",
        profile_photo_url: null,
    },
    {
        id: "2",
        author_name: "Thabo Mwsane",
        rating: 5,
        text: "Best place in Pretoria for refurbished tech. Got a Dell Optiplex for my office and it works like new. The team was very helpful and friendly.",
        relative_time_description: "1 month ago",
        profile_photo_url: null,
    },
    {
        id: "3",
        author_name: "Sarah Jenkins",
        rating: 5,
        text: "Bought a gaming monitor here. Great price and they let me test it in store before buying. will definitely be coming back for my upgrade next year!",
        relative_time_description: "3 weeks ago",
        profile_photo_url: null,
    },
    {
        id: "4",
        author_name: "Mike Rossouw",
        rating: 5,
        text: "Solid products and good warranty on refurbished items. Had a small issue with a cable but they swapped it out immediately. Great customer support.",
        relative_time_description: "1 week ago",
        profile_photo_url: null,
    },
    {
        id: "5",
        author_name: "David K.",
        rating: 5,
        text: "Ordered online and collected in store. Seamless process. The shop looks amazing and the staff really know their stuff.",
        relative_time_description: "Just now",
        profile_photo_url: null,
    }
];

const FALLBACK_STATS = {
    rating: parseFloat(process.env.MANUAL_RATING || "4.8"),
    user_ratings_total: parseInt(process.env.MANUAL_REVIEW_COUNT || "15")
};

export async function GET() {
    try {
        const apiKey = process.env.GOOGLE_PLACES_API_KEY;
        const placeId = process.env.GOOGLE_PLACE_ID;

        if (!apiKey || !placeId) {
            console.warn("Google Places API Key or Place ID not found. Serving fallback data.");
            return NextResponse.json({
                reviews: FALLBACK_REVIEWS,
                rating: FALLBACK_STATS.rating,
                user_ratings_total: FALLBACK_STATS.user_ratings_total,
                source: "fallback"
            });
        }

        const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&key=${apiKey}`,
            { next: { revalidate: 3600 } } // Cache for 1 hour
        );

        if (!response.ok) {
            throw new Error(`Google Places API error: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.status !== "OK") {
            console.error("Google Places API returned status:", data.status, data.error_message);
            // If the API call itself was valid but the logic failed (e.g. invalid key), fallback
            return NextResponse.json({
                reviews: FALLBACK_REVIEWS,
                rating: FALLBACK_STATS.rating,
                user_ratings_total: FALLBACK_STATS.user_ratings_total,
                source: "fallback",
                error: data.status
            });
        }

        // Transform Google API format to our internal format if needed, or just pass through
        // Google returns: { result: { reviews: [], rating: 4.5, user_ratings_total: 100 } }

        return NextResponse.json({
            reviews: data.result.reviews,
            rating: data.result.rating,
            user_ratings_total: data.result.user_ratings_total,
            source: "google"
        });

    } catch (error) {
        console.error("Error fetching reviews:", error);
        return NextResponse.json({
            reviews: FALLBACK_REVIEWS,
            rating: FALLBACK_STATS.rating,
            user_ratings_total: FALLBACK_STATS.user_ratings_total,
            source: "fallback"
        });
    }
}

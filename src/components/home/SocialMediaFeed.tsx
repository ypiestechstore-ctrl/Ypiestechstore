"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Split videos
interface Video {
    id: string;
    type: "tiktok" | "youtube";
    fallbackTitle: string;
}

const TIKTOK_VIDEOS: Video[] = [
    {
        id: "7577719407506509077",
        type: "tiktok",
        fallbackTitle: "TikTok Video"
    },
    {
        id: "7577684472468868372",
        type: "tiktok",
        fallbackTitle: "TikTok Video"
    },
    {
        id: "7574405820205567253",
        type: "tiktok",
        fallbackTitle: "TikTok Video"
    }
];

const YOUTUBE_VIDEOS: Video[] = [
    {
        id: "MMcdvtkJHSE",
        type: "youtube",
        fallbackTitle: "MacBook Pro M2 - Quick Look"
    },
    {
        id: "EHK_hmu3BcY",
        type: "youtube",
        fallbackTitle: "Dell Latitude - Business Grade"
    },
    {
        id: "8pN513dyrhA",
        type: "youtube",
        fallbackTitle: "YouTube Video"
    }
];

export function SocialMediaFeed() {
    return (
        <section className="bg-muted/30 py-16">
            <div className="container space-y-12">
                <div className="text-center md:text-left mb-6">
                    <h2 className="text-3xl font-bold tracking-tight mb-2">Follow Us</h2>
                    <p className="text-muted-foreground">
                        See our latest reviews, unboxings, and tech tips on our social media channels.
                    </p>
                </div>

                {/* TikTok Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3V0Z" />
                            </svg>
                            <h3 className="text-xl font-semibold">Latest on TikTok</h3>
                        </div>
                        <a href="https://www.tiktok.com/@ypiestechstore" target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="gap-2">
                                View Profile
                            </Button>
                        </a>
                    </div>
                    <VideoRow videos={TIKTOK_VIDEOS} />
                </div>

                {/* YouTube Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16" className="text-red-600">
                                <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.007 2.007 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.007 2.007 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31.4 31.4 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.007 2.007 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A99.788 99.788 0 0 1 7.858 2h.193zM6.4 5.209v4.818l4.157-2.408L6.4 5.209z" />
                            </svg>
                            <h3 className="text-xl font-semibold">Latest on YouTube</h3>
                        </div>
                        <a href="https://www.youtube.com/@ypiestechstore" target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="gap-2">
                                View Channel
                            </Button>
                        </a>
                    </div>
                    <VideoRow videos={YOUTUBE_VIDEOS} />
                </div>
            </div>
        </section>
    );
}

function VideoRow({ videos }: { videos: Video[] }) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener("resize", checkScroll);
        setTimeout(checkScroll, 100);
        return () => window.removeEventListener("resize", checkScroll);
    }, []);

    const scroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const scrollAmount = 350;
            scrollContainerRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth"
            });
            setTimeout(checkScroll, 300);
        }
    };

    return (
        <div className="relative group">
            {canScrollLeft && (
                <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
                    onClick={() => scroll("left")}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
            )}

            {canScrollRight && (
                <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
                    onClick={() => scroll("right")}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            )}

            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto gap-4 pb-4 px-1 scrollbar-hide snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                onScroll={checkScroll}
            >
                {videos.map((video, index) => (
                    <div key={index} className="flex-none snap-center">
                        <VideoCard video={video} />
                    </div>
                ))}
            </div>
        </div>
    );
}

function VideoCard({ video }: { video: Video }) {
    if (video.type === "youtube") {
        return (
            <Card className="w-[300px] md:w-[350px] overflow-hidden border-0 shadow-md">
                <CardContent className="p-0 relative aspect-video bg-black group cursor-pointer">
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${video.id}`}
                        title={video.fallbackTitle}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 z-0"
                    ></iframe>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-[300px] md:w-[325px] overflow-hidden border-0 shadow-md h-full bg-black">
            <CardContent className="p-0 relative aspect-[9/16] bg-black">
                <iframe
                    src={`https://www.tiktok.com/embed/v2/${video.id}?lang=en-US`}
                    className="w-full h-full absolute inset-0"
                    allowFullScreen
                    style={{ border: "none" }}
                    title={video.fallbackTitle}
                ></iframe>
            </CardContent>
        </Card>
    );
}

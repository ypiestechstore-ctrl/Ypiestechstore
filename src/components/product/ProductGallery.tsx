"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
    mainImage: string;
    additionalImages?: string[];
    productName: string;
}

export function ProductGallery({ mainImage, additionalImages = [], productName }: ProductGalleryProps) {
    const [activeImage, setActiveImage] = useState(mainImage);

    // Combine all unique images
    const allImages = Array.from(new Set([mainImage, ...additionalImages]));

    return (
        <div className="flex flex-col gap-4">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-muted md:aspect-square border">
                <Image
                    src={activeImage}
                    alt={productName}
                    fill
                    className="object-contain"
                    priority
                    unoptimized
                />
            </div>

            {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {allImages.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveImage(img)}
                            className={cn(
                                "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 bg-muted transition-all",
                                activeImage === img ? "border-primary ring-2 ring-primary ring-offset-1" : "border-transparent opacity-70 hover:opacity-100"
                            )}
                        >
                            <Image
                                src={img}
                                alt={`${productName} thumbnail ${idx + 1}`}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

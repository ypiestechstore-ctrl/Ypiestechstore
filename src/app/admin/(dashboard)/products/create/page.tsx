"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Plus, Trash2, Upload, Loader2, Star, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

export default function CreateProductPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [imageUrlInput, setImageUrlInput] = useState("");
    const [showUrlInput, setShowUrlInput] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        shortDescription: "",
        price: "",
        category: "",
        image: "", // Main image
        sku: "",
        stock: "",
        costPrice: "",
        warrantyPeriod: "",
        condition: "New",
        isFeatured: false,
    });

    // Additional Images State
    const [additionalImages, setAdditionalImages] = useState<string[]>([]);
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch("/api/categories");
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                }
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (checked: boolean) => {
        setFormData(prev => ({ ...prev, isFeatured: checked }));
    };

    // Image Handlers
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const newImages: string[] = [];
        const errors: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const data = new FormData();
            data.append("file", file);

            try {
                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: data
                });
                const result = await res.json();

                if (res.ok) {
                    newImages.push(result.url);
                } else {
                    errors.push(`${file.name}: ${result.error}`);
                }
            } catch (err) {
                console.error(err);
                errors.push(`${file.name}: Upload failed`);
            }
        }

        if (errors.length > 0) {
            alert("Some files failed to upload:\n" + errors.join("\n"));
        }

        setAdditionalImages(prev => {
            const updated = [...prev, ...newImages];
            // If no featured image yet, set the first new one as featured
            if (!formData.image && newImages.length > 0) {
                setFormData(prevData => ({ ...prevData, image: newImages[0] }));
            }
            return updated;
        });

        setIsUploading(false);
        e.target.value = "";
    };

    const removeImage = (urlToRemove: string) => {
        setAdditionalImages(prev => prev.filter(url => url !== urlToRemove));
        if (formData.image === urlToRemove) {
            setFormData(prev => ({ ...prev, image: "" }));
        }
    };

    const setFeaturedImage = (url: string) => {
        setFormData(prev => ({ ...prev, image: url }));
    };

    const addImageUrl = () => {
        if (!imageUrlInput.trim()) return;

        setAdditionalImages(prev => {
            const updated = [...prev, imageUrlInput];
            if (!formData.image) {
                setFormData(prevData => ({ ...prevData, image: imageUrlInput }));
            }
            return updated;
        });
        setImageUrlInput("");
        setShowUrlInput(false);
    };

    // AI Generation
    const handleGenerateDescription = async () => {
        if (!formData.name || !formData.category) {
            alert("Please enter a Name and Category first.");
            return;
        }

        setIsGenerating(true);
        try {
            const res = await fetch("/api/generate-description", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: formData.name,
                    category: formData.category
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setFormData(prev => ({
                    ...prev,
                    description: data.description,
                    shortDescription: data.shortDescription
                }));
            }
        } catch (error) {
            console.error("Gen error", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Filter out empty strings from additionalImages
        const validAdditionalImages = additionalImages.filter(img => img.trim() !== "");

        try {
            const res = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    additionalImages: validAdditionalImages
                }),
            });

            if (res.ok) {
                router.push("/admin/products");
                router.refresh();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to create product");
            }
        } catch (error) {
            console.error("Error creating product:", error);
            alert("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-10 pb-20">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
                <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Product Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Product Name *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Gaming PC Pro"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category *</Label>
                                <select
                                    id="category"
                                    name="category"
                                    required
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    <option value="">Select...</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="shortDescription">Short Description (Summary)</Label>
                                <textarea
                                    id="shortDescription"
                                    name="shortDescription"
                                    className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.shortDescription}
                                    onChange={handleChange}
                                    placeholder="Brief summary shown on cards..."
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="description">Long Description</Label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                        onClick={handleGenerateDescription}
                                        disabled={isGenerating}
                                    >
                                        <Sparkles className="mr-2 h-3 w-3" />
                                        {isGenerating ? "Generating..." : "Generate Both with AI"}
                                    </Button>
                                </div>
                                <textarea
                                    id="description"
                                    name="description"
                                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (R) *</Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stock">Initial Stock</Label>
                                <Input
                                    id="stock"
                                    name="stock"
                                    type="number"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    placeholder="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sku">SKU</Label>
                                <Input
                                    id="sku"
                                    name="sku"
                                    value={formData.sku}
                                    onChange={handleChange}
                                    placeholder="PROD-001"
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="costPrice">Cost Price (R)</Label>
                                <Input
                                    id="costPrice"
                                    name="costPrice"
                                    type="number"
                                    step="0.01"
                                    value={formData.costPrice}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="warrantyPeriod">Warranty</Label>
                                <Input
                                    id="warrantyPeriod"
                                    name="warrantyPeriod"
                                    value={formData.warrantyPeriod}
                                    onChange={handleChange}
                                    placeholder="e.g. 12 Months"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="condition">Condition</Label>
                                <select
                                    id="condition"
                                    name="condition"
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.condition}
                                    onChange={handleChange}
                                >
                                    <option value="New">New</option>
                                    <option value="Refurbished - Excellent">Refurbished - Excellent</option>
                                    <option value="Refurbished - Good">Refurbished - Good</option>
                                    <option value="Used">Used</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4 border-t pt-4">
                            <Label className="text-base">Product Images</Label>
                            <div className="space-y-4">

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {additionalImages.map((img, index) => (
                                        <div key={index} className={`relative group border rounded-lg overflow-hidden aspect-square ${formData.image === img ? 'ring-2 ring-primary' : ''}`}>
                                            <div className="relative w-full h-full">
                                                <Image
                                                    src={img}
                                                    alt={`Product ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            </div>
                                            {/* Actions Overlay */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant={formData.image === img ? "default" : "secondary"}
                                                    size="sm"
                                                    onClick={() => setFeaturedImage(img)}
                                                    className="w-28 text-xs"
                                                >
                                                    {formData.image === img ? (
                                                        <><Star className="w-3 h-3 mr-1 fill-current" /> Featured</>
                                                    ) : (
                                                        "Set Featured"
                                                    )}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => removeImage(img)}
                                                    className="w-28 text-xs"
                                                >
                                                    <Trash2 className="w-3 h-3 mr-1" /> Remove
                                                </Button>
                                            </div>
                                            {formData.image === img && (
                                                <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-0.5 text-xs rounded-full shadow-md flex items-center">
                                                    <Star className="w-3 h-3 mr-1 fill-current" /> Featured
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Upload Button */}
                                    <label className="border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer transition-colors">
                                        {isUploading ? (
                                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                        ) : (
                                            <>
                                                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                                                <span className="text-xs text-muted-foreground font-medium">Upload Images</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={handleFileUpload}
                                            disabled={isUploading}
                                        />
                                    </label>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Upload multiple images. Select one as the "Featured" image which will be the default.
                                    Max size 20MB per image.
                                </p>

                                {showUrlInput ? (
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="https://example.com/image.jpg"
                                            value={imageUrlInput}
                                            onChange={(e) => setImageUrlInput(e.target.value)}
                                        />
                                        <Button type="button" onClick={addImageUrl} size="sm">Add</Button>
                                        <Button type="button" variant="ghost" onClick={() => setShowUrlInput(false)} size="sm">Cancel</Button>
                                    </div>
                                ) : (
                                    <Button type="button" variant="outline" size="sm" onClick={() => setShowUrlInput(true)}>
                                        <ImageIcon className="w-4 h-4 mr-2" /> Add Image from URL
                                    </Button>
                                )}
                            </div>
                        </div>


                        <div className="flex items-center space-x-2 pt-2">
                            <input
                                type="checkbox"
                                id="isFeatured"
                                checked={formData.isFeatured}
                                onChange={(e) => handleCheckboxChange(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="isFeatured">Feature this product on home page</Label>
                        </div>

                        <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                            {isLoading ? "Creating..." : "Create Product"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div >
    );
}

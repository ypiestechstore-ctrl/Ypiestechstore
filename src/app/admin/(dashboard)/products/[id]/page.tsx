"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Upload, Loader2, Star, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface SerialNumber {
    id: string;
    serial: string;
    status: string;
}

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Serials State
    const [serials, setSerials] = useState<SerialNumber[]>([]);
    const [newSerial, setNewSerial] = useState("");
    const [isAddingSerial, setIsAddingSerial] = useState(false);
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        shortDescription: "",
        price: "",
        category: "",
        image: "",
        sku: "",
        stock: "",
        costPrice: "",
        warrantyPeriod: "",
        condition: "New",
        isFeatured: false,
    });

    const [additionalImages, setAdditionalImages] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [imageUrlInput, setImageUrlInput] = useState("");
    const [showUrlInput, setShowUrlInput] = useState(false);

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

    useEffect(() => {
        if (id) {
            fetchProduct(id);
            fetchSerials(id);
        }
        fetchCategories();
    }, [id]);

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

    const fetchProduct = async (productId: string) => {
        try {
            const res = await fetch(`/api/products/${productId}`);
            if (res.ok) {
                const data = await res.json();
                setFormData({
                    name: data.name,
                    description: data.description,
                    shortDescription: data.shortDescription || "",
                    price: data.price,
                    category: data.category,
                    image: data.image,
                    sku: data.sku || "",
                    stock: data.stock,
                    costPrice: data.costPrice || "",
                    warrantyPeriod: data.warrantyPeriod || "",
                    condition: data.condition || "New",
                    isFeatured: data.isFeatured,
                });
                if (data.images && Array.isArray(data.images)) {
                    setAdditionalImages(data.images.map((img: any) => img.url));
                }
            } else {
                alert("Failed to load product");
            }
        } catch (error) {
            console.error("Error loading product:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSerials = async (productId: string) => {
        try {
            const res = await fetch(`/api/products/${productId}/serials`);
            if (res.ok) {
                const data = await res.json();
                setSerials(data);
            }
        } catch (error) {
            console.error("Error loading serials", error);
        }
    };

    const handleAddSerial = async () => {
        if (!newSerial.trim()) return;
        setIsAddingSerial(true);
        try {
            const res = await fetch(`/api/products/${id}/serials`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ serial: newSerial })
            });

            if (res.ok) {
                setNewSerial("");
                fetchSerials(id);
                // Also refresh product to get updated stock
                fetchProduct(id);
            } else {
                const err = await res.json();
                alert(err.error || "Failed to add serial");
            }
        } catch (error) {
            alert("Error adding serial");
        } finally {
            setIsAddingSerial(false);
        }
    };

    const handleDeleteSerial = async (serialId: string) => {
        if (!confirm("Delete this serial number? Stock will be adjusted.")) return;
        try {
            const res = await fetch(`/api/products/${id}/serials?serialId=${serialId}`, {
                method: "DELETE"
            });
            if (res.ok) {
                fetchSerials(id);
                // Also refresh product to get updated stock
                fetchProduct(id);
            }
        } catch (error) {
            alert("Error deleting serial");
        }
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (checked: boolean) => {
        setFormData(prev => ({ ...prev, isFeatured: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const res = await fetch(`/api/products/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    additionalImages
                }),
            });

            if (res.ok) {
                router.push("/admin/products");
                router.refresh();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to update product");
            }
        } catch (error) {
            console.error("Error updating product:", error);
            alert("An error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-10 text-center">Loading product...</div>;

    return (
        <div className="max-w-2xl mx-auto py-10 pb-20">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
                <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Product Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Product Name *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sku">SKU</Label>
                                <Input
                                    id="sku"
                                    name="sku"
                                    value={formData.sku}
                                    onChange={handleChange}
                                />
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
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Long Description</Label>
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
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stock">Current Stock</Label>
                                <Input
                                    id="stock"
                                    name="stock"
                                    type="number"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    disabled={serials.length > 0}
                                    placeholder={serials.length > 0 ? "Managed by Serial Numbers" : "Manual Stock"}
                                />
                                {serials.length > 0 && <p className="text-xs text-muted-foreground">Managed via Serial Numbers below</p>}
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

                        <Button type="submit" className="w-full mt-6" disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Serial Numbers</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Enter Serial Number scan..."
                            value={newSerial}
                            onChange={(e) => setNewSerial(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddSerial();
                                }
                            }}
                        />
                        <Button onClick={handleAddSerial} disabled={isAddingSerial}>
                            <Plus className="mr-2 h-4 w-4" /> Add
                        </Button>
                    </div>

                    <div className="mt-4 space-y-2">
                        {serials.length === 0 && <p className="text-sm text-muted-foreground">No serial numbers tracked for this product.</p>}
                        {serials.map((sn) => (
                            <div key={sn.id} className="flex items-center justify-between p-2 border rounded-md bg-muted/20">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-sm">{sn.serial}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${sn.status === 'IN_STOCK' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {sn.status}
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteSerial(sn.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

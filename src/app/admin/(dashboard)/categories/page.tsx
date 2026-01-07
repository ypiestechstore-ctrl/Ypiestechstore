"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import { Pencil, Trash2, Plus, GripVertical, ChevronRight, ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Category {
    id: string;
    name: string;
    isFeatured: boolean;
    parentId?: string | null;
    createdAt: string;
    children?: Category[]; // Client-side constructed
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [flatCategories, setFlatCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState<{ name: string; isFeatured: boolean; parentId: string | null }>({ name: "", isFeatured: false, parentId: null });
    const [isSaving, setIsSaving] = useState(false);

    // UI State for expanded nodes
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories");
            if (res.ok) {
                const data: Category[] = await res.json();
                setFlatCategories(data);
                const tree = buildHierarchy(data);
                setCategories(tree);

                // Expand all by default or keep state
                const allIds = data.reduce((acc, c) => ({ ...acc, [c.id]: true }), {});
                if (Object.keys(expanded).length === 0) setExpanded(allIds);
            }
        } catch (error) {
            console.error("Failed to fetch categories", error);
        } finally {
            setIsLoading(false);
        }
    };

    const buildHierarchy = (items: Category[]) => {
        const itemMap = new Map<string, Category>();
        items.forEach(item => itemMap.set(item.id, { ...item, children: [] }));

        const rootItems: Category[] = [];
        items.forEach(item => {
            if (item.parentId && itemMap.has(item.parentId)) {
                const parent = itemMap.get(item.parentId);
                parent?.children?.push(itemMap.get(item.id)!);
            } else {
                rootItems.push(itemMap.get(item.id)!);
            }
        });
        return rootItems;
    };

    const handleOpenSheet = (category?: Category, parentId: string | null = null) => {
        if (category) {
            setCurrentCategory(category);
            setFormData({
                name: category.name,
                isFeatured: category.isFeatured || false,
                parentId: category.parentId || null
            });
        } else {
            setCurrentCategory(null);
            setFormData({ name: "", isFeatured: false, parentId: parentId });
        }
        setIsSheetOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name) return;
        setIsSaving(true);

        try {
            if (currentCategory) {
                // Update
                const res = await fetch(`/api/categories/${currentCategory.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                if (!res.ok) throw new Error("Failed to update");
            } else {
                // Create
                const res = await fetch("/api/categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                if (!res.ok) throw new Error("Failed to create");
            }
            await fetchCategories();
            setIsSheetOpen(false);
        } catch (error) {
            console.error("Error saving category:", error);
            alert("Failed to save category.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will delete the category.")) return;

        try {
            const res = await fetch(`/api/categories/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                fetchCategories();
            } else {
                alert("Failed to delete category");
            }
        } catch (error) {
            console.error("Error deleting category:", error);
        }
    };

    // Drag and Drop Logic
    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData("categoryId", id);
        e.stopPropagation();
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = async (e: React.DragEvent, targetId?: string) => {
        e.preventDefault();
        e.stopPropagation();
        const draggedId = e.dataTransfer.getData("categoryId");

        if (!draggedId || draggedId === targetId) return;

        // Prevent dropping parent into its own child (cycle check simplified)
        // We'll trust backend or catch error, simple check here:
        if (targetId) {
            // TODO: comprehensive cycle check
        }

        try {
            const res = await fetch(`/api/categories/${draggedId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: flatCategories.find(c => c.id === draggedId)?.name, // Require name for update
                    parentId: targetId ?? null
                }),
            });
            if (res.ok) {
                fetchCategories();
            } else {
                const err = await res.json();
                alert(err.error || "Failed to move category");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const CategoryItem = ({ category, level = 0 }: { category: Category, level?: number }) => {
        const hasChildren = category.children && category.children.length > 0;
        const isExpanded = expanded[category.id];

        return (
            <div className="select-none">
                <div
                    className={cn(
                        "flex items-center gap-2 p-2 px-3 border-b hover:bg-muted/50 transition-colors group",
                        level > 0 && "ml-6 border-l"
                    )}
                    draggable
                    onDragStart={(e) => handleDragStart(e, category.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, category.id)}
                >
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing" />

                    <button onClick={(e) => toggleExpand(category.id, e)} className="p-0.5 hover:bg-muted rounded">
                        {hasChildren ? (
                            isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                        ) : <div className="w-4 h-4" />}
                    </button>

                    <span className="font-medium flex-1">{category.name}</span>

                    {category.isFeatured && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                            Featured
                        </span>
                    )}

                    <div className="flex gap-1 opacity-10 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenSheet(undefined, category.id)} title="Add Subcategory">
                            <Plus className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleOpenSheet(category)} title="Edit">
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(category.id)} title="Delete">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {isExpanded && hasChildren && (
                    <div className="border-l border-muted/40 ml-2">
                        {category.children!.map(child => (
                            <CategoryItem key={child.id} category={child} level={level + 1} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Drag and drop items to reorder hierarchy.
                    </p>
                </div>
                <Button onClick={() => handleOpenSheet()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Root Category
                </Button>
            </div>

            <div
                className="rounded-md border bg-card min-h-[200px] p-2"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, undefined)} // Handle drop to root
            >
                {isLoading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No categories found.</div>
                ) : (
                    categories.map(cat => (
                        <CategoryItem key={cat.id} category={cat} />
                    ))
                )}

                {categories.length > 0 && (
                    <div className="h-20 border-2 border-dashed border-transparent hover:border-muted-foreground/20 rounded m-2 flex items-center justify-center text-muted-foreground text-sm">
                        Drop here to make Root Level
                    </div>
                )}
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>{currentCategory ? "Edit Category" : "Add Category"}</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Category Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Laptops"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="parent">Parent Category</Label>
                            <select
                                id="parent"
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.parentId || ""}
                                onChange={(e) => setFormData({ ...formData, parentId: e.target.value || null })}
                            >
                                <option value="">(None - Root Level)</option>
                                {flatCategories
                                    .filter(c => c.id !== currentCategory?.id) // Prevent selecting self
                                    .map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                            </select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="isFeatured"
                                checked={formData.isFeatured}
                                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="isFeatured">Feature on Homepage</Label>
                        </div>
                    </div>
                    <SheetFooter>
                        <Button variant="outline" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isSaving || !formData.name}>
                            {isSaving ? "Saving..." : "Save"}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
}

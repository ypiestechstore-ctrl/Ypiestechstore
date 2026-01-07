"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/context/store-context";
import { Product, ImportTemplate } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight } from "lucide-react";
import Papa from "papaparse";

const stripHtml = (html: string) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"');
};

function NewImportContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { importTemplates, saveImportTemplate } = useStore();

    // Steps: 1=Source, 2=Map, 3=Filter
    const [step, setStep] = useState(1);
    const [templateName, setTemplateName] = useState("");
    const [sourceType, setSourceType] = useState<'file' | 'url'>('file');
    const [url, setUrl] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [csvData, setCsvData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);

    // New State for Advanced Import
    const [markupPercentage, setMarkupPercentage] = useState<number>(0);
    const [selectedStockColumns, setSelectedStockColumns] = useState<string[]>([]);

    // Mapping State
    const [mapping, setMapping] = useState({
        sku: "",
        name: "",
        price: "",
        category: "",
        description: "",
        image: ""
    });

    // Category Filter State
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    // Load template if ID provided
    useEffect(() => {
        const templateId = searchParams.get('template');
        if (templateId) {
            const template = importTemplates.find(t => t.id === templateId);
            if (template) {
                setTemplateName(template.name);
                setSourceType(template.sourceType);
                if (template.url) setUrl(template.url);

                setMapping({
                    sku: template.fieldMapping.sku,
                    name: template.fieldMapping.name,
                    price: template.fieldMapping.price,
                    category: template.fieldMapping.category,
                    description: template.fieldMapping.description || "",
                    image: template.fieldMapping.image || ""
                });

                if (template.fieldMapping.stock) {
                    setSelectedStockColumns(template.fieldMapping.stock.split(','));
                }
            }
        }
    }, [searchParams, importTemplates]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const parseCSV = () => {
        if (sourceType === 'file' && file) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    setCsvData(results.data);
                    if (results.meta.fields) {
                        setHeaders(results.meta.fields);
                    }
                    setStep(2);
                },
                error: (error: Error) => {
                    alert("Error parsing CSV: " + error.message);
                }
            });
        } else if (sourceType === 'url' && url) {
            Papa.parse(url, {
                download: true,
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    setCsvData(results.data);
                    if (results.meta.fields) {
                        setHeaders(results.meta.fields);
                    }
                    setStep(2);
                },
                error: (error: Error) => {
                    alert("Error fetching/parsing CSV from URL: " + error.message);
                }
            });
        } else {
            alert("Please provide a file or URL.");
        }
    };

    const handleMappingChange = (field: string, value: string) => {
        setMapping(prev => ({ ...prev, [field]: value }));
    };

    const toggleStockColumn = (header: string) => {
        setSelectedStockColumns(prev =>
            prev.includes(header) ? prev.filter(h => h !== header) : [...prev, header]
        );
    };

    const proceedToCategories = () => {
        if (!mapping.sku || !mapping.name || !mapping.price || selectedStockColumns.length === 0) {
            alert("Please map SKU, Name, Price, and select at least one Stock column.");
            return;
        }

        const categoryField = mapping.category;
        if (categoryField) {
            const categories = Array.from(new Set(csvData.map(row => row[categoryField]).filter(Boolean)));
            setAvailableCategories(categories);
            setSelectedCategories(categories);
        }

        setStep(3);
    };

    const toggleCategory = (category: string) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const handleImport = async (saveTemplate: boolean) => {
        const filteredData = csvData.filter(row => {
            const rowCategory = mapping.category ? row[mapping.category] : null;
            return !mapping.category || (rowCategory && selectedCategories.includes(rowCategory));
        });

        const productsToImport: Product[] = filteredData.map(row => {
            // 1. Calculate Total Stock
            let totalStock = 0;
            selectedStockColumns.forEach(col => {
                const val = parseInt(row[col]);
                if (!isNaN(val)) totalStock += val;
            });

            // 2. Calculate Price with Markup
            let basePrice = parseFloat(row[mapping.price]) || 0;
            if (markupPercentage > 0) {
                basePrice = basePrice * (1 + markupPercentage / 100);
            }

            // 3. Handle Images (Split by comma, pipe, or semicolon)
            const rawImages = row[mapping.image] || "";
            const imageList = rawImages.split(/[,|;]/).map((s: string) => s.trim()).filter((s: string) => s !== "");
            const mainImage = imageList.length > 0 ? imageList[0] : "";

            return {
                id: "",
                sku: row[mapping.sku],
                name: row[mapping.name],
                price: parseFloat(basePrice.toFixed(2)),
                stock: totalStock,
                category: mapping.category ? row[mapping.category] : "Uncategorized",
                description: mapping.description ? stripHtml(row[mapping.description]) : "",
                image: mainImage,
                images: imageList,
                isSupplierStock: true
            };
        }).filter(p => p.sku);

        if (saveTemplate && templateName) {
            const newTemplate: ImportTemplate = {
                id: searchParams.get('template') || `TMP-${Date.now()}`,
                name: templateName,
                sourceType,
                url: sourceType === 'url' ? url : undefined,
                fieldMapping: { ...mapping, stock: selectedStockColumns.join(',') },
                categoryFilter: selectedCategories
            };
            saveImportTemplate(newTemplate);
        }

        try {
            const res = await fetch("/api/products/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ products: productsToImport })
            });

            if (res.ok) {
                const result = await res.json();
                alert(`Import Successful!\nCreated: ${result.created}\nUpdated: ${result.updated}`);
                router.push("/admin/products");
            } else {
                const err = await res.json();
                alert("Import failed: " + (err.error || "Unknown error"));
            }
        } catch (error) {
            console.error(error);
            alert("Error submitting import.");
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">New Import</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className={step >= 1 ? "text-primary font-bold" : ""}>1. Source</span>
                    <ArrowRight className="h-4 w-4" />
                    <span className={step >= 2 ? "text-primary font-bold" : ""}>2. Map</span>
                    <ArrowRight className="h-4 w-4" />
                    <span className={step >= 3 ? "text-primary font-bold" : ""}>3. Filter & Import</span>
                </div>
            </div>

            {step === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Select Data Source</CardTitle>
                        <CardDescription>Upload a CSV file or provide a URL.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Template Name (Optional)</Label>
                            <Input
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                placeholder="e.g., Supplier A Weekly Update"
                            />
                        </div>

                        <Tabs defaultValue="file" value={sourceType} onValueChange={(v) => setSourceType(v as 'file' | 'url')}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="file">File Upload</TabsTrigger>
                                <TabsTrigger value="url">URL</TabsTrigger>
                            </TabsList>
                            <TabsContent value="file" className="space-y-4 pt-4">
                                <div className="grid w-full max-w-sm items-center gap-1.5">
                                    <Label htmlFor="csv-file">CSV File</Label>
                                    <Input id="csv-file" type="file" accept=".csv" onChange={handleFileUpload} />
                                </div>
                            </TabsContent>
                            <TabsContent value="url" className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="url">CSV URL</Label>
                                    <Input
                                        id="url"
                                        placeholder="https://example.com/feed.csv"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>

                        <Button onClick={parseCSV} disabled={sourceType === 'file' && !file || sourceType === 'url' && !url}>
                            Next: Map Fields
                        </Button>
                    </CardContent>
                </Card>
            )}

            {step === 2 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Map Fields</CardTitle>
                        <CardDescription>Match CSV columns to product fields.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            {['sku', 'name', 'price', 'category', 'description', 'image'].map((field) => (
                                <div key={field} className="space-y-2">
                                    <Label className="capitalize">{field} {['sku', 'name', 'price'].includes(field) && '*'}</Label>
                                    <Select
                                        value={mapping[field as keyof typeof mapping]}
                                        onValueChange={(val) => handleMappingChange(field, val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select column" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {headers.map(header => (
                                                <SelectItem key={header} value={header}>{header}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 border-t pt-4">
                            <div>
                                <Label className="text-base font-semibold">Stock Columns *</Label>
                                <p className="text-sm text-muted-foreground mb-2">Select all columns that contain stock quantities. They will be summed together.</p>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border rounded-md bg-muted/20">
                                {headers.map(header => (
                                    <div key={header} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`stock-${header}`}
                                            checked={selectedStockColumns.includes(header)}
                                            onCheckedChange={() => toggleStockColumn(header)}
                                        />
                                        <Label htmlFor={`stock-${header}`} className="font-normal cursor-pointer">{header}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between mt-6">
                            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                            <Button onClick={proceedToCategories}>Next: Settings & Filter</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {step === 3 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Import Settings</CardTitle>
                        <CardDescription>Configure pricing and categories.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        <div className="p-4 border rounded-md bg-muted/20 space-y-2">
                            <Label htmlFor="markup">Price Markup (%)</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="markup"
                                    type="number"
                                    min="0"
                                    value={markupPercentage}
                                    onChange={(e) => setMarkupPercentage(parseFloat(e.target.value) || 0)}
                                    className="max-w-[150px]"
                                />
                                <span className="text-sm text-muted-foreground">Add to imported price</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Select Categories to Import</Label>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedCategories(availableCategories)}
                                    >
                                        Select All
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedCategories([])}
                                    >
                                        Unselect All
                                    </Button>
                                    <p className="text-xs text-muted-foreground self-center">
                                        ({selectedCategories.length} selected)
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border p-4 rounded-md max-h-60 overflow-y-auto">
                                {availableCategories.length === 0 && <p className="col-span-3 text-center text-muted-foreground py-4">No categories found in CSV</p>}
                                {availableCategories.map(category => (
                                    <div key={category} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`cat-${category}`}
                                            checked={selectedCategories.includes(category)}
                                            onCheckedChange={() => toggleCategory(category)}
                                        />
                                        <Label htmlFor={`cat-${category}`}>{category}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 pt-4 border-t">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="save-template"
                                    checked={!!templateName}
                                    disabled={!templateName}
                                />
                                <Label htmlFor="save-template" className={!templateName ? "text-muted-foreground" : ""}>
                                    Save as Template {templateName ? `"${templateName}"` : "(Enter name in Step 1)"}
                                </Label>
                            </div>

                            <div className="flex justify-between">
                                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                                <div className="flex gap-2">
                                    <Button onClick={() => handleImport(false)} variant="secondary">Import Only</Button>
                                    <Button onClick={() => handleImport(true)} disabled={!templateName}>Import & Save Template</Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default function NewImportPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NewImportContent />
        </Suspense>
    );
}

"use client";

import Link from "next/link";
import { useStore } from "@/context/store-context";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, FileUp, Trash2, Play } from "lucide-react";

export default function ImportPage() {
    const { importTemplates, deleteImportTemplate } = useStore();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Stock Import</h1>
                <Link href="/admin/import/new">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        New Import
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border bg-card">
                <div className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Saved Import Templates</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Template Name</TableHead>
                                <TableHead>Source</TableHead>
                                <TableHead>Mapped Fields</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {importTemplates.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        No templates saved. Create a new import to save a template.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                importTemplates.map((template) => (
                                    <TableRow key={template.id}>
                                        <TableCell className="font-medium">{template.name}</TableCell>
                                        <TableCell>
                                            <span className="capitalize">{template.sourceType}</span>
                                            {template.url && <span className="text-xs text-muted-foreground block truncate max-w-[200px]">{template.url}</span>}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1 flex-wrap">
                                                {Object.entries(template.fieldMapping).map(([key, value]) => (
                                                    value && (
                                                        <span key={key} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                                            {key}: {value}
                                                        </span>
                                                    )
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/admin/import/new?template=${template.id}`}>
                                                    <Button variant="outline" size="sm" className="gap-2">
                                                        <Play className="h-4 w-4" />
                                                        Run
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive"
                                                    onClick={() => deleteImportTemplate(template.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}

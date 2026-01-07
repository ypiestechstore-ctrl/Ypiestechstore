"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product, Quote, Invoice, ImportTemplate, CartItem } from "@/lib/types";
import { products as initialProducts } from "@/lib/data";

interface StoreContextType {
    products: Product[];
    quotes: Quote[];
    invoices: Invoice[];
    importTemplates: ImportTemplate[];
    cart: CartItem[];
    updateProductStock: (id: string, quantity: number) => void;
    createQuote: (quote: Quote) => void;
    convertQuoteToInvoice: (quoteId: string) => void;
    deleteQuote: (id: string) => void;
    updateQuoteStatus: (id: string, status: Quote['status']) => void;
    saveImportTemplate: (template: ImportTemplate) => void;
    deleteImportTemplate: (id: string) => void;
    importProducts: (newProducts: Product[]) => void;
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateCartQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [importTemplates, setImportTemplates] = useState<ImportTemplate[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initializeStore = () => {
            const storedProducts = localStorage.getItem("computer-store-products");
            const storedQuotes = localStorage.getItem("computer-store-quotes");
            const storedInvoices = localStorage.getItem("computer-store-invoices");
            const storedTemplates = localStorage.getItem("computer-store-import-templates");
            const storedCart = localStorage.getItem("computer-store-cart");

            if (storedProducts) {
                setProducts(JSON.parse(storedProducts));
            } else {
                setProducts(initialProducts);
            }

            if (storedQuotes) setQuotes(JSON.parse(storedQuotes));
            if (storedInvoices) setInvoices(JSON.parse(storedInvoices));
            if (storedTemplates) setImportTemplates(JSON.parse(storedTemplates));
            if (storedCart) setCart(JSON.parse(storedCart));

            setIsInitialized(true);
        };

        initializeStore();
    }, []);

    // Persist changes
    useEffect(() => {
        if (!isInitialized) return;
        localStorage.setItem("computer-store-products", JSON.stringify(products));
    }, [products, isInitialized]);

    useEffect(() => {
        if (!isInitialized) return;
        localStorage.setItem("computer-store-quotes", JSON.stringify(quotes));
    }, [quotes, isInitialized]);

    useEffect(() => {
        if (!isInitialized) return;
        localStorage.setItem("computer-store-invoices", JSON.stringify(invoices));
    }, [invoices, isInitialized]);

    useEffect(() => {
        if (!isInitialized) return;
        localStorage.setItem("computer-store-import-templates", JSON.stringify(importTemplates));
    }, [importTemplates, isInitialized]);

    useEffect(() => {
        if (!isInitialized) return;
        localStorage.setItem("computer-store-cart", JSON.stringify(cart));
    }, [cart, isInitialized]);

    const updateProductStock = (id: string, quantity: number) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: quantity } : p));
    };

    const createQuote = (quote: Quote) => {
        setQuotes(prev => [...prev, quote]);
    };

    const deleteQuote = (id: string) => {
        setQuotes(prev => prev.filter(q => q.id !== id));
    };

    const updateQuoteStatus = (id: string, status: Quote['status']) => {
        setQuotes(prev => prev.map(q => q.id === id ? { ...q, status } : q));
    };

    const convertQuoteToInvoice = (quoteId: string) => {
        const quote = quotes.find(q => q.id === quoteId);
        if (!quote) return;

        // Create Invoice
        const newInvoice: Invoice = {
            id: `INV-${Date.now()}`,
            quoteId: quote.id,
            customerName: quote.customerName,
            customerEmail: quote.customerEmail,
            items: quote.items,
            total: quote.total,
            status: 'Unpaid',
            createdAt: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days due
        };

        setInvoices(prev => [...prev, newInvoice]);

        // Update Quote Status
        updateQuoteStatus(quoteId, 'Invoiced');

        // Deduct Stock
        setProducts(prevProducts => {
            const newProducts = [...prevProducts];
            quote.items.forEach(item => {
                if (item.productId) {
                    const productIndex = newProducts.findIndex(p => p.id === item.productId);
                    if (productIndex !== -1) {
                        newProducts[productIndex] = {
                            ...newProducts[productIndex],
                            stock: Math.max(0, newProducts[productIndex].stock - item.quantity)
                        };
                    }
                }
            });
            return newProducts;
        });
    };

    const saveImportTemplate = (template: ImportTemplate) => {
        setImportTemplates(prev => {
            const exists = prev.find(t => t.id === template.id);
            if (exists) {
                return prev.map(t => t.id === template.id ? template : t);
            }
            return [...prev, template];
        });
    };

    const deleteImportTemplate = (id: string) => {
        setImportTemplates(prev => prev.filter(t => t.id !== id));
    };

    const importProducts = (newProducts: Product[]) => {
        setProducts(prev => {
            const updatedProducts = [...prev];
            newProducts.forEach(newP => {
                // Find existing product by SKU if available
                const existingIndex = updatedProducts.findIndex(p => p.sku === newP.sku && newP.sku !== undefined && newP.sku !== "");

                if (existingIndex !== -1) {
                    // Update existing product
                    updatedProducts[existingIndex] = {
                        ...updatedProducts[existingIndex],
                        price: newP.price,
                        stock: newP.stock,
                        isSupplierStock: true,
                    };
                } else {
                    // Add new product
                    updatedProducts.push({
                        ...newP,
                        isSupplierStock: true,
                        id: `IMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                    });
                }
            });
            return updatedProducts;
        });
    };

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existingItem = prev.find(item => item.id === product.id);
            if (existingItem) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateCartQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart(prev => prev.map(item =>
            item.id === productId ? { ...item, quantity } : item
        ));
    };

    const clearCart = () => {
        setCart([]);
    };

    return (
        <StoreContext.Provider value={{
            products,
            quotes,
            invoices,
            importTemplates,
            cart,
            updateProductStock,
            createQuote,
            convertQuoteToInvoice,
            deleteQuote,
            updateQuoteStatus,
            saveImportTemplate,
            deleteImportTemplate,
            importProducts,
            addToCart,
            removeFromCart,
            updateCartQuantity,
            clearCart
        }}>
            {children}
        </StoreContext.Provider>
    );
}

export function useStore() {
    const context = useContext(StoreContext);
    if (context === undefined) {
        throw new Error("useStore must be used within a StoreProvider");
    }
    return context;
}

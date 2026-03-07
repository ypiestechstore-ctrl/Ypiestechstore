export interface Product {
    id: string;
    sku?: string; // Added SKU for import matching
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    isFeatured?: boolean;
    stock: number;
    isSupplierStock?: boolean; // To mark items as "In Stock with Supplier"
    warrantyPeriod?: string | null;
    images?: string[]; // Added for multiple images support
    categories?: { id: string; name: string }[];
}

export interface QuoteItem {
    id: string;
    productId?: string;
    name: string;
    price: number;
    quantity: number;
    isCustom: boolean;
    warranty?: string;
    serialNumbers?: string[];
}

export interface Quote {
    id: string;
    customerName: string;
    customerEmail: string;
    items: QuoteItem[];
    total: number;
    status: 'Draft' | 'Sent' | 'Invoiced';
    createdAt: string;
    salesPerson?: {
        name: string;
        email: string;
    };
}

export interface Invoice {
    id: string;
    quoteId: string;
    customerName: string;
    customerEmail: string;
    items: QuoteItem[];
    total: number;
    status: 'Paid' | 'Unpaid';
    createdAt: string;
    dueDate: string;
    quote?: Quote;
    salesPerson?: {
        name: string;
        email: string;
    };
}

export interface ImportTemplate {
    id: string;
    name: string;
    sourceType: 'file' | 'url';
    url?: string;
    fieldMapping: {
        sku: string;
        name: string;
        price: string;
        stock: string;
        category: string;
        description?: string;
        image?: string;
    };
    categoryFilter: string[]; // List of categories to import
}

export interface CartItem extends Product {
    quantity: number;
}

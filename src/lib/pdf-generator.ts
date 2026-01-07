
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Quote, Invoice } from "@/lib/types";

export const companyInfo = {
    name: "Ypie's Tech Store",
    address: [
        "Shop Nr. 9, Giessenburg centre",
        "252 Ben Viljoen St",
        "Pretoria North, 0182",
        "Phone: 064 512 7972",
        "Email: sales@ypiestechstore.co.za"
    ],
    logoUrl: "/logo.png"
};

const loadImage = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        console.log(`Loading image from ${url}`);
        const img = new Image();
        img.src = url;
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            console.log("Image loaded successfully");
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                reject("Could not get canvas context");
                return;
            }
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = (e) => {
            console.error("Image load failed", e);
            reject(e);
        };
    });
};

export const generateQuotePDF = async (quote: Quote) => {
    try {
        console.log("Generating Quote PDF...");
        const doc = new jsPDF();

        // Add Logo
        try {
            const logoData = await loadImage(companyInfo.logoUrl);
            // Maintain aspect ratio, assume header area is about 40px high
            doc.addImage(logoData, 'PNG', 14, 10, 40, 40);
        } catch (e) {
            console.error("Failed to load logo", e);
        }

        // Header Info
        doc.setFontSize(22);
        doc.setTextColor(40);
        doc.text("QUOTE", 150, 22);

        doc.setFontSize(10);
        doc.setTextColor(100);

        let yPos = 32;
        doc.text(companyInfo.name, 150, yPos);

        companyInfo.address.forEach((line) => {
            yPos += 5;
            doc.text(line, 150, yPos);
        });

        // Divider
        doc.setDrawColor(200);
        doc.line(14, 60, 196, 60);

        // Customer Info
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Bill To:`, 14, 70);

        doc.setFontSize(10);
        doc.setTextColor(50);
        doc.text(quote.customerName || "Valued Customer", 14, 76);
        doc.text(quote.customerEmail || "", 14, 82);

        // Quote Details
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Quote #: ${quote.id.substring(0, 8).toUpperCase()}`, 130, 70);
        doc.text(`Date: ${new Date(quote.createdAt || Date.now()).toLocaleDateString()}`, 130, 76);
        doc.text(`Valid Until: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}`, 130, 82);

        if (quote.salesPerson?.name) {
            doc.text(`Salesperson: ${quote.salesPerson.name}`, 130, 88);
        }

        // Items Table
        const tableBody = (quote.items || []).map((item) => [
            item.name,
            item.warranty || "-",
            item.quantity,
            `R ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            `R ${(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
        ]);

        autoTable(doc, {
            startY: quote.salesPerson?.name ? 100 : 90,
            head: [['Item Description', 'Warranty', 'Qty', 'Unit Price', 'Total']],
            body: tableBody,
            headStyles: { fillColor: [66, 66, 66] },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            foot: [['', '', '', 'Total:', `R ${quote.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`]],
            footStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'right' },
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 25, halign: 'center' },
                2: { cellWidth: 15, halign: 'center' },
                3: { cellWidth: 30, halign: 'right' },
                4: { cellWidth: 30, halign: 'right' }
            }
        });

        // Terms
        const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("Terms & Conditions:", 14, finalY);
        doc.text("1. This quote is valid for 7 days.", 14, finalY + 5);
        doc.text("2. Payment is required before delivery.", 14, finalY + 10);

        doc.save(`Quote-${quote.id.substring(0, 8)}.pdf`);
        console.log("PDF Saved");
    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Failed to generate PDF. Check console for details.");
    }
};

export const generateInvoicePDF = async (invoice: Invoice) => {
    try {
        console.log("Generating Invoice PDF...");
        const doc = new jsPDF();

        // Add Logo
        try {
            const logoData = await loadImage(companyInfo.logoUrl);
            doc.addImage(logoData, 'PNG', 14, 10, 40, 40);
        } catch (e) {
            console.error("Failed to load logo", e);
        }

        // Header Info
        doc.setFontSize(22);
        doc.setTextColor(40);
        doc.text("INVOICE", 150, 22);

        doc.setFontSize(10);
        doc.setTextColor(100);

        let yPos = 32;
        doc.text(companyInfo.name, 150, yPos);

        companyInfo.address.forEach((line) => {
            yPos += 5;
            doc.text(line, 150, yPos);
        });

        // Divider
        doc.setDrawColor(200);
        doc.line(14, 60, 196, 60);

        // Customer Info
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Bill To:`, 14, 70);

        doc.setFontSize(10);
        doc.setTextColor(50);
        doc.text(invoice.customerName || "Valued Customer", 14, 76);
        doc.text(invoice.customerEmail || "", 14, 82);

        // Invoice Details
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Invoice #: ${invoice.id.substring(0, 8).toUpperCase()}`, 130, 70);
        doc.text(`Date: ${new Date(invoice.createdAt || Date.now()).toLocaleDateString()}`, 130, 76);
        doc.text(`Due Date: ${new Date(invoice.dueDate || Date.now()).toLocaleDateString()}`, 130, 82);

        if (invoice.salesPerson?.name) {
            doc.text(`Salesperson: ${invoice.salesPerson.name}`, 130, 88);
        }

        // Status Badge text
        const status = invoice.status || "Unpaid";
        if (status === 'Paid') {
            doc.setTextColor(0, 128, 0);
        } else {
            doc.setTextColor(200, 0, 0);
        }
        doc.text(`Status: ${status.toUpperCase()}`, 130, invoice.salesPerson?.name ? 94 : 88);


        // Items Table
        const tableBody = (invoice.items || []).map((item) => [
            item.name,
            item.warranty || "-",
            item.quantity,
            `R ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            `R ${(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
        ]);

        autoTable(doc, {
            startY: invoice.salesPerson?.name ? 105 : 95,
            head: [['Item Description', 'Warranty', 'Qty', 'Unit Price', 'Total']],
            body: tableBody,
            headStyles: { fillColor: [66, 66, 66] },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            foot: [['', '', '', 'Total:', `R ${invoice.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`]],
            footStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'right' },
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 25, halign: 'center' },
                2: { cellWidth: 15, halign: 'center' },
                3: { cellWidth: 30, halign: 'right' },
                4: { cellWidth: 30, halign: 'right' }
            }
        });

        // Payment Info
        const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text("Banking Details:", 14, finalY);
        doc.setFontSize(9);
        doc.setTextColor(50);
        doc.text("BankName: Tech Bank", 14, finalY + 5);
        doc.text("Account: 1234567890", 14, finalY + 10);
        doc.text("Branch: 000000", 14, finalY + 15);
        doc.text(`Ref: ${invoice.id.substring(0, 8)}`, 14, finalY + 20);

        doc.save(`Invoice-${invoice.id.substring(0, 8)}.pdf`);
        console.log("PDF Saved");
    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Failed to generate PDF. Check console for details.");
    }
};

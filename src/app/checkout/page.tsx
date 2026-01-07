"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatCurrency } from "@/lib/utils";
import { useStore } from "@/context/store-context";

interface Bank {
    id: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    branchCode: string;
    isVisible: boolean;
}

export default function CheckoutPage() {
    const { cart } = useStore();
    const [paymentMethod, setPaymentMethod] = useState("eft");
    const [banks, setBanks] = useState<Bank[]>([]);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        address: "",
        city: "",
        postalCode: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handlePlaceOrder = async () => {
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.address) {
            alert("Please fill in all shipping details.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: cart,
                    total,
                    customerName: `${formData.firstName} ${formData.lastName}`,
                    customerEmail: formData.email,
                    shippingAddress: `${formData.address}, ${formData.city}, ${formData.postalCode}`,
                    paymentMethod
                })
            });

            if (res.ok) {
                const order = await res.json();
                alert(`Order placed successfully! Order ID: ${order.id}`);
                window.location.href = "/";
            } else {
                alert("Failed to place order. Please try again.");
            }
        } catch (error) {
            console.error("Error placing order:", error);
            alert("An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        fetch('/api/settings/banks')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setBanks(data.filter((b: Bank) => b.isVisible));
                }
            })
            .catch(err => console.error(err));
    }, []);

    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <div className="container py-10">
            <h1 className="mb-8 text-3xl font-bold">Checkout</h1>
            <div className="grid gap-8 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Shipping Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input id="firstName" placeholder="John" value={formData.firstName} onChange={handleInputChange} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input id="lastName" placeholder="Doe" value={formData.lastName} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="john@example.com" value={formData.email} onChange={handleInputChange} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">Address</Label>
                            <Input id="address" placeholder="123 Main St" value={formData.address} onChange={handleInputChange} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="city">City</Label>
                                <Input id="city" placeholder="Cape Town" value={formData.city} onChange={handleInputChange} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="postalCode">Postal Code</Label>
                                <Input id="postalCode" placeholder="8001" value={formData.postalCode} onChange={handleInputChange} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-4">
                            <Label>Payment Method</Label>
                            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="flex flex-col space-y-2">
                                <div className="flex items-center space-x-2 border p-4 rounded-md">
                                    <RadioGroupItem value="eft" id="eft" />
                                    <Label htmlFor="eft" className="flex-1 cursor-pointer">EFT / Bank Transfer</Label>
                                </div>
                                <div className="flex items-center space-x-2 border p-4 rounded-md">
                                    <RadioGroupItem value="cash" id="cash" />
                                    <Label htmlFor="cash" className="flex-1 cursor-pointer">Cash on Collection</Label>
                                </div>
                            </RadioGroup>

                            {paymentMethod === "eft" && (
                                <div className="rounded-md bg-muted p-4 text-sm space-y-4">
                                    <p className="font-semibold">Banking Details:</p>

                                    {banks.length > 0 ? (
                                        banks.map((bank) => (
                                            <div key={bank.id} className="grid grid-cols-3 gap-1 border-b pb-2 last:border-0 last:pb-0">
                                                <span className="text-muted-foreground">Bank:</span>
                                                <span className="col-span-2 font-medium">{bank.bankName}</span>
                                                <span className="text-muted-foreground">Acc Name:</span>
                                                <span className="col-span-2">{bank.accountName}</span>
                                                <span className="text-muted-foreground">Acc No:</span>
                                                <span className="col-span-2 font-mono">{bank.accountNumber}</span>
                                                <span className="text-muted-foreground">Branch:</span>
                                                <span className="col-span-2">{bank.branchCode}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-red-500">No banking details available. Please contact support.</p>
                                    )}

                                    <div className="pt-2">
                                        <span className="text-muted-foreground">Reference:</span>
                                        <span className="ml-2 font-bold">Order #</span>
                                    </div>

                                    <p className="text-xs text-muted-foreground mt-2">
                                        Please send proof of payment to sales@ypiestechstore.co.za. Your order will be processed once payment clears.
                                    </p>
                                </div>
                            )}

                            {paymentMethod === "cash" && (
                                <div className="rounded-md bg-muted p-4 text-sm">
                                    <p>
                                        Please pay at the counter when you collect your order.
                                        <br />
                                        <span className="text-xs text-muted-foreground">Note: Orders not collected within 3 days will be cancelled.</span>
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between border-t pt-4 font-bold">
                            <span>Total to Pay</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" size="lg" onClick={handlePlaceOrder} disabled={isSubmitting}>
                            {isSubmitting ? "Processing..." : "Place Order"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

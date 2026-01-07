"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ChevronDown, Check, Clock, Truck, XCircle } from "lucide-react";

// Mock Data
type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

interface Order {
    id: string;
    customer: string;
    date: string;
    total: number;
    status: OrderStatus;
    items: number;
}

const initialOrders: Order[] = [
    { id: "ORD-001", customer: "John Doe", date: "2023-12-01", total: 24999, status: "Delivered", items: 3 },
    { id: "ORD-002", customer: "Jane Smith", date: "2023-12-05", total: 1499, status: "Processing", items: 1 },
    { id: "ORD-003", customer: "Bob Johnson", date: "2023-12-06", total: 8500, status: "Pending", items: 2 },
    { id: "ORD-004", customer: "Alice Brown", date: "2023-12-07", total: 32000, status: "Shipped", items: 5 },
    { id: "ORD-005", customer: "Charlie Wilson", date: "2023-12-07", total: 450, status: "Cancelled", items: 1 },
];

const statusColors: Record<OrderStatus, string> = {
    Pending: "bg-yellow-100 text-yellow-800",
    Processing: "bg-blue-100 text-blue-800",
    Shipped: "bg-purple-100 text-purple-800",
    Delivered: "bg-green-100 text-green-800",
    Cancelled: "bg-red-100 text-red-800",
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>(initialOrders);

    const updateStatus = (orderId: string, newStatus: OrderStatus) => {
        setOrders(orders.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
        ));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">{order.id}</TableCell>
                                <TableCell>{order.customer}</TableCell>
                                <TableCell>{order.date}</TableCell>
                                <TableCell>{order.items}</TableCell>
                                <TableCell>R {order.total.toLocaleString()}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status]}`}>
                                        {order.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => updateStatus(order.id, "Pending")}>
                                                <Clock className="mr-2 h-4 w-4" /> Mark Pending
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => updateStatus(order.id, "Processing")}>
                                                <Clock className="mr-2 h-4 w-4" /> Mark Processing
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => updateStatus(order.id, "Shipped")}>
                                                <Truck className="mr-2 h-4 w-4" /> Mark Shipped
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => updateStatus(order.id, "Delivered")}>
                                                <Check className="mr-2 h-4 w-4" /> Mark Delivered
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => updateStatus(order.id, "Cancelled")} className="text-red-600">
                                                <XCircle className="mr-2 h-4 w-4" /> Cancel Order
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div >
    );
}

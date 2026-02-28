"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, Mail, PackageCheck, Eye, Loader2 } from "lucide-react";
import { MagneticButton } from "@/components/premium/MagneticButton";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const OrderStatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, string> = {
        Pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        Processing: "bg-volt/10 text-volt border-volt/20",
        Shipped: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        Delivered: "bg-green-500/10 text-green-400 border-green-500/20",
        Refunded: "bg-red-500/10 text-red-400 border-red-500/20",
    };

    return (
        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${config[status] || ""}`}>
            {status}
        </span>
    );
};

export default function AdminOrdersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                profiles:user_id ( full_name, email )
            `)
            .order('created_at', { ascending: false });

        if (data) {
            setOrders(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();

        // Subscribe to real-time order updates
        const channel = supabase
            .channel('admin_orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
                fetchOrders(); // Just refetch to keep it simple, or update state optimistically
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            toast.success(`Order marked as ${newStatus}`);
        } catch (error: any) {
            toast.error(error.message || "Failed to update order");
        }
    };

    const filteredOrders = orders.filter(
        (order) => order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.profiles?.full_name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-heading text-3xl font-bold">Orders</h1>
                <p className="mt-1 text-sm text-text-secondary">
                    Track, process, and manage customer orders across all channels.
                </p>
            </div>

            <div className="rounded-xl border border-white/5 bg-surface pb-4 shadow-xl">
                {/* Toolbar */}
                <div className="flex flex-col border-b border-white/5 p-4 sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="Search by Order ID or Customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-10 w-full rounded-lg border border-white/10 bg-deep-black pl-10 pr-4 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-volt/30 focus:outline-none"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-text-secondary hover:bg-white/5 hover:text-text-primary">
                            <Filter className="h-3.5 w-3.5" />
                            Status
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-xs text-text-secondary">
                            <tr>
                                <th className="px-6 py-3 font-medium">Order ID</th>
                                <th className="px-6 py-3 font-medium">Date</th>
                                <th className="px-6 py-3 font-medium">Customer</th>
                                <th className="px-6 py-3 font-medium">Total</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <Loader2 className="h-6 w-6 animate-spin text-volt" />
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredOrders.map((order) => (
                                <tr key={order.id} className="transition-colors hover:bg-white-[0.02]">
                                    <td className="px-6 py-4 font-medium text-text-primary capitalize">{order.id.split('-')[0]}</td>
                                    <td className="px-6 py-4 text-text-secondary">{new Date(order.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-text-primary">{order.profiles?.full_name || "Guest Checkout"}</p>
                                        <p className="text-xs text-text-secondary">{order.profiles?.email || order.contact_info?.email}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-text-primary">₹{order.total_amount?.toLocaleString("en-IN")}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <OrderStatusBadge status={order.status.charAt(0).toUpperCase() + order.status.slice(1)} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {(order.status === "processing" || order.status === "pending") && (
                                                <button
                                                    onClick={() => handleUpdateStatus(order.id, 'shipped')}
                                                    className="flex items-center gap-1 rounded bg-volt/10 px-2 py-1 text-xs font-medium text-volt hover:bg-volt/20"
                                                >
                                                    <PackageCheck className="h-3.5 w-3.5" />
                                                    Ship
                                                </button>
                                            )}
                                            <button className="p-2 text-text-secondary transition-colors hover:text-white">
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {!loading && filteredOrders.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-text-secondary">No orders match your search.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

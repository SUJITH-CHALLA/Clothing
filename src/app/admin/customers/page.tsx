"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { Users, Search, Award, Wallet, MoreVertical, Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { toast } from "sonner";

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const supabase = createClient();

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        console.log("Fetching all customers...");
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Fetch error:", error);
            toast.error("Failed to load customers: " + error.message);
        }
        if (data) {
            console.log(`Found ${data.length} customers`);
            setCustomers(data);
        }
        setLoading(false);
    };

    const updateLoyalty = async (id: string, amount: number) => {
        const customer = customers.find(c => c.id === id);
        const newPoints = (customer?.loyalty_points || 0) + amount;

        const { error } = await supabase
            .from("profiles")
            .update({ loyalty_points: newPoints })
            .eq("id", id);

        if (!error) {
            toast.success(`Updated loyalty points`);
            setCustomers(prev => prev.map(c => c.id === id ? { ...c, loyalty_points: newPoints } : c));
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-volt" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold">Customer Loyalty</h1>
                    <p className="text-text-secondary">Manage loyalty points and reward credits.</p>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search users..."
                        className="w-full h-12 bg-surface/50 border border-white/10 rounded-2xl pl-12 pr-4 text-sm focus:outline-none focus:border-volt/30 transition-all"
                    />
                </div>
            </header>

            <div className="grid gap-6">
                <div className="overflow-x-auto rounded-3xl border border-white/5 bg-surface/20">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-white/5 bg-white/5 text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                            <tr>
                                <th className="px-6 py-5">Customer</th>
                                <th className="px-6 py-5">Loyalty Points</th>
                                <th className="px-6 py-5">Credit Balance</th>
                                <th className="px-6 py-5">Status</th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredCustomers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-volt/10 flex items-center justify-center text-volt font-bold">
                                                {customer.full_name?.charAt(0) || customer.email?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white">{customer.full_name || 'Anonymous'}</p>
                                                <p className="text-xs text-text-secondary">{customer.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <Award className="h-4 w-4 text-volt" />
                                            <span className="font-bold text-white">{customer.loyalty_points || 0}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-blue-400">
                                            <Wallet className="h-4 w-4" />
                                            <span className="font-bold">₹{(customer.credit_balance || 0).toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tighter ${(customer.loyalty_points || 0) > 1000 ? 'bg-volt/20 text-volt' : 'bg-white/5 text-text-secondary'
                                            }`}>
                                            {(customer.loyalty_points || 0) > 1000 ? 'VIP Member' : 'Standard'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => updateLoyalty(customer.id, 50)}
                                                className="p-2 rounded-lg bg-volt/10 text-volt hover:bg-volt hover:text-deep-black transition-colors"
                                                title="Add 50 Points"
                                            >
                                                <ArrowUpRight className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => updateLoyalty(customer.id, -50)}
                                                className="p-2 rounded-lg bg-red-400/10 text-red-400 hover:bg-red-400 hover:text-white transition-colors"
                                                title="Remove 50 Points"
                                            >
                                                <ArrowDownRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

"use client";

import React, { useState, useEffect } from "react";
import { Plus, Tag as TagIcon, Clock, Percent, AlertCircle, Loader2 } from "lucide-react";
import { MagneticButton } from "@/components/premium/MagneticButton";
import { createClient } from "@/lib/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AdminDiscountsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [discounts, setDiscounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        code: "",
        type: "percentage",
        value: "",
        min_order_amount: "0",
        max_uses: "",
    });

    const supabase = createClient();

    const fetchDiscounts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('discounts')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) {
            setDiscounts(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchDiscounts();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: (name === 'code' ? value.toUpperCase() : value) }));
    };

    const handleCreateDiscount = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { error } = await supabase.from('discounts').insert([{
                code: formData.code,
                type: formData.type,
                value: parseInt(formData.value),
                min_order_amount: parseInt(formData.min_order_amount) || 0,
                max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
                is_active: true
            }]);

            if (error) throw error;
            toast.success("Discount created successfully");
            setIsAddModalOpen(false);
            setFormData({ code: "", type: "percentage", value: "", min_order_amount: "0", max_uses: "" });
            fetchDiscounts();
        } catch (err: any) {
            toast.error(err.message || "Failed to create discount");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredDiscounts = discounts.filter(
        (discount) => discount.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-heading text-3xl font-bold">Discounts</h1>
                    <p className="mt-1 text-sm text-text-secondary">
                        Manage promo codes, automated discounts, and flash sales.
                    </p>
                </div>

                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <div>
                            <MagneticButton>
                                <button className="flex items-center gap-2 rounded-xl bg-volt px-4 py-2.5 text-sm font-semibold text-deep-black transition-all hover:bg-volt/90">
                                    <Plus className="h-4 w-4" />
                                    Create Discount
                                </button>
                            </MagneticButton>
                        </div>
                    </DialogTrigger>
                    <DialogContent className="border-white/10 bg-[#0a0a0a] text-text-primary sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="font-heading text-xl font-bold">New Discount Code</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateDiscount} className="mt-4 space-y-4">
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Code</label>
                                <input required name="code" value={formData.code} onChange={handleChange} className="mt-1.5 w-full rounded-lg border border-white/10 bg-surface px-4 py-2.5 text-sm uppercase focus:border-volt/50 focus:outline-none" placeholder="e.g. WELCOME20" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Type</label>
                                    <select name="type" value={formData.type} onChange={handleChange} className="mt-1.5 w-full rounded-lg border border-white/10 bg-surface px-4 py-2.5 text-sm focus:border-volt/50 focus:outline-none appearance-none">
                                        <option value="percentage">Percentage</option>
                                        <option value="fixed">Fixed Amount</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Value</label>
                                    <input required type="number" name="value" value={formData.value} onChange={handleChange} className="mt-1.5 w-full rounded-lg border border-white/10 bg-surface px-4 py-2.5 text-sm focus:border-volt/50 focus:outline-none" placeholder={formData.type === 'percentage' ? "20 (%)" : "500 (₹)"} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Min Order (₹)</label>
                                    <input type="number" name="min_order_amount" value={formData.min_order_amount} onChange={handleChange} className="mt-1.5 w-full rounded-lg border border-white/10 bg-surface px-4 py-2.5 text-sm focus:border-volt/50 focus:outline-none" placeholder="0" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Max Uses</label>
                                    <input type="number" name="max_uses" value={formData.max_uses} onChange={handleChange} className="mt-1.5 w-full rounded-lg border border-white/10 bg-surface px-4 py-2.5 text-sm focus:border-volt/50 focus:outline-none" placeholder="Leave empty for ∞" />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium hover:bg-white/5">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="rounded-lg bg-volt px-4 py-2 text-sm font-semibold text-deep-black hover:bg-volt/90 disabled:opacity-50 flex items-center gap-2">
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
                                </button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Flash Sale Banner Configurator */}
            <div className="rounded-xl border border-volt/20 bg-volt/5 p-6">
                <div className="flex items-start gap-4">
                    <div className="rounded-full bg-volt/10 p-3 text-volt">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-volt">Active Flash Sale: 24Hr Drop</h3>
                        <p className="mt-1 text-sm text-text-secondary">
                            Currently running on the homepage. Ends in 12 hours, 45 minutes.
                        </p>
                        <div className="mt-4 flex gap-3">
                            <button className="rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/20">
                                Edit Timer
                            </button>
                            <button className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20">
                                End Early
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-surface pb-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/5 p-4">
                    <div className="relative w-full max-w-sm">
                        <input
                            type="text"
                            placeholder="Search by discount code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-10 w-full rounded-lg border border-white/10 bg-deep-black px-4 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-volt/30 focus:outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-xs text-text-secondary">
                            <tr>
                                <th className="px-6 py-3 font-medium">Code</th>
                                <th className="px-6 py-3 font-medium">Type & Value</th>
                                <th className="px-6 py-3 font-medium">Usage</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <Loader2 className="h-6 w-6 animate-spin text-volt" />
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredDiscounts.map((discount) => (
                                <tr key={discount.id} className="transition-colors hover:bg-white-[0.02]">
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono font-medium text-text-primary">
                                            <TagIcon className="h-3 w-3 text-volt" />
                                            {discount.code}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-text-primary">
                                            {discount.type === 'percentage' ? `${discount.value}%` : `₹${discount.value?.toLocaleString('en-IN')}`}
                                        </p>
                                        <p className="text-xs text-text-secondary capitalize">{discount.type}</p>
                                    </td>
                                    <td className="px-6 py-4 text-text-secondary">
                                        {discount.used_count || 0} / {discount.max_uses ? discount.max_uses : '∞'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${discount.is_active ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/5 text-text-secondary border border-white/10'
                                            }`}>
                                            {discount.is_active ? 'Active' : 'Expired/Paused'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {!loading && filteredDiscounts.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-text-secondary">
                            <AlertCircle className="mb-2 h-8 w-8 opacity-50" />
                            <p>No discount codes found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

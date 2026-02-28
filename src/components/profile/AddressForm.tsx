"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AddressForm({ onSuccess, onCancel }: { onSuccess: () => void, onCancel: () => void }) {
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target as HTMLFormElement);
        const newAddress = {
            full_name: formData.get("full_name"),
            phone: formData.get("phone"),
            address_line_1: formData.get("address_line_1"),
            address_line_2: formData.get("address_line_2") || null,
            city: formData.get("city"),
            state: formData.get("state"),
            pincode: formData.get("pincode"),
            country: "India",
            is_default: formData.get("is_default") === "on",
        };

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {

            // If setting default, unset other defaults first (simplified for UX right now)
            if (newAddress.is_default) {
                await supabase.from("user_addresses")
                    .update({ is_default: false })
                    .eq("user_id", session.user.id);
            }

            const { error } = await supabase
                .from("user_addresses")
                .insert([{ ...newAddress, user_id: session.user.id }]);

            if (!error) {
                onSuccess();
            }
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 border border-white/10 rounded-2xl p-6 bg-surface/30">
            <h3 className="text-xl font-semibold mb-4">Add New Address</h3>

            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs text-text-secondary">Full Name</label>
                    <input required name="full_name" type="text" className="w-full h-12 rounded-xl bg-deep-black border border-white/10 px-4 mt-1 focus:border-volt/30 focus:outline-none" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs text-text-secondary">Phone Number</label>
                    <input required name="phone" type="tel" className="w-full h-12 rounded-xl bg-deep-black border border-white/10 px-4 mt-1 focus:border-volt/30 focus:outline-none" />
                </div>
                <div className="col-span-2">
                    <label className="text-xs text-text-secondary">Address Line 1</label>
                    <input required name="address_line_1" type="text" className="w-full h-12 rounded-xl bg-deep-black border border-white/10 px-4 mt-1 focus:border-volt/30 focus:outline-none" />
                </div>
                <div className="col-span-2">
                    <label className="text-xs text-text-secondary">Address Line 2 (Optional)</label>
                    <input name="address_line_2" type="text" className="w-full h-12 rounded-xl bg-deep-black border border-white/10 px-4 mt-1 focus:border-volt/30 focus:outline-none" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs text-text-secondary">City</label>
                    <input required name="city" type="text" className="w-full h-12 rounded-xl bg-deep-black border border-white/10 px-4 mt-1 focus:border-volt/30 focus:outline-none" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs text-text-secondary">State</label>
                    <input required name="state" type="text" className="w-full h-12 rounded-xl bg-deep-black border border-white/10 px-4 mt-1 focus:border-volt/30 focus:outline-none" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs text-text-secondary">Pincode</label>
                    <input required name="pincode" type="text" className="w-full h-12 rounded-xl bg-deep-black border border-white/10 px-4 mt-1 focus:border-volt/30 focus:outline-none" />
                </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" id="is_default" name="is_default" className="accent-volt" />
                <label htmlFor="is_default" className="text-sm">Set as default address</label>
            </div>

            <div className="flex gap-4 mt-8">
                <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-full border border-white/10 hover:bg-white/5 transition-colors">
                    Cancel
                </button>
                <button type="submit" disabled={loading} className="flex-1 py-3 rounded-full bg-volt text-deep-black font-semibold hover:bg-volt/90 transition-colors disabled:opacity-50">
                    {loading ? "Saving..." : "Save Address"}
                </button>
            </div>
        </form>
    );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, MapPin, Loader2, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AddressForm } from "@/components/profile/AddressForm";

export default function AddressesPage() {
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const fetchAddresses = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user?.id) return;

            const { data } = await supabase
                .from("user_addresses")
                .select("*")
                .eq("user_id", session.user.id)
                .order("is_default", { ascending: false });

            if (data) {
                setAddresses(data);
            }
            setLoading(false);
        };
        fetchAddresses();
    }, [supabase.auth, showForm]);

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from("user_addresses").delete().eq("id", id);
        if (!error) {
            setAddresses(addresses.filter(a => a.id !== id));
        }
    };

    return (
        <div className="mx-auto max-w-4xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold font-heading">Saved Addresses</h1>
                    <p className="text-sm text-text-secondary mt-1">Manage where your drops get delivered.</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-volt text-deep-black font-semibold px-4 py-2 rounded-lg hover:bg-volt/90 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Add Address</span>
                    </button>
                )}
            </div>

            {showForm ? (
                <AddressForm
                    onSuccess={() => setShowForm(false)}
                    onCancel={() => setShowForm(false)}
                />
            ) : loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-volt" />
                </div>
            ) : addresses.length === 0 ? (
                <div className="text-center py-16 border border-white/5 rounded-2xl bg-surface/30">
                    <MapPin className="h-12 w-12 text-text-secondary/20 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No addresses saved</h3>
                    <p className="text-sm text-text-secondary mt-1">Add an address to make checkout faster.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                        <div key={address.id} className="border border-white/10 rounded-2xl p-5 bg-deep-black relative group">
                            {address.is_default && (
                                <span className="absolute top-4 right-4 text-xs font-semibold text-volt bg-volt/10 px-2 py-1 rounded flex items-center gap-1">
                                    <Star className="h-3 w-3" /> Default
                                </span>
                            )}
                            <h3 className="font-medium text-lg">{address.full_name}</h3>
                            <p className="text-text-secondary text-sm mt-1">{address.phone}</p>

                            <div className="mt-4 text-sm text-text-secondary space-y-1">
                                <p>{address.address_line_1}</p>
                                {address.address_line_2 && <p>{address.address_line_2}</p>}
                                <p>{address.city}, {address.state} {address.pincode}</p>
                                <p>{address.country}</p>
                            </div>

                            <div className="mt-6 flex gap-3 border-t border-white/5 pt-4">
                                <button
                                    onClick={() => handleDelete(address.id)}
                                    className="text-sm font-medium text-text-secondary hover:text-red-500 flex items-center gap-1 transition-colors"
                                >
                                    <Trash2 className="h-3.5 w-3.5" /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

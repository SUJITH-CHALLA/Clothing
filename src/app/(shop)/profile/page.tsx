"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, User, MapPin, Package, AlertCircle, Heart, History } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RecentlyViewed } from "@/components/shop/RecentlyViewed";
import Link from "next/link";

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [activeTab, setActiveTab] = useState<"details" | "address" | "orders" | "wishlist">("details");
    const [orders, setOrders] = useState<any[]>([]);

    const [profile, setProfile] = useState({
        full_name: "",
        phone: "",
    });

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // Check if demo user
                if (document.cookie.includes("clothify_demo_auth")) {
                    setUser({ email: "demo@clothify.shop", id: "demo-123" });
                    setProfile({ full_name: "Demo User", phone: "+91 9876543210" });
                    setLoading(false);
                    return;
                }
                router.push("/login");
                return;
            }

            setUser(session.user);

            // Fetch profile data
            const { data: profileData } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", session.user.id)
                .single();

            if (profileData) {
                setProfile({
                    full_name: profileData.full_name || "",
                    phone: profileData.phone || "",
                });
            }

            // Fetch orders
            const { data: userOrders } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (userOrders) {
                setOrders(userOrders);
            }

            setLoading(false);
        };

        fetchUser();
    }, [router, supabase]);

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.error("Sign out error:", err);
        }
        document.cookie = "clothify_demo_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        window.location.href = "/login";
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");

        if (user.id === "demo-123") {
            setTimeout(() => {
                setMessage("Profile saved (Mocked)");
                setSaving(false);
            }, 800);
            return;
        }

        const { error } = await supabase
            .from("profiles")
            .update({
                full_name: profile.full_name,
                phone: profile.phone,
            })
            .eq("id", user.id);

        if (error) {
            setMessage("Failed to save profile.");
        } else {
            setMessage("Profile updated successfully.");
        }
        setSaving(false);
    };

    if (loading) {
        return <div className="flex h-[60vh] items-center justify-center">Loading...</div>;
    }

    if (!user) return null;

    return (
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
            <h1 className="mb-12 font-heading text-3xl font-bold tracking-tight md:text-5xl">My Account</h1>

            <div className="flex flex-col gap-12 md:flex-row">
                {/* Sidebar */}
                <div className="w-full md:w-64 space-y-2">
                    <button
                        onClick={() => { setActiveTab("details"); setMessage(""); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "details" ? "bg-surface border border-white/10" : "hover:bg-white/5 text-text-secondary"}`}
                    >
                        <User className="h-4 w-4" />
                        <span className="text-sm font-medium">Account Details</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab("address"); setMessage(""); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "address" ? "bg-surface border border-white/10" : "hover:bg-white/5 text-text-secondary"}`}
                    >
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm font-medium">Addresses</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab("orders"); setMessage(""); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "orders" ? "bg-surface border border-white/10" : "hover:bg-white/5 text-text-secondary"}`}
                    >
                        <Package className="h-4 w-4" />
                        <span className="text-sm font-medium">Order History</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab("wishlist"); setMessage(""); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "wishlist" ? "bg-surface border border-white/10" : "hover:bg-white/5 text-text-secondary"}`}
                    >
                        <Heart className="h-4 w-4" />
                        <span className="text-sm font-medium">Wishlist</span>
                    </button>

                    <div className="pt-8">
                        <button
                            onClick={handleSignOut}
                            className="flex w-full items-center gap-3 px-4 py-3 text-red-400 transition-colors hover:bg-red-400/10 rounded-xl"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="text-sm font-medium">Sign out</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="max-w-3xl">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="rounded-2xl border border-white/5 bg-surface/30 p-8 backdrop-blur-md"
                        >
                            {activeTab === "details" && (
                                <div>
                                    <h2 className="text-xl font-bold mb-6">Personal Details</h2>
                                    <form onSubmit={handleSaveProfile} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs text-text-secondary">Email Address</Label>
                                            <Input
                                                disabled
                                                value={user.email}
                                                className="h-12 rounded-xl border-white/10 bg-deep-black/50 text-text-secondary"
                                            />
                                            <p className="text-[10px] text-text-secondary">Email cannot be changed.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs text-text-secondary">Full Name</Label>
                                            <Input
                                                value={profile.full_name}
                                                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                                placeholder="Your name"
                                                className="h-12 rounded-xl border-white/10 bg-deep-black text-text-primary focus:border-volt/30"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs text-text-secondary">Phone Number</Label>
                                            <Input
                                                value={profile.phone}
                                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                                placeholder="+91..."
                                                className="h-12 rounded-xl border-white/10 bg-deep-black text-text-primary focus:border-volt/30"
                                            />
                                        </div>

                                        <button
                                            disabled={saving}
                                            type="submit"
                                            className="mt-4 rounded-full bg-white text-black px-6 py-3 text-sm font-semibold transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                                        >
                                            {saving ? "Saving..." : "Save Changes"}
                                        </button>

                                        {message && <p className="mt-4 text-sm text-volt">{message}</p>}
                                    </form>
                                </div>
                            )}

                            {activeTab === "address" && (
                                <div className="flex flex-col items-center justify-center p-12 text-center text-text-secondary">
                                    <MapPin className="h-12 w-12 mb-4 opacity-50 text-volt" />
                                    <h3 className="text-xl font-bold mb-2 text-white">Address Management</h3>
                                    <p className="mb-6">We have moved addresses to a dedicated hub.</p>
                                    <button
                                        onClick={() => router.push("/profile/addresses")}
                                        className="rounded-full bg-volt text-deep-black px-8 py-3 text-sm font-semibold transition-transform hover:scale-105 active:scale-95"
                                    >
                                        Manage Addresses
                                    </button>
                                </div>
                            )}

                            {activeTab === "orders" && (
                                <div>
                                    <h2 className="text-xl font-bold mb-6">Order History</h2>
                                    {orders.length > 0 ? (
                                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                            {orders.map((order) => (
                                                <div key={order.id} className="rounded-xl border border-white/10 bg-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-text-primary capitalize">Order #{order.id.split('-')[0]}</p>
                                                        <p className="mt-1 text-xs text-text-secondary">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/2">
                                                        <div className="text-left sm:text-right">
                                                            <p className="text-sm font-bold text-text-primary">₹{order.total_amount?.toLocaleString('en-IN')}</p>
                                                            <p className="text-xs text-text-secondary">{order.payment_method || 'Razorpay'}</p>
                                                        </div>
                                                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${order.status === 'delivered' ? 'bg-green-500/10 text-green-400' :
                                                            order.status === 'processing' || order.status === 'pending' ? 'bg-volt/10 text-volt' :
                                                                'bg-blue-500/10 text-blue-400'
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-white/10 rounded-xl">
                                            <AlertCircle className="h-8 w-8 text-text-secondary mb-4 opacity-50" />
                                            <p className="text-text-secondary text-sm">You haven't placed any orders yet.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            {activeTab === "wishlist" && (
                                <div className="flex flex-col items-center justify-center p-12 text-center text-text-secondary">
                                    <Heart className="h-12 w-12 mb-4 opacity-50 text-red-500" />
                                    <h3 className="text-xl font-bold mb-2 text-white">Your Wishlist</h3>
                                    <p className="mb-6">View and manage your saved drops in a dedicated space.</p>
                                    <Link
                                        href="/profile/wishlist"
                                        className="rounded-full bg-volt text-deep-black px-8 py-3 text-sm font-semibold transition-transform hover:scale-105 active:scale-95"
                                    >
                                        Open Wishlist
                                    </Link>
                                </div>
                            )}
                        </motion.div>

                        <div className="mt-12">
                            <RecentlyViewed />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

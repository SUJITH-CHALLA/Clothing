"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ProductCard } from "@/components/shop/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Loader2, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";

export default function WishlistPage() {
    const [wishlistItems, setWishlistItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchWishlist = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setLoading(false);
                return;
            }
            setUser(session.user);

            const { data, error } = await supabase
                .from("wishlist")
                .select("*, products(*)")
                .eq("user_id", session.user.id);

            if (data) {
                setWishlistItems(data.map((item: any) => ({
                    ...item.products,
                    wishlist_id: item.id
                })));
            }
            setLoading(false);
        };

        fetchWishlist();
    }, [supabase]);

    const removeFromWishlist = async (wishlistId: string) => {
        const { error } = await supabase
            .from("wishlist")
            .delete()
            .eq("id", wishlistId);

        if (!error) {
            setWishlistItems(prev => prev.filter(item => item.wishlist_id !== wishlistId));
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-volt" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-6">
                <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <Heart className="h-10 w-10 text-white/20" />
                </div>
                <h1 className="text-3xl font-heading font-bold mb-4 uppercase tracking-tighter">Login Required</h1>
                <p className="text-text-secondary max-w-sm mb-8">Please sign in to view and manage your conceptual wishlist.</p>
                <Link href="/login" className="rounded-full bg-volt text-deep-black px-8 py-3 text-sm font-bold transition-all hover:scale-105 active:scale-95">
                    Sign In
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
            <header className="mb-16">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-volt/10 flex items-center justify-center">
                        <Heart className="h-5 w-5 text-volt" />
                    </div>
                    <h1 className="text-4xl font-heading font-bold italic uppercase tracking-tighter">Your Wishlist</h1>
                </div>
                <p className="text-text-secondary">Track the pieces you're watching for future drops.</p>
            </header>

            <AnimatePresence mode="popLayout">
                {wishlistItems.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {wishlistItems.map((product, idx) => (
                            <motion.div
                                key={product.wishlist_id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="relative group"
                            >
                                <ProductCard product={product} />
                                <button
                                    onClick={() => removeFromWishlist(product.wishlist_id)}
                                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-deep-black/60 backdrop-blur-md text-white/50 hover:text-red-500 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-white/5 rounded-3xl"
                    >
                        <ShoppingBag className="h-16 w-16 text-white/5 mb-6" />
                        <h2 className="text-2xl font-bold mb-2">Nothing here (yet)</h2>
                        <p className="text-text-secondary text-sm max-w-xs mb-8">Your wishlist is empty. Start adding some classified concepts to track them.</p>
                        <Link href="/" className="text-volt text-sm font-bold border-b border-volt/20 hover:border-volt transition-colors">
                            Explore Catalog
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ProductCard } from "./ProductCard";
import { motion } from "framer-motion";
import { History } from "lucide-react";

export function RecentlyViewed() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchRecentlyViewed = async () => {
            const viewedIds = JSON.parse(localStorage.getItem("clothify_recently_viewed") || "[]");
            if (viewedIds.length === 0) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("products")
                .select("*")
                .in("id", viewedIds);

            if (data) {
                // Sort by the order in viewedIds
                const sorted = viewedIds
                    .map((id: string) => data.find(p => p.id === id))
                    .filter(Boolean);
                setProducts(sorted);
            }
            setLoading(false);
        };

        fetchRecentlyViewed();
    }, [supabase]);

    if (loading || products.length === 0) return null;

    return (
        <div className="mt-32">
            <div className="flex items-center gap-3 mb-10">
                <div className="h-10 w-10 rounded-xl bg-volt/10 flex items-center justify-center">
                    <History className="h-5 w-5 text-volt" />
                </div>
                <h2 className="text-3xl font-heading font-bold italic uppercase tracking-tighter">Your History</h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product, idx) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        viewport={{ once: true }}
                    >
                        <ProductCard product={product} />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

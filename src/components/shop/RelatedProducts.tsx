"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ProductCard } from "./ProductCard";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function RelatedProducts({ productId, subcategory, collection }: { productId: string, subcategory?: string, collection?: string }) {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchRelated = async () => {
            let query = supabase.from("products").select("*").neq("id", productId).limit(4);

            if (collection) {
                query = query.eq("collection", collection);
            } else if (subcategory) {
                query = query.eq("subcategory", subcategory);
            }

            const { data } = await query;
            if (data && data.length > 0) {
                setProducts(data);
            } else {
                // Fallback to any 4 products if no collection matches
                const { data: fallback } = await supabase.from("products").select("*").neq("id", productId).limit(4);
                if (fallback) setProducts(fallback);
            }
            setLoading(false);
        };

        fetchRelated();
    }, [productId, subcategory, collection, supabase]);

    if (loading || products.length === 0) return null;

    return (
        <div className="mt-32">
            <div className="flex items-center gap-3 mb-10">
                <div className="h-10 w-10 rounded-xl bg-volt/10 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-volt" />
                </div>
                <h2 className="text-3xl font-heading font-bold italic uppercase tracking-tighter">Complete the Look</h2>
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

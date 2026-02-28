"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { HoverBorderCard } from "@/components/premium/HoverBorderCard";
import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProductCardProps {
    product: {
        id: string;
        name: string;
        price: number;
        image: string;
        tag?: string;
    };
    index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        const checkWishlist = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
            if (session?.user) {
                const { data } = await supabase
                    .from("wishlist")
                    .select("*")
                    .eq("product_id", product.id)
                    .eq("user_id", session.user.id)
                    .single();
                if (data) setIsWishlisted(true);
            }
        };
        checkWishlist();
    }, [product.id, supabase]);

    const toggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            toast.error("Login to wishlist items");
            return;
        }

        if (isWishlisted) {
            const { error } = await supabase
                .from("wishlist")
                .delete()
                .eq("product_id", product.id)
                .eq("user_id", user.id);
            if (!error) setIsWishlisted(false);
        } else {
            const { error } = await supabase
                .from("wishlist")
                .insert([{ product_id: product.id, user_id: user.id }]);
            if (!error) setIsWishlisted(true);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: (index % 4) * 0.1, duration: 0.5 }}
        >
            <HoverBorderCard className="group cursor-pointer">
                <Link href={`/product/${product.id}`}>
                    <div className="relative aspect-[3/4] overflow-hidden bg-surface-light">
                        {/* Product Image or Fallback */}
                        {product.image ? (
                            <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                loading="lazy"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-text-secondary/20 transition-transform duration-700 group-hover:scale-105">
                                <span className="font-heading text-6xl font-bold">
                                    {product.name.charAt(0)}
                                </span>
                            </div>
                        )}

                        {/* Tag */}
                        {product.tag && (
                            <span className="absolute left-3 top-3 rounded-full bg-volt px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-deep-black z-10">
                                {product.tag}
                            </span>
                        )}

                        {/* Wishlist Button */}
                        <button
                            onClick={toggleWishlist}
                            className={cn(
                                "absolute right-3 top-3 z-10 p-2 rounded-full backdrop-blur-md transition-all",
                                isWishlisted
                                    ? "bg-red-500/20 text-red-500 opacity-100"
                                    : "bg-deep-black/60 text-white/40 hover:text-white hover:bg-deep-black/80 md:opacity-0 group-hover:opacity-100"
                            )}
                        >
                            <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500" : ""}`} />
                        </button>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-deep-black/0 transition-colors duration-300 group-hover:bg-deep-black/20" />

                        {/* Quick add overlay */}
                        <motion.div
                            className="absolute inset-x-0 bottom-0 flex transform items-center justify-center bg-gradient-to-t from-deep-black/90 pb-6 pt-12 opacity-0 transition-all duration-300 group-hover:opacity-100"
                            initial={false}
                        >
                            <button
                                className="translate-y-4 rounded-full bg-volt px-6 py-2.5 text-xs font-semibold text-deep-black transition-all duration-300 hover:scale-105 group-hover:translate-y-0 shadow-[0_0_20px_rgba(224,255,34,0.2)]"
                                onClick={(e) => {
                                    e.preventDefault();
                                    window.dispatchEvent(
                                        new CustomEvent("cart:add", {
                                            detail: {
                                                id: product.id,
                                                name: product.name,
                                                price: product.price,
                                                quantity: 1
                                            },
                                        })
                                    );
                                }}
                            >
                                Quick Add
                            </button>
                        </motion.div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                        <h3 className="text-sm font-medium text-text-primary transition-colors group-hover:text-volt">
                            {product.name}
                        </h3>
                        <p className="mt-1 text-sm font-semibold text-text-secondary">
                            ₹{product.price.toLocaleString("en-IN")}
                        </p>
                    </div>
                </Link>
            </HoverBorderCard>
        </motion.div>
    );
}

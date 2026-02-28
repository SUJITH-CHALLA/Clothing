"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ChevronLeft, ChevronRight, Check, Heart, Loader2 } from "lucide-react";
import { MagneticButton } from "@/components/premium/MagneticButton";
import { createClient } from "@/lib/supabase/client";
import { ProductReviews } from "@/components/shop/ProductReviews";
import { RecentlyViewed } from "@/components/shop/RecentlyViewed";
import { RelatedProducts } from "@/components/shop/RelatedProducts";
import { SizeChart } from "@/components/shop/SizeChart";
import { toast } from "sonner";

export default function ProductDetailPage() {
    const params = useParams();
    const id = (params?.id as string);

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (data) {
                setProduct(data);
            }
            setLoading(false);
        };
        fetchProduct();
    }, [id]);

    const [activeImage, setActiveImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string>("Black");
    const [isAdding, setIsAdding] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

    const sizes = ["S", "M", "L", "XL"];
    const colors = ["Black", "Volt", "Grey"];

    useEffect(() => {
        const checkWishlist = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);

            if (session?.user && id) {
                const { data } = await supabase
                    .from("wishlist")
                    .select("*")
                    .eq("product_id", id)
                    .eq("user_id", session.user.id)
                    .single();
                if (data) setIsWishlisted(true);
            }
        };
        checkWishlist();

        // Recently Viewed Logic
        if (id) {
            const viewed = JSON.parse(localStorage.getItem("clothify_recently_viewed") || "[]");
            const updated = [id, ...viewed.filter((v: string) => v !== id)].slice(0, 10);
            localStorage.setItem("clothify_recently_viewed", JSON.stringify(updated));
        }
    }, [id, supabase]);

    const toggleWishlist = async () => {
        if (!user) {
            toast.error("Please login to wishlist items");
            return;
        }

        setWishlistLoading(true);
        if (isWishlisted) {
            const { error } = await supabase
                .from("wishlist")
                .delete()
                .eq("product_id", id)
                .eq("user_id", user.id);

            if (!error) {
                setIsWishlisted(false);
                toast.success("Removed from wishlist");
            }
        } else {
            const { error } = await supabase
                .from("wishlist")
                .insert([{ product_id: id, user_id: user.id }]);

            if (!error) {
                setIsWishlisted(true);
                toast.success("Added to wishlist");
            } else if (error.code === '23505') {
                setIsWishlisted(true);
            } else {
                toast.error("Failed to update wishlist");
            }
        }
        setWishlistLoading(false);
    };

    const handleAddToCart = () => {
        if (!selectedSize) {
            alert("Please select a size");
            return;
        }

        setIsAdding(true);
        setTimeout(() => {
            window.dispatchEvent(
                new CustomEvent("cart:add", {
                    detail: {
                        id: product.name, // Using name as ID for demo to split by type
                        name: `${product.name} (${selectedColor})`,
                        price: product.price,
                        quantity: 1,
                        size: selectedSize
                    },
                })
            );
            setIsAdding(false);
        }, 500);
    };

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-volt"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center flex-col gap-4">
                <h1 className="text-3xl font-heading font-bold">Product Not Found</h1>
                <p className="text-text-secondary">The item you are looking for does not exist or has been removed.</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-4 pt-6 pb-12 md:pt-10 md:pb-20">
            <div className="grid gap-8 lg:gap-12 lg:grid-cols-2 lg:h-[calc(100vh-140px)]">
                {/* Visuals / Gallery */}
                <div className="relative flex flex-col gap-3 h-[60vh] lg:h-full">
                    <motion.div
                        className="group relative flex-1 w-full overflow-hidden rounded-2xl bg-surface border border-white/5"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Main Product Image */}
                        {product.images && product.images.length > 0 ? (
                            <img
                                src={product.images[activeImage] || product.images[0]}
                                alt={product.name}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-text-secondary/10">
                                <span className="font-heading text-9xl font-bold uppercase tracking-tighter">
                                    {product.name.substring(0, 2)}
                                </span>
                            </div>
                        )}

                        {product.is_limited_drop && (
                            <span className="absolute left-6 top-6 rounded-full bg-volt px-3 py-1 text-xs font-bold uppercase tracking-wider text-deep-black shadow-lg shadow-volt/20">
                                Limited Drop
                            </span>
                        )}

                        {/* Nav controls */}
                        {product.images && product.images.length > 1 && (
                            <>
                                <button
                                    onClick={() => setActiveImage(prev => prev > 0 ? prev - 1 : product.images.length - 1)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-deep-black/50 p-3 text-white backdrop-blur-md transition-colors hover:bg-white/10 opacity-0 group-hover:opacity-100"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => setActiveImage(prev => prev < product.images.length - 1 ? prev + 1 : 0)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-deep-black/50 p-3 text-white backdrop-blur-md transition-colors hover:bg-white/10 opacity-0 group-hover:opacity-100"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </>
                        )}
                    </motion.div>

                    {/* Thumbnails */}
                    {product.images && product.images.length > 1 && (
                        <div className="grid grid-cols-4 gap-3 shrink-0">
                            {product.images.map((img: string, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    className={`relative h-20 sm:h-24 rounded-xl overflow-hidden bg-surface transition-all ${activeImage === idx ? "border-2 border-volt ring-2 ring-volt/20" : "border border-white/5 hover:border-white/20"}`}
                                >
                                    <img src={img} alt={`${product.name} ${idx + 1}`} className="h-full w-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details */}
                <motion.div
                    className="flex flex-col justify-between h-full py-2 lg:py-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="space-y-1 mb-6 border-b border-white/5 pb-6">
                        <h1 className="font-heading text-4xl font-black uppercase tracking-tight text-text-primary break-words">
                            {product.name}
                        </h1>
                        <p className="text-xl font-bold text-text-secondary">₹{product.price?.toLocaleString('en-IN')}</p>
                    </div>

                    <div className="flex-1 flex flex-col justify-center space-y-8">
                        <p className="leading-relaxed text-sm md:text-base text-text-secondary line-clamp-3">
                            {product.description || "A classified archive product. High grade construction, strictly conceptual design logic."}
                        </p>

                        <div className="space-y-4">
                            {/* Color Select */}
                            <div>
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="text-sm font-semibold uppercase tracking-wider text-text-primary">Color</span>
                                    <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">{selectedColor}</span>
                                </div>
                                <div className="flex gap-4">
                                    {colors.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`h-10 w-10 rounded-full border-2 transition-transform duration-300 ${selectedColor === color ? 'border-volt scale-110 shadow-[0_0_15px_rgba(224,255,34,0.15)]' : 'border-white/10 hover:border-white/30'
                                                }`}
                                            style={{
                                                backgroundColor: color === 'Black' ? '#050505' : color === 'Volt' ? '#E0FF22' : '#52525B'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Size Select */}
                            <div>
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="text-sm font-semibold uppercase tracking-wider text-text-primary">Size</span>
                                    <button
                                        onClick={() => setIsSizeChartOpen(true)}
                                        className="text-xs font-semibold uppercase tracking-wider text-volt hover:underline"
                                    >
                                        Size Guide
                                    </button>
                                </div>
                                <div className="grid grid-cols-4 gap-3">
                                    {sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`rounded-xl border py-3.5 text-sm font-bold transition-all ${selectedSize === size
                                                ? 'border-volt bg-volt/10 text-volt shadow-[0_0_15px_rgba(224,255,34,0.15)]'
                                                : 'border-white/10 bg-surface hover:bg-white/5 text-text-secondary hover:text-white'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Add to Cart Actions */}
                        <div className="pt-6 mt-auto">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={isAdding}
                                    className="relative flex flex-1 h-14 items-center justify-center overflow-hidden rounded bg-volt text-sm font-black uppercase tracking-[0.15em] text-deep-black transition-all hover:bg-white active:scale-[0.98] disabled:opacity-70"
                                >
                                    <AnimatePresence mode="wait">
                                        {isAdding ? (
                                            <motion.div
                                                key="loading"
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                exit={{ y: -20, opacity: 0 }}
                                                className="flex items-center gap-2"
                                            >
                                                <Check className="h-5 w-5" />
                                                <span>Added</span>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="idle"
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                exit={{ y: -20, opacity: 0 }}
                                                className="flex items-center gap-2"
                                            >
                                                <ShoppingBag className="h-4 w-4" />
                                                <span>Add to Cart — ₹{product.price.toLocaleString('en-IN')}</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </button>

                                <button
                                    onClick={toggleWishlist}
                                    disabled={wishlistLoading}
                                    className={`flex h-14 sm:w-14 w-full shrink-0 items-center justify-center rounded border transition-all active:scale-90 ${isWishlisted
                                        ? "bg-red-500/10 text-red-500 border-red-500/30"
                                        : "bg-surface hover:bg-white/5 text-text-secondary hover:text-white border-white/5"
                                        }`}
                                >
                                    {wishlistLoading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
                                    )}
                                </button>
                            </div>
                            <p className="mt-4 text-center text-xs text-text-secondary/60">
                                Secure Checkout via Razorpay. Free tracking on all orders.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Product Reviews */}
            <ProductReviews productId={product.id} />

            {/* Related Products */}
            <RelatedProducts
                productId={product.id}
                subcategory={product.subcategory}
                collection={product.collection}
            />

            {/* Recently Viewed */}
            <RecentlyViewed />

            {/* Size Chart Modal */}
            <SizeChart
                isOpen={isSizeChartOpen}
                onClose={() => setIsSizeChartOpen(false)}
            />
        </div>
    );
}

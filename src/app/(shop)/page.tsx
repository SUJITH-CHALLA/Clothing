"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Search, Loader2, SlidersHorizontal } from "lucide-react";
import { BlurIn } from "@/components/premium/BlurIn";
import { BackgroundBlobs } from "@/components/premium/BackgroundBlobs";
import { TextReveal } from "@/components/premium/TextReveal";
import { MagneticButton } from "@/components/premium/MagneticButton";
import { ProductCard } from "@/components/shop/ProductCard";
import { createClient } from "@/lib/supabase/client";

export default function HomePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedSize, setSelectedSize] = useState("all");
    const [selectedColor, setSelectedColor] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [showFilters, setShowFilters] = useState(false);

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchProducts = async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) {
                const formattedProducts = data.map(p => ({
                    ...p,
                    image: p.images && p.images.length > 0 ? p.images[0] : "",
                    tag: p.is_active ? "NEW" : undefined,
                }));
                setProducts(formattedProducts);
            }
            setLoading(false);
        };
        fetchProducts();
    }, []);

    const featuredProducts = products.slice(0, 4);
    const catalogProducts = products;

    const filteredProducts = catalogProducts.filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
        const matchesSize = selectedSize === "all" || (p.sizes && p.sizes.includes(selectedSize));
        const matchesColor = selectedColor === "all" || (p.colors && p.colors.includes(selectedColor));
        return matchesSearch && matchesCategory && matchesSize && matchesColor;
    }).sort((a, b) => {
        if (sortBy === "price_asc") return a.price - b.price;
        if (sortBy === "price_desc") return b.price - a.price;
        return 0; // "newest" is default (DB order)
    });

    const uniqueCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
    const uniqueSizes = Array.from(new Set(products.flatMap(p => p.sizes || []).filter(Boolean)));
    const uniqueColors = Array.from(new Set(products.flatMap(p => p.colors || []).filter(Boolean)));

    return (
        <div className="relative">
            {/* ═══════ HERO ═══════ */}
            <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
                <BackgroundBlobs />

                <div className="relative z-10 text-center">
                    {/* Tagline */}
                    <BlurIn delay={0.2}>
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-volt/20 bg-volt/5 px-4 py-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-volt" />
                            <span className="text-xs font-medium tracking-wider text-volt">
                                NEW SEASON DROP
                            </span>
                        </div>
                    </BlurIn>

                    {/* Main heading */}
                    <h1 className="font-heading text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl flex flex-col sm:flex-row justify-center gap-x-4 items-center">
                        <TextReveal text="DEFINE YOUR" delay={0.4} />
                        <span className="text-gradient-volt">
                            <TextReveal text="STREETWEAR" delay={0.8} />
                        </span>
                    </h1>

                    {/* Sub heading */}
                    <BlurIn delay={1.2}>
                        <p className="mx-auto mt-6 max-w-lg text-base text-text-secondary md:text-lg">
                            Premium streetwear for the culture. Limited drops and exclusive collections that redefine your aesthetic.
                        </p>
                    </BlurIn>

                    {/* CTA Buttons */}
                    <BlurIn delay={1.5}>
                        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                            <MagneticButton>
                                <Link
                                    href="/#collections"
                                    className="group flex items-center gap-2 rounded-full bg-volt px-8 py-3.5 text-sm font-semibold text-deep-black transition-all hover:bg-volt/90 hover:shadow-[0_0_30px_rgba(224,255,34,0.3)]"
                                >
                                    Shop Now
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </MagneticButton>

                            <MagneticButton>
                                <Link
                                    href="/collections"
                                    className="flex items-center gap-2 rounded-full border border-white/10 px-8 py-3.5 text-sm font-medium text-text-primary transition-all hover:border-white/20 hover:bg-white/5"
                                >
                                    View Collections
                                </Link>
                            </MagneticButton>
                        </div>
                    </BlurIn>
                </div>

                {/* Scroll indicator */}
                <motion.div
                    className="absolute bottom-10 left-1/2 -translate-x-1/2"
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className="h-8 w-5 rounded-full border border-white/20 p-1">
                        <motion.div
                            className="h-2 w-full rounded-full bg-volt/60"
                            animate={{ y: [0, 12, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </div>
                </motion.div>
            </section>

            {/* ═══════ FEATURED DROPS ═══════ */}
            <section id="drops" className="px-4 py-20 md:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-12 flex items-end justify-between">
                        <div>
                            <motion.p
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-volt"
                            >
                                Featured
                            </motion.p>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="font-heading text-3xl font-bold md:text-4xl"
                            >
                                Latest Drops
                            </motion.h2>
                        </div>
                        <Link
                            href="/products"
                            className="hidden items-center gap-1 text-sm text-text-secondary transition-colors hover:text-volt md:flex"
                        >
                            View all
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>

                    {/* Product Grid */}
                    {loading ? (
                        <div className="flex justify-center py-20 pb-40">
                            <Loader2 className="h-8 w-8 animate-spin text-volt" />
                        </div>
                    ) : featuredProducts.length > 0 ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {featuredProducts.map((product, i) => (
                                <ProductCard key={product.id} product={product} index={i} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center text-text-secondary">
                            No products available yet.
                        </div>
                    )}
                </div>
            </section>

            {/* ═══════ FULL CATALOG ═══════ */}
            <section id="collections" className="bg-surface/30 px-4 py-20 md:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-12 text-center">
                        <h2 className="font-heading text-3xl font-bold md:text-5xl">
                            The Complete Arsenal
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-text-secondary">
                            Explore the full collection of engineered streetwear. Built to last, designed to stand out.
                        </p>

                        {/* Search Bar & Filter Toggle */}
                        <div className="mx-auto mt-8 max-w-2xl px-4 flex flex-col sm:flex-row gap-4" style={{ alignItems: 'flex-start' }}>
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary/50" />
                                <input
                                    type="text"
                                    placeholder="Search products by name or description..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-14 rounded-full border border-white/10 bg-deep-black pl-12 pr-6 text-text-primary placeholder:text-text-secondary/50 focus:border-volt/30 focus:outline-none transition-colors"
                                />
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`h-14 px-6 rounded-full border flex items-center gap-2 transition-colors ${showFilters ? 'bg-volt/10 border-volt/30 text-volt' : 'border-white/10 bg-deep-black text-text-secondary hover:bg-white/5 hover:text-white'}`}
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                <span>Filters</span>
                            </button>
                        </div>

                        {/* Expandable Filters */}
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mx-auto mt-6 max-w-4xl text-left bg-surface/50 border border-white/5 p-6 rounded-2xl"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                                    {/* Category */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs uppercase tracking-wider text-text-secondary font-semibold">Category</label>
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="h-10 rounded-lg bg-deep-black border border-white/10 px-3 text-sm text-text-primary focus:border-volt/30 focus:outline-none"
                                        >
                                            <option value="all">All Categories</option>
                                            {uniqueCategories.map((c: any) => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>

                                    {/* Size */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs uppercase tracking-wider text-text-secondary font-semibold">Size</label>
                                        <select
                                            value={selectedSize}
                                            onChange={(e) => setSelectedSize(e.target.value)}
                                            className="h-10 rounded-lg bg-deep-black border border-white/10 px-3 text-sm text-text-primary focus:border-volt/30 focus:outline-none"
                                        >
                                            <option value="all">All Sizes</option>
                                            {uniqueSizes.map((s: any) => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>

                                    {/* Color */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs uppercase tracking-wider text-text-secondary font-semibold">Color</label>
                                        <select
                                            value={selectedColor}
                                            onChange={(e) => setSelectedColor(e.target.value)}
                                            className="h-10 rounded-lg bg-deep-black border border-white/10 px-3 text-sm text-text-primary focus:border-volt/30 focus:outline-none"
                                        >
                                            <option value="all">All Colors</option>
                                            {uniqueColors.map((c: any) => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>

                                    {/* Sort */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs uppercase tracking-wider text-text-secondary font-semibold">Sort By</label>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="h-10 rounded-lg bg-deep-black border border-white/10 px-3 text-sm text-text-primary focus:border-volt/30 focus:outline-none"
                                        >
                                            <option value="newest">Newest Arrivals</option>
                                            <option value="price_asc">Price: Low to High</option>
                                            <option value="price_desc">Price: High to Low</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-volt" />
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {filteredProducts.map((product, i) => (
                                <ProductCard key={product.id} product={product} index={i} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center text-text-secondary">
                            {searchQuery ? `No products found matching "${searchQuery}"` : "No products available in the catalog."}
                        </div>
                    )}

                    {!searchQuery && (
                        <div className="mt-16 text-center">
                            <MagneticButton>
                                <button className="rounded-full border border-volt/30 bg-volt/5 px-8 py-3 text-sm font-semibold text-volt transition-colors hover:bg-volt/10">
                                    Load More
                                </button>
                            </MagneticButton>
                        </div>
                    )}
                </div>
            </section>

            {/* ═══════ BRAND STRIP (Removed fake stats) ═══════ */}
            <section className="border-y border-white/5 py-12">
                <div className="mx-auto flex max-w-7xl items-center justify-center gap-8 px-6">
                    <p className="text-sm font-medium tracking-[0.2em] text-text-secondary uppercase">
                        Quality Above Everything
                    </p>
                </div>
            </section>

            {/* ═══════ NEWSLETTER ═══════ */}
            <section className="px-6 py-24">
                <div className="relative mx-auto max-w-2xl overflow-hidden rounded-2xl border border-white/5 bg-surface p-10 text-center md:p-16">
                    <BackgroundBlobs className="opacity-30" />
                    <div className="relative z-10">
                        <motion.h3
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="font-heading text-2xl font-bold md:text-3xl text-volt"
                        >
                            Get 10% Off Your First Order
                        </motion.h3>
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="mt-3 text-sm text-text-secondary max-w-md mx-auto"
                        >
                            Subscribe to our newsletter and get early access to exclusive drops, restocks, and a 10% discount sent straight to your inbox.
                        </motion.p>
                        <motion.form
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="mt-8 flex gap-3"
                            onSubmit={(e) => e.preventDefault()}
                        >
                            <input
                                type="email"
                                placeholder="your@email.com"
                                className="flex-1 rounded-full bg-deep-black border border-white/10 px-5 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-volt/30 focus:outline-none"
                            />
                            <MagneticButton>
                                <button
                                    type="submit"
                                    className="rounded-full bg-volt px-6 py-3 text-sm font-semibold text-deep-black transition-all hover:bg-volt/90"
                                >
                                    Subscribe
                                </button>
                            </MagneticButton>
                        </motion.form>
                    </div>
                </div>
            </section>
        </div>
    );
}

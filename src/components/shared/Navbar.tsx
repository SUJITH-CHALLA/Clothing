"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Menu, X, Search, User, Heart } from "lucide-react";
import { MagneticButton } from "@/components/premium/MagneticButton";
import { cn } from "@/lib/utils";

const navLinks = [
    { label: "New Drops", href: "/#drops" },
    { label: "Collections", href: "/#collections" },
    { label: "Sale", href: "/#sale" },
];

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [cartPop, setCartPop] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Expose a global way to trigger cart pop animation
    useEffect(() => {
        const handler = (e: CustomEvent) => {
            setCartCount((prev) => prev + (e.detail?.count || 1));
            setCartPop(true);
            setTimeout(() => setCartPop(false), 400);
        };
        window.addEventListener("cart:add" as string, handler as EventListener);
        return () =>
            window.removeEventListener("cart:add" as string, handler as EventListener);
    }, []);

    return (
        <>
            <motion.header
                className={cn(
                    "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
                    isScrolled ? "glass-strong py-3" : "bg-transparent py-5"
                )}
                initial={{ y: -80 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
            >
                <nav className="mx-auto flex max-w-7xl items-center justify-between px-6">
                    {/* Logo */}
                    <Link href="/" className="group flex items-center gap-2">
                        <span className="font-heading text-2xl font-bold tracking-tight text-text-primary">
                            CLOTH
                            <span className="text-volt">IFY</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden items-center gap-10 md:flex">
                        {navLinks.map((link) => (
                            <MagneticButton key={link.label} strength={0.2}>
                                <Link
                                    href={link.href}
                                    className="relative text-sm font-medium tracking-wide text-text-secondary transition-colors hover:text-text-primary"
                                >
                                    {link.label}
                                    <span className="absolute -bottom-1 left-0 h-[1px] w-0 bg-volt transition-all duration-300 group-hover:w-full" />
                                </Link>
                            </MagneticButton>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <MagneticButton strength={0.2} className="hidden md:block">
                            <Link
                                href="/#collections"
                                className="rounded-full p-2 text-text-secondary transition-colors hover:text-text-primary"
                            >
                                <Search className="h-5 w-5" />
                            </Link>
                        </MagneticButton>

                        <MagneticButton strength={0.2} className="hidden md:block">
                            <Link
                                href="/profile/wishlist"
                                className="rounded-full p-2 text-text-secondary transition-colors hover:text-text-primary"
                            >
                                <Heart className="h-5 w-5" />
                            </Link>
                        </MagneticButton>

                        <MagneticButton strength={0.2} className="hidden md:block">
                            <Link
                                href="/profile"
                                className="rounded-full p-2 text-text-secondary transition-colors hover:text-text-primary"
                            >
                                <User className="h-5 w-5" />
                            </Link>
                        </MagneticButton>

                        {/* Cart Button with Pop Animation */}
                        <MagneticButton strength={0.2}>
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent('cart:toggle'))}
                                className="relative rounded-full p-2 text-text-secondary transition-colors hover:text-text-primary"
                            >
                                <motion.div
                                    animate={cartPop ? { scale: [1, 1.3, 1] } : {}}
                                    transition={{ duration: 0.4 }}
                                >
                                    <ShoppingBag className="h-5 w-5" />
                                </motion.div>
                                {cartCount > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-volt text-[10px] font-bold text-deep-black"
                                    >
                                        {cartCount}
                                    </motion.span>
                                )}
                            </button>
                        </MagneticButton>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="rounded-full p-2 text-text-secondary md:hidden"
                        >
                            {mobileOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </nav>
            </motion.header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-deep-black/95 backdrop-blur-xl md:hidden"
                    >
                        {navLinks.map((link, i) => (
                            <motion.div
                                key={link.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Link
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="font-heading text-3xl font-bold text-text-primary transition-colors hover:text-volt"
                                >
                                    {link.label}
                                </Link>
                            </motion.div>
                        ))}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Link
                                href="/login"
                                onClick={() => setMobileOpen(false)}
                                className="mt-4 rounded-full border border-volt/30 px-8 py-3 font-medium text-volt transition-all hover:bg-volt hover:text-deep-black"
                            >
                                Sign In
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

"use client";

import React from "react";
import { X, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import Link from "next/link";
import { MagneticButton } from "@/components/premium/MagneticButton";

export function CartDrawer() {
    const { items, isOpen, setIsOpen, updateQuantity, removeItem, subtotal } = useCart();

    // Listen for header cart clicks manually if needed, 
    // or we can just trigger window.dispatchEvent(new CustomEvent('cart:toggle'))
    React.useEffect(() => {
        const toggleCart = () => setIsOpen((prev) => !prev);
        window.addEventListener("cart:toggle", toggleCart);
        return () => window.removeEventListener("cart:toggle", toggleCart);
    }, [setIsOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 z-50 bg-deep-black/60 backdrop-blur-sm"
                    />

                    {/* Drawer Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col bg-surface border-l border-white/10 shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
                            <h2 className="font-heading text-lg font-bold flex items-center gap-2">
                                <ShoppingBag className="h-5 w-5 text-volt" />
                                Your Cart
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="rounded-full p-2 text-text-secondary transition-colors hover:bg-white/5 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto px-6 py-6">
                            {items.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center text-text-secondary">
                                    <ShoppingBag className="mb-4 h-12 w-12 opacity-20" />
                                    <p>Your cart is empty.</p>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="mt-4 text-sm font-medium text-volt hover:underline"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <AnimatePresence>
                                        {items.map((item) => (
                                            <motion.div
                                                key={item.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95, height: 0 }}
                                                className="flex gap-4"
                                            >
                                                {/* Image Placeholder */}
                                                <div className="h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-light border border-white/5">
                                                    <div className="flex h-full w-full items-center justify-center text-2xl font-bold opacity-20">
                                                        {item.name.charAt(0)}
                                                    </div>
                                                </div>

                                                {/* Details */}
                                                <div className="flex flex-1 flex-col justify-between">
                                                    <div className="flex justify-between">
                                                        <div>
                                                            <h3 className="text-sm font-medium text-text-primary">{item.name}</h3>
                                                            {item.size && (
                                                                <p className="mt-1 text-xs text-text-secondary">Size: {item.size}</p>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => removeItem(item.id)}
                                                            className="text-text-secondary hover:text-red-400"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        {/* Quantity controls */}
                                                        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-deep-black px-2 py-1">
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                className="text-text-secondary hover:text-white"
                                                            >
                                                                <Minus className="h-3 w-3" />
                                                            </button>
                                                            <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                className="text-text-secondary hover:text-white"
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                            </button>
                                                        </div>

                                                        <p className="text-sm font-semibold text-volt">
                                                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="border-t border-white/5 bg-deep-black/50 p-6">
                                <div className="space-y-3 mb-6 text-sm">
                                    <div className="flex justify-between text-text-secondary">
                                        <span>Subtotal</span>
                                        <span className="text-white">₹{subtotal.toLocaleString("en-IN")}</span>
                                    </div>
                                    <div className="flex justify-between text-text-secondary">
                                        <span>Shipping</span>
                                        <span>Calculated at checkout</span>
                                    </div>
                                    <div className="flex justify-between border-t border-white/10 pt-3 text-base font-semibold">
                                        <span className="text-white">Total</span>
                                        <span className="text-volt">₹{subtotal.toLocaleString("en-IN")}</span>
                                    </div>
                                </div>

                                <Link
                                    href="/checkout"
                                    onClick={() => setIsOpen(false)}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-volt py-4 text-sm font-semibold text-deep-black transition-all hover:bg-volt/90 shadow-[0_0_20px_rgba(224,255,34,0.15)] hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Secure Checkout
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

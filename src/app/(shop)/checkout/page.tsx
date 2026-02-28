"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, CreditCard, Box } from "lucide-react";
import { MagneticButton } from "@/components/premium/MagneticButton";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function CheckoutPage() {
    const { items, subtotal, clearCart } = useCart();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [discountCode, setDiscountCode] = useState("");
    const [discountApplied, setDiscountApplied] = useState(0);
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();

    const shippingFee = 250;
    const taxRate = 0.18; // 18% GST (Example)
    const taxableAmount = Math.max(0, subtotal - discountApplied);
    const taxAmount = taxableAmount * taxRate;
    const finalTotal = Math.round(taxableAmount + shippingFee + taxAmount);

    useEffect(() => {
        setIsClient(true);
        const fetchUserData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
                const savedAddress = localStorage.getItem(`clothify_address_${session.user.id}`);
                if (savedAddress) {
                    try {
                        const parsed = JSON.parse(savedAddress);

                        // populate the specific address fields we used if element exists
                        // wait for a bit so DOM renders
                        setTimeout(() => {
                            const streetInput = document.querySelector('input[name="address"]') as HTMLInputElement;
                            const cityInput = document.querySelector('input[name="city"]') as HTMLInputElement;
                            const postalInput = document.querySelector('input[name="postalCode"]') as HTMLInputElement;

                            if (streetInput && parsed.street) streetInput.value = parsed.street;
                            if (cityInput && parsed.city) cityInput.value = parsed.city;
                            if (postalInput && parsed.postal_code) postalInput.value = parsed.postal_code;
                        }, 100);
                    } catch (e) { }
                }
            }
        };
        fetchUserData();
    }, [supabase.auth]);

    const handleApplyDiscount = () => {
        if (discountCode === "VOLT") {
            setDiscountApplied(500);
        } else {
            alert("Invalid discount code");
            setDiscountApplied(0);
        }
    };

    const handleMockPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            const formData = new FormData(e.target as HTMLFormElement);
            const email = formData.get('email') as string;
            const phone = formData.get('phone') as string;
            const fullName = formData.get('fullName') as string;
            const address = formData.get('address') as string;
            const city = formData.get('city') as string;
            const postalCode = formData.get('postalCode') as string;

            const { data: { user } } = await supabase.auth.getUser();

            // Insert the order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user?.id || null, // null if guest
                    status: 'processing',
                    total_amount: finalTotal,
                    discount_applied: discountApplied,
                    shipping_address: { fullName, address, city, postalCode },
                    contact_info: { email, phone },
                })
                .select()
                .single();

            if (orderError) throw orderError;

            if (order) {
                // Insert order items
                const orderItems = items.map(item => ({
                    order_id: order.id,
                    product_id: item.id.split('-')[0] !== 'id' ? item.id : null, // handle dummy IDs edge cases where possible, ideally real UUIDs
                    quantity: item.quantity,
                    size: item.size || null,
                    color: item.color || null,
                    price_at_purchase: item.price
                }));

                // filter out items with non-uuid product_id for safety if user tested with old mock local storage
                const validOrderItems = orderItems.filter(item => item.product_id && item.product_id.length > 20);

                if (validOrderItems.length > 0) {
                    const { error: itemsError } = await supabase
                        .from('order_items')
                        .insert(validOrderItems);
                    if (itemsError) console.error("Error inserting order items:", itemsError);
                } else {
                    // Since some clients might have old stub data, we could just dummy insert without product_id
                    const mockItems = items.map(item => ({
                        order_id: order.id,
                        quantity: item.quantity,
                        size: item.size || null,
                        color: item.color || null,
                        price_at_purchase: item.price
                    }));
                    await supabase.from('order_items').insert(mockItems);
                }

                // Simulate processing delay
                await new Promise(r => setTimeout(r, 1500));

                clearCart();
                router.push("/checkout/success");
            }

        } catch (error: any) {
            toast.error(error.message || "Checkout failed. Please try again.");
            setIsProcessing(false);
        }
    };

    if (!isClient) return null;

    if (items.length === 0) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
                <Box className="mb-4 h-16 w-16 text-text-secondary/20" />
                <h1 className="font-heading text-2xl font-bold">Your cart is empty</h1>
                <p className="mt-2 text-sm text-text-secondary">Add some items before checking out.</p>
                <button
                    onClick={() => router.push("/")}
                    className="mt-8 rounded-full bg-volt px-8 py-3 text-sm font-semibold text-deep-black transition-all hover:bg-volt/90 hover:scale-[1.02] active:scale-[0.98]"
                >
                    Back to Shop
                </button>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-24">
            <h1 className="mb-12 font-heading text-3xl font-bold tracking-tight md:text-5xl">Checkout</h1>

            {!user && (
                <div className="mb-8 rounded-xl border border-volt/30 bg-volt/5 p-4 text-sm text-text-primary flex items-center justify-between">
                    <div>
                        <span className="font-semibold text-volt">Guest Checkout:</span> You are checking out as a guest.
                        <span className="hidden sm:inline"> Consider logging in for faster checkout and order tracking.</span>
                    </div>
                    <button
                        onClick={() => router.push("/login?redirect=/checkout")}
                        className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold hover:bg-white/20 transition-colors"
                    >
                        Log In
                    </button>
                </div>
            )}

            <div className="grid gap-12 lg:grid-cols-12">
                {/* Form Section */}
                <div className="lg:col-span-7 xl:col-span-8">
                    <form id="checkout-form" onSubmit={handleMockPayment} className="space-y-8">
                        {/* Contact Info */}
                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold">Contact Information</h2>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-xs text-text-secondary">Email Address</label>
                                    <input required name="email" type="email" placeholder="you@example.com" className="w-full rounded-xl border border-white/10 bg-surface/50 px-4 py-3 text-sm text-text-primary focus:border-volt/30 focus:outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-text-secondary">Phone Number</label>
                                    <input required name="phone" type="tel" placeholder="+91 98765 43210" className="w-full rounded-xl border border-white/10 bg-surface/50 px-4 py-3 text-sm text-text-primary focus:border-volt/30 focus:outline-none" />
                                </div>
                            </div>
                        </section>

                        {/* Shipping Address */}
                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold">Shipping Address</h2>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2 sm:col-span-2">
                                    <label className="text-xs text-text-secondary">Full Name</label>
                                    <input required name="fullName" type="text" placeholder="John Doe" className="w-full rounded-xl border border-white/10 bg-surface/50 px-4 py-3 text-sm text-text-primary focus:border-volt/30 focus:outline-none" />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <label className="text-xs text-text-secondary">Street Address</label>
                                    <input required name="address" type="text" placeholder="House No, Building, Street" className="w-full rounded-xl border border-white/10 bg-surface/50 px-4 py-3 text-sm text-text-primary focus:border-volt/30 focus:outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-text-secondary">City</label>
                                    <input required name="city" type="text" placeholder="Mumbai" className="w-full rounded-xl border border-white/10 bg-surface/50 px-4 py-3 text-sm text-text-primary focus:border-volt/30 focus:outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-text-secondary">Postal Code</label>
                                    <input required name="postalCode" type="text" placeholder="400001" className="w-full rounded-xl border border-white/10 bg-surface/50 px-4 py-3 text-sm text-text-primary focus:border-volt/30 focus:outline-none" />
                                </div>
                            </div>
                        </section>
                    </form>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-5 xl:col-span-4">
                    <div className="sticky top-24 rounded-2xl border border-white/10 bg-surface/30 p-6 backdrop-blur-md">
                        <h2 className="mb-6 text-xl font-semibold">Order Summary</h2>

                        <div className="mb-6 space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="h-16 w-12 shrink-0 rounded bg-white/5 flex items-center justify-center text-xs text-white/20">
                                        {item.name.charAt(0)}
                                    </div>
                                    <div className="flex flex-1 flex-col justify-center">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium">{item.name}</span>
                                            <span className="text-sm font-semibold">₹{(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                        <div className="text-xs text-text-secondary flex gap-2">
                                            <span>Qty: {item.quantity}</span>
                                            {item.size && <span>• Size: {item.size}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Discount */}
                        <div className="mb-6 flex gap-2 border-b border-white/5 pb-6">
                            <input
                                type="text"
                                placeholder="Discount code (try VOLT)"
                                value={discountCode}
                                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                                className="flex-1 rounded-lg border border-white/10 bg-deep-black px-4 py-2 text-sm text-text-primary focus:border-volt/30 focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={handleApplyDiscount}
                                className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                            >
                                Apply
                            </button>
                        </div>

                        {/* Totals */}
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-text-secondary">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-text-secondary">
                                <span>Shipping</span>
                                <span>₹{shippingFee.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-text-secondary">
                                <span>Estimated Tax (18%)</span>
                                <span>₹{Math.round(taxAmount).toLocaleString()}</span>
                            </div>
                            {discountApplied > 0 && (
                                <div className="flex justify-between text-volt">
                                    <span>Discount (Code: {discountCode})</span>
                                    <span>-₹{discountApplied.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between border-t border-white/10 pt-3 text-lg font-bold">
                                <span>Total</span>
                                <span>₹{finalTotal.toLocaleString()}</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            form="checkout-form"
                            disabled={isProcessing}
                            className="mt-8 group relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-volt py-4 font-semibold text-deep-black transition-all hover:bg-volt/90 disabled:opacity-70 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isProcessing ? (
                                <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity }}>
                                    Processing via Razorpay...
                                </motion.div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    Pay ₹{finalTotal.toLocaleString()}
                                </div>
                            )}
                        </button>

                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-text-secondary">
                            <ShieldCheck className="h-4 w-4 text-green-400" />
                            Secure mock payment processed directly via server.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

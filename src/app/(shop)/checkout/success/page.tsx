"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Package, MapPin, Mail } from "lucide-react";
import { MagneticButton } from "@/components/premium/MagneticButton";
import { BlurIn } from "@/components/premium/BlurIn";

export default function CheckoutSuccessPage() {
    return (
        <div className="flex min-h-[80vh] items-center justify-center px-6 py-12">
            <div className="w-full max-w-2xl text-center">
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 20, stiffness: 200, delay: 0.1 }}
                    className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-volt/10"
                >
                    <CheckCircle2 className="h-12 w-12 text-volt" />
                </motion.div>

                <BlurIn delay={0.2}>
                    <h1 className="font-heading text-4xl font-bold md:text-5xl">Order Confirmed</h1>
                    <p className="mt-4 text-lg text-text-secondary">
                        Thanks for dropping in. Your order <span className="font-semibold text-text-primary">#ORD-9822</span> is secured.
                    </p>
                </BlurIn>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-12 rounded-2xl border border-white/5 bg-surface/50 p-8 text-left backdrop-blur-sm"
                >
                    <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-text-secondary">What happens next?</h2>

                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 text-text-secondary">
                                <Mail className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-medium text-text-primary">Order Confirmation Email</p>
                                <p className="mt-1 text-sm text-text-secondary">We&apos;ve sent a receipt to your email address.</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 text-text-secondary">
                                <Package className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-medium text-text-primary">Processing</p>
                                <p className="mt-1 text-sm text-text-secondary">Your items are being carefully picked and packed.</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 text-text-secondary">
                                <MapPin className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-medium text-text-primary">Shipping Update</p>
                                <p className="mt-1 text-sm text-text-secondary">You&apos;ll receive a tracking number as soon as it ships.</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-12"
                >
                    <MagneticButton>
                        <Link
                            href="/"
                            className="inline-flex rounded-full bg-deep-black border border-white/10 px-8 py-3.5 text-sm font-medium text-text-primary transition-colors hover:border-white/30"
                        >
                            Back to Shop
                        </Link>
                    </MagneticButton>
                </motion.div>
            </div>
        </div>
    );
}

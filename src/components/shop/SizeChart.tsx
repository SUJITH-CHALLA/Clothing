"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Ruler } from "lucide-react";

interface SizeChartProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SizeChart({ isOpen, onClose }: SizeChartProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-deep-black/90 backdrop-blur-xl"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-surface p-8 shadow-2xl"
                    >
                        <button
                            onClick={onClose}
                            className="absolute right-6 top-6 rounded-full bg-white/5 p-2 text-text-secondary transition-colors hover:bg-white/10 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-8">
                            <div className="h-10 w-10 rounded-xl bg-volt/10 flex items-center justify-center text-volt">
                                <Ruler className="h-5 w-5" />
                            </div>
                            <h2 className="text-3xl font-heading font-bold italic uppercase tracking-tighter text-white">Size Guide</h2>
                        </div>

                        <div className="overflow-x-auto rounded-2xl border border-white/5 bg-deep-black/50">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-white/5 bg-white/5 text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                                    <tr>
                                        <th className="px-6 py-4">Size</th>
                                        <th className="px-6 py-4">Chest (cm)</th>
                                        <th className="px-6 py-4">Length (cm)</th>
                                        <th className="px-6 py-4">Sleeve (cm)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-text-primary">
                                    {[
                                        { s: "S", c: 104, l: 68, sl: 22 },
                                        { s: "M", c: 110, l: 70, sl: 23 },
                                        { s: "L", c: 116, l: 72, sl: 24 },
                                        { s: "XL", c: 122, l: 74, sl: 25 },
                                    ].map((row) => (
                                        <tr key={row.s} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4 font-bold text-volt">{row.s}</td>
                                            <td className="px-6 py-4">{row.c}</td>
                                            <td className="px-6 py-4">{row.l}</td>
                                            <td className="px-6 py-4">{row.sl}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-8 grid gap-6 md:grid-cols-2 text-xs text-text-secondary leading-relaxed">
                            <div className="space-y-2">
                                <h4 className="font-bold text-white uppercase tracking-wider">How to Measure</h4>
                                <p>Measure around the fullest part of your chest, keeping the tape horizontal.</p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-bold text-white uppercase tracking-wider">Product Fit</h4>
                                <p>Standard oversized conceptual fit. We recommend your true size for the intended silhouette.</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

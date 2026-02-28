"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Star, CheckCircle, XCircle, Trash2, MessageSquare, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("product_reviews")
            .select("*, products(name), profiles(full_name)")
            .order("created_at", { ascending: false });

        if (data) setReviews(data);
        setLoading(false);
    };

    const updateReviewStatus = async (id: string, status: boolean) => {
        const { error } = await supabase
            .from("product_reviews")
            .update({ is_verified_purchase: status }) // Using verified as a proxy for 'approved' status in this demo
            .eq("id", id);

        if (!error) {
            toast.success(`Review ${status ? 'Verified' : 'Unverified'}`);
            setReviews(prev => prev.map(r => r.id === id ? { ...r, is_verified_purchase: status } : r));
        }
    };

    const deleteReview = async (id: string) => {
        if (!confirm("Are you sure you want to delete this review?")) return;

        const { error } = await supabase
            .from("product_reviews")
            .delete()
            .eq("id", id);

        if (!error) {
            toast.success("Review deleted");
            setReviews(prev => prev.filter(r => r.id !== id));
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-volt" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold">Review Moderation</h1>
                <p className="text-text-secondary">Manage customer feedback and verified tags.</p>
            </header>

            <div className="grid gap-4">
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-surface/30 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start"
                        >
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex text-volt">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star key={s} className={`h-3 w-3 ${s <= review.rating ? 'fill-volt' : 'text-white/10'}`} />
                                        ))}
                                    </div>
                                    <span className="text-sm font-bold text-white tracking-tight">{review.title}</span>
                                </div>
                                <p className="text-sm text-text-secondary leading-relaxed italic">"{review.comment}"</p>
                                <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-widest text-white/40 pt-2">
                                    <span>User: {review.profiles?.full_name || 'Legacy User'}</span>
                                    <span>Product: {review.products?.name}</span>
                                    <span>Date: {new Date(review.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => updateReviewStatus(review.id, !review.is_verified_purchase)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${review.is_verified_purchase
                                            ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                            : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                                        }`}
                                >
                                    {review.is_verified_purchase ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                    {review.is_verified_purchase ? 'Verified' : 'Verify'}
                                </button>
                                <button
                                    onClick={() => deleteReview(review.id)}
                                    className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-red-400 hover:bg-red-400/10 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-white/10 rounded-3xl">
                        <MessageSquare className="h-12 w-12 text-white/5 mb-4" />
                        <h3 className="text-xl font-bold mb-2">No reviews yet</h3>
                        <p className="text-text-secondary text-sm">Customer feedback will appear here as it arrives.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

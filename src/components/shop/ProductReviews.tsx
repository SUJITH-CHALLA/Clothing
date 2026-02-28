"use client";

import React, { useState, useEffect } from "react";
import { Star, Loader2, User, CheckCircle2, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface Review {
    id: string;
    rating: number;
    title: string;
    comment: string;
    is_verified_purchase: boolean;
    created_at: string;
    profiles: {
        full_name: string;
    };
}

export function ProductReviews({ productId }: { productId: string }) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();

    const [form, setForm] = useState({
        rating: 5,
        title: "",
        comment: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        const loadData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);

            fetchReviews();
        };

        const fetchReviews = async () => {
            const { data, error } = await supabase
                .from("product_reviews")
                .select("*, profiles(full_name)")
                .eq("product_id", productId)
                .order("created_at", { ascending: false });

            if (data) setReviews(data);
            setLoading(false);
        };

        loadData();
    }, [productId, supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSubmitting(true);
        setStatus(null);

        const { error } = await supabase
            .from("product_reviews")
            .insert([{
                product_id: productId,
                user_id: user.id,
                rating: form.rating,
                title: form.title,
                comment: form.comment,
            }]);

        if (error) {
            setStatus({ type: 'error', message: "Failed to submit review. Try again." });
        } else {
            setStatus({ type: 'success', message: "Review submitted successfully!" });
            setForm({ rating: 5, title: "", comment: "" });
            setShowForm(false);
            // Re-fetch reviews
            const { data } = await supabase
                .from("product_reviews")
                .select("*, profiles(full_name)")
                .eq("product_id", productId)
                .order("created_at", { ascending: false });
            if (data) setReviews(data);
        }
        setSubmitting(false);
    };

    return (
        <div className="mt-20 border-t border-white/5 pt-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h2 className="text-3xl font-heading font-bold">Feedback</h2>
                    <div className="mt-2 flex items-center gap-4">
                        <div className="flex items-center gap-1 text-volt">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`h-4 w-4 ${star <= (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length || 0) ? "fill-volt" : "text-white/10"}`}
                                />
                            ))}
                        </div>
                        <span className="text-sm text-text-secondary">
                            Based on {reviews.length} reviews
                        </span>
                    </div>
                </div>

                {!showForm && user && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="rounded-full border border-volt text-volt px-8 py-3 text-sm font-semibold transition-all hover:bg-volt hover:text-deep-black"
                    >
                        Write a Review
                    </button>
                )}
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-12 overflow-hidden"
                    >
                        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-surface/30 p-8 backdrop-blur-md">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold">Share your thoughts</h3>
                                <button type="button" onClick={() => setShowForm(false)} className="text-sm text-text-secondary hover:text-white">Cancel</button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-3">Rating</label>
                                    <div className="flex gap-2 text-volt">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setForm({ ...form, rating: star })}
                                                className="transition-transform hover:scale-125"
                                            >
                                                <Star className={`h-8 w-8 ${star <= form.rating ? "fill-volt" : "text-white/10"}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-xs text-text-secondary uppercase tracking-widest font-bold">Review Title</label>
                                        <input
                                            required
                                            value={form.title}
                                            onChange={e => setForm({ ...form, title: e.target.value })}
                                            placeholder="Summarize your experience"
                                            className="w-full h-12 bg-deep-black/50 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-volt/30 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-text-secondary uppercase tracking-widest font-bold">Details</label>
                                        <textarea
                                            required
                                            value={form.comment}
                                            onChange={e => setForm({ ...form, comment: e.target.value })}
                                            placeholder="What did you think of the fit and quality?"
                                            rows={4}
                                            className="w-full bg-deep-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-volt/30 transition-colors"
                                        />
                                    </div>
                                </div>

                                <button
                                    disabled={submitting}
                                    type="submit"
                                    className="w-full md:w-auto rounded-full bg-volt text-deep-black px-8 py-3 text-sm font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                                >
                                    {submitting ? "Posting..." : "Post Review"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {status && (
                <div className={`mb-8 p-4 rounded-xl border ${status.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    {status.message}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-volt" />
                </div>
            ) : reviews.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {reviews.map((review) => (
                        <div key={review.id} className="group rounded-2xl border border-white/5 bg-surface/20 p-6 transition-all hover:border-white/10 hover:bg-surface/30">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-1 text-volt">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} className={`h-3 w-3 ${star <= review.rating ? "fill-volt" : "text-white/10"}`} />
                                    ))}
                                </div>
                                <span className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">{new Date(review.created_at).toLocaleDateString()}</span>
                            </div>

                            <h4 className="font-bold text-white mb-2">{review.title}</h4>
                            <p className="text-sm text-text-secondary leading-relaxed mb-6 italic">"{review.comment}"</p>

                            <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-volt/20 flex items-center justify-center">
                                        <User className="h-3 w-3 text-volt" />
                                    </div>
                                    <span className="text-xs font-medium text-text-primary">{review.profiles?.full_name || "Anonymous User"}</span>
                                </div>
                                {review.is_verified_purchase && (
                                    <div className="flex items-center gap-1 text-[10px] text-green-400 font-bold uppercase tracking-tighter">
                                        <CheckCircle2 className="h-3 w-3" /> Verified
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-2xl">
                    <MessageSquare className="h-12 w-12 text-white/10 mb-4" />
                    <h3 className="text-xl font-bold mb-2">No feedback yet</h3>
                    <p className="text-text-secondary text-sm max-w-xs">Be the first to share your experience with this conceptual drop.</p>
                </div>
            )}
        </div>
    );
}

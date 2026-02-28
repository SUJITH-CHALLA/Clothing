"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export function useOrderTracking(orderId: string | null) {
    const [status, setStatus] = useState<OrderStatus | null>(null);
    const [loading, setLoading] = useState(true);

    // Initialize browser client
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        if (!orderId) {
            setLoading(false);
            return;
        }

        // Initial fetch
        const fetchOrderStatus = async () => {
            const { data, error } = await supabase
                .from("orders")
                .select("status")
                .eq("id", orderId)
                .single();

            if (!error && data) {
                setStatus(data.status as OrderStatus);
            }
            setLoading(false);
        };

        fetchOrderStatus();

        // Subscribe to real-time updates for this specific order
        const channel = supabase
            .channel(`order_tracking_${orderId}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "orders",
                    filter: `id=eq.${orderId}`,
                },
                (payload) => {
                    setStatus(payload.new.status as OrderStatus);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [orderId, supabase]);

    return { status, loading };
}

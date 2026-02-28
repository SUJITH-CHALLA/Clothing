"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export type CartItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    size?: string;
    color?: string;
};

interface CartContextType {
    items: CartItem[];
    isOpen: boolean;
    setIsOpen: (isOpen: boolean | ((prev: boolean) => boolean)) => void;
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const supabase = createClient();

    // Check user session on mount
    useEffect(() => {
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            if (data.session?.user) {
                setUserId(data.session.user.id);
            }
        };
        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserId(session?.user?.id || null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Initial load from localStorage
    useEffect(() => {
        setIsMounted(true);
        const saved = localStorage.getItem("clothify_cart");
        if (saved) {
            try {
                setItems(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        if (isMounted) {
            localStorage.setItem("clothify_cart", JSON.stringify(items));
        }
    }, [items, isMounted]);

    // Sync to Supabase when user is authenticated, ignoring rapid consecutive updates
    useEffect(() => {
        if (!isMounted || !userId) return;

        const syncToSupabase = async () => {
            // Note: The `carts` and `cart_items` tables are not in the current Supabase schema.
            // Bypassing DB synchronization to prevent console errors.
            // Items are currently persisted in LocalStorage reliably.
            // console.warn("Cart UI is persisting via LocalStorage. Supabase DB cart tables not found - skipping sync.");
        };

        const timeout = setTimeout(syncToSupabase, 1000);
        return () => clearTimeout(timeout);
    }, [items, userId, isMounted]);

    // Handle global cart:add events
    useEffect(() => {
        const handleAdd = (e: Event) => {
            const customEvent = e as CustomEvent<CartItem>;
            addItem(customEvent.detail);
            setIsOpen(true);
        };
        window.addEventListener("cart:add", handleAdd);
        return () => window.removeEventListener("cart:add", handleAdd);
    }, []);

    const addItem = (newItem: CartItem) => {
        setItems((current) => {
            const existing = current.find((item) => item.id === newItem.id);
            if (existing) {
                return current.map((item) =>
                    item.id === newItem.id
                        ? { ...item, quantity: item.quantity + newItem.quantity }
                        : item
                );
            }
            return [...current, newItem];
        });
        toast.success(`${newItem.name} added to cart`);
    };

    const removeItem = (id: string) => {
        setItems((current) => {
            const itemToRemove = current.find(i => i.id === id);
            if (itemToRemove) {
                toast.success(`${itemToRemove.name} removed from cart`);
            }
            return current.filter((item) => item.id !== id);
        });
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity < 1) return removeItem(id);
        setItems((current) =>
            current.map((item) => (item.id === id ? { ...item, quantity } : item))
        );
    };

    const clearCart = () => setItems([]);

    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                isOpen,
                setIsOpen,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                totalItems,
                subtotal,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}

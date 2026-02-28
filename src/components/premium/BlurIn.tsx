"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BlurInProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    duration?: number;
}

export function BlurIn({
    children,
    className,
    delay = 0,
    duration = 0.8,
}: BlurInProps) {
    return (
        <motion.div
            initial={{ opacity: 0, filter: "blur(12px)", y: 8 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{
                duration,
                delay,
                ease: [0.25, 0.4, 0.25, 1],
            }}
            className={cn(className)}
        >
            {children}
        </motion.div>
    );
}

interface BlurInViewProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    duration?: number;
}

export function BlurInView({
    children,
    className,
    delay = 0,
    duration = 0.8,
}: BlurInViewProps) {
    return (
        <motion.div
            initial={{ opacity: 0, filter: "blur(12px)", y: 20 }}
            whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
                duration,
                delay,
                ease: [0.25, 0.4, 0.25, 1],
            }}
            className={cn(className)}
        >
            {children}
        </motion.div>
    );
}

"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function BackgroundBlobs({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                "pointer-events-none absolute inset-0 overflow-hidden",
                className
            )}
        >
            {/* Volt blob – top right */}
            <motion.div
                className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full opacity-20"
                style={{
                    background:
                        "radial-gradient(circle, rgba(224, 255, 34, 0.4) 0%, transparent 70%)",
                }}
                animate={{
                    x: [0, 30, -20, 0],
                    y: [0, -20, 30, 0],
                    scale: [1, 1.1, 0.95, 1],
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Cyan blob – bottom left */}
            <motion.div
                className="absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full opacity-10"
                style={{
                    background:
                        "radial-gradient(circle, rgba(34, 211, 238, 0.4) 0%, transparent 70%)",
                }}
                animate={{
                    x: [0, -30, 20, 0],
                    y: [0, 20, -30, 0],
                    scale: [1, 0.95, 1.1, 1],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Purple blob – center */}
            <motion.div
                className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.07]"
                style={{
                    background:
                        "radial-gradient(circle, rgba(167, 139, 250, 0.5) 0%, transparent 70%)",
                }}
                animate={{
                    x: [0, 40, -40, 0],
                    y: [0, -40, 40, 0],
                    scale: [1, 1.2, 0.9, 1],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
        </div>
    );
}

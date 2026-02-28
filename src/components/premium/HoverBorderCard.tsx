"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HoverBorderCardProps {
    children: React.ReactNode;
    className?: string;
    borderColor?: string;
    borderWidth?: number;
}

export function HoverBorderCard({
    children,
    className,
    borderColor = "rgba(224, 255, 34, 0.5)",
    borderWidth = 1,
}: HoverBorderCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        setPosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
                "relative overflow-hidden rounded-xl bg-surface",
                className
            )}
            style={{
                border: `${borderWidth}px solid rgba(255, 255, 255, 0.06)`,
            }}
        >
            {/* Glowing border effect */}
            <motion.div
                className="pointer-events-none absolute inset-0 z-10 rounded-xl"
                style={{
                    background: isHovered
                        ? `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${borderColor}, transparent 50%)`
                        : "none",
                    opacity: isHovered ? 1 : 0,
                    mask: `
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0)
          `,
                    maskComposite: "xor",
                    WebkitMaskComposite: "xor",
                    padding: `${borderWidth}px`,
                }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.2 }}
            />

            {/* Subtle inner glow */}
            <motion.div
                className="pointer-events-none absolute inset-0 z-0 rounded-xl"
                style={{
                    background: isHovered
                        ? `radial-gradient(300px circle at ${position.x}px ${position.y}px, rgba(224, 255, 34, 0.04), transparent 50%)`
                        : "none",
                }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
            />

            <div className="relative z-20">{children}</div>
        </motion.div>
    );
}

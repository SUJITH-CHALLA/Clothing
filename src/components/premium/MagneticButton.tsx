"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    strength?: number;
    as?: "button" | "a" | "div";
    href?: string;
}

export function MagneticButton({
    children,
    className,
    onClick,
    as = "button",
    href,
}: MagneticButtonProps) {
    const Component = motion.div;

    return (
        <Component
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={cn("inline-block", className)}
        >
            {as === "a" && href ? (
                <a href={href} className="block">{children}</a>
            ) : (
                children
            )}
        </Component>
    );
}

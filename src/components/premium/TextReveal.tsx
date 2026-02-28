"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextRevealProps {
    text: string;
    className?: string;
    delay?: number;
    staggerDelay?: number;
}

export function TextReveal({
    text,
    className,
    delay = 0,
    staggerDelay = 0.03,
}: TextRevealProps) {
    const words = text.split(" ");

    return (
        <motion.span className={cn("inline-flex flex-wrap", className)}>
            {words.map((word, wordIndex) => (
                <span key={wordIndex} className="mr-[0.3em] inline-flex">
                    {word.split("").map((char, charIndex) => {
                        const globalIndex =
                            words
                                .slice(0, wordIndex)
                                .reduce((acc, w) => acc + w.length, 0) + charIndex;
                        return (
                            <motion.span
                                key={charIndex}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.4,
                                    delay: delay + globalIndex * staggerDelay,
                                    ease: [0.25, 0.4, 0.25, 1],
                                }}
                                className="inline-block"
                            >
                                {char}
                            </motion.span>
                        );
                    })}
                </span>
            ))}
        </motion.span>
    );
}

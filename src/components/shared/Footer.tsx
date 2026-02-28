import React from "react";
import Link from "next/link";
import { Instagram, Twitter, ArrowUpRight } from "lucide-react";

const footerLinks = {
    Shop: [
        { label: "New Drops", href: "/new-drops" },
        { label: "Collections", href: "/collections" },
        { label: "Sale", href: "/sale" },
    ],
    Help: [
        { label: "Track Order", href: "/#" },
        { label: "Returns", href: "/#" },
        { label: "Contact", href: "/#" },
    ],
    Legal: [
        { label: "Privacy", href: "/#" },
        { label: "Terms", href: "/#" },
        { label: "Refunds", href: "/#" },
    ],
};

export function Footer() {
    return (
        <footer className="border-t border-white/5 bg-deep-black">
            <div className="mx-auto max-w-7xl px-6 py-16">
                <div className="grid gap-12 md:grid-cols-4">
                    {/* Brand */}
                    <div className="space-y-4">
                        <span className="font-heading text-2xl font-bold tracking-tight">
                            CLOTH<span className="text-volt">IFY</span>
                        </span>
                        <p className="text-sm leading-relaxed text-text-secondary">
                            Premium streetwear for the culture. Limited drops, exclusive
                            collections, and fast fashion that doesn&apos;t compromise on quality.
                        </p>
                        <div className="flex gap-3 pt-2">
                            <a
                                href="#"
                                className="rounded-full border border-white/10 p-2 text-text-secondary transition-all hover:border-volt/30 hover:text-volt"
                            >
                                <Instagram className="h-4 w-4" />
                            </a>
                            <a
                                href="#"
                                className="rounded-full border border-white/10 p-2 text-text-secondary transition-all hover:border-volt/30 hover:text-volt"
                            >
                                <Twitter className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title}>
                            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">
                                {title}
                            </h4>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="group flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-text-primary"
                                        >
                                            {link.label}
                                            <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 md:flex-row">
                    <p className="text-xs text-text-secondary">
                        © {new Date().getFullYear()} Clothify. All rights reserved.
                    </p>
                    <p className="text-xs text-text-secondary">
                        Crafted with precision ✦
                    </p>
                </div>
            </div>
        </footer>
    );
}

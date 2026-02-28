"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    BarChart3,
    Tag,
    LogOut,
    MessageSquare,
    Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const sidebarLinks = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    { label: "Inventory", icon: Package, href: "/admin/inventory" },
    { label: "Orders", icon: ShoppingCart, href: "/admin/orders" },
    { label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
    { label: "Discounts", icon: Tag, href: "/admin/discounts" },
    { label: "Reviews", icon: MessageSquare, href: "/admin/reviews" },
    { label: "Customers", icon: Users, href: "/admin/customers" },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [userRole, setUserRole] = React.useState<string | null>(null);

    React.useEffect(() => {
        const checkRole = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", session.user.id)
                    .single();
                let role = profile?.role || 'user';

                // Hardcoded admin email fallback
                const adminEmails = ['admin@clothify.shop', 'superadmin@clothify.shop'];
                const isAdminEmail = adminEmails.includes(session.user.email || '');
                if (isAdminEmail) {
                    role = 'admin';
                }

                setUserRole(role);

                // Protect admin routes: Redirect if not admin
                if (role !== 'admin') {
                    toast.error("Unauthorized access. Admin privileges required.");
                    router.push("/");
                }
            } else {
                // Not logged in
                router.push("/login");
            }
        };
        checkRole();
    }, [supabase, router]);

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.error("Sign out error:", err);
        }
        document.cookie = "clothify_demo_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        window.location.href = "/login";
    };

    return (
        <div className="flex min-h-screen bg-deep-black">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-white/5 bg-surface/50 backdrop-blur-xl">
                {/* Logo */}
                <div className="flex h-16 items-center px-6">
                    <Link href="/admin" className="flex items-center gap-2">
                        <span className="font-heading text-xl font-bold">
                            CLOTH<span className="text-volt">IFY</span>
                        </span>
                        <span className="rounded-full bg-volt/10 px-2 py-0.5 text-[10px] font-semibold text-volt">
                            ADMIN
                        </span>
                    </Link>
                </div>

                {/* Nav */}
                <nav className="flex-1 space-y-1 px-3 py-4">
                    {sidebarLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                                    isActive
                                        ? "bg-volt/10 text-volt"
                                        : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                                )}
                            >
                                <link.icon className="h-4 w-4" />
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom */}
                <div className="border-t border-white/5 p-3 space-y-2">
                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-text-secondary flex justify-between items-center">
                        <span>Current Role</span>
                        <span className={cn("px-2 py-0.5 rounded-md", userRole === 'admin' ? "bg-volt text-deep-black" : "bg-white/10 text-text-primary")}>
                            {userRole || 'Loading...'}
                        </span>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-secondary transition-all hover:bg-white/5 hover:text-text-primary"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="ml-64 flex-1 p-8">
                {children}
            </main>
        </div>
    );
}

"use client";

import React, { useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
} from "recharts";
import { ArrowUpRight, TrendingUp, Package, Users, Loader2, MessageSquare, Star, Award } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Helper to get last 7 days names
const getLast7Days = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        result.push({ name: days[d.getDay()], total: 0 });
    }
    return result;
};

export default function AdminDashboardPage() {
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [revenueStats, setRevenueStats] = useState<any[]>([]);
    const [stats, setStats] = useState({
        revenue: 0,
        totalOrders: 0,
        activeUsers: 0,
        reviewCount: 0,
        totalLoyaltyPoints: 0,
        conversionRate: 3.2
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const supabase = createClient();
            setLoading(true);

            // Fetch recent orders
            const { data: orders } = await supabase
                .from('orders')
                .select(`
                    id,
                    total_amount,
                    status,
                    created_at,
                    profiles:user_id ( full_name )
                `)
                .order('created_at', { ascending: false });

            // Fetch users sum
            const { count: usersCount, data: profiles } = await supabase
                .from('profiles')
                .select('loyalty_points', { count: 'exact' });

            // Fetch reviews count
            const { count: reviewsCount } = await supabase
                .from('product_reviews')
                .select('*', { count: 'exact', head: true });

            if (orders) {
                const totalRev = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
                const totalLoyalty = profiles?.reduce((sum, p) => sum + (p.loyalty_points || 0), 0) || 0;

                // Aggregate revenue by day
                const dayMap = getLast7Days();
                const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

                orders.forEach(order => {
                    const date = new Date(order.created_at);
                    const dayName = dayNames[date.getDay()];
                    const dayObj = dayMap.find(d => d.name === dayName);
                    if (dayObj) {
                        dayObj.total += (order.total_amount || 0) / 100; // Convert to logical currency units if stored in cents
                    }
                });

                setRevenueStats(dayMap);
                setStats({
                    revenue: totalRev,
                    totalOrders: orders.length,
                    activeUsers: usersCount || 0,
                    reviewCount: reviewsCount || 0,
                    totalLoyaltyPoints: totalLoyalty,
                    conversionRate: totalRev > 0 ? 4.8 : 0 // Improved visual feedback
                });
                setRecentOrders(orders.slice(0, 5));
            }

            setLoading(false);
        };

        fetchDashboardData();
    }, []);
    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-heading text-3xl font-bold">Dashboard</h1>
                <p className="mt-1 text-sm text-text-secondary">
                    Welcome back. Here&apos;s your store at a glance.
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "Total Revenue", value: `₹${stats.revenue.toLocaleString('en-IN')}`, change: "+12.5%", icon: TrendingUp },
                    { label: "Active Feedback", value: stats.reviewCount.toString(), change: "+14%", icon: MessageSquare },
                    { label: "Registered Users", value: stats.activeUsers.toString(), change: "+24%", icon: Users },
                    { label: "Loyalty Pool", value: stats.totalLoyaltyPoints.toLocaleString(), change: "+4.2%", icon: Award },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="flex items-start justify-between rounded-xl border border-white/5 bg-surface p-6"
                    >
                        <div>
                            <p className="text-xs uppercase tracking-[0.1em] text-text-secondary">
                                {stat.label}
                            </p>
                            <p className="mt-2 text-2xl font-bold">{stat.value}</p>
                            <span className="mt-1 inline-block text-xs font-medium text-volt">
                                {stat.change} from last week
                            </span>
                        </div>
                        <div className="rounded-lg bg-white/5 p-2 text-text-secondary">
                            <stat.icon className="h-5 w-5" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Revenue Chart */}
                <div className="rounded-xl border border-white/5 bg-surface p-6">
                    <div className="mb-4">
                        <h3 className="font-semibold">Revenue Overview</h3>
                        <p className="text-xs text-text-secondary">Rolling 7-day performance</p>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueStats} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="name" stroke="#A1A1AA" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#A1A1AA" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                                <Tooltip
                                    cursor={{ fill: '#ffffff05' }}
                                    contentStyle={{ backgroundColor: '#050505', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                />
                                <Bar dataKey="total" fill="#E0FF22" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Growth Perspective */}
                <div className="rounded-xl border border-white/5 bg-surface p-6">
                    <div className="mb-4">
                        <h3 className="font-semibold">Sales Velocity</h3>
                        <p className="text-xs text-text-secondary">Average transaction growth</p>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueStats} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="name" stroke="#A1A1AA" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#A1A1AA" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#050505', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                />
                                <Line type="monotone" dataKey="total" stroke="#E0FF22" strokeWidth={2} dot={{ fill: '#E0FF22' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Orders List */}
            <div className="rounded-xl border border-white/5 bg-surface p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold">Recent Orders</h3>
                        <p className="text-xs text-text-secondary">Latest transactions from your store</p>
                    </div>
                    <button className="text-xs font-medium text-volt hover:underline">
                        View All
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-white/5 text-xs text-text-secondary">
                            <tr>
                                <th className="pb-3 font-medium">Order ID</th>
                                <th className="pb-3 font-medium">Customer</th>
                                <th className="pb-3 font-medium">Item</th>
                                <th className="pb-3 font-medium">Status</th>
                                <th className="pb-3 text-right font-medium">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-text-secondary">
                                        <Loader2 className="inline-block h-6 w-6 animate-spin text-volt" />
                                    </td>
                                </tr>
                            ) : recentOrders.map((order) => (
                                <tr key={order.id} className="transition-colors hover:bg-white/5">
                                    <td className="py-3 font-medium text-text-primary capitalize">{order.id.split('-')[0]}</td>
                                    <td className="py-3 text-text-secondary">{order.profiles?.full_name || 'Guest'}</td>
                                    <td className="py-3 text-text-secondary truncate max-w-[150px]">Store Items</td>
                                    <td className="py-3">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${order.status === 'delivered' ? 'bg-green-500/10 text-green-400' :
                                            order.status === 'processing' || order.status === 'pending' ? 'bg-volt/10 text-volt' :
                                                'bg-blue-500/10 text-blue-400'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="py-3 text-right font-medium text-text-primary">₹{order.total_amount?.toLocaleString('en-IN')}</td>
                                </tr>
                            ))}
                            {!loading && recentOrders.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-text-secondary">
                                        No recent orders found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

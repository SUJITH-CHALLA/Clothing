"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Phone, ArrowRight, Loader2, User as UserIcon, Lock, Check } from "lucide-react";
import { BlurIn } from "@/components/premium/BlurIn";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const [mode, setMode] = useState<"email" | "phone">("email");
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        fullName: "",
        emailOrPhone: "",
        password: "",
        confirmPassword: "",
    });

    const [agreed, setAgreed] = useState(false);

    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const router = useRouter();
    const supabase = createClient();

    const handleGoogleLogin = async () => {
        setLoading(true);
        setErrorMsg("");
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/`,
            }
        });

        if (error) {
            setErrorMsg(error.message);
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");
        setSuccessMsg("");

        if (formData.password !== formData.confirmPassword) {
            setErrorMsg("Passwords do not match");
            setLoading(false);
            return;
        }

        if (!agreed) {
            setErrorMsg("You must agree to the Terms & Privacy Policy");
            setLoading(false);
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email: formData.emailOrPhone,
            password: formData.password,
            options: {
                data: {
                    full_name: formData.fullName,
                },
            },
        });

        if (error) {
            setErrorMsg(error.message);
            setLoading(false);
            return;
        }

        if (data.user && data.user.identities && data.user.identities.length === 0) {
            setErrorMsg("User already exists. Please sign in instead.");
            setLoading(false);
            return;
        }

        setSuccessMsg("Check your email to verify your account!");
        setLoading(false);

        // Wait a bit before redirecting or let them verify 
        // depending on your Supabase confirm settings. We assume confirmed via redirect or auto-login.
        if (data.session) {
            router.push("/");
        }
    };

    return (
        <BlurIn className="space-y-8">
            {/* Logo */}
            <div className="text-center">
                <Link href="/">
                    <span className="font-heading text-3xl font-bold">
                        CLOTH<span className="text-volt">IFY</span>
                    </span>
                </Link>
                <p className="mt-3 text-sm text-text-secondary">
                    Join the culture. Get exclusive access to drops.
                </p>
            </div>

            {/* Card */}
            <div className="rounded-2xl border border-white/5 bg-surface/50 p-8 backdrop-blur-xl">
                <motion.form
                    key="details"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onSubmit={handleRegister}
                    className="space-y-6"
                >
                    {/* Mode Toggle */}
                    <div className="flex rounded-lg bg-deep-black p-1">
                        <button
                            type="button"
                            onClick={() => setMode("email")}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-xs font-medium transition-all ${mode === "email"
                                ? "bg-surface text-text-primary"
                                : "text-text-secondary hover:text-text-primary"
                                }`}
                        >
                            <Mail className="h-3.5 w-3.5" />
                            Email
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode("phone")}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-xs font-medium transition-all ${mode === "phone"
                                ? "bg-surface text-text-primary"
                                : "text-text-secondary hover:text-text-primary"
                                }`}
                        >
                            <Phone className="h-3.5 w-3.5" />
                            Phone
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <Label className="text-xs text-text-secondary">Full Name</Label>
                            <div className="relative">
                                <UserIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary/50" />
                                <Input
                                    type="text"
                                    placeholder="John Doe"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="h-12 rounded-xl border-white/10 bg-deep-black pl-11 text-text-primary placeholder:text-text-secondary/40 focus:border-volt/30"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email / Phone */}
                        <div className="space-y-2">
                            <Label className="text-xs text-text-secondary">
                                {mode === "email" ? "Email address" : "Phone number"}
                            </Label>
                            <Input
                                type={mode === "email" ? "email" : "tel"}
                                placeholder={
                                    mode === "email" ? "you@example.com" : "+91 9876543210"
                                }
                                value={formData.emailOrPhone}
                                onChange={(e) => setFormData({ ...formData, emailOrPhone: e.target.value })}
                                className="h-12 rounded-xl border-white/10 bg-deep-black text-text-primary placeholder:text-text-secondary/40 focus:border-volt/30"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label className="text-xs text-text-secondary">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary/50" />
                                <Input
                                    type="password"
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="h-12 rounded-xl border-white/10 bg-deep-black pl-11 text-text-primary placeholder:text-text-secondary/40 focus:border-volt/30"
                                    required
                                    minLength={8}
                                />
                            </div>
                            {/* Password Strength basic indicator */}
                            {formData.password.length > 0 && (
                                <div className="flex gap-1 mt-2">
                                    <div className={`h-1 flex-1 rounded-full ${formData.password.length > 0 ? "bg-red-500" : "bg-white/10"}`} />
                                    <div className={`h-1 flex-1 rounded-full ${formData.password.length > 5 ? "bg-yellow-500" : "bg-white/10"}`} />
                                    <div className={`h-1 flex-1 rounded-full ${formData.password.length > 8 && /[A-Z]/.test(formData.password) ? "bg-volt" : "bg-white/10"}`} />
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <Label className="text-xs text-text-secondary">Confirm Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary/50" />
                                <Input
                                    type="password"
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="h-12 rounded-xl border-white/10 bg-deep-black pl-11 text-text-primary placeholder:text-text-secondary/40 focus:border-volt/30"
                                    required
                                    minLength={8}
                                />
                                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                    <Check className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-volt" />
                                )}
                            </div>
                        </div>

                        {/* Terms Checkbox */}
                        <div className="flex items-start gap-3 pt-2">
                            <div className="flex items-center h-5">
                                <input
                                    id="terms"
                                    type="checkbox"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    className="h-4 w-4 rounded border-white/10 bg-deep-black text-volt focus:ring-volt/30 cursor-pointer"
                                />
                            </div>
                            <Label htmlFor="terms" className="text-xs text-text-secondary leading-snug cursor-pointer">
                                I agree to the <Link href="/terms" className="text-volt hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-volt hover:underline">Privacy Policy</Link>.
                            </Label>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full group mt-6 relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-volt py-4 font-semibold text-deep-black transition-all hover:bg-volt/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                Create Account
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </>
                        )}
                    </button>

                    {errorMsg && (
                        <div className="text-center text-sm font-medium text-red-500 bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                            {errorMsg}
                        </div>
                    )}

                    {successMsg && (
                        <div className="text-center text-sm font-medium text-volt bg-volt/10 py-2 rounded-lg border border-volt/20">
                            {successMsg}
                        </div>
                    )}

                    {/* OAuth Separator */}
                    <div className="relative my-6 text-center">
                        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/10" />
                        <span className="relative bg-surface px-2 text-[10px] uppercase tracking-widest text-text-secondary">
                            Or continue with
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-deep-black py-4 font-medium text-text-primary transition-colors hover:bg-white/5 disabled:opacity-50"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google
                    </button>
                </motion.form>
            </div >
            <p className="text-center text-xs text-text-secondary">
                Already have an account?{" "}
                <Link href="/login" className="text-volt hover:underline">
                    Sign in
                </Link>
            </p>
        </BlurIn >
    );
}

"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Vote, Shield, AlertCircle } from "lucide-react";

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);

    const error = searchParams.get("error");
    const redirectTo = searchParams.get("redirectTo") || "/dashboard";

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
                    queryParams: {
                        hd: "sjcetpalai.ac.in",
                        prompt: "select_account",
                    },
                },
            });

            if (error) {
                console.error("Auth error:", error);
                setLoading(false);
            }
        } catch (err) {
            console.error("Login failed:", err);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f6fa] p-4 text-center">
            <div className="bg-white rounded-[32px] p-10 md:p-14 shadow-[0_10px_40px_rgba(59,54,140,0.05)] border border-gray-100 max-w-[480px] w-full flex flex-col items-center">
                <div className="w-20 h-20 bg-[#3b368c] rounded-3xl flex items-center justify-center shadow-lg shadow-[#3b368c]/20 mb-8">
                    <Vote size={40} className="text-white" />
                </div>

                <h1 className="text-3xl font-extrabold text-[#1e1e2d] mb-3">iVOTE System</h1>
                <p className="text-sm font-medium text-gray-400 mb-10 w-full max-w-[320px]">
                    Sign in with your SJCET Google account to access the online election portal.
                </p>

                {error && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-red-50 rounded-xl mb-6 text-sm font-semibold text-red-600 w-full text-left">
                        <AlertCircle size={20} className="shrink-0" />
                        {error === "unauthorized_domain"
                            ? "Access denied. Only @cy.sjcetpalai.ac.in and @cc.sjcetpalai.ac.in emails are allowed."
                            : "An error occurred during sign in. Please try again."}
                    </div>
                )}

                <div className="flex items-center justify-center gap-2 bg-[#f0f0ff] text-[#3b368c] text-xs font-bold px-4 py-2 rounded-full mb-8">
                    <Shield size={16} />
                    Only @sjcetpalai.ac.in accounts allowed
                </div>

                <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full h-14 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center gap-3 font-bold text-[#1e1e2d] hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-[#1e1e2d]/30 border-t-[#1e1e2d] rounded-full animate-spin" />
                    ) : (
                        <>
                            <svg width="24" height="24" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Continue with Google
                        </>
                    )}
                </button>

                <p className="mt-8 text-xs font-medium text-gray-400 max-w-[280px]">
                    By signing in, you agree to participate in the SJCET student election process. Your vote is confidential.
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-[#f5f6fa]">
                    <div className="spinner" />
                </div>
            }
        >
            <LoginContent />
        </Suspense>
    );
}


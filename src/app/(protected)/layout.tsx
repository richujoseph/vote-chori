"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { User } from "@supabase/supabase-js";
import { Search, Bell, HelpCircle, Menu } from "lucide-react";
import { trpc } from "@/trpc/client";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const router = useRouter();
    const supabase = createClient();
    const { data: userData } = trpc.auth.me.useQuery();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
            } else {
                setUser(user);
                setLoading(false);
            }
        };

        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_OUT") {
                router.push("/login");
            } else if (session?.user) {
                setUser(session.user);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [router, supabase]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f5f6fa]">
                <div className="w-12 h-12 border-4 border-[#3b368c]/10 border-t-[#3b368c] rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#f5f6fa]">
            <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

            <main className="md:ml-[260px] min-h-screen transition-all duration-300">
                {/* Topbar */}
                <header className="h-[76px] px-4 md:px-8 flex items-center justify-between sticky top-0 bg-[#f5f6fa]/80 backdrop-blur-md z-30">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="md:hidden p-2.5 rounded-xl bg-white border border-gray-100 text-gray-500 shadow-sm"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="flex-1 max-w-xl hidden md:block">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search elections..."
                                    className="w-full bg-white border border-gray-200 rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-[#3b368c] focus:ring-4 focus:ring-[#3b368c]/5 transition-all shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-6">
                        <button className="hidden sm:flex text-gray-400 hover:text-[#3b368c] transition-colors relative p-2">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>

                        <div className="flex items-center gap-3 pl-3 md:pl-4 border-l border-gray-200/60">
                            <div className="flex flex-col items-end hidden sm:flex">
                                <span className="font-bold text-sm text-[#1e1e2d]">
                                    {userData?.name?.split(' ')[0] || userData?.email?.split('@')[0]}
                                </span>
                                <span className="text-[10px] font-black text-[#3b368c] uppercase tracking-wider opacity-60">
                                    {userData?.role || "Student"}
                                </span>
                            </div>

                            {userData?.image ? (
                                <img
                                    src={userData.image}
                                    alt="User"
                                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#3b368c] to-[#a5b4fc] text-white flex items-center justify-center font-black text-sm border-2 border-white shadow-md">
                                    {userData?.name ? userData.name[0] : userData?.email?.[0]?.toUpperCase() || "U"}
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}


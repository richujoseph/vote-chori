"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { trpc } from "@/trpc/client";
import { getInitials } from "@/lib/utils";
import {
    LayoutDashboard,
    Vote,
    BookOpenText,
    LogOut,
    Shield,
    PlusCircle,
    Menu,
    X,
    ChevronRight,
    Trophy
} from "lucide-react";
import { useState } from "react";

const studentNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/vote", label: "Vote Now", icon: Vote },
    { href: "/results", label: "Live Tally", icon: Trophy },
];

const adminNavItems = [
    { href: "/admin", label: "Admin Console", icon: Shield },
    { href: "/admin/elections/new", label: "New Election", icon: PlusCircle },
];

export function Sidebar({ mobileOpen, setMobileOpen }: { mobileOpen: boolean, setMobileOpen: (open: boolean) => void }) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: user, isLoading: userLoading } = trpc.auth.me.useQuery();
    const supabase = createClient();

    const isAdmin = user?.role === "admin";

    const initials = getInitials(user?.name || user?.email);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    return (
        <>
            {/* Overlay for mobile */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-[#0a0a10]/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside className={`fixed top-0 left-0 w-[260px] h-screen bg-white z-50 flex flex-col border-r border-gray-100 transition-transform duration-500 ease-in-out ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>

                {/* Brand Logo */}
                <div className="pt-10 pb-12 px-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#3b368c] flex items-center justify-center shadow-lg shadow-[#3b368c]/20">
                            <span className="text-white font-black text-xl italic tracking-tighter">V</span>
                        </div>
                        <span className="font-black text-2xl text-[#1e1e2d] tracking-tighter uppercase italic">iVOTE</span>
                    </div>
                </div>

                {/* Profile Peek */}
                <div className="px-6 mb-12">
                    <Link
                        href="/profile"
                        className="bg-gray-50/50 rounded-3xl p-5 border border-gray-50 flex items-center gap-4 group hover:bg-[#3b368c]/5 transition-all"
                        onClick={() => setMobileOpen(false)}
                    >
                        <div className="w-12 h-12 rounded-2xl bg-[#f0f0ff] flex items-center justify-center overflow-hidden border-2 border-white shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                            {userLoading ? (
                                <div className="w-full h-full bg-gray-100 animate-pulse" />
                            ) : user?.image ? (
                                <img src={user.image} alt={user.name || ""} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-[#3b368c] font-black text-sm">{initials}</span>
                            )}
                        </div>
                        <div className="flex flex-col min-w-0">
                            {userLoading ? (
                                <div className="w-20 h-4 bg-gray-100 animate-pulse rounded-full mb-1" />
                            ) : (
                                <>
                                    <span className="font-black text-sm text-[#1e1e2d] truncate">{user?.name?.split(' ')[0] || "User"}</span>
                                    {(user?.department || user?.batch) && (
                                        <span className="text-[9px] font-bold text-gray-400 truncate uppercase tracking-tighter">
                                            {user.department || user.batch}
                                        </span>
                                    )}
                                </>
                            )}
                            <div className="text-[10px] font-black text-[#3b368c] uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity flex items-center mt-0.5">
                                My Profile <ChevronRight size={10} className="ml-0.5" />
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                    <p className="px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Main Navigation</p>
                    {studentNavItems.map((item) => {
                        const isActive = pathname === item.href || (pathname.startsWith(item.href + "/") && item.href !== "/");
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center justify-between px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all group ${isActive
                                    ? "bg-[#3b368c] text-white shadow-xl shadow-[#3b368c]/20"
                                    : "text-gray-500 hover:text-[#1e1e2d] hover:bg-gray-50"
                                    }`}
                                onClick={() => setMobileOpen(false)}
                            >
                                <div className="flex items-center gap-4">
                                    <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                    <span>{item.label}</span>
                                </div>
                                {isActive && <div className="w-1 h-1 rounded-full bg-white opacity-40" />}
                            </Link>
                        );
                    })}

                    {isAdmin && (
                        <>
                            <p className="px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pt-8 mb-4">Administrative</p>
                            {adminNavItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center justify-between px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all group ${isActive
                                            ? "bg-[#1e1e2d] text-white shadow-xl shadow-black/20"
                                            : "text-gray-500 hover:text-[#1e1e2d] hover:bg-gray-50"
                                            }`}
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                            <span>{item.label}</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </>
                    )}
                </nav>

                {/* Bottom Actions */}
                <div className="p-6 space-y-3">
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-[#1e1e2d] hover:bg-red-50 hover:text-red-500 transition-all border border-gray-100/50"
                    >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>

                {/* Mobile Close Button */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="md:hidden absolute top-10 right-6 p-2 rounded-xl bg-gray-50 text-gray-500 border border-gray-100"
                >
                    <X size={20} />
                </button>
            </aside>
        </>
    );
}



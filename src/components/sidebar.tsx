"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { trpc } from "@/trpc/client";
import {
    LayoutDashboard,
    Vote,
    BarChart3,
    User,
    Settings,
    LogOut,
    Shield,
    PlusCircle,
    Menu,
    X,
} from "lucide-react";
import { useState } from "react";

const studentNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/vote", label: "Vote", icon: Vote },
    { href: "/results", label: "Results", icon: BarChart3 },
    { href: "/profile", label: "Profile", icon: User },
];

const adminNavItems = [
    { href: "/admin", label: "Admin Panel", icon: Shield },
    { href: "/admin/elections/new", label: "Create Election", icon: PlusCircle },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { data: user, isLoading: userLoading } = trpc.auth.me.useQuery();
    const [mobileOpen, setMobileOpen] = useState(false);
    const supabase = createClient();

    const isAdmin = user?.role === "admin";

    const initials = (user?.name || user?.email || "?")
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <>
            {/* Mobile menu button */}
            <button
                className="mobile-menu-btn"
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{
                    position: "fixed",
                    top: 18,
                    left: 16,
                    zIndex: 50,
                    padding: 8,
                }}
            >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay for mobile */}
            {mobileOpen && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.3)",
                        zIndex: 39,
                    }}
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
                {/* Logo */}
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                        <Vote size={18} />
                    </div>
                    <div className="sidebar-logo-text">
                        SJCET<span>Vote</span>
                    </div>
                </div>

                {/* Profile */}
                <div className="sidebar-profile">
                    <div className="sidebar-avatar">
                        {userLoading ? (
                            <div className="skeleton" style={{ width: "100%", height: "100%", borderRadius: "inherit" }} />
                        ) : user?.image ? (
                            <img src={user.image} alt={user.name || ""} />
                        ) : (
                            <span className="sidebar-avatar-fallback">{initials}</span>
                        )}
                    </div>
                    {userLoading ? (
                        <div className="skeleton" style={{ width: 80, height: 16, marginTop: 4 }} />
                    ) : (
                        <span className="sidebar-name">{user?.name || user?.email?.split('@')[0] || "User"}</span>
                    )}
                    <Link
                        href="/profile"
                        className="sidebar-view-profile"
                        onClick={() => setMobileOpen(false)}
                    >
                        View Profile →
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {studentNavItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`sidebar-nav-item ${pathname === item.href || pathname.startsWith(item.href + "/")
                                ? "active"
                                : ""
                                }`}
                            onClick={() => setMobileOpen(false)}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </Link>
                    ))}

                    {isAdmin && (
                        <>
                            <div className="sidebar-section-label">Administration</div>
                            {adminNavItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`sidebar-nav-item ${pathname === item.href ? "active" : ""
                                        }`}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <item.icon size={20} />
                                    {item.label}
                                </Link>
                            ))}
                        </>
                    )}
                </nav>

                {/* Footer */}
                <div className="sidebar-footer">
                    <button
                        className="sidebar-nav-item"
                        onClick={handleSignOut}
                        style={{ width: "100%", border: "none", background: "none" }}
                    >
                        <LogOut size={20} />
                        Log out
                    </button>
                </div>
            </aside>
        </>
    );
}


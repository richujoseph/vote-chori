"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { User } from "@supabase/supabase-js";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

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
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--bg)",
                }}
            >
                <div className="spinner" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <>
            <Sidebar />
            <main className="main-content">{children}</main>
        </>
    );
}


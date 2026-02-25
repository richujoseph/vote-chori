"use client";

import { trpc } from "@/trpc/client";
import { User, Mail, Shield, Calendar, BookOpen, GraduationCap, Hash, AlertTriangle } from "lucide-react";

export default function ProfilePage() {
    const { data: profile, isLoading } = trpc.auth.me.useQuery();

    const user = profile;
    const dbConnected = (profile as any)?.dbConnected ?? true;

    return (
        <div className="page-content">
            <h1 className="page-title">Profile</h1>
            <p className="page-subtitle">Your academic and account information</p>

            {!isLoading && !dbConnected && (
                <div style={{
                    background: "var(--danger-light)",
                    color: "#991b1b",
                    padding: "16px 24px",
                    borderRadius: "12px",
                    marginBottom: "24px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    border: "1px solid #fecaca",
                    fontSize: "14px",
                    fontWeight: 500
                }}>
                    <AlertTriangle size={20} />
                    <span>Database connection failed. Showing limited profile information. Admin features may be disabled.</span>
                </div>
            )}

            <div className="card" style={{ maxWidth: 800, margin: "0 auto" }}>
                <div className="card-body" style={{ padding: "40px" }}>
                    {/* Header: Avatar + Identity */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 32,
                            marginBottom: 40,
                            paddingBottom: 32,
                            borderBottom: "1px solid var(--border-light)",
                        }}
                    >
                        <div
                            className="sidebar-avatar"
                            style={{
                                width: 120,
                                height: 120,
                                borderRadius: "30%",
                                fontSize: "36px",
                                background: "var(--primary-gradient)",
                                color: "white",
                                boxShadow: "0 10px 20px -5px var(--primary-light)"
                            }}
                        >
                            {isLoading ? (
                                <div className="skeleton" style={{ width: "100%", height: "100%", borderRadius: "inherit" }} />
                            ) : user?.image ? (
                                <img src={user.image} alt={user.name || ""} style={{ borderRadius: "inherit" }} />
                            ) : (
                                <span className="sidebar-avatar-fallback">
                                    {(user?.name || "User")
                                        .split(" ")
                                        .map((n: string) => n[0])
                                        .join("")
                                        .toUpperCase()
                                        .slice(0, 2)}
                                </span>
                            )}
                        </div>
                        <div>
                            {isLoading ? (
                                <>
                                    <div className="skeleton" style={{ width: 200, height: 32, marginBottom: 12, borderRadius: 8 }} />
                                    <div className="skeleton" style={{ width: 120, height: 24, borderRadius: 6 }} />
                                </>
                            ) : (
                                <>
                                    <h2
                                        style={{
                                            fontSize: 32,
                                            fontWeight: 800,
                                            color: "var(--text-primary)",
                                            marginBottom: 8,
                                            letterSpacing: "-0.5px"
                                        }}
                                    >
                                        {user?.name}
                                    </h2>
                                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                        <span
                                            className={`badge ${user?.role === "admin" ? "badge-admin" : "badge-student"
                                                }`}
                                            style={{ padding: "6px 16px", fontSize: "14px" }}
                                        >
                                            {user?.role === "admin" ? "Administrator" : "Student"}
                                        </span>
                                        {user?.department && (
                                            <span style={{ color: "var(--text-muted)", fontSize: "15px", fontWeight: 500 }}>
                                                {user.department}
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Information Grid */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                        gap: "24px"
                    }}>
                        {/* Personal Info Group */}
                        <div style={{ background: "rgba(255,255,255,0.4)", padding: "24px", borderRadius: "16px", border: "1px solid var(--border-light)" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "20px", color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "1px" }}>Personal Details</h3>
                            <div style={{ display: "grid", gap: 20 }}>
                                {isLoading ? (
                                    <>
                                        {[1, 2, 3].map(i => (
                                            <div key={i} style={{ display: "flex", gap: 16 }}>
                                                <div className="skeleton" style={{ width: 42, height: 42, borderRadius: 12 }} />
                                                <div style={{ flex: 1 }}>
                                                    <div className="skeleton" style={{ width: 60, height: 12, marginBottom: 6 }} />
                                                    <div className="skeleton" style={{ width: 150, height: 16 }} />
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <>
                                        <InfoRow icon={<User size={18} />} label="Full Name" value={user?.name} />
                                        <InfoRow icon={<Mail size={18} />} label="Email Address" value={user?.email} />
                                        <InfoRow
                                            icon={<Shield size={18} />}
                                            label="Account Role"
                                            value={
                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <span style={{ textTransform: "capitalize" }}>{user?.role}</span>
                                                    {!dbConnected && (
                                                        <span style={{
                                                            fontSize: "10px",
                                                            background: "var(--danger-light)",
                                                            color: "var(--danger)",
                                                            padding: "2px 6px",
                                                            borderRadius: "4px",
                                                            fontWeight: 700,
                                                            textTransform: "uppercase"
                                                        }}>
                                                            Disconnected
                                                        </span>
                                                    )}
                                                </div>
                                            }
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Academic Info Group */}
                        <div style={{ background: "rgba(255,255,255,0.4)", padding: "24px", borderRadius: "16px", border: "1px solid var(--border-light)" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "20px", color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "1px" }}>Academic Status</h3>
                            <div style={{ display: "grid", gap: 20 }}>
                                {isLoading ? (
                                    <>
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} style={{ display: "flex", gap: 16 }}>
                                                <div className="skeleton" style={{ width: 42, height: 42, borderRadius: 12 }} />
                                                <div style={{ flex: 1 }}>
                                                    <div className="skeleton" style={{ width: 60, height: 12, marginBottom: 6 }} />
                                                    <div className="skeleton" style={{ width: 150, height: 16 }} />
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <>
                                        {user?.department && (
                                            <InfoRow icon={<BookOpen size={18} />} label="Department" value={user.department} />
                                        )}
                                        {user?.batch && (
                                            <InfoRow icon={<GraduationCap size={18} />} label="Academic Batch" value={user.batch} />
                                        )}
                                        <InfoRow icon={<Calendar size={18} />} label="Member Since" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                                            day: "numeric", month: "long", year: "numeric"
                                        }) : "-"} />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoRow({ icon, label, value, style }: { icon: React.ReactNode, label: string, value?: React.ReactNode, style?: React.CSSProperties }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary)",
                boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                flexShrink: 0,
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 2, fontWeight: 500 }}>
                    {label}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", ...style }}>
                    {value || "—"}
                </div>
            </div>
        </div>
    );
}



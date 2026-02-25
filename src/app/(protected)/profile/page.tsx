"use client";

import { trpc } from "@/trpc/client";
import { User, Mail, Shield, Calendar } from "lucide-react";

export default function ProfilePage() {
    const { data: profile } = trpc.auth.me.useQuery();

    const user = profile;

    return (
        <div className="page-content">
            <h1 className="page-title">Profile</h1>
            <p className="page-subtitle">Your account information</p>

            <div className="card" style={{ maxWidth: 600 }}>
                <div className="card-body">
                    {/* Avatar + Name */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 20,
                            marginBottom: 32,
                            paddingBottom: 24,
                            borderBottom: "1px solid var(--border-light)",
                        }}
                    >
                        <div className="sidebar-avatar" style={{ width: 80, height: 80 }}>
                            {user?.image ? (
                                <img src={user.image} alt={user.name || ""} />
                            ) : (
                                <span className="sidebar-avatar-fallback">
                                    {user?.name
                                        ?.split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()
                                        .slice(0, 2)}
                                </span>
                            )}
                        </div>
                        <div>
                            <h2
                                style={{
                                    fontSize: 22,
                                    fontWeight: 700,
                                    color: "var(--text-primary)",
                                    marginBottom: 4,
                                }}
                            >
                                {user?.name}
                            </h2>
                            <span
                                className={`badge ${user?.role === "admin" ? "badge-admin" : "badge-student"
                                    }`}
                            >
                                {user?.role === "admin" ? "Administrator" : "Student"}
                            </span>
                        </div>
                    </div>

                    {/* Info rows */}
                    <div style={{ display: "grid", gap: 20 }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 14,
                            }}
                        >
                            <div
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 8,
                                    background: "var(--primary-lightest)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "var(--primary)",
                                    flexShrink: 0,
                                }}
                            >
                                <User size={18} />
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontSize: 12,
                                        color: "var(--text-muted)",
                                        marginBottom: 2,
                                    }}
                                >
                                    Full Name
                                </div>
                                <div
                                    style={{
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: "var(--text-primary)",
                                    }}
                                >
                                    {user?.name}
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 14,
                            }}
                        >
                            <div
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 8,
                                    background: "var(--primary-lightest)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "var(--primary)",
                                    flexShrink: 0,
                                }}
                            >
                                <Mail size={18} />
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontSize: 12,
                                        color: "var(--text-muted)",
                                        marginBottom: 2,
                                    }}
                                >
                                    Email
                                </div>
                                <div
                                    style={{
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: "var(--text-primary)",
                                    }}
                                >
                                    {user?.email}
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 14,
                            }}
                        >
                            <div
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 8,
                                    background: "var(--primary-lightest)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "var(--primary)",
                                    flexShrink: 0,
                                }}
                            >
                                <Shield size={18} />
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontSize: 12,
                                        color: "var(--text-muted)",
                                        marginBottom: 2,
                                    }}
                                >
                                    Role
                                </div>
                                <div
                                    style={{
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: "var(--text-primary)",
                                        textTransform: "capitalize",
                                    }}
                                >
                                    {user?.role || "Student"}
                                </div>
                            </div>
                        </div>

                        {profile?.createdAt && (
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 14,
                                }}
                            >
                                <div
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 8,
                                        background: "var(--primary-lightest)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "var(--primary)",
                                        flexShrink: 0,
                                    }}
                                >
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: "var(--text-muted)",
                                            marginBottom: 2,
                                        }}
                                    >
                                        Member Since
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 14,
                                            fontWeight: 600,
                                            color: "var(--text-primary)",
                                        }}
                                    >
                                        {new Date(profile.createdAt).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


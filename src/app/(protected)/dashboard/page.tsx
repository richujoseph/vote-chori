"use client";

import { trpc } from "@/trpc/client";
import Link from "next/link";
import { Vote, Users, BarChart3, Clock, CalendarDays, ArrowRight } from "lucide-react";

export default function DashboardPage() {
    const { data: user } = trpc.auth.me.useQuery();
    const { data: ongoingElections, isLoading: electionsLoading } =
        trpc.election.getOngoing.useQuery();
    const { data: allElections } = trpc.election.getAll.useQuery();

    const firstName = user?.name?.split(" ")[0] || "Student";

    return (
        <div className="page-content">
            {/* Greeting */}
            <h1 className="page-title">Hello, {firstName}!</h1>
            <p className="page-subtitle">
                Welcome to SJCET&apos;s Online Voting System
            </p>

            {/* Stats Row */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 16,
                    marginBottom: 28,
                }}
            >
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <Users size={24} />
                    </div>
                    <div>
                        <div className="stat-number">
                            {allElections?.length ?? "—"}
                        </div>
                        <div className="stat-label">Total Elections</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">
                        <Vote size={24} />
                    </div>
                    <div>
                        <div className="stat-number" style={{ color: "var(--success)" }}>
                            {ongoingElections?.length ?? "—"}
                        </div>
                        <div className="stat-label">Ongoing Elections</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon purple">
                        <BarChart3 size={24} />
                    </div>
                    <div>
                        <div className="stat-number" style={{ color: "#7c3aed" }}>
                            {allElections?.filter((e) => e.status === "completed").length ??
                                "—"}
                        </div>
                        <div className="stat-label">Completed Elections</div>
                    </div>
                </div>
            </div>

            {/* Ongoing Elections */}
            <div style={{ marginBottom: 32 }}>
                <h2
                    style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        marginBottom: 16,
                    }}
                >
                    Ongoing Elections
                </h2>

                {electionsLoading ? (
                    <div style={{ display: "grid", gap: 16 }}>
                        {[1, 2].map((i) => (
                            <div key={i} className="skeleton" style={{ height: 120, borderRadius: 12 }} />
                        ))}
                    </div>
                ) : ongoingElections && ongoingElections.length > 0 ? (
                    <div style={{ display: "grid", gap: 16 }}>
                        {ongoingElections.map((election) => (
                            <div key={election.id} className="election-card">
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        flexWrap: "wrap",
                                        gap: 12,
                                    }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 10,
                                                marginBottom: 6,
                                            }}
                                        >
                                            <h3 className="election-card-title">{election.title}</h3>
                                            <span className="badge badge-ongoing">Ongoing</span>
                                        </div>
                                        <p className="election-card-desc">{election.description}</p>
                                        <div
                                            style={{
                                                display: "flex",
                                                gap: 20,
                                                fontSize: 13,
                                                color: "var(--text-muted)",
                                            }}
                                        >
                                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                                <CalendarDays size={14} />
                                                Ends:{" "}
                                                {new Date(election.endTime).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </span>
                                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                                <Clock size={14} />
                                                {new Date(election.endTime).toLocaleTimeString("en-IN", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/vote?election=${election.id}`}
                                        className="btn btn-primary"
                                    >
                                        Vote Now <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card">
                        <div className="empty-state" style={{ padding: 40 }}>
                            <div className="empty-state-icon">
                                <Vote size={32} />
                            </div>
                            <div className="empty-state-title">No ongoing elections</div>
                            <div className="empty-state-desc">
                                There are no active elections at the moment. Check back later!
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Election Activities */}
            <div>
                <h2
                    style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        marginBottom: 16,
                    }}
                >
                    Election Activities
                </h2>
                <div className="card">
                    <div className="card-body" style={{ padding: 0 }}>
                        {allElections && allElections.length > 0 ? (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Election</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allElections.map((election) => (
                                        <tr key={election.id}>
                                            <td style={{ fontWeight: 600 }}>{election.title}</td>
                                            <td>
                                                <span
                                                    className={`badge badge-${election.status}`}
                                                >
                                                    {election.status.charAt(0).toUpperCase() +
                                                        election.status.slice(1)}
                                                </span>
                                            </td>
                                            <td style={{ color: "var(--text-muted)", fontSize: 13 }}>
                                                {new Date(election.startTime).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </td>
                                            <td>
                                                <Link
                                                    href={`/results?election=${election.id}`}
                                                    style={{
                                                        fontSize: 13,
                                                        color: "var(--primary)",
                                                        fontWeight: 500,
                                                        textDecoration: "none",
                                                    }}
                                                >
                                                    View →
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="empty-state" style={{ padding: 40 }}>
                                <div className="empty-state-desc">No election activities yet</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { trpc } from "@/trpc/client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { BarChart3, Trophy, Users } from "lucide-react";

function ResultsContent() {
    const searchParams = useSearchParams();
    const electionId = searchParams.get("election");

    const { data: elections } = trpc.election.getAll.useQuery();
    const activeElectionId = electionId || elections?.[0]?.id;

    const { data: election } = trpc.election.getById.useQuery(
        { id: activeElectionId! },
        { enabled: !!activeElectionId }
    );
    const { data: results, isLoading } = trpc.vote.getResults.useQuery(
        { electionId: activeElectionId! },
        { enabled: !!activeElectionId }
    );

    if (!activeElectionId) {
        return (
            <div className="page-content">
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <BarChart3 size={32} />
                    </div>
                    <div className="empty-state-title">No elections found</div>
                    <div className="empty-state-desc">
                        Results will appear here once elections are created.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-content">
            <h1 className="page-title">Live Results</h1>
            <p className="page-subtitle">{election?.title}</p>

            {/* Election selector */}
            {elections && elections.length > 1 && (
                <div style={{ marginBottom: 24 }}>
                    <div
                        style={{
                            display: "flex",
                            gap: 8,
                            flexWrap: "wrap",
                        }}
                    >
                        {elections.map((e) => (
                            <a
                                key={e.id}
                                href={`/results?election=${e.id}`}
                                className={`btn btn-sm ${e.id === activeElectionId ? "btn-primary" : "btn-outline"
                                    }`}
                            >
                                {e.title}
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {isLoading ? (
                <div style={{ display: "grid", gap: 20 }}>
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="skeleton"
                            style={{ height: 200, borderRadius: 12 }}
                        />
                    ))}
                </div>
            ) : results && results.length > 0 ? (
                <div style={{ display: "grid", gap: 24 }}>
                    {results.map((result) => {
                        const maxVotes = Math.max(
                            ...result.candidates.map((c) => c.voteCount),
                            1
                        );

                        return (
                            <div key={result.category.id} className="card">
                                <div className="card-header">
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <div>
                                            <h3
                                                style={{
                                                    fontSize: 17,
                                                    fontWeight: 700,
                                                    color: "var(--text-primary)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 8,
                                                }}
                                            >
                                                <Trophy size={18} color="var(--primary)" />
                                                {result.category.title}
                                            </h3>
                                        </div>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 6,
                                                fontSize: 13,
                                                color: "var(--text-muted)",
                                            }}
                                        >
                                            <Users size={14} />
                                            {result.totalVotes} total votes
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body">
                                    {result.candidates.map((candidate, idx) => {
                                        const percentage =
                                            result.totalVotes > 0
                                                ? Math.round(
                                                    (candidate.voteCount / result.totalVotes) * 100
                                                )
                                                : 0;
                                        const isWinner = idx === 0 && candidate.voteCount > 0;

                                        return (
                                            <div
                                                key={candidate.id}
                                                className="result-bar-container"
                                                style={{
                                                    marginBottom: 16,
                                                }}
                                            >
                                                <div
                                                    className="result-bar-label"
                                                    style={{
                                                        width: 150,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 8,
                                                    }}
                                                >
                                                    {candidate.photoUrl ? (
                                                        <img
                                                            src={candidate.photoUrl}
                                                            alt=""
                                                            style={{
                                                                width: 32,
                                                                height: 32,
                                                                borderRadius: "50%",
                                                                objectFit: "cover",
                                                            }}
                                                        />
                                                    ) : (
                                                        <div
                                                            style={{
                                                                width: 32,
                                                                height: 32,
                                                                borderRadius: "50%",
                                                                background: "var(--primary-lightest)",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                color: "var(--primary)",
                                                                fontWeight: 700,
                                                                fontSize: 13,
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            {candidate.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <span
                                                        style={{
                                                            fontWeight: isWinner ? 700 : 500,
                                                            whiteSpace: "nowrap",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                        }}
                                                    >
                                                        {candidate.name}
                                                    </span>
                                                </div>
                                                <div className="result-bar-track">
                                                    <div
                                                        className="result-bar-fill"
                                                        style={{
                                                            width: `${Math.max(percentage, 3)}%`,
                                                            background: isWinner
                                                                ? "linear-gradient(90deg, var(--primary), var(--primary-light))"
                                                                : "linear-gradient(90deg, var(--primary-lighter), var(--primary-lightest))",
                                                        }}
                                                    >
                                                        <span
                                                            className="result-bar-value"
                                                            style={{
                                                                color: isWinner ? "white" : "var(--primary)",
                                                            }}
                                                        >
                                                            {percentage}%
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="result-bar-count">
                                                    {candidate.voteCount}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="card">
                    <div className="empty-state" style={{ padding: 40 }}>
                        <div className="empty-state-icon">
                            <BarChart3 size={32} />
                        </div>
                        <div className="empty-state-title">No results yet</div>
                        <div className="empty-state-desc">
                            Results will appear once votes are cast.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ResultsPage() {
    return (
        <Suspense
            fallback={
                <div className="page-content">
                    <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
                        <div className="spinner" />
                    </div>
                </div>
            }
        >
            <ResultsContent />
        </Suspense>
    );
}

"use client";

import { trpc } from "@/trpc/client";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { toast } from "sonner";
import { Vote, CheckCircle2, AlertCircle } from "lucide-react";

const RING_COLORS = ["ring-blue", "ring-purple", "ring-pink", "ring-green", "ring-orange", "ring-cyan"];

function VoteContent() {
    const searchParams = useSearchParams();
    const electionId = searchParams.get("election");

    const { data: election } = trpc.election.getById.useQuery(
        { id: electionId! },
        { enabled: !!electionId }
    );
    const { data: categories } = trpc.category.getByElection.useQuery(
        { electionId: electionId! },
        { enabled: !!electionId }
    );
    const { data: userVotes, refetch: refetchVotes } =
        trpc.vote.getUserVotes.useQuery(
            { electionId: electionId! },
            { enabled: !!electionId }
        );

    const castVoteMutation = trpc.vote.castVote.useMutation({
        onSuccess: () => {
            refetchVotes();
        },
    });

    const [selections, setSelections] = useState<Record<string, string>>({});
    const [showConfirm, setShowConfirm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    if (!electionId) {
        return (
            <div className="page-content">
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <Vote size={32} />
                    </div>
                    <div className="empty-state-title">No election selected</div>
                    <div className="empty-state-desc">
                        Go to the Dashboard to select an active election.
                    </div>
                </div>
            </div>
        );
    }

    const hasVotedInCategory = (categoryId: string) =>
        userVotes?.some((v) => v.categoryId === categoryId);

    const allCategoriesVoted =
        categories?.every((cat) => hasVotedInCategory(cat.id)) ?? false;

    const handleSelect = (categoryId: string, candidateId: string) => {
        if (hasVotedInCategory(categoryId)) return;
        setSelections((prev) => ({ ...prev, [categoryId]: candidateId }));
    };

    const handleSubmitVotes = async () => {
        setSubmitting(true);
        try {
            for (const [categoryId, candidateId] of Object.entries(selections)) {
                if (!hasVotedInCategory(categoryId)) {
                    await castVoteMutation.mutateAsync({ categoryId, candidateId });
                }
            }
            toast.success("Your votes have been submitted successfully!");
            setSelections({});
            setShowConfirm(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to submit votes");
        } finally {
            setSubmitting(false);
        }
    };

    const pendingSelections = Object.entries(selections).filter(
        ([catId]) => !hasVotedInCategory(catId)
    );

    return (
        <div className="page-content" style={{ paddingBottom: 100 }}>
            <h1 className="page-title" style={{ textTransform: "uppercase" }}>
                You may now cast your votes!
            </h1>
            <p className="page-subtitle">{election?.title}</p>

            {allCategoriesVoted && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "14px 20px",
                        background: "var(--success-light)",
                        borderRadius: 10,
                        marginBottom: 24,
                        fontSize: 14,
                        color: "#065f46",
                        fontWeight: 600,
                    }}
                >
                    <CheckCircle2 size={20} />
                    You have voted in all categories. Thank you for participating!
                </div>
            )}

            {categories?.map((category) => (
                <CategorySection
                    key={category.id}
                    category={category}
                    selectedCandidate={selections[category.id]}
                    votedCandidate={userVotes?.find((v) => v.categoryId === category.id)?.candidateId}
                    onSelect={(candidateId) => handleSelect(category.id, candidateId)}
                />
            ))}

            {/* Submit bar */}
            {pendingSelections.length > 0 && (
                <div className="submit-bar">
                    <span className="submit-bar-text">
                        Double check your choices before submitting your votes.
                    </span>
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={() => setShowConfirm(true)}
                    >
                        SUBMIT VOTE
                    </button>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div style={{ textAlign: "center", marginBottom: 8 }}>
                            <AlertCircle size={48} color="var(--primary)" />
                        </div>
                        <h3 className="modal-title" style={{ textAlign: "center" }}>
                            Confirm Your Votes
                        </h3>
                        <p className="modal-desc" style={{ textAlign: "center" }}>
                            You are about to submit {pendingSelections.length} vote(s). This
                            action cannot be undone. Are you sure?
                        </p>
                        <div className="modal-actions" style={{ justifyContent: "center" }}>
                            <button
                                className="btn btn-outline"
                                onClick={() => setShowConfirm(false)}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSubmitVotes}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <div
                                            className="spinner"
                                            style={{ width: 16, height: 16, borderWidth: 2 }}
                                        />
                                        Submitting...
                                    </>
                                ) : (
                                    "Confirm & Submit"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function CategorySection({
    category,
    selectedCandidate,
    votedCandidate,
    onSelect,
}: {
    category: { id: string; title: string; maxVotes: number };
    selectedCandidate?: string;
    votedCandidate?: string;
    onSelect: (candidateId: string) => void;
}) {
    const { data: candidates, isLoading } = trpc.candidate.getByCategory.useQuery(
        { categoryId: category.id }
    );

    const hasVoted = !!votedCandidate;

    return (
        <div className="category-section">
            <h2 className="category-title">{category.title}</h2>
            <p className="category-subtitle">
                {hasVoted ? (
                    <span className="badge badge-voted" style={{ fontSize: 12 }}>
                        <CheckCircle2 size={14} /> You have voted
                    </span>
                ) : (
                    `You can only vote for one candidate`
                )}
            </p>

            {isLoading ? (
                <div className="candidates-grid">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton" style={{ height: 200, borderRadius: 12 }} />
                    ))}
                </div>
            ) : (
                <div className="candidates-grid">
                    {candidates?.map((candidate, idx) => {
                        const isSelected = selectedCandidate === candidate.id;
                        const isVoted = votedCandidate === candidate.id;
                        const ringColor = RING_COLORS[idx % RING_COLORS.length];

                        return (
                            <div
                                key={candidate.id}
                                className={`candidate-card ${isSelected ? "selected" : ""} ${isVoted ? "selected" : ""
                                    }`}
                                onClick={() => !hasVoted && onSelect(candidate.id)}
                                style={{
                                    opacity: hasVoted && !isVoted ? 0.5 : 1,
                                    cursor: hasVoted ? "default" : "pointer",
                                }}
                            >
                                <div className={`candidate-avatar-ring ${ringColor}`}>
                                    <div className="candidate-avatar">
                                        {candidate.photoUrl ? (
                                            <img src={candidate.photoUrl} alt={candidate.name} />
                                        ) : (
                                            <span className="candidate-avatar-fallback">
                                                {candidate.name.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="candidate-name">{candidate.name}</div>
                                <div className="candidate-dept">{candidate.bio}</div>
                                <div className="candidate-actions">
                                    {hasVoted ? (
                                        isVoted ? (
                                            <span className="badge badge-voted">
                                                <CheckCircle2 size={12} /> Your Vote
                                            </span>
                                        ) : null
                                    ) : (
                                        <button
                                            className={`btn btn-sm ${isSelected ? "btn-primary" : "btn-outline"
                                                }`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelect(candidate.id);
                                            }}
                                        >
                                            {isSelected ? "Selected" : "VOTE"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function VotePage() {
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
            <VoteContent />
        </Suspense>
    );
}

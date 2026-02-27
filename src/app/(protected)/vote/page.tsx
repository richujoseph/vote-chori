"use client";

import { trpc } from "@/trpc/client";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { toast } from "sonner";
import { Vote, CheckCircle2, AlertCircle, Info, User, ChevronRight } from "lucide-react";

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
            <div className="p-4 md:p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
                <div className="bg-white p-8 md:p-12 rounded-[32px] shadow-sm border border-gray-100 flex flex-col items-center text-center max-w-md">
                    <div className="w-16 h-16 rounded-2xl bg-[#f0f0ff] flex items-center justify-center text-[#3b368c] mb-6">
                        <Vote size={32} />
                    </div>
                    <h2 className="text-xl font-black text-[#1e1e2d] mb-2 uppercase tracking-tight">No Selection</h2>
                    <p className="text-gray-400 text-sm font-medium leading-relaxed">Please return to the dashboard and select an active election to participate.</p>
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

    const pendingSelectionsCount = Object.entries(selections).filter(
        ([catId]) => !hasVotedInCategory(catId)
    ).length;

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto pb-44">
            <div className="text-center mb-12">
                <h1 className="text-2xl md:text-4xl font-black text-[#1e1e2d] tracking-tight mb-3">
                    Cast Your Vote
                </h1>
                <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">
                    {election?.title || "Loading Election..."}
                </p>
            </div>

            {allCategoriesVoted && (
                <div className="bg-green-50 border border-green-100 p-6 rounded-[24px] flex items-center gap-4 mb-12 max-w-2xl mx-auto">
                    <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="font-bold text-green-800 text-sm">Participation Confirmed</p>
                        <p className="text-green-600 text-xs mt-0.5">Your voice has been successfully recorded in this election.</p>
                    </div>
                </div>
            )}

            <div className="space-y-20">
                {categories?.map((category) => (
                    <CategorySection
                        key={category.id}
                        category={category}
                        selectedCandidate={selections[category.id]}
                        votedCandidate={userVotes?.find((v) => v.categoryId === category.id)?.candidateId}
                        onSelect={(candidateId) => handleSelect(category.id, candidateId)}
                    />
                ))}
            </div>

            {/* Submission Bar */}
            {pendingSelectionsCount > 0 && (
                <div className="fixed bottom-0 left-0 md:left-[260px] right-0 p-4 md:p-6 z-40">
                    <div className="bg-[#1e1e2d] text-white rounded-[24px] p-4 md:p-6 shadow-2xl shadow-black/20 flex flex-col md:flex-row items-center justify-between gap-4 max-w-4xl mx-auto border border-white/5 animate-in slide-in-from-bottom-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#3b368c] flex items-center justify-center">
                                <Info size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-sm">{pendingSelectionsCount} Selections Ready</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Review your choices before submitting</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowConfirm(true)}
                            className="w-full md:w-auto px-10 py-4 bg-[#3b368c] hover:bg-[#4a44b0] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg shadow-[#3b368c]/20"
                        >
                            Finalize Ballot
                        </button>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-6" onClick={() => setShowConfirm(false)}>
                    <div className="bg-white rounded-[40px] p-8 md:p-10 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-3xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-8 transform rotate-6 scale-110">
                                <AlertCircle size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-[#1e1e2d] mb-4">Are you certain?</h3>
                            <p className="text-gray-400 text-sm font-medium leading-relaxed mb-10">
                                Once submitted, your choices for <span className="text-[#3b368c] font-black">{pendingSelectionsCount} category(ies)</span> will be permanent and encrypted. There's no turning back.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button
                                className="w-full py-4 bg-[#3b368c] text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-[#2e2a77] transition-all flex justify-center items-center gap-3 shadow-lg shadow-[#3b368c]/10"
                                onClick={handleSubmitVotes}
                                disabled={submitting}
                            >
                                {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "YES, ENCRYPT & SUBMIT"}
                            </button>
                            <button
                                className="w-full py-4 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-[#1e1e2d] transition-colors"
                                onClick={() => setShowConfirm(false)}
                                disabled={submitting}
                            >
                                Not yet
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
        <div className="w-full">
            <div className="flex items-center gap-4 mb-8">
                <div className="h-px bg-gray-200 flex-1" />
                <h2 className="text-sm md:text-xs font-black text-[#1e1e2d] uppercase tracking-[0.2em]">{category.title}</h2>
                <div className="h-px bg-gray-200 flex-1" />
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => <div key={i} className="h-80 bg-white rounded-[32px] border border-gray-100 animate-pulse" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {candidates?.map((candidate) => {
                        const isSelected = selectedCandidate === candidate.id;
                        const isVoted = votedCandidate === candidate.id;

                        return (
                            <div
                                key={candidate.id}
                                className={`group relative bg-white rounded-[32px] border transition-all duration-300 overflow-hidden ${isSelected || isVoted
                                    ? "border-[#3b368c] ring-1 ring-[#3b368c] shadow-xl shadow-[#3b368c]/5"
                                    : "border-gray-100 hover:border-[#3b368c]/30 hover:shadow-lg shadow-sm"
                                    }`}
                                onClick={() => !hasVoted && onSelect(candidate.id)}
                                style={{ cursor: hasVoted ? "default" : "pointer" }}
                            >
                                <div className="p-6 md:p-8 flex flex-col items-center">
                                    <div className="relative mb-6">
                                        <div className={`w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-white shadow-xl transition-transform group-hover:scale-105 duration-500 ${isSelected || isVoted ? "ring-2 ring-[#3b368c]/20" : ""}`}>
                                            {candidate.photoUrl ? (
                                                <img src={candidate.photoUrl} alt={candidate.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-50 flex items-center justify-center font-black text-gray-200 text-3xl">
                                                    {candidate.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        {(isSelected || isVoted) && (
                                            <div className="absolute -top-1 -right-1 bg-[#3b368c] text-white p-1.5 rounded-full shadow-lg">
                                                <CheckCircle2 size={16} />
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="font-black text-[#1e1e2d] text-base md:text-lg mb-1">{candidate.name}</h3>
                                    <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest text-center">{candidate.bio || "Candidate"}</p>

                                    <div className="mt-8 w-full">
                                        {hasVoted ? (
                                            isVoted ? (
                                                <div className="w-full bg-[#3b368c]/5 text-[#3b368c] font-black text-[10px] uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2">
                                                    <CheckCircle2 size={14} /> My Choice
                                                </div>
                                            ) : (
                                                <div className="w-full bg-gray-50 text-gray-300 font-black text-[10px] uppercase tracking-widest py-3 rounded-xl flex items-center justify-center opacity-50">
                                                    Locked
                                                </div>
                                            )
                                        ) : (
                                            <button className={`w-full py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${isSelected
                                                ? "bg-[#3b368c] text-white shadow-lg shadow-[#3b368c]/20"
                                                : "bg-white border border-gray-100 text-[#3b368c] hover:bg-gray-50"
                                                }`}>
                                                {isSelected ? "Selected" : "Select Candidate"}
                                                <ChevronRight size={14} className={isSelected ? "translate-x-1 transition-transform" : ""} />
                                            </button>
                                        )}
                                    </div>
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
                <div className="min-h-screen flex items-center justify-center w-full bg-[#f5f6fa]">
                    <div className="w-12 h-12 border-4 border-[#3b368c]/10 border-t-[#3b368c] rounded-full animate-spin" />
                </div>
            }
        >
            <VoteContent />
        </Suspense>
    );
}


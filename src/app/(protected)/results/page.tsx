"use client";

import { trpc } from "@/trpc/client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useMemo } from "react";
import { BarChart3, Users, Trophy, ChevronRight, TrendingUp, Award, Zap, ShieldCheck } from "lucide-react";
import Link from "next/link";

function ResultsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const electionId = searchParams.get("election");
    const categoryId = searchParams.get("category");

    const { data: elections } = trpc.election.getAll.useQuery();
    const activeElectionId = electionId || elections?.[0]?.id;

    const { data: resultsData, isLoading } = trpc.vote.getResults.useQuery(
        { electionId: activeElectionId! },
        { enabled: !!activeElectionId }
    );

    const election = resultsData?.election;
    const results = resultsData?.results;
    const resultsHidden = resultsData?.resultsHidden;

    // Get categories from results for the tab system
    const categories = useMemo(() => {
        if (!results) return [];
        return results.map(r => r.category);
    }, [results]);

    const activeCategoryId = categoryId || categories[0]?.id;
    const activeResult = useMemo(() => {
        if (!results || !activeCategoryId) return null;
        return results.find(r => r.category.id === activeCategoryId);
    }, [results, activeCategoryId]);

    if (!activeElectionId) {
        return (
            <div className="p-4 md:p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
                <div className="bg-white p-8 md:p-12 rounded-[32px] shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <BarChart3 size={48} className="text-[#3b368c] mb-4 opacity-10" />
                    <div className="text-xl font-black text-[#1e1e2d] mb-2 uppercase tracking-tight">System Idle</div>
                    <p className="text-gray-400 text-sm font-medium">No elections found. Once an election is launched, results will stream here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-[1200px] mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-[#3b368c10] flex items-center justify-center text-[#3b368c]">
                            <TrendingUp size={16} />
                        </div>
                        <span className="text-[10px] font-black text-[#3b368c] uppercase tracking-[0.2em]">Real-time Tally</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-[#1e1e2d] tracking-tight">{election?.title || "Live Results"}</h1>
                </div>

                {/* Election Switcher */}
                {elections && elections.length > 1 && (
                    <div className="flex flex-wrap gap-2 bg-white/50 p-2 border border-gray-100 rounded-[24px] shadow-sm backdrop-blur-sm">
                        {elections.map((e) => (
                            <Link
                                key={e.id}
                                href={`/results?election=${e.id}`}
                                className={`px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${e.id === activeElectionId
                                    ? "bg-[#3b368c] text-white shadow-lg shadow-[#3b368c]/20"
                                    : "text-gray-400 hover:text-[#1e1e2d] hover:bg-white"
                                    }`}
                            >
                                {e.title}
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Category Tabs */}
            <div className="mb-12 overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex items-center gap-2 min-w-max p-1 bg-gray-100/50 rounded-[24px] border border-gray-100/50 w-fit">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                const params = new URLSearchParams(searchParams);
                                params.set("category", cat.id);
                                router.push(`/results?${params.toString()}`);
                            }}
                            className={`px-6 md:px-8 py-3 rounded-[20px] font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${activeCategoryId === cat.id
                                ? "bg-white text-[#3b368c] shadow-sm border border-gray-100"
                                : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            {cat.title}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="bg-white rounded-[40px] p-20 shadow-sm border border-gray-100 h-[500px] flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-[#3b368c]/10 border-t-[#3b368c] rounded-full animate-spin" />
                    <p className="mt-6 text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Synching Data</p>
                </div>
            ) : activeResult ? (
                <div className="space-y-12">
                    {/* Status Banner */}
                    <div className="flex items-center gap-4 bg-white border border-gray-100 p-4 md:p-5 rounded-[24px] w-fit shadow-sm mx-auto mb-16 px-6 md:px-8">
                        <div className="flex items-center gap-2 pr-4 border-r border-gray-100">
                            <Award size={20} className="text-yellow-500" />
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                {election?.status === "ongoing" ? "Live Progress" : "Final Tally"}
                            </span>
                        </div>
                        <span className="text-xs md:text-sm font-black text-[#1e1e2d] tracking-tight uppercase tracking-widest text-[10px]">
                            Results showing as <span className="text-[#3b368c] font-black">Relative Percentage</span>
                        </span>
                    </div>

                    {/* HERO SECTION: TOP 2 Comparison - MOBILE RESPONSIVE */}
                    <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-16 md:gap-32 lg:gap-48 mb-24 px-4 pb-20 md:pb-32">

                        {/* Winner/Rank 1 */}
                        {activeResult.candidates[0] && (
                            <div className="relative flex flex-col items-center w-full max-w-[280px] group">
                                <div
                                    className="w-full bg-gradient-to-t from-[#3b368c] to-[#5a54d4] rounded-[32px] shadow-2xl shadow-[#3b368c]/30 relative transition-all duration-1000 ease-out flex flex-col items-center justify-start pt-10"
                                    style={{ height: `${Math.max((activeResult.candidates[0].voteCount / (activeResult.totalVotes || 1)) * 340, 140)}px` }}
                                >
                                    <div className="absolute -top-6 bg-white p-3 rounded-2xl shadow-xl shadow-black/10 text-[#3b368c] transform -rotate-12 group-hover:rotate-0 transition-transform">
                                        <Award size={24} />
                                    </div>
                                    <span className="text-5xl md:text-6xl font-black text-white italic tracking-tighter drop-shadow-lg">
                                        {activeResult.totalVotes > 0 ? Math.round((activeResult.candidates[0].voteCount / activeResult.totalVotes) * 100) : 0}%
                                    </span>

                                    <div className="absolute -bottom-16 md:-bottom-24 left-1/2 -translate-x-1/2 w-32 h-32 md:w-44 md:h-44 rounded-full border-[6px] border-white shadow-2xl overflow-hidden z-20 group-hover:scale-105 transition-transform duration-500">
                                        {activeResult.candidates[0].photoUrl ? (
                                            <img src={activeResult.candidates[0].photoUrl} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-[#f0f0ff] flex items-center justify-center text-5xl font-black text-[#3b368c]/20 capitalize">
                                                {activeResult.candidates[0].name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-20 md:mt-28 text-center">
                                    <span className="text-xl md:text-2xl font-black text-[#1e1e2d] block truncate max-w-[240px]">{activeResult.candidates[0].name}</span>
                                    <div className="inline-block mt-3 px-6 py-2 bg-[#3b368c] text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-[#3b368c]/20">Leading Majority</div>
                                </div>
                            </div>
                        )}

                        {/* Gap Box Placeholder for desktop */}
                        {activeResult.candidates[0] && activeResult.candidates[1] && (
                            <div className="hidden md:flex flex-col items-center absolute left-1/2 bottom-1/2 -translate-x-1/2 z-10 opacity-20 hover:opacity-100 transition-opacity">
                                <Zap size={32} className="text-[#3b368c] mb-2" />
                            </div>
                        )}

                        {/* Runner-up/Rank 2 */}
                        {activeResult.candidates[1] && (
                            <div className="relative flex flex-col items-center w-full max-w-[280px] group">
                                <div
                                    className="w-full bg-gradient-to-t from-teal-500 to-teal-300 rounded-[32px] shadow-2xl shadow-teal-500/10 relative transition-all duration-1000 ease-out flex flex-col items-center justify-start pt-10"
                                    style={{ height: `${Math.max((activeResult.candidates[1].voteCount / (activeResult.totalVotes || 1)) * 340, 120)}px` }}
                                >
                                    <span className="text-5xl md:text-6xl font-black text-white italic tracking-tighter drop-shadow-md">
                                        {activeResult.totalVotes > 0 ? Math.round((activeResult.candidates[1].voteCount / activeResult.totalVotes) * 100) : 0}%
                                    </span>

                                    <div className="absolute -bottom-16 md:-bottom-24 left-1/2 -translate-x-1/2 w-32 h-32 md:w-44 md:h-44 rounded-full border-[6px] border-white shadow-2xl overflow-hidden z-20 group-hover:scale-105 transition-transform duration-500">
                                        {activeResult.candidates[1].photoUrl ? (
                                            <img src={activeResult.candidates[1].photoUrl} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-50 flex items-center justify-center text-5xl font-black text-gray-200 capitalize">
                                                {activeResult.candidates[1].name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-20 md:mt-28 text-center">
                                    <span className="text-xl md:text-2xl font-black text-[#1e1e2d] block truncate max-w-[240px]">{activeResult.candidates[1].name}</span>
                                    <div className="inline-block mt-3 px-6 py-2 border-2 border-teal-500/20 text-teal-600 text-[10px] font-black uppercase tracking-widest rounded-full">Runner Up</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* GAP ANALYTICS FOR MOBILE */}
                    {activeResult.candidates[1] && (
                        <div className="bg-white rounded-[32px] p-8 md:p-10 border border-gray-100 shadow-sm flex flex-col items-center max-w-[400px] mx-auto mb-20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
                                <TrendingUp size={80} />
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Vote Margin</span>
                            <div className="text-4xl font-black text-[#1e1e2d] mb-1">
                                {Math.abs(Math.round(((activeResult.candidates[0].voteCount - activeResult.candidates[1].voteCount) / (activeResult.totalVotes || 1)) * 100))}%
                            </div>
                            <span className="text-xs font-bold text-gray-400">
                                Leading by <span className="text-[#3b368c]">percentage gap</span>
                            </span>
                        </div>
                    )}

                    {/* OTHER CANDIDATES */}
                    <div className="max-w-[800px] mx-auto">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-px bg-gray-100 flex-1" />
                            <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Full Standings</h3>
                            <div className="h-px bg-gray-100 flex-1" />
                        </div>

                        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                            {activeResult.candidates.slice(2).length > 0 ? (
                                <div className="divide-y divide-gray-50">
                                    {activeResult.candidates.slice(2).map((candidate, idx) => {
                                        const percentage = activeResult.totalVotes > 0 ? Math.round((candidate.voteCount / activeResult.totalVotes) * 100) : 0;
                                        return (
                                            <div key={candidate.id} className="p-6 md:p-8 flex items-center gap-4 md:gap-8 group hover:bg-gray-50/50 transition-colors">
                                                <div className="hidden sm:block text-2xl font-black text-[#3b368c10] w-8">#{idx + 3}</div>
                                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gray-100 overflow-hidden shrink-0 border-2 border-white shadow-sm">
                                                    {candidate.photoUrl ? (
                                                        <img src={candidate.photoUrl} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center font-black text-gray-200 capitalize">
                                                            {candidate.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm md:text-base font-black text-[#1e1e2d] mb-2">{candidate.name}</div>
                                                    <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                                                        <div className="h-full bg-[#3b368c]/20 group-hover:bg-[#3b368c] transition-all duration-700 ease-out" style={{ width: `${percentage}%` }} />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end shrink-0">
                                                    <span className="text-xl font-black text-[#1e1e2d]">{percentage}%</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-16 text-center">
                                    <Users size={32} className="mx-auto text-gray-100 mb-4" />
                                    <p className="text-xs text-gray-300 font-bold uppercase tracking-widest">No additional nominees</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-[40px] p-20 shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <BarChart3 size={64} className="text-[#3b368c] opacity-5 mb-8" />
                    <h3 className="text-xl font-black text-[#1e1e2d] mb-2 uppercase tracking-tight">Data Unavailable</h3>
                    <p className="text-gray-400 text-sm max-w-xs mx-auto">No candidates have been registered for this category yet.</p>
                </div>
            )}
        </div>
    );
}

export default function ResultsPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center w-full bg-[#f5f6fa]">
                    <div className="w-12 h-12 border-4 border-[#3b368c]/10 border-t-[#3b368c] rounded-full animate-spin" />
                </div>
            }
        >
            <ResultsContent />
        </Suspense>
    );
}


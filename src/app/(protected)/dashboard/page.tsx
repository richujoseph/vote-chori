"use client";

import { trpc } from "@/trpc/client";
import Link from "next/link";
import { ChevronRight, ChevronLeft, HandHeart, CheckCircle2, ShieldCheck, TrendingUp, Users, Calendar, Award } from "lucide-react";

export default function DashboardPage() {
    const { data: user, isLoading: userLoading } = trpc.auth.me.useQuery();
    const { data: ongoingElections, isLoading: electionsLoading } = trpc.election.getOngoing.useQuery();
    const { data: allElections } = trpc.election.getAll.useQuery();
    const { data: stats } = trpc.analytics.getStats.useQuery();
    const { data: livePulse } = trpc.analytics.getCurrentResults.useQuery();

    const firstName = user?.name ? user.name.split(" ")[0] : user?.email?.split('@')[0] || "User";

    const completedCount = allElections?.filter((e) => e.status === "completed").length ?? 0;
    const totalVotes = stats?.totalVotes ?? 0;
    const registeredVoters = stats?.totalUsers ?? 0;

    return (
        <div className="p-4 md:p-8 max-w-[1200px] mx-auto pb-20">
            {/* Header / Welcome */}
            <div className="mb-10">
                {userLoading ? (
                    <div className="h-10 w-64 bg-white rounded-xl animate-pulse" />
                ) : (
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-4xl font-black text-[#1e1e2d] tracking-tight">Hello, {firstName}! 👏</h1>
                            <p className="text-sm font-medium text-gray-400 mt-2">Welcome to the iVOTE Campaign Center.</p>
                        </div>
                        <div className="bg-[#3b368c10] text-[#3b368c] px-4 py-2 rounded-xl border border-[#3b368c20] flex items-center gap-2">
                            <TrendingUp size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Election Season 2026</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

                {/* Left Column (Main) */}
                <div className="lg:col-span-2 flex flex-col gap-6 md:gap-8">

                    {/* Ongoing Elections Card */}
                    <div className="bg-[#3b368c] rounded-[32px] p-8 md:p-10 shadow-2xl shadow-[#3b368c]/20 flex flex-col md:flex-row justify-between relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/10 transition-all duration-700" />

                        <div className="flex flex-col z-10 relative">
                            <div className="inline-flex px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest mb-4 self-start">
                                Active Now
                            </div>
                            <h2 className="text-white font-black text-2xl md:text-3xl max-w-[300px] leading-[1.1] mb-8">
                                {electionsLoading ? "Loading Elections..." : (ongoingElections?.[0]?.title || "No active elections")}
                            </h2>

                            {ongoingElections && ongoingElections.length > 0 && (
                                <Link
                                    href={`/vote?election=${ongoingElections[0].id}`}
                                    className="self-start bg-white text-[#3b368c] rounded-2xl px-10 py-4 font-black transition-all hover:scale-105 hover:shadow-xl active:scale-95 text-sm uppercase tracking-widest"
                                >
                                    Cast Vote
                                </Link>
                            )}
                        </div>

                        <div className="mt-8 md:mt-0 relative w-full md:w-[200px] flex items-center justify-center">
                            <div className="w-full aspect-square bg-white/10 rounded-[32px] flex items-center justify-center transform rotate-6 border border-white/5">
                                <HandHeart size={64} className="text-white/40" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        {/* Live Results Card */}
                        <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-[#1e1e2d] font-black text-base uppercase tracking-widest">{livePulse?.electionTitle || "Live Pulse"}</h2>
                                <div className="p-2 rounded-xl bg-gray-50 text-gray-400">
                                    <Award size={18} />
                                </div>
                            </div>

                            <div className="space-y-6 flex-1">
                                {livePulse?.candidates && livePulse.candidates.length > 0 ? (
                                    livePulse.candidates.map((item, i) => {
                                        const percentage = livePulse.totalVotes > 0
                                            ? Math.round((item.voteCount / livePulse.totalVotes) * 100)
                                            : 0;
                                        const colors = ["#3b368c", "#a5b4fc", "#f0f0ff"];

                                        return (
                                            <div key={i} className="space-y-2">
                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                                    <span className="text-gray-400 truncate max-w-[150px]">{item.name}</span>
                                                    <span className="text-[#1e1e2d]">{item.voteCount} votes ({percentage}%)</span>
                                                </div>
                                                <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-1000 ease-out"
                                                        style={{ width: `${percentage}%`, backgroundColor: colors[i % colors.length] }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                                        <p className="text-gray-300 text-xs italic">No voting data available yet.</p>
                                    </div>
                                )}
                            </div>
                            <Link href="/results" className="mt-8 text-center text-xs font-black text-[#3b368c] uppercase tracking-widest hover:underline">
                                View Full Analytics
                            </Link>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100">
                            <h2 className="text-[#1e1e2d] font-black text-base uppercase tracking-widest mb-8">Recent Activity</h2>
                            <div className="space-y-6">
                                {allElections?.slice(0, 3).map((election) => (
                                    <div key={election.id} className="flex gap-4 group">
                                        <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center ${election.status === 'ongoing' ? 'bg-green-50 text-green-500' :
                                            election.status === 'completed' ? 'bg-[#3b368c]/5 text-[#3b368c]' : 'bg-gray-50 text-gray-400'
                                            }`}>
                                            <CheckCircle2 size={18} />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-bold text-sm text-[#1e1e2d] truncate">{election.title}</span>
                                            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-0.5">
                                                {election.status} • {election.endTime ? new Date(election.endTime).toLocaleDateString() : 'TBA'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {(!allElections || allElections.length === 0) && (
                                    <p className="text-gray-300 text-xs italic py-4">No recent activities to show.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-6 md:gap-8">
                    {/* Calendar Placeholder */}
                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-[#1e1e2d] font-black text-base uppercase tracking-widest">Election Cycle</h2>
                            <Calendar size={18} className="text-gray-300" />
                        </div>
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] font-black text-[#3b368c] uppercase tracking-tighter">
                                        {new Date().toLocaleString('default', { month: 'short' }).toUpperCase()}
                                    </span>
                                    <span className="text-2xl font-black text-[#1e1e2d]">{new Date().getDate()}</span>
                                </div>
                                <div className="h-10 w-px bg-gray-100" />
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-[#1e1e2d] mb-1">Election Day</p>
                                    <p className="text-[10px] text-gray-400 font-medium tracking-tight">System is live for voting</p>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                                <span className="text-[10px] font-black text-[#1e1e2d] uppercase tracking-widest">Total Elections</span>
                                <span className="text-[10px] font-bold text-gray-400">{stats?.totalElections || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col flex-1">
                        <h2 className="text-[#1e1e2d] font-black text-base uppercase tracking-widest mb-10">Network Stats</h2>

                        <div className="space-y-10 flex-1 flex flex-col justify-center">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-full border-4 border-[#3b368c]/10 flex items-center justify-center">
                                    <Users size={20} className="text-[#3b368c]" />
                                </div>
                                <div>
                                    <p className="text-xl font-black text-[#1e1e2d] tracking-tight">{registeredVoters}</p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Voters Rooted</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-full border-4 border-[#3b368c]/10 flex items-center justify-center">
                                    <TrendingUp size={20} className="text-[#3b368c]" />
                                </div>
                                <div>
                                    <p className="text-xl font-black text-[#1e1e2d] tracking-tight">{totalVotes}</p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Votes Flowing</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-full border-4 border-[#3b368c]/10 flex items-center justify-center">
                                    <ShieldCheck size={20} className="text-[#3b368c]" />
                                </div>
                                <div>
                                    <p className="text-xl font-black text-[#1e1e2d] tracking-tight">100%</p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Integrity Verified</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-gray-50">
                            <div className="flex items-center gap-2 text-[10px] font-black text-[#3b368c] uppercase tracking-widest">
                                <ShieldCheck size={12} />
                                <span>Secured by Blockchain</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


"use client";

import { trpc } from "@/trpc/client";
import Link from "next/link";
import { toast } from "sonner";
import {
    PlusCircle,
    Settings,
    Play,
    StopCircle,
    Trash2,
    Eye,
    Calendar,
    Search,
    Filter,
} from "lucide-react";
import { useState } from "react";

export default function AdminDashboardPage() {
    const { data: elections, isLoading, refetch } = trpc.election.getAll.useQuery();

    const updateStatus = trpc.election.updateStatus.useMutation({
        onSuccess: () => {
            refetch();
            toast.success("Election status updated!");
        },
        onError: (err) => toast.error(err.message),
    });

    const deleteElection = trpc.election.delete.useMutation({
        onSuccess: () => {
            refetch();
            toast.success("Election deleted!");
        },
        onError: (err) => toast.error(err.message),
    });

    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const handleStatusChange = (id: string, status: "upcoming" | "ongoing" | "completed") => {
        updateStatus.mutate({ id, status });
    };

    const filteredElections = elections?.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8 max-w-[1200px] mx-auto pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-[#1e1e2d] tracking-tight">Admin Dashboard</h1>
                    <p className="text-sm font-medium text-gray-400 mt-1">
                        Control center for all campus elections
                    </p>
                </div>
                <Link
                    href="/admin/elections/new"
                    className="flex items-center justify-center gap-2 bg-[#3b368c] text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-[#3b368c]/20 hover:bg-[#2e2a77] hover:-translate-y-0.5 transition-all text-sm"
                >
                    <PlusCircle size={18} />
                    Create Election
                </Link>
            </div>

            {/* Stats / Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search elections..."
                        className="w-full bg-white border border-gray-100 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3b368c]/10 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total</span>
                    <span className="text-lg font-black text-[#1e1e2d]">{elections?.length || 0}</span>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-20 bg-white rounded-2xl border border-gray-100 animate-pulse shadow-sm" />
                    ))}
                </div>
            ) : filteredElections && filteredElections.length > 0 ? (
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-50 uppercase text-[10px] font-black text-gray-400 tracking-[0.2em]">
                                    <th className="px-8 py-5">Election Detail</th>
                                    <th className="px-6 py-5">Status</th>
                                    <th className="px-6 py-5 hidden md:table-cell">Duration</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredElections.map((election) => (
                                    <tr key={election.id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="font-bold text-[#1e1e2d] text-base group-hover:text-[#3b368c] transition-colors">
                                                {election.title}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1 max-w-[300px] truncate">
                                                {election.description || "No description provided"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-sm">
                                            <div className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${election.status === "ongoing"
                                                    ? "bg-green-50 text-green-600 border-green-100"
                                                    : election.status === "completed"
                                                        ? "bg-gray-50 text-gray-500 border-gray-200"
                                                        : "bg-blue-50 text-blue-600 border-blue-100"
                                                }`}>
                                                {election.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 hidden md:table-cell">
                                            <div className="text-xs font-bold text-[#1e1e2d]">
                                                {election.startTime ? new Date(election.startTime).toLocaleDateString() : "TBA"}
                                            </div>
                                            <div className="text-[10px] text-gray-400 mt-0.5">
                                                {election.endTime ? `until ${new Date(election.endTime).toLocaleDateString()}` : "Manual close"}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end gap-2">
                                                {election.status === "upcoming" && (
                                                    <button
                                                        onClick={() => handleStatusChange(election.id, "ongoing")}
                                                        className="p-2.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors shadow-sm"
                                                        title="Start Election"
                                                    >
                                                        <Play size={16} fill="currentColor" />
                                                    </button>
                                                )}
                                                {election.status === "ongoing" && (
                                                    <button
                                                        onClick={() => handleStatusChange(election.id, "completed")}
                                                        className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors shadow-sm"
                                                        title="End Election"
                                                    >
                                                        <StopCircle size={16} fill="currentColor" />
                                                    </button>
                                                )}
                                                <Link
                                                    href={`/admin/elections/${election.id}`}
                                                    className="p-2.5 rounded-xl bg-gray-50 text-[#1e1e2d] hover:bg-gray-100 transition-colors shadow-sm"
                                                    title="Settings"
                                                >
                                                    <Settings size={16} />
                                                </Link>
                                                <Link
                                                    href={`/results?election=${election.id}`}
                                                    className="p-2.5 rounded-xl bg-[#f0f0ff] text-[#3b368c] hover:bg-[#e4e4fc] transition-colors shadow-sm"
                                                    title="Results"
                                                >
                                                    <Eye size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => setConfirmDelete(election.id)}
                                                    className="p-2.5 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition-all shadow-sm"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-16 md:p-24 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center text-gray-200 mb-6">
                        <Calendar size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-[#1e1e2d] mb-2">No elections found</h3>
                    <p className="text-sm font-medium text-gray-400 max-w-[300px] mb-8">
                        {searchTerm ? "No results match your search query." : "Ready to start the voting season? Create your first election."}
                    </p>
                    <Link
                        href="/admin/elections/new"
                        className="bg-[#3b368c] text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-[#3b368c]/20 hover:bg-[#2e2a77] transition-all text-sm"
                    >
                        Create New Election
                    </Link>
                </div>
            )}

            {/* Reusable Delete Modal */}
            {confirmDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl scale-in-center overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-2 bg-red-600 opacity-20" />
                        <h3 className="text-xl font-black text-[#1e1e2d] mb-2">Delete Election?</h3>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8">
                            This action is permanent and will destroy all associated categories, candidates, and casted votes. Are you absolutely certain?
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="flex-1 py-3.5 rounded-2xl bg-gray-50 text-gray-600 font-bold hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    deleteElection.mutate({ id: confirmDelete });
                                    setConfirmDelete(null);
                                }}
                                className="flex-1 py-3.5 rounded-2xl bg-red-600 text-white font-bold shadow-lg shadow-red-600/20 hover:bg-red-700 transition-colors"
                            >
                                Delete Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


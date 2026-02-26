"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { ArrowLeft, PlusCircle, Layout, Calendar, Type, AlignLeft } from "lucide-react";
import Link from "next/link";

export default function CreateElectionPage() {
    const router = useRouter();
    const createElection = trpc.election.create.useMutation({
        onSuccess: (election) => {
            toast.success("Election created successfully!");
            router.push(`/admin/elections/${election.id}`);
        },
        onError: (err) => toast.error(err.message),
    });

    const [form, setForm] = useState({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.title) {
            toast.error("Please fill in election title");
            return;
        }

        if (form.startTime && form.endTime && new Date(form.endTime) <= new Date(form.startTime)) {
            toast.error("End time must be after start time");
            return;
        }

        createElection.mutate({
            title: form.title,
            description: form.description,
            startTime: form.startTime ? new Date(form.startTime).toISOString() : undefined,
            endTime: form.endTime ? new Date(form.endTime).toISOString() : undefined,
        });
    };

    return (
        <div className="p-4 md:p-8 max-w-[800px] mx-auto pb-20">
            {/* Back Button */}
            <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#3b368c] transition-colors mb-8 group"
            >
                <div className="p-2 rounded-xl bg-white border border-gray-100 group-hover:border-[#e4e4fc] group-hover:bg-[#f0f0ff] transition-all shadow-sm">
                    <ArrowLeft size={16} />
                </div>
                Back to Dashboard
            </Link>

            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-extrabold text-[#1e1e2d] tracking-tight">Create New Election</h1>
                <p className="text-sm font-medium text-gray-400 mt-1">
                    Set the foundation for your next democratic event on campus.
                </p>
            </div>

            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden p-8 md:p-12 relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#3b368c] via-[#a5b4fc] to-[#3b368c]" />

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Title Input */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                            <Type size={14} className="text-[#3b368c]" />
                            Election Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Student Council Election 2026"
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-[#1e1e2d] focus:outline-none focus:ring-2 focus:ring-[#3b368c]/10 focus:bg-white transition-all"
                            value={form.title}
                            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                            required
                        />
                    </div>

                    {/* Description Input */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                            <AlignLeft size={14} className="text-[#3b368c]" />
                            Description
                        </label>
                        <textarea
                            placeholder="Provide details about the election, eligible voters, and positions..."
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-medium text-[#1e1e2d] focus:outline-none focus:ring-2 focus:ring-[#3b368c]/10 focus:bg-white transition-all min-h-[120px] resize-none"
                            value={form.description}
                            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        />
                    </div>

                    {/* Schedule Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                                <Calendar size={14} className="text-[#3b368c]" />
                                Start Time
                            </label>
                            <input
                                type="datetime-local"
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-[#1e1e2d] focus:outline-none focus:ring-2 focus:ring-[#3b368c]/10 focus:bg-white transition-all"
                                value={form.startTime}
                                onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                                <Calendar size={14} className="text-red-400" />
                                End Time
                            </label>
                            <input
                                type="datetime-local"
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-[#1e1e2d] focus:outline-none focus:ring-2 focus:ring-[#3b368c]/10 focus:bg-white transition-all"
                                value={form.endTime}
                                onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            className="w-full bg-[#3b368c] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-[#3b368c]/20 hover:bg-[#2e2a77] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-3"
                            disabled={createElection.isPending}
                        >
                            {createElection.isPending ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <PlusCircle size={20} />
                                    Launch Election
                                </>
                            )}
                        </button>
                        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-6 italic">
                            * You will be able to add categories and candidates in the next step
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}


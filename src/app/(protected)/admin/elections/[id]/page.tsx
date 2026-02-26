"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    PlusCircle,
    Trash2,
    Users,
    Upload,
    ChevronDown,
    ChevronUp,
    LayoutDashboard,
    Trophy,
    UserPlus,
} from "lucide-react";
import { uploadCandidatePhoto } from "@/lib/supabase";

export default function ElectionBuilderPage() {
    const params = useParams();
    const electionId = params.id as string;

    const { data: election } = trpc.election.getById.useQuery({ id: electionId });
    const {
        data: categories,
        isLoading: categoriesLoading,
        refetch: refetchCategories,
    } = trpc.category.getByElection.useQuery({ electionId });

    const createCategory = trpc.category.create.useMutation({
        onSuccess: () => {
            refetchCategories();
            setCategoryForm({ title: "", maxVotes: 1 });
            toast.success("Category added!");
        },
        onError: (err) => toast.error(err.message),
    });

    const deleteCategory = trpc.category.delete.useMutation({
        onSuccess: () => {
            refetchCategories();
            toast.success("Category deleted!");
        },
        onError: (err) => toast.error(err.message),
    });

    const [categoryForm, setCategoryForm] = useState({ title: "", maxVotes: 1 });
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryForm.title) return;
        createCategory.mutate({
            electionId,
            title: categoryForm.title,
            maxVotes: categoryForm.maxVotes,
        });
    };

    return (
        <div className="p-4 md:p-8 max-w-[1000px] mx-auto pb-20">
            {/* Navigation */}
            <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#3b368c] transition-colors mb-8 group"
            >
                <div className="p-2 rounded-xl bg-white border border-gray-100 group-hover:border-[#e4e4fc] group-hover:bg-[#f0f0ff] transition-all shadow-sm">
                    <ArrowLeft size={16} />
                </div>
                Back to Dashboard
            </Link>

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-[#1e1e2d] tracking-tight truncate max-w-[500px]">
                        {election?.title || "Election Builder"}
                    </h1>
                    <p className="text-sm font-medium text-gray-400 mt-1">
                        Configure categories and candidate profiles for this election.
                    </p>
                </div>
                <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${election?.status === "ongoing"
                        ? "bg-green-50 text-green-600 border-green-100"
                        : "bg-blue-50 text-blue-600 border-blue-100"
                    }`}>
                    {election?.status || "Loading..."}
                </div>
            </div>

            {/* Add Category Card */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden p-6 md:p-8 mb-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-[#f0f0ff] flex items-center justify-center text-[#3b368c]">
                        <LayoutDashboard size={20} />
                    </div>
                    <h3 className="text-lg font-black text-[#1e1e2d]">Add Category</h3>
                </div>

                <form onSubmit={handleAddCategory} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:flex-1 space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category Title</label>
                        <input
                            type="text"
                            placeholder="e.g. President, General Secretary..."
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-[#1e1e2d] focus:outline-none focus:ring-2 focus:ring-[#3b368c]/10 transition-all focus:bg-white"
                            value={categoryForm.title}
                            onChange={(e) => setCategoryForm((f) => ({ ...f, title: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="w-full md:w-32 space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Max Votes</label>
                        <input
                            type="number"
                            min={1}
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-[#1e1e2d] focus:outline-none focus:ring-2 focus:ring-[#3b368c]/10 transition-all focus:bg-white"
                            value={categoryForm.maxVotes}
                            onChange={(e) => setCategoryForm((f) => ({ ...f, maxVotes: parseInt(e.target.value) || 1 }))}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full md:w-auto h-[54px] px-8 bg-[#3b368c] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#2e2a77] transition-all disabled:opacity-50 shadow-lg shadow-[#3b368c]/10"
                        disabled={createCategory.isPending}
                    >
                        {createCategory.isPending ? "Adding..." : "Add"}
                    </button>
                </form>
            </div>

            {/* List of Categories */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Active Categories</h3>
                    <div className="text-[10px] font-bold text-gray-300">Total: {categories?.length || 0}</div>
                </div>

                {categoriesLoading ? (
                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="h-24 bg-white rounded-[32px] border border-gray-100 animate-pulse" />
                        ))}
                    </div>
                ) : categories && categories.length > 0 ? (
                    categories.map((category) => (
                        <CategoryCard
                            key={category.id}
                            category={category}
                            expanded={expandedCategory === category.id}
                            onToggle={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                            onDelete={() => deleteCategory.mutate({ id: category.id })}
                        />
                    ))
                ) : (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[32px] p-12 text-center">
                        <Users size={32} className="mx-auto text-gray-300 mb-4" />
                        <h4 className="text-[#1e1e2d] font-bold mb-1">No categories defined</h4>
                        <p className="text-gray-400 text-xs">Start by adding a category like "President" using the form above.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function CategoryCard({
    category,
    expanded,
    onToggle,
    onDelete,
}: {
    category: { id: string; title: string; maxVotes: number };
    expanded: boolean;
    onToggle: () => void;
    onDelete: () => void;
}) {
    const {
        data: candidates,
        isLoading,
        refetch: refetchCandidates,
    } = trpc.candidate.getByCategory.useQuery({ categoryId: category.id });

    const createCandidate = trpc.candidate.create.useMutation({
        onSuccess: () => {
            refetchCandidates();
            setCandidateForm({ name: "", bio: "", photoUrl: "" });
            toast.success("Candidate added!");
        },
        onError: (err) => toast.error(err.message),
    });

    const deleteCandidate = trpc.candidate.delete.useMutation({
        onSuccess: () => {
            refetchCandidates();
            toast.success("Candidate removed!");
        },
        onError: (err) => toast.error(err.message),
    });

    const [candidateForm, setCandidateForm] = useState({
        name: "",
        bio: "",
        photoUrl: "",
    });
    const [uploading, setUploading] = useState(false);

    const handleAddCandidate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!candidateForm.name) return;
        createCandidate.mutate({
            categoryId: category.id,
            name: candidateForm.name,
            bio: candidateForm.bio,
            photoUrl: candidateForm.photoUrl,
        });
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const url = await uploadCandidatePhoto(file, category.id);
            setCandidateForm((f) => ({ ...f, photoUrl: url }));
            toast.success("Photo uploaded!");
        } catch (err: any) {
            toast.error(err.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={`bg-white rounded-[32px] border transition-all duration-300 ${expanded ? "border-[#3b368c]/20 shadow-xl shadow-[#3b368c]/5 ring-1 ring-[#3b368c]/5" : "border-gray-100 shadow-sm"}`}>
            {/* Category Header Bar */}
            <div
                className="px-6 md:px-8 py-6 flex items-center justify-between cursor-pointer"
                onClick={onToggle}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${expanded ? "bg-[#3b368c] text-white" : "bg-gray-50 text-gray-400 group-hover:bg-gray-100"}`}>
                        <Trophy size={18} />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-[#1e1e2d]">{category.title}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{candidates?.length || 0} Candidates</span>
                            <span className="w-1 h-1 rounded-full bg-gray-200" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Max {category.maxVotes} Vote(s)</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-2.5 rounded-xl hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
                        title="Delete Category"
                    >
                        <Trash2 size={16} />
                    </button>
                    <div className={`p-2 rounded-xl transition-colors ${expanded ? "text-[#3b368c]" : "text-gray-300"}`}>
                        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            {expanded && (
                <div className="px-6 md:px-8 pb-8 animate-in slide-in-from-top-2 duration-300">
                    <div className="h-px bg-gray-50 mb-8" />

                    {/* Add Candidate Form */}
                    <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-6 md:p-8 mb-10">
                        <div className="flex items-center gap-2 mb-6">
                            <UserPlus size={16} className="text-[#3b368c]" />
                            <h4 className="text-xs font-black text-[#1e1e2d] uppercase tracking-[0.2em]">Register Candidate</h4>
                        </div>

                        <form onSubmit={handleAddCandidate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                <input
                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-[#1e1e2d] focus:outline-none focus:ring-2 focus:ring-[#3b368c]/10"
                                    type="text"
                                    placeholder="e.g. Rahul Sharma"
                                    value={candidateForm.name}
                                    onChange={(e) => setCandidateForm((f) => ({ ...f, name: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bio / Department</label>
                                <input
                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-[#1e1e2d] focus:outline-none focus:ring-2 focus:ring-[#3b368c]/10"
                                    type="text"
                                    placeholder="e.g. S6 CSE-A"
                                    value={candidateForm.bio}
                                    onChange={(e) => setCandidateForm((f) => ({ ...f, bio: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2 lg:col-span-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Candidate Portrait</label>
                                <div className="flex items-center gap-3">
                                    <label className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-gray-600 cursor-pointer hover:bg-gray-100 transition-all">
                                        <Upload size={14} />
                                        {uploading ? "Uploading..." : "Click to Upload"}
                                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                                    </label>
                                    {candidateForm.photoUrl && (
                                        <img src={candidateForm.photoUrl} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                                    )}
                                </div>
                            </div>
                            <div className="md:col-span-2 lg:col-span-3 pt-2">
                                <button
                                    type="submit"
                                    className="w-full bg-[#3b368c] text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#2e2a77] transition-all shadow-lg shadow-[#3b368c]/10 disabled:opacity-50"
                                    disabled={createCandidate.isPending || uploading}
                                >
                                    Add Candidate to {category.title}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Candidates Gallery */}
                    <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 ml-1">Registered Nominees</div>

                        {isLoading ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-50 rounded-2xl animate-pulse" />)}
                            </div>
                        ) : candidates && candidates.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                                {candidates.map((candidate) => (
                                    <div key={candidate.id} className="group relative bg-white border border-gray-100 rounded-2xl p-4 flex flex-col items-center text-center hover:shadow-lg transition-all hover:-translate-y-1">
                                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-gray-50 mb-4 shadow-sm relative">
                                            {candidate.photoUrl ? (
                                                <img src={candidate.photoUrl} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-50 flex items-center justify-center font-black text-2xl text-gray-200">
                                                    {candidate.name.charAt(0)}
                                                </div>
                                            )}
                                            <button
                                                onClick={() => deleteCandidate.mutate({ id: candidate.id })}
                                                className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]"
                                            >
                                                <Trash2 size={24} />
                                            </button>
                                        </div>
                                        <h5 className="text-sm font-black text-[#1e1e2d] truncate w-full px-2">{candidate.name}</h5>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1 truncate w-full px-2">{candidate.bio}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-10 text-center text-gray-300 font-medium text-xs italic bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
                                No candidates registered yet.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}


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
        <div className="page-content">
            <Link
                href="/admin"
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    color: "var(--primary)",
                    fontSize: 14,
                    fontWeight: 500,
                    textDecoration: "none",
                    marginBottom: 20,
                }}
            >
                <ArrowLeft size={16} />
                Back to Admin
            </Link>

            <h1 className="page-title">{election?.title || "Election Builder"}</h1>
            <p className="page-subtitle">
                Add categories and candidates to this election
            </p>

            {/* Add Category Form */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-header">
                    <h3
                        style={{
                            fontSize: 16,
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        <PlusCircle size={18} color="var(--primary)" />
                        Add Category
                    </h3>
                </div>
                <div className="card-body">
                    <form
                        onSubmit={handleAddCategory}
                        style={{ display: "flex", gap: 12, alignItems: "flex-end" }}
                    >
                        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                            <label className="form-label">Category Title</label>
                            <input
                                className="form-input"
                                type="text"
                                placeholder="e.g. President, Vice President..."
                                value={categoryForm.title}
                                onChange={(e) =>
                                    setCategoryForm((f) => ({ ...f, title: e.target.value }))
                                }
                                required
                            />
                        </div>
                        <div className="form-group" style={{ width: 120, marginBottom: 0 }}>
                            <label className="form-label">Max Votes</label>
                            <input
                                className="form-input"
                                type="number"
                                min={1}
                                value={categoryForm.maxVotes}
                                onChange={(e) =>
                                    setCategoryForm((f) => ({
                                        ...f,
                                        maxVotes: parseInt(e.target.value) || 1,
                                    }))
                                }
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={createCategory.isPending}
                            style={{ height: 42 }}
                        >
                            Add
                        </button>
                    </form>
                </div>
            </div>

            {/* Categories List */}
            {categoriesLoading ? (
                <div style={{ display: "grid", gap: 16 }}>
                    {[1, 2].map((i) => (
                        <div
                            key={i}
                            className="skeleton"
                            style={{ height: 80, borderRadius: 12 }}
                        />
                    ))}
                </div>
            ) : categories && categories.length > 0 ? (
                <div style={{ display: "grid", gap: 16 }}>
                    {categories.map((category) => (
                        <CategoryCard
                            key={category.id}
                            category={category}
                            expanded={expandedCategory === category.id}
                            onToggle={() =>
                                setExpandedCategory(
                                    expandedCategory === category.id ? null : category.id
                                )
                            }
                            onDelete={() => deleteCategory.mutate({ id: category.id })}
                        />
                    ))}
                </div>
            ) : (
                <div className="card">
                    <div className="empty-state" style={{ padding: 40 }}>
                        <div className="empty-state-icon">
                            <Users size={32} />
                        </div>
                        <div className="empty-state-title">No categories yet</div>
                        <div className="empty-state-desc">
                            Add categories like President, Vice President, etc.
                        </div>
                    </div>
                </div>
            )}
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
        <div className="card">
            <div
                className="card-header"
                style={{ cursor: "pointer" }}
                onClick={onToggle}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700 }}>
                            {category.title}
                        </h3>
                        <span
                            style={{
                                fontSize: 12,
                                color: "var(--text-muted)",
                                background: "var(--bg)",
                                padding: "2px 8px",
                                borderRadius: 4,
                            }}
                        >
                            {candidates?.length || 0} candidates
                        </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button
                            className="btn btn-sm btn-ghost"
                            style={{ color: "var(--danger)" }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                        >
                            <Trash2 size={14} />
                        </button>
                        {expanded ? (
                            <ChevronUp size={18} color="var(--text-muted)" />
                        ) : (
                            <ChevronDown size={18} color="var(--text-muted)" />
                        )}
                    </div>
                </div>
            </div>

            {expanded && (
                <div className="card-body">
                    {/* Add Candidate Form */}
                    <form
                        onSubmit={handleAddCandidate}
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 12,
                            marginBottom: 20,
                            padding: 16,
                            background: "var(--bg)",
                            borderRadius: 10,
                        }}
                    >
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Candidate Name</label>
                            <input
                                className="form-input"
                                type="text"
                                placeholder="Full name"
                                value={candidateForm.name}
                                onChange={(e) =>
                                    setCandidateForm((f) => ({ ...f, name: e.target.value }))
                                }
                                required
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Department / Bio</label>
                            <input
                                className="form-input"
                                type="text"
                                placeholder="e.g. Computer Science"
                                value={candidateForm.bio}
                                onChange={(e) =>
                                    setCandidateForm((f) => ({ ...f, bio: e.target.value }))
                                }
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Photo</label>
                            <div style={{ display: "flex", gap: 8 }}>
                                <label
                                    className="btn btn-sm btn-outline"
                                    style={{ cursor: "pointer" }}
                                >
                                    <Upload size={14} />
                                    {uploading ? "Uploading..." : "Upload"}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        onChange={handlePhotoUpload}
                                        disabled={uploading}
                                    />
                                </label>
                                {candidateForm.photoUrl && (
                                    <img
                                        src={candidateForm.photoUrl}
                                        alt="Preview"
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: "50%",
                                            objectFit: "cover",
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "flex-end",
                                marginBottom: 0,
                            }}
                        >
                            <button
                                type="submit"
                                className="btn btn-primary btn-sm"
                                disabled={createCandidate.isPending}
                            >
                                <PlusCircle size={14} />
                                Add Candidate
                            </button>
                        </div>
                    </form>

                    {/* Candidates List */}
                    {candidates && candidates.length > 0 ? (
                        <div className="candidates-grid">
                            {candidates.map((candidate) => (
                                <div
                                    key={candidate.id}
                                    className="candidate-card"
                                    style={{ cursor: "default" }}
                                >
                                    <div className="candidate-avatar-ring ring-blue">
                                        <div className="candidate-avatar">
                                            {candidate.photoUrl ? (
                                                <img
                                                    src={candidate.photoUrl}
                                                    alt={candidate.name}
                                                />
                                            ) : (
                                                <span className="candidate-avatar-fallback">
                                                    {candidate.name.charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="candidate-name">{candidate.name}</div>
                                    <div className="candidate-dept">{candidate.bio}</div>
                                    <button
                                        className="btn btn-sm btn-ghost"
                                        style={{ color: "var(--danger)", marginTop: 4 }}
                                        onClick={() =>
                                            deleteCandidate.mutate({ id: candidate.id })
                                        }
                                    >
                                        <Trash2 size={12} />
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p
                            style={{
                                textAlign: "center",
                                color: "var(--text-muted)",
                                fontSize: 13,
                                padding: 20,
                            }}
                        >
                            No candidates added yet
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

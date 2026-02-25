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
} from "lucide-react";
import { useState } from "react";

export default function AdminDashboardPage() {
    const { data: elections, isLoading, refetch } =
        trpc.election.getAll.useQuery();
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

    const handleStatusChange = (id: string, status: "upcoming" | "ongoing" | "completed") => {
        updateStatus.mutate({ id, status });
    };

    return (
        <div className="page-content">
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 28,
                }}
            >
                <div>
                    <h1 className="page-title">Admin Dashboard</h1>
                    <p className="page-subtitle" style={{ marginBottom: 0 }}>
                        Manage elections, categories, and candidates
                    </p>
                </div>
                <Link href="/admin/elections/new" className="btn btn-primary">
                    <PlusCircle size={18} />
                    Create Election
                </Link>
            </div>

            {isLoading ? (
                <div style={{ display: "grid", gap: 16 }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />
                    ))}
                </div>
            ) : elections && elections.length > 0 ? (
                <div className="card">
                    <div className="card-body" style={{ padding: 0 }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Election</th>
                                    <th>Status</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {elections.map((election) => (
                                    <tr key={election.id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{election.title}</div>
                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    color: "var(--text-muted)",
                                                    marginTop: 2,
                                                }}
                                            >
                                                {election.description || "No description"}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge badge-${election.status}`}>
                                                {election.status.charAt(0).toUpperCase() +
                                                    election.status.slice(1)}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: 13, color: "var(--text-muted)" }}>
                                            {new Date(election.startTime).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </td>
                                        <td style={{ fontSize: 13, color: "var(--text-muted)" }}>
                                            {new Date(election.endTime).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", gap: 6 }}>
                                                {election.status === "upcoming" && (
                                                    <button
                                                        className="btn btn-sm btn-success"
                                                        onClick={() =>
                                                            handleStatusChange(election.id, "ongoing")
                                                        }
                                                        title="Start Election"
                                                    >
                                                        <Play size={14} />
                                                    </button>
                                                )}
                                                {election.status === "ongoing" && (
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() =>
                                                            handleStatusChange(election.id, "completed")
                                                        }
                                                        title="End Election"
                                                    >
                                                        <StopCircle size={14} />
                                                    </button>
                                                )}
                                                <Link
                                                    href={`/admin/elections/${election.id}`}
                                                    className="btn btn-sm btn-outline"
                                                    title="Manage"
                                                >
                                                    <Settings size={14} />
                                                </Link>
                                                <Link
                                                    href={`/results?election=${election.id}`}
                                                    className="btn btn-sm btn-ghost"
                                                    title="View Results"
                                                >
                                                    <Eye size={14} />
                                                </Link>
                                                <button
                                                    className="btn btn-sm btn-ghost"
                                                    style={{ color: "var(--danger)" }}
                                                    onClick={() => setConfirmDelete(election.id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
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
                <div className="card">
                    <div className="empty-state" style={{ padding: 60 }}>
                        <div className="empty-state-icon">
                            <Calendar size={32} />
                        </div>
                        <div className="empty-state-title">No elections yet</div>
                        <div className="empty-state-desc">
                            Create your first election to get started.
                        </div>
                        <Link
                            href="/admin/elections/new"
                            className="btn btn-primary"
                            style={{ marginTop: 16 }}
                        >
                            <PlusCircle size={18} />
                            Create Election
                        </Link>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {confirmDelete && (
                <div
                    className="modal-overlay"
                    onClick={() => setConfirmDelete(null)}
                >
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="modal-title">Delete Election</h3>
                        <p className="modal-desc">
                            Are you sure you want to delete this election? This will also
                            delete all associated categories, candidates, and votes. This
                            action cannot be undone.
                        </p>
                        <div className="modal-actions">
                            <button
                                className="btn btn-outline"
                                onClick={() => setConfirmDelete(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={() => {
                                    deleteElection.mutate({ id: confirmDelete });
                                    setConfirmDelete(null);
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

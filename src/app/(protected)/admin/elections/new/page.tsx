"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { ArrowLeft, PlusCircle } from "lucide-react";
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

        if (!form.title || !form.startTime || !form.endTime) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (new Date(form.endTime) <= new Date(form.startTime)) {
            toast.error("End time must be after start time");
            return;
        }

        createElection.mutate({
            title: form.title,
            description: form.description,
            startTime: new Date(form.startTime).toISOString(),
            endTime: new Date(form.endTime).toISOString(),
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

            <h1 className="page-title">Create Election</h1>
            <p className="page-subtitle">
                Set up a new election with title, description, and schedule.
            </p>

            <div className="card" style={{ maxWidth: 600 }}>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">
                                Election Title <span style={{ color: "var(--danger)" }}>*</span>
                            </label>
                            <input
                                className="form-input"
                                type="text"
                                placeholder="e.g. Student Council Election 2026"
                                value={form.title}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, title: e.target.value }))
                                }
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-input"
                                placeholder="Brief description of the election..."
                                value={form.description}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, description: e.target.value }))
                                }
                            />
                        </div>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 16,
                            }}
                        >
                            <div className="form-group">
                                <label className="form-label">
                                    Start Time <span style={{ color: "var(--danger)" }}>*</span>
                                </label>
                                <input
                                    className="form-input"
                                    type="datetime-local"
                                    value={form.startTime}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, startTime: e.target.value }))
                                    }
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    End Time <span style={{ color: "var(--danger)" }}>*</span>
                                </label>
                                <input
                                    className="form-input"
                                    type="datetime-local"
                                    value={form.endTime}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, endTime: e.target.value }))
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            style={{ width: "100%", marginTop: 8 }}
                            disabled={createElection.isPending}
                        >
                            {createElection.isPending ? (
                                <>
                                    <div
                                        className="spinner"
                                        style={{ width: 18, height: 18, borderWidth: 2 }}
                                    />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <PlusCircle size={18} />
                                    Create Election
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

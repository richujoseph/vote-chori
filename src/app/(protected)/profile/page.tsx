"use client";

import { trpc } from "@/trpc/client";
import { User, Mail, Shield, Calendar, BookOpen, GraduationCap, AlertTriangle, Trophy } from "lucide-react";
import { getInitials } from "@/lib/utils";

export default function ProfilePage() {
    const { data: profile, isLoading } = trpc.auth.me.useQuery();
    const user = profile;
    const dbConnected = (profile as any)?.dbConnected ?? true;

    return (
        <div className="p-4 md:p-8 max-w-[1000px] mx-auto pb-20">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-extrabold text-[#1e1e2d] tracking-tight">Profile Setup</h1>
                <p className="text-sm font-medium text-gray-400 mt-1">Manage your academic and account information</p>
            </div>

            {!isLoading && !dbConnected && (
                <div className="bg-red-50 text-red-700 px-6 py-4 rounded-2xl flex items-center gap-4 border border-red-100 mb-8 font-semibold text-sm shadow-sm">
                    <AlertTriangle size={20} className="shrink-0" />
                    <span>Database connection failed. Showing limited profile information. features may be disabled.</span>
                </div>
            )}

            <div className="bg-white rounded-2xl md:rounded-[32px] p-6 md:p-12 shadow-sm border border-gray-100">

                {/* Header: Avatar + Identity */}
                <div className="flex flex-col md:flex-row shadow-[0_4px_30px_rgba(59,54,140,0.03)] items-center md:items-start gap-8 border-b border-gray-50 pb-12 mb-12">
                    <div className="w-32 h-32 rounded-[28px] bg-gradient-to-br from-[#3b368c] to-[#2e2a77] flex items-center justify-center text-white text-4xl font-black shadow-lg shadow-[#3b368c]/30 overflow-hidden shrink-0 border-4 border-white">
                        {isLoading ? (
                            <div className="w-full h-full bg-gray-200 animate-pulse" />
                        ) : (user?.image && user.image.startsWith('http')) ? (
                            <img src={user.image} alt={user.name || ""} className="w-full h-full object-cover" />
                        ) : (
                            <span>
                                {getInitials(user?.name)}
                            </span>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start justify-center pt-2">
                        {isLoading ? (
                            <>
                                <div className="w-48 h-10 bg-gray-100 rounded-lg animate-pulse mb-3" />
                                <div className="w-32 h-6 bg-gray-100 rounded-full animate-pulse" />
                            </>
                        ) : (
                            <>
                                <h2 className="text-[32px] leading-tight font-extrabold text-[#1e1e2d] tracking-tight mb-4">
                                    {user?.name}
                                </h2>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${user?.role === "admin"
                                        ? "bg-purple-100 text-purple-700 border border-purple-200"
                                        : "bg-[#e4e4fc] text-[#3b368c] border border-[#a5b4fc]/30"
                                        }`}>
                                        {user?.role === "admin" ? "Administrator" : "Student"}
                                    </span>
                                    {user?.department && (
                                        <span className="font-semibold text-gray-500 text-sm bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100">
                                            {user.department}
                                        </span>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Information Grid */}
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12 min-w-0">

                    {/* Personal Info */}
                    <div className="bg-gray-50/50 p-8 rounded-[24px] border border-gray-100/50 min-w-0">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-3">
                            <User size={16} /> Personal Details
                        </h3>

                        <div className="space-y-8">
                            {isLoading ? (
                                <>
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex gap-4">
                                            <div className="w-12 h-12 bg-gray-200 rounded-2xl animate-pulse shrink-0" />
                                            <div className="flex-1 space-y-2 py-1">
                                                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
                                                <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <>
                                    <InfoRow icon={<User size={20} />} label="Full Name" value={user?.name} />
                                    <InfoRow icon={<Mail size={20} />} label="Email Address" value={user?.email} />
                                    <InfoRow
                                        icon={<Shield size={20} />}
                                        label="Account Role"
                                        value={
                                            <div className="flex items-center gap-2">
                                                <span className="capitalize">{user?.role}</span>
                                                {!dbConnected && (
                                                    <span className="bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                                                        Disconnected
                                                    </span>
                                                )}
                                            </div>
                                        }
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Academic Info */}
                    <div className="bg-gray-50/50 p-8 rounded-[24px] border border-gray-100/50 min-w-0">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-3">
                            <GraduationCap size={16} /> Academic Status
                        </h3>

                        <div className="space-y-8">
                            {isLoading ? (
                                <>
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex gap-4">
                                            <div className="w-12 h-12 bg-gray-200 rounded-2xl animate-pulse shrink-0" />
                                            <div className="flex-1 space-y-2 py-1">
                                                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
                                                <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <>
                                    <InfoRow
                                        icon={<BookOpen size={20} />}
                                        label="Department"
                                        value={user?.department || <span className="text-gray-300 italic">Not set</span>}
                                    />
                                    <InfoRow
                                        icon={<Trophy size={20} />}
                                        label="Academic Batch"
                                        value={user?.batch || <span className="text-gray-300 italic">Not set</span>}
                                    />
                                    <InfoRow
                                        icon={<Calendar size={20} />}
                                        label="Member Since"
                                        value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                                            day: "numeric", month: "long", year: "numeric"
                                        }) : "-"}
                                    />
                                </>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode, label: string, value?: React.ReactNode }) {
    return (
        <div className="flex items-center gap-5 min-w-0 w-full overflow-hidden">
            <div className="w-[52px] h-[52px] rounded-[18px] bg-white flex items-center justify-center text-[#3b368c] shadow-sm border border-gray-100/60 shrink-0">
                {icon}
            </div>
            <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide truncate">
                    {label}
                </span>
                <div className="text-[15px] font-bold text-[#1e1e2d] truncate w-full block break-all">
                    {value || "—"}
                </div>
            </div>
        </div>
    );
}



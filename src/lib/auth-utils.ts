import { createClient } from "./supabase/server";

export async function getRequiredSession() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("Unauthorized");
    }
    return { user };
}

export async function getOptionalSession() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user ? { user } : null;
}

export function extractStudentDetails(email: string) {
    const localPart = email.split('@')[0];
    const match = localPart.match(/^(\d{2})([a-zA-Z]{1,3})(\d{3,4})$/i);

    if (match) {
        const batchStart = `20${match[1]}`;
        const deptCode = match[2].toUpperCase();

        const depts: Record<string, string> = {
            'CS': 'Computer Science',
            'EC': 'Electronics & Communication',
            'EE': 'Electrical & Electronics',
            'ME': 'Mechanical Engineering',
            'CE': 'Civil Engineering',
            'AD': 'Artificial Intelligence & Data Science',
            'CY': 'Cyber Security',
        };

        return {
            batch: `${batchStart} - ${Number(batchStart) + 4}`,
            department: depts[deptCode] || deptCode,
        };
    }
    return {};
}

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
    const [localPart, domain] = email.toLowerCase().split('@');

    const yearMatch = localPart.match(/(20\d{2})/);

    const deptMatch = domain.match(/^([a-z]{1,3})\./);

    if (!yearMatch || !deptMatch) return {};

    const batchStart = Number(yearMatch[1]);
    const deptCode = deptMatch[1].toUpperCase();

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
        batch: `${batchStart}`,
        department: depts[deptCode] || deptCode,
    };
}
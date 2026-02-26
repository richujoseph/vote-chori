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
    const [localPart, domain] = email.split('@');
    if (!domain) return {};

    const subdomain = domain.split('.')[0];
    const details: { batch?: string; department?: string } = {};

    const depts: Record<string, string> = {
        'CS': 'Computer Science',
        'EC': 'Electronics & Communication',
        'EE': 'Electrical & Electronics',
        'ME': 'Mechanical Engineering',
        'CE': 'Civil Engineering',
        'AD': 'Artificial Intelligence & Data Science',
        'CY': 'Cyber Security',
    };

    // 1. Try to get department from subdomain (e.g., cy.sjcetpalai.ac.in)
    if (depts[subdomain.toUpperCase()]) {
        details.department = depts[subdomain.toUpperCase()];
    }

    // 2. Try to get batch from local part if it contains a 4-digit year (e.g., timstittus2027)
    const yearMatch = localPart.match(/\d{4}/);
    if (yearMatch) {
        details.batch = yearMatch[0];
    }

    // 3. Fallback/Original pattern (e.g., 22cs001)
    const patternMatch = localPart.match(/^(\d{2})([a-zA-Z]{1,3})(\d{3,4})$/i);
    if (patternMatch) {
        if (!details.batch) {
            const startYear = 2000 + parseInt(patternMatch[1]);
            details.batch = (startYear + 4).toString(); // Graduation year
        }
        if (!details.department) {
            const deptCode = patternMatch[2].toUpperCase();
            details.department = depts[deptCode] || deptCode;
        }
    }

    return details;
}

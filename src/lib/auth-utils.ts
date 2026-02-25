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

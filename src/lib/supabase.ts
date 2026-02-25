import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function uploadCandidatePhoto(
    file: File,
    candidateId: string
): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${candidateId}-${Date.now()}.${fileExt}`;
    const filePath = `candidate-photos/${fileName}`;

    const { error } = await supabase.storage
        .from("election-assets")
        .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
        });

    if (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }

    const {
        data: { publicUrl },
    } = supabase.storage.from("election-assets").getPublicUrl(filePath);

    return publicUrl;
}

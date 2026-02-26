import { createClient } from "./supabase/client";

export async function uploadCandidatePhoto(
    file: File,
    candidateId: string
): Promise<string> {
    const supabase = createClient();
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

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
const CONFIGURED = Boolean(url && key);

export const BUCKET = (import.meta.env.VITE_SUPABASE_STORAGE_BUCKET as string) || "uploads";

export async function uploadFile(
  file: File,
  folder: string = "waste-reports"
): Promise<string | null> {
  if (!CONFIGURED) {
    console.warn("File storage not configured — image upload skipped.");
    return null;
  }

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(url, key);
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (error) {
      console.error("Upload error:", error.message);
      return null;
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
    return urlData.publicUrl;
  } catch (err) {
    console.error("Storage error:", err);
    return null;
  }
}

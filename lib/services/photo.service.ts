import { createSupabaseClient } from "@/lib/supabase/client";

export interface Photo {
  id: string;
  session_id: string;
  event_id: string;
  file_path: string;
  created_at: string;
}

export async function createPhoto(
  sessionId: string,
  eventId: string,
  filePath: string,
): Promise<Photo | null> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("photos")
    .insert({
      session_id: sessionId,
      event_id: eventId,
      file_path: filePath,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("Create photo error:", error);
    return null;
  }

  return data;
}

export async function getPhotosBySession(sessionId: string): Promise<Photo[]> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("photos")
    .select("id, session_id, event_id, file_path, created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Get photos error:", error);
    return [];
  }

  return data ?? [];
}

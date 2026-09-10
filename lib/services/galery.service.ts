import { createSupabaseClient } from "@/lib/supabase/client";

export interface GalleryPhoto {
  id: string;
  session_id: string;
  event_id: string;
  file_path: string;
  created_at: string;
  guest_name: string;
}

export async function getGalleryPhotos(
  eventId: string,
): Promise<GalleryPhoto[]> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("photos")
    .select(
      `
      id,
      session_id,
      event_id,
      file_path,
      created_at,
      sessions (
        guest_name
      )
    `,
    )
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Get gallery photos error:", error);
    return [];
  }

  return (data ?? []).map((photo: any) => ({
    id: photo.id,
    session_id: photo.session_id,
    event_id: photo.event_id,
    file_path: photo.file_path,
    created_at: photo.created_at,
    guest_name: photo.sessions?.guest_name ?? "Tamu",
  }));
}

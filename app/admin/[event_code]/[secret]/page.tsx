import { createSupabaseServer } from "@/lib/supabase/server";
import { getGalleryPhotos, GalleryPhoto } from "@/lib/services/galery.service";

interface AdminTestPageProps {
  params: Promise<{
    event_code: string;
    secret: string;
  }>;
}

export default async function AdminTestPage({ params }: AdminTestPageProps) {
  const { event_code, secret } = await params;

  const ADMIN_SECRET = "rapoleondanhaura";

  const supabase = createSupabaseServer();

  const { data: event } = await supabase
    .from("events")
    .select("id, event_code, bride_name, groom_name")
    .eq("event_code", event_code)
    .single();

  if (!event) {
    return (
      <main style={{ padding: 40, fontFamily: "Arial" }}>
        <h1>EVENT TIDAK DITEMUKAN</h1>

        <p>
          <strong>Event Code:</strong> {event_code}
        </p>
      </main>
    );
  }

  let photos: GalleryPhoto[] = [];
  let galleryError: string | null = null;

  try {
    photos = await getGalleryPhotos(event.id);
  } catch (error: unknown) {
    galleryError = error instanceof Error ? error.message : String(error);
  }

  return (
    <main
      style={{
        padding: 40,
        fontFamily: "Arial",
        lineHeight: 1.8,
      }}
    >
      <h1>ADMIN STEP 3 TEST</h1>

      <p>
        <strong>Event Code:</strong> {event_code}
      </p>

      <p>
        <strong>Secret Match:</strong> {secret === ADMIN_SECRET ? "YES" : "NO"}
      </p>

      <hr />

      <p>
        <strong>Event:</strong> {event.bride_name} & {event.groom_name}
      </p>

      <p>
        <strong>Event ID:</strong> {event.id}
      </p>

      <p>
        <strong>Jumlah Foto:</strong> {photos.length}
      </p>

      <p>
        <strong>Gallery Error:</strong> {galleryError ?? "Tidak ada error"}
      </p>

      <hr />

      <h2>Data Foto</h2>

      {photos.length === 0 ? (
        <p>Tidak ada foto.</p>
      ) : (
        <pre
          style={{
            whiteSpace: "pre-wrap",
            background: "#f5f5f5",
            padding: 20,
            borderRadius: 10,
          }}
        >
          {JSON.stringify(photos, null, 2)}
        </pre>
      )}
    </main>
  );
}

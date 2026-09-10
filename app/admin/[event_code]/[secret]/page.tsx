import { createSupabaseServer } from "@/lib/supabase/server";

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

  const { data: event, error } = await supabase
    .from("events")
    .select("id, event_code, bride_name, groom_name")
    .eq("event_code", event_code)
    .single();

  return (
    <main
      style={{
        padding: 40,
        fontFamily: "Arial",
        lineHeight: 1.8,
      }}
    >
      <h1>ADMIN STEP 2 TEST</h1>

      <p>
        <strong>Event Code:</strong> {event_code}
      </p>

      <p>
        <strong>Secret:</strong> {secret}
      </p>

      <p>
        <strong>Secret Match:</strong> {secret === ADMIN_SECRET ? "YES" : "NO"}
      </p>

      <hr />

      <p>
        <strong>Event ditemukan:</strong> {event ? "YES" : "NO"}
      </p>

      <p>
        <strong>Event ID:</strong> {event?.id ?? "-"}
      </p>

      <p>
        <strong>Bride:</strong> {event?.bride_name ?? "-"}
      </p>

      <p>
        <strong>Groom:</strong> {event?.groom_name ?? "-"}
      </p>

      <p>
        <strong>Supabase Error:</strong> {error?.message ?? "Tidak ada error"}
      </p>
    </main>
  );
}

import { createSupabaseClient } from "@/lib/supabase/client";

export default async function Home() {
  const supabase = createSupabaseClient();

  const { data: events, error } = await supabase
    .from("events")
    .select("id, event_code, bride_name, groom_name");

  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-3xl font-bold">Wedding Camera</h1>
    </main>
  );
}

import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import WelcomeForm from "./WelcomeForm";

interface WeddingPageProps {
  params: Promise<{
    event_code: string;
  }>;
}

export default async function WeddingPage({ params }: WeddingPageProps) {
  const { event_code } = await params;

  const supabase = createSupabaseServer();

  const { data: event, error } = await supabase
    .from("events")
    .select("id, event_code, bride_name, groom_name, event_date, venue")
    .eq("event_code", event_code)
    .single();

  console.log("EVENT CODE:", event_code);

  console.log("EVENT DATA:", event);

  console.log("EVENT ERROR:", error);
  if (error || !event) {
    notFound();
  }

  return (
    <WelcomeForm
      eventId={event.id}
      eventCode={event.event_code}
      brideName={event.bride_name}
      groomName={event.groom_name}
    />
  );
}

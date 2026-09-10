import { createSupabaseClient } from "@/lib/supabase/client";
import { Event } from "@/types/event";

export async function getEventByCode(eventCode: string): Promise<Event | null> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("events")
    .select("id, event_code, bride_name, groom_name, event_date, venue")
    .eq("event_code", eventCode)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

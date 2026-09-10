import { createSupabaseClient } from "@/lib/supabase/client";
import { Session } from "@/types/session";

export async function getSession(
  eventId: string,
  deviceId: string,
): Promise<Session | null> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("event_id", eventId)
    .eq("device_id", deviceId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function createSession(
  eventId: string,
  deviceId: string,
  guestName: string,
): Promise<Session | null> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      event_id: eventId,
      device_id: deviceId,
      guest_name: guestName,
      photo_limit: 10,
      photo_used: 0,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("Create session error:", error);
    return null;
  }

  return data;
}

export async function getSessionById(
  sessionId: string,
): Promise<Session | null> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (error || !data) {
    console.error("Get session error:", error);
    return null;
  }

  return data;
}

export async function incrementPhotoUsed(
  sessionId: string,
): Promise<Session | null> {
  const supabase = createSupabaseClient();

  const { data: session, error: getError } = await supabase
    .from("sessions")
    .select("photo_used, photo_limit")
    .eq("id", sessionId)
    .single();

  if (getError || !session) {
    console.error("Get session error:", getError);
    return null;
  }

  if (session.photo_used >= session.photo_limit) {
    return null;
  }

  const { data, error } = await supabase
    .from("sessions")
    .update({
      photo_used: session.photo_used + 1,
      last_active: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .select("*")
    .single();

  if (error || !data) {
    console.error("Update photo used error:", error);
    return null;
  }

  return data;
}

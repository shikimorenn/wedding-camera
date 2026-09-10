"use server";

import { createSession } from "@/lib/services/session.service";

export async function startWeddingSession(
  eventId: string,
  deviceId: string,
  guestName: string,
) {
  if (!guestName.trim()) {
    throw new Error("Guest name is required");
  }

  const session = await createSession(eventId, deviceId, guestName.trim());

  if (!session) {
    throw new Error("Failed to create session");
  }

  return {
    sessionId: session.id,
    photoLimit: session.photo_limit,
    photoUsed: session.photo_used,
  };
}

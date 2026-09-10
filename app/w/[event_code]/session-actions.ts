"use server";

import { incrementPhotoUsed } from "@/lib/services/session.service";

export async function usePhotoQuota(sessionId: string) {
  const session = await incrementPhotoUsed(sessionId);

  if (!session) {
    throw new Error("Photo quota exceeded or session not found");
  }

  return {
    photoUsed: session.photo_used,
    photoLimit: session.photo_limit,
  };
}

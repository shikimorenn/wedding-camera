"use client";

import { useRouter } from "next/navigation";
import { getDeviceId } from "@/lib/utils/device";
import { startWeddingSession } from "./action";

interface StartButtonProps {
  eventId: string;
  eventCode: string;
  guestName: string;
}

export default function StartButton({
  eventId,
  eventCode,
  guestName,
}: StartButtonProps) {
  const router = useRouter();

  const handleStart = async () => {
    if (!guestName.trim()) return;

    try {
      const deviceId = getDeviceId();

      const result = await startWeddingSession(
        eventId,
        deviceId,
        guestName.trim(),
      );

      router.push(`/w/${eventCode}/camera?session=${result.sessionId}`);
    } catch (error) {
      console.error("Failed to start session:", error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleStart}
      disabled={!guestName.trim()}
      className="mt-8 flex justify-center rounded-full px-6 py-3 w-full bg-white text-black shadow-sm transition-all duration-300 hover:bg-white/80 disabled:cursor-not-allowed disabled:bg-gray-400/40 disabled:text-white/60"
    >
      Mulai Ambil Foto
    </button>
  );
}

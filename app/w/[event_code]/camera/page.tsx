import { notFound } from "next/navigation";
import Camera from "./camera";
import { getEventByCode } from "@/lib/services/event.service";
import { getSessionById } from "@/lib/services/session.service";

interface CameraPageProps {
  params: Promise<{
    event_code: string;
  }>;
  searchParams: Promise<{
    session?: string;
  }>;
}

export default async function CameraPage({
  params,
  searchParams,
}: CameraPageProps) {
  const { event_code } = await params;
  const { session: sessionId } = await searchParams;

  if (!sessionId) {
    notFound();
  }

  const event = await getEventByCode(event_code);

  if (!event) {
    notFound();
  }

  const session = await getSessionById(sessionId);

  if (!session) {
    notFound();
  }

  if (session.event_id !== event.id) {
    notFound();
  }

  return (
    <Camera
      sessionId={session.id}
      eventId={session.event_id}
      photoUsed={session.photo_used}
      photoLimit={session.photo_limit}
    />
  );
}

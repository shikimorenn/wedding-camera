import { createSupabaseServer } from "@/lib/supabase/server";
import { getGalleryPhotos } from "@/lib/services/galery.service";
import DownloadAllButton from "./DownloadAllButton";

interface AdminGalleryPageProps {
  params: Promise<{
    event_code: string;
    secret: string;
  }>;
}

export default async function AdminGalleryPage({
  params,
}: AdminGalleryPageProps) {
  const { event_code, secret } = await params;

  const ADMIN_SECRET = "rapoleondanhaura";

  if (secret !== ADMIN_SECRET) {
    return (
      <main className="min-h-screen bg-[#fdfcf9] p-10 text-center">
        <h1 className="text-2xl font-semibold">Akses Ditolak</h1>

        <p className="mt-3 text-gray-500">Secret tidak sesuai.</p>
      </main>
    );
  }

  const supabase = createSupabaseServer();

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, event_code, bride_name, groom_name")
    .eq("event_code", event_code)
    .single();

  if (!event) {
    return (
      <main className="min-h-screen bg-[#fdfcf9] p-10 text-center">
        <h1 className="text-2xl font-semibold">Event Tidak Ditemukan</h1>

        <p className="mt-3 text-gray-500">
          {eventError ? String(eventError) : "Event tidak tersedia."}
        </p>
      </main>
    );
  }

  const photos = await getGalleryPhotos(event.id);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return (
      <main className="min-h-screen bg-[#fdfcf9] p-10 text-center">
        <h1 className="text-2xl font-semibold">Supabase URL tidak tersedia</h1>
      </main>
    );
  }

  const groupedPhotos = photos.reduce(
    (groups, photo) => {
      if (!groups[photo.guest_name]) {
        groups[photo.guest_name] = [];
      }

      groups[photo.guest_name].push(photo);

      return groups;
    },
    {} as Record<string, typeof photos>,
  );

  return (
    <main className="min-h-screen bg-white/90 px-5 py-10 text-[#292929] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-black">
            Wedding Gallery
          </p>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {event.groom_name} & {event.bride_name}
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            {photos.length} foto dari tamu
          </p>

          {photos.length > 0 && (
            <div className="mt-6 flex justify-center">
              <DownloadAllButton eventCode={event_code} secret={secret} />
            </div>
          )}
        </header>

        {photos.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <p className="text-gray-500">Belum ada foto dari tamu.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedPhotos).map(([guestName, guestPhotos]) => (
              <section key={guestName}>
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium">{guestName}</h2>

                    <p className="mt-1 text-xs text-gray-400">
                      Foto dari sesi tamu
                    </p>
                  </div>

                  <span className="rounded-full bg-white px-3 py-1.5 text-xs text-gray-500 shadow-sm ring-1 ring-gray-200">
                    {guestPhotos.length} foto
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {guestPhotos.map((photo) => {
                    const imageUrl =
                      `${supabaseUrl}/storage/v1/object/public/` +
                      `wedding-photos/${photo.file_path}`;

                    return (
                      <div
                        key={photo.id}
                        className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5"
                      >
                        <div className="relative">
                          <img
                            src={imageUrl}
                            alt={`Foto ${guestName}`}
                            className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
                          />

                          <a
                            href={`${imageUrl}?download=${encodeURIComponent(
                              `foto-${guestName}-${photo.id}.webp`,
                            )}`}
                            aria-label={`Download foto ${guestName}`}
                            className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm transition hover:bg-black active:scale-95"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="h-4 w-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"
                              />
                            </svg>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

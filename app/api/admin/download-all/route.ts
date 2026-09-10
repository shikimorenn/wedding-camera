import { NextResponse } from "next/server";
import { Readable } from "node:stream";
import { ZipArchive } from "archiver";

import { createSupabaseServer } from "@/lib/supabase/server";
import { getGalleryPhotos } from "@/lib/services/galery.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET_NAME = "wedding-photos";

function sanitizeFolderName(name: string) {
  return (
    name
      .trim()
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
      .replace(/\.+$/g, "")
      .trim() || "Tamu"
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const eventCode = body?.eventCode;
    const secret = body?.secret;

    if (typeof eventCode !== "string" || !eventCode) {
      return NextResponse.json(
        {
          error: "Event code tidak valid.",
        },
        {
          status: 400,
        },
      );
    }

    if (typeof secret !== "string" || !secret) {
      return NextResponse.json(
        {
          error: "Secret tidak valid.",
        },
        {
          status: 401,
        },
      );
    }

    const adminSecret = process.env.ADMIN_SECRET;

    if (!adminSecret || secret !== adminSecret) {
      return NextResponse.json(
        {
          error: "Akses ditolak.",
        },
        {
          status: 403,
        },
      );
    }

    const supabase = createSupabaseServer();

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, event_code, bride_name, groom_name")
      .eq("event_code", eventCode)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        {
          error: "Event tidak ditemukan.",
        },
        {
          status: 404,
        },
      );
    }

    const photos = await getGalleryPhotos(event.id);

    if (photos.length === 0) {
      return NextResponse.json(
        {
          error: "Belum ada foto untuk didownload.",
        },
        {
          status: 404,
        },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
      return NextResponse.json(
        {
          error: "NEXT_PUBLIC_SUPABASE_URL belum tersedia.",
        },
        {
          status: 500,
        },
      );
    }

    const archive = new ZipArchive({
      zlib: {
        level: 6,
      },
    });

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        archive.on("data", (chunk: Buffer) => {
          controller.enqueue(
            new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength),
          );
        });

        archive.on("end", () => {
          controller.close();
        });

        archive.on("error", (error) => {
          console.error("ZIP archive error:", error);

          controller.error(error);
        });
      },

      cancel() {
        archive.abort();
      },
    });

    for (const photo of photos) {
      const imageUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${photo.file_path}`;

      const response = await fetch(imageUrl, {
        cache: "no-store",
      });

      if (!response.ok) {
        console.error(
          "Failed to fetch photo:",
          photo.file_path,
          response.status,
        );

        continue;
      }

      const arrayBuffer = await response.arrayBuffer();

      const guestFolder = sanitizeFolderName(photo.guest_name);

      const photoIndex = photos.filter(
        (item) =>
          item.guest_name === photo.guest_name &&
          item.created_at <= photo.created_at,
      ).length;

      archive.append(Buffer.from(arrayBuffer), {
        name: `${guestFolder}/foto-${String(photoIndex).padStart(2, "0")}.webp`,
      });
    }

    void archive.finalize();

    const filename =
      `${event.bride_name}-${event.groom_name}-Wedding-Photos.zip`
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .replace(/-+/g, "-");

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",

        "Content-Disposition": `attachment; filename="${filename}"`,

        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Download all photos error:", error);

    return NextResponse.json(
      {
        error: "Gagal membuat file ZIP.",
      },
      {
        status: 500,
      },
    );
  }
}

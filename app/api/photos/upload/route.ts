import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase/client";
import { createPhoto } from "@/lib/services/photo.service";
import { incrementPhotoUsed } from "@/lib/services/session.service";

export const runtime = "nodejs";

const BUCKET_NAME = "wedding-photos";
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");
    const sessionId = formData.get("sessionId");
    const eventId = formData.get("eventId");

    // Validasi file
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "File tidak ditemukan." },
        { status: 400 },
      );
    }

    // Validasi session
    if (typeof sessionId !== "string" || !sessionId) {
      return NextResponse.json(
        { error: "Session ID tidak valid." },
        { status: 400 },
      );
    }

    // Validasi event
    if (typeof eventId !== "string" || !eventId) {
      return NextResponse.json(
        { error: "Event ID tidak valid." },
        { status: 400 },
      );
    }

    // Validasi WebP
    if (
      file.type !== "image/webp" &&
      !file.name.toLowerCase().endsWith(".webp")
    ) {
      return NextResponse.json(
        { error: "Foto harus berformat WebP." },
        { status: 400 },
      );
    }

    // Validasi ukuran
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "Ukuran foto terlalu besar. Maksimal 2 MB.",
        },
        { status: 400 },
      );
    }

    const supabase = createSupabaseClient();

    /*
     * Buat nama file unik
     */
    const fileName = `${crypto.randomUUID()}.webp`;

    /*
     * Struktur folder:
     *
     * wedding/
     *   eventId/
     *     sessionId/
     *       file.webp
     */
    const filePath = `wedding/${eventId}/${sessionId}/${fileName}`;

    /*
     * Upload ke Supabase Storage
     */
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);

      return NextResponse.json(
        {
          error: "Gagal mengupload foto.",
          detail: uploadError.message,
        },
        { status: 500 },
      );
    }

    /*
     * Simpan metadata foto ke database
     */
    const photo = await createPhoto(sessionId, eventId, filePath);

    if (!photo) {
      // Hapus file jika database gagal
      await supabase.storage.from(BUCKET_NAME).remove([filePath]);

      return NextResponse.json(
        {
          error: "Foto berhasil diupload tetapi gagal disimpan ke database.",
        },
        { status: 500 },
      );
    }

    /*
     * Tambahkan photo_used
     */
    const session = await incrementPhotoUsed(sessionId);

    if (!session) {
      // Rollback database
      await supabase.from("photos").delete().eq("id", photo.id);

      // Rollback storage
      await supabase.storage.from(BUCKET_NAME).remove([filePath]);

      return NextResponse.json(
        {
          error: "Gagal memperbarui jumlah foto.",
        },
        { status: 409 },
      );
    }

    /*
     * Ambil URL public
     */
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,

      photo: {
        id: photo.id,
        file_path: filePath,
        url: publicUrlData.publicUrl,
      },

      photoUsed: session.photo_used,
      photoLimit: session.photo_limit,
    });
  } catch (error) {
    console.error("Upload photo error:", error);

    return NextResponse.json(
      {
        error: "Terjadi kesalahan saat menyimpan foto.",
      },
      { status: 500 },
    );
  }
}

"use client";

import { useEffect, useRef, useState } from "react";
import { getSessionPhotos } from "../session-actions";

interface CameraProps {
  sessionId: string;
  eventId: string;
  photoUsed: number;
  photoLimit: number;
}

export default function Camera({
  sessionId,
  eventId,
  photoUsed: initialPhotoUsed,
  photoLimit,
}: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraError, setCameraError] = useState("");
  const [photoUsed, setPhotoUsed] = useState(initialPhotoUsed);

  // Foto yang sedang di-preview
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  // Foto terakhir yang sudah dipilih Use Photo
  const [photos, setPhotos] = useState<string[]>([]);
  const [showPhotoRoll, setShowPhotoRoll] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Animasi counter
  const [isCountingDown, setIsCountingDown] = useState(false);

  const handleSwitchCamera = () => {
    setFacingMode((current) =>
      current === "environment" ? "user" : "environment",
    );
  };

  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment",
  );

  useEffect(() => {
    let mounted = true;

    async function loadPhotos() {
      try {
        const data = await getSessionPhotos(sessionId);

        if (!mounted) {
          return;
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

        if (!supabaseUrl) {
          return;
        }

        const photoUrls = data.map((photo) => {
          return `${supabaseUrl}/storage/v1/object/public/wedding-photos/${photo.file_path}`;
        });

        setPhotos(photoUrls);
      } catch (error) {
        console.error("Failed to load photos:", error);
      }
    }

    loadPhotos();

    return () => {
      mounted = false;
    };
  }, [sessionId]);

  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      try {
        // Stop kamera sebelumnya
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: {
              ideal: facingMode,
            },
          },
          audio: false,
        });

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          // Tidak mirror untuk kamera depan maupun belakang
          videoRef.current.style.transform = "none";

          await videoRef.current.play();
        }
      } catch (error) {
        console.error("Camera error:", error);
        setCameraError("Tidak dapat mengakses kamera.");
      }
    }

    startCamera();

    return () => {
      mounted = false;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          if (track.readyState !== "ended") {
            track.stop();
          }
        });

        streamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [facingMode]);

  // CAPTURE
  const handleCapture = async () => {
    if (photoUsed >= photoLimit) {
      return;
    }

    if (!videoRef.current) {
      return;
    }

    const video = videoRef.current;

    if (!video.videoWidth || !video.videoHeight) {
      return;
    }

    const maxSize = 1600;

    let width = video.videoWidth;
    let height = video.videoHeight;

    if (width > height && width > maxSize) {
      height = Math.round((height / width) * maxSize);
      width = maxSize;
    } else if (height > maxSize) {
      width = Math.round((width / height) * maxSize);
      height = maxSize;
    }

    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    context.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          return;
        }

        const webpBlob = new Blob([blob], {
          type: "image/webp",
        });

        const imageUrl = URL.createObjectURL(webpBlob);

        setCapturedPhoto(imageUrl);
      },
      "image/webp",
      0.8,
    );
  };

  // RETAKE
  const handleRetake = () => {
    setCapturedPhoto(null);

    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  };

  // USE PHOTO masih test
  const handleUsePhoto = async () => {
    if (!capturedPhoto || isUploading) {
      return;
    }

    try {
      setIsUploading(true);

      /*
       * Convert data URL menjadi Blob
       */

      const imageResponse = await fetch(capturedPhoto);

      const imageBlob = await imageResponse.blob();

      const webpBlob = new Blob([imageBlob], {
        type: "image/webp",
      });

      const formData = new FormData();

      formData.append("file", webpBlob, "photo.webp");

      formData.append("sessionId", sessionId);

      formData.append("eventId", eventId);

      /*
       * Kirim ke API
       */

      const response = await fetch("/api/photos/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal menyimpan foto.");
      }

      /*
       * Update jumlah foto
       */

      setPhotoUsed(result.photoUsed);

      /*
       * Masukkan foto yang baru disimpan
       * ke Photo Roll
       */

      setPhotos((prev) => [...prev, result.photo.url]);

      /*
       * Tutup preview
       */

      setCapturedPhoto(null);

      /*
       * Animasi counter
       */

      setIsCountingDown(true);

      setTimeout(() => {
        setIsCountingDown(false);
      }, 350);
    } catch (error) {
      console.error("Failed to save photo:", error);

      alert(error instanceof Error ? error.message : "Gagal menyimpan foto.");
    } finally {
      setIsUploading(false);
    }
  };

  const remainingPhotos = photoLimit - photoUsed;

  return (
    <main className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <header className="relative flex h-16 items-center justify-center px-5">
        {/* BACK */}
        <button
          type="button"
          onClick={() => window.history.back()}
          aria-label="Back"
          className="absolute left-4 flex h-10 w-10 items-center justify-center text-white transition active:scale-90"
        >
          <span className="text-4xl font-light leading-none">‹</span>
        </button>

        {/* TITLE */}
        <h1 className="text-base font-medium tracking-wide text-white">
          Rafi & Haura
        </h1>

        {/* SWITCH CAMERA */}
        <button
          type="button"
          onClick={handleSwitchCamera}
          aria-label="Switch camera"
          className="absolute right-4 flex h-10 w-10 items-center justify-center transition active:scale-90"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
          >
            <path
              d="M20 11C20 7.13 16.87 4 13 4H9"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
            />

            <path
              d="M9 1L6 4L9 7"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="M4 13C4 16.87 7.13 20 11 20H15"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
            />

            <path
              d="M15 17L18 20L15 23"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </header>

      {/* CAMERA */}
      <div className="px-3">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[28px] bg-[#171717]">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${
              capturedPhoto ? "opacity-0" : "opacity-100"
            }`}
          />

          {/* CAMERA ERROR */}
          {cameraError && !capturedPhoto && (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <p className="text-center text-sm text-white/70">{cameraError}</p>
            </div>
          )}

          {/* CAPTURED PHOTO */}
          {capturedPhoto && (
            <img
              src={capturedPhoto}
              alt="Captured photo"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </div>
      </div>

      {/* CONTROLS */}
      <div className="px-6 pt-8">
        {capturedPhoto ? (
          /* ================= PREVIEW MODE ================= */
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleRetake}
              className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium backdrop-blur-sm transition active:scale-95"
            >
              Retake
            </button>

            <button
              type="button"
              onClick={handleUsePhoto}
              disabled={isUploading}
              className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition active:scale-95 disabled:opacity-50"
            >
              {isUploading ? "Saving..." : "Use Photo"}
            </button>
          </div>
        ) : (
          /* camera mode */
          <div className="flex items-center justify-between">
            {/* roll */}
            <div className="flex w-20 items-center justify-start gap-2">
              {/* photo roll */}
              <img src="/rolls.png" alt="" className="h-6 w-6 shrink-0 " />
              {/* COUNTER */}
              <div className="relative h-12 w-12 overflow-hidden">
                <span
                  key={remainingPhotos}
                  className={`relative left-0 top-4 henny-penny-regular text-[35px] font-medium leading-none text-white/80 ${
                    isCountingDown ? "animate-number-down" : ""
                  }`}
                >
                  {remainingPhotos}
                </span>
              </div>
            </div>

            {/* SHUTTER */}
            <button
              type="button"
              onClick={handleCapture}
              disabled={photoUsed >= photoLimit}
              aria-label="Take photo"
              className="flex h-[78px] w-[78px] items-center justify-center mr-7 transition-transform active:scale-90 disabled:opacity-30"
            >
              <svg
                viewBox="0 0 78 78"
                className="h-full w-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Lingkaran luar */}
                <circle
                  cx="39"
                  cy="39"
                  r="36"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                />

                {/* Lingkaran kedua - mengikuti background */}

                {/* Lingkaran dalam */}
                <circle cx="39" cy="39" r="20" fill="white" />
              </svg>
            </button>

            {/* SWITCH CAMERA */}

            {/* LAST PHOTO */}
            <button
              type="button"
              onClick={() => setShowPhotoRoll(true)}
              aria-label="View photos"
              className="h-14 w-14 overflow-hidden rounded-xl border border-white/20 bg-white/10 transition active:scale-95"
            >
              {photos.length > 0 ? (
                <img
                  src={photos[photos.length - 1]}
                  alt="Last captured photo"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-xs text-white/30">—</span>
                </div>
              )}
            </button>
          </div>
        )}

        {/* INFO */}
        {!capturedPhoto && (
          <p className="mt-5 text-center text-xs tracking-wide text-white/40">
            {remainingPhotos > 0
              ? `${remainingPhotos} photos remaining`
              : "No photos remaining"}
          </p>
        )}
        {showPhotoRoll && (
          <div className="fixed inset-0 z-50 bg-black/95">
            <div className="flex h-full flex-col">
              <header className="flex h-16 items-center justify-between px-5">
                <h2 className="text-base font-medium text-white">
                  Your Photos
                </h2>

                <button
                  type="button"
                  onClick={() => setShowPhotoRoll(false)}
                  className="flex h-10 w-10 items-center justify-center text-2xl text-white/80"
                  aria-label="Close"
                >
                  ×
                </button>
              </header>

              <div className="flex-1 overflow-y-auto px-4 pb-6">
                <div className="grid grid-cols-2 gap-3">
                  {photos.map((photo, index) => (
                    <div
                      key={index}
                      className="aspect-[3/4] overflow-hidden rounded-2xl"
                    >
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

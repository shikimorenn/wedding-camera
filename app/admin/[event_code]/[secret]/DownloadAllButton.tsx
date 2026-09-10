"use client";

import { useState } from "react";

interface DownloadAllButtonProps {
  eventCode: string;
  secret: string;
  disabled?: boolean;
}

export default function DownloadAllButton({
  eventCode,
  secret,
  disabled = false,
}: DownloadAllButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (isDownloading || disabled) return;

    try {
      setIsDownloading(true);

      const response = await fetch("/api/admin/download-all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventCode,
          secret,
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);

        throw new Error(result?.error || "Gagal mendownload foto.");
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "Rafi-Haura-Wedding-Photos.zip";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download all error:", error);

      alert(error instanceof Error ? error.message : "Gagal mendownload foto.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={disabled || isDownloading}
      className="inline-flex items-center gap-2 rounded-full bg-[#292929] px-5 py-3 text-sm font-medium text-white transition hover:bg-black active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isDownloading ? (
        <>
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />

            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          Membuat ZIP...
        </>
      ) : (
        <>
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
          Download Semua Foto
        </>
      )}
    </button>
  );
}

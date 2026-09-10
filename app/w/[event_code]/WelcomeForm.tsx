"use client";

import { useState } from "react";
import StartButton from "./StartButton";

interface WelcomeFormProps {
  eventId: string;
  eventCode: string;
  brideName: string;
  groomName: string;
}

export default function WelcomeForm({
  eventId,
  eventCode,
  brideName,
  groomName,
}: WelcomeFormProps) {
  console.log("WELCOME FORM RENDER");

  const [guestName, setGuestName] = useState("");

  const displayName = `${groomName} & ${brideName}`;
  const floatingLoves = [
    { left: "5%", size: 18, duration: 9, delay: 0 },
    { left: "12%", size: 12, duration: 12, delay: 3 },
    { left: "20%", size: 22, duration: 10, delay: 5 },
    { left: "29%", size: 14, duration: 13, delay: 1 },
    { left: "37%", size: 18, duration: 11, delay: 7 },
    { left: "46%", size: 11, duration: 9, delay: 2 },
    { left: "54%", size: 24, duration: 14, delay: 6 },
    { left: "63%", size: 15, duration: 10, delay: 4 },
    { left: "71%", size: 20, duration: 12, delay: 8 },
    { left: "79%", size: 12, duration: 9, delay: 1 },
    { left: "88%", size: 19, duration: 13, delay: 5 },
    { left: "95%", size: 14, duration: 11, delay: 3 },
  ];
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fdfcf9] text-[#252525]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
        {floatingLoves.map((love, index) => (
          <img
            key={index}
            src="/love.png"
            alt=""
            className="absolute animate-float-love object-contain z-10"
            style={{
              left: love.left,
              bottom: "-40px",
              width: `${love.size}px`,
              height: `${love.size}px`,
              animationDuration: `${love.duration}s`,
              animationDelay: `${love.delay}s`,
            }}
          />
        ))}
      </div>
      {/* bg decor */}
      <div className="pointer-events-none absolut" />
      <img
        src="/weddingbg.jpeg"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />

      {/* content */}

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-8 pt-18 z-20">
        {/* camera*/}
        {/* <div className="mb-7 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/30 shadow-sm">
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path
                d="M9 5L10.5 3H13.5L15 5H19C20.1 5 21 5.9 21 7V18C21 19.1 20.1 20 19 20H5C3.9 20 3 19.1 3 18V7C3 5.9 3.9 5 5 5H9Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="12"
                cy="12"
                r="4"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div> */}

        {/* judul */}

        <section className="text-center">
          <p className="mb-8 text-[10px] font-medium uppercase tracking-[0.3em] leading-3 text-white">
            Wedding Guest Camera
          </p>

          <h1 className="text-[45px] font-light leading-[1.05] tracking-[-0.03em] text-white">
            {displayName}
          </h1>

          <p className="mx-auto mt-4 max-w-[300px] text-[14px] leading-6 text-white/80">
            Abadikan momen special kami
            <br />
            dari sudut pandangmu
          </p>
        </section>

        {/* form card*/}

        <section className="mt-10 rounded-[20px] border border-white/25 bg-white/15 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] backdrop-blur-md">
          <div className="flex">
            <h2 className="text-[20px] font-semibold text-white/85 ml-1">
              Siapa namamu?
            </h2>
          </div>

          {/* input */}

          <div className="relative mt-3">
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="8"
                  r="3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />

                <path
                  d="M5 20C5.6 16.8 8.2 15 12 15C15.8 15 18.4 16.8 19 20"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Masukkan nama"
              maxLength={50}
              autoComplete="name"
              className="h-16 w-full rounded-2xl border border-white/80 bg-white/30 pl-14 pr-4 text-white/60 text-base outline-none transition focus:border-white/40 focus:ring-2 focus:ring-[#b4935b]/10"
            />
          </div>

          {/* features */}

          {/* <div className="mt-6 grid grid-cols-3 divide-x-2 divide-white/20 rounded-2xl bg-white/10 py-5 text-white/70">
            <Feature icon="qr" title="Scan Qr" description="hingga 10 foto" />

            <Feature
              icon="camera"
              title="Bagikan momen"
              description="terbaik dari acara"
            />

            <Feature
              icon="heart"
              title="Jadi bagian"
              description="dari kenangan kami"
            />
          </div> */}

          {/* start */}

          <div className="mt-2 flex flex-col justify-center">
            <div className="text-white text-[17px] px-2 py-6 -mb-10">
              <h1>Kamu punya 10 jepretan</h1>
            </div>
            <StartButton
              eventId={eventId}
              eventCode={eventCode}
              guestName={guestName}
            />
          </div>
        </section>

        {/* ================= PRIVACY ================= */}

        <div className="mt-6 flex items-center justify-center text-center leading-5">
          <p className="text-[14px] text-white/80">
            Semua foto akan terkumpul menjadi satu album
            <br />
            kenangan Rafi & Haura setelah acara
          </p>
        </div>
      </div>
    </main>
  );
}

/* feature component */

function Feature({
  icon,
  title,
  description,
}: {
  icon: "camera" | "image" | "heart" | "qr";
  title: string;
  description: string;
}) {
  return (
    <div className="px-2 text-center">
      <div className="mb-2 flex justify-center text-white/70">
        {icon === "camera" && (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 5L10.5 3H13.5L15 5H19C20.1 5 21 5.9 21 7V18C21 19.1 20.1 20 19 20H5C3.9 20 3 19.1 3 18V7C3 5.9 3.9 5 5 5H9Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle
              cx="12"
              cy="12"
              r="4"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        )}

        {icon === "image" && (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <rect
              x="3"
              y="4"
              width="18"
              height="16"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle
              cx="8"
              cy="9"
              r="1.5"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M3 17L8 12L12 16L15 13L21 19"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        )}

        {icon === "heart" && (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path
              d="M20.8 8.8C20.8 13.5 12 20 12 20C12 20 3.2 13.5 3.2 8.8C3.2 5.8 5.4 4 8 4C9.7 4 11.2 4.9 12 6.2C12.8 4.9 14.3 4 16 4C18.6 4 20.8 5.8 20.8 8.8Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        )}

        {icon === "qr" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            className="text-heading"
          >
            <path fill="none" d="M0 0h33v33H0z"></path>
            <path
              stroke="currentColor"
              d="M4 4.5h7m1 0h4m1 0h4m1 0h7M4 5.5h1m5 0h1m3 0h3m1 0h1m3 0h1m5 0h1M4 6.5h1m1 0h3m1 0h1m2 0h1m4 0h1m3 0h1m1 0h3m1 0h1M4 7.5h1m1 0h3m1 0h1m1 0h2m3 0h2m1 0h1m1 0h1m1 0h3m1 0h1M4 8.5h1m1 0h3m1 0h1m1 0h1m2 0h1m2 0h2m2 0h1m1 0h3m1 0h1M4 9.5h1m5 0h1m1 0h1m1 0h3m3 0h1m1 0h1m5 0h1M4 10.5h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7M12 11.5h1m2 0h2m1 0h2M4 12.5h1m3 0h1m1 0h4m1 0h1m5 0h5m2 0h1M4 13.5h3m1 0h1m2 0h1m1 0h2m1 0h1m1 0h3m3 0h2m1 0h1M4 14.5h1m1 0h1m1 0h1m1 0h1m2 0h1m2 0h1m1 0h3m1 0h1m1 0h3M4 15.5h2m5 0h1m2 0h3m1 0h2m1 0h1m1 0h1m2 0h2M6 16.5h2m1 0h3m3 0h1m1 0h2m1 0h4m1 0h4M4 17.5h3m2 0h1m3 0h2m1 0h1m1 0h3m3 0h1m2 0h1M6 18.5h5m2 0h7m2 0h5M6 19.5h1m1 0h2m1 0h1m1 0h1m1 0h1m1 0h1m1 0h2m1 0h3m1 0h2M4 20.5h3m2 0h3m2 0h1m1 0h2m1 0h8M12 21.5h1m4 0h2m1 0h1m3 0h1M4 22.5h7m1 0h3m5 0h1m1 0h1m1 0h1M4 23.5h1m5 0h1m5 0h1m1 0h1m1 0h1m3 0h4M4 24.5h1m1 0h3m1 0h1m1 0h4m1 0h2m1 0h9M4 25.5h1m1 0h3m1 0h1m3 0h1m1 0h1m3 0h4m2 0h3M4 26.5h1m1 0h3m1 0h1m3 0h7m1 0h1m2 0h1m1 0h1M4 27.5h1m5 0h1m4 0h1m1 0h1m1 0h1m3 0h5M4 28.5h7m1 0h1m1 0h1m1 0h2m1 0h1m1 0h1m4 0h3"
            ></path>
          </svg>
        )}
      </div>

      <p className="text-xs font-semibold">{title}</p>

      <p className="mt-1 text-[11px] leading-4 text-white/70">{description}</p>
    </div>
  );
}

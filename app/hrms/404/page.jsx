// app/components/Modern404Client.jsx
"use client";

import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useRouter } from "next/navigation";

export default function Modern404Client() {
  const router = useRouter();

  function goHome(e) {
    e?.preventDefault();
    router.push("/");
  }

  function contactSupport(e) {
    e?.preventDefault();
    router.push("/contact");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-white via-slate-50 to-sky-50">

      {/* Top Animation (Full Width) */}
      <div className="w-full flex items-center justify-center py-10 bg-gradient-to-b from-blue-50 to-transparent">
        <div className="w-full max-w-3xl">
          <DotLottieReact
            src="https://lottie.host/cf7cde16-2fa4-4dfe-af1a-0a7ff78601e0/ahZvRf7Bhu.lottie"
            loop
            autoplay
            className="w-full h-auto"
          />
        </div>
      </div>

      {/* Bottom Text Content */}
      <div className="flex flex-col items-center text-center px-6 max-w-2xl">

        <span className="inline-block px-4 py-1 mb-4 rounded-full bg-red-50 text-red-700 text-sm font-semibold">
          404 • Page Not Found
        </span>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 mb-4">
          Oops — we can’t find that page!
        </h1>

        <p className="text-slate-600 mb-8">
          It seems like the page you’re looking for got lost in a snow globe.  
          No worries — head back home or reach out to support.
        </p>

        {/* Buttons Section */}
        <div className="flex flex-col sm:flex-row items-center gap-4">

          {/* PRIMARY BUTTON — match your HRMS theme */}
          <button
            onClick={goHome}
            className="px-6 py-3 rounded-md bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold shadow"
          >
            Go to Homepage
          </button>

          {/* SECONDARY BUTTON */}
          <button
            onClick={contactSupport}
            className="px-6 py-3 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold shadow-sm"
          >
            Contact Support
          </button>
        </div>

        <button
          onClick={() => router.back()}
          className="mt-6 text-sm text-slate-500 hover:underline"
        >
          ← Go Back
        </button>

        <p className="mt-4 text-xs text-slate-400">
          If you believe this is a mistake, please let support know.
        </p>
      </div>

      <div className="h-10" />
    </div>
  );
}

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
    <div className="min-h-screen flex flex-col items-center justify-center ">

      {/* Top Animation (Full Width) */}
      <div className="w-full flex items-center justify-center py-10 ">
        <div className="w-150">
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

        {/* <span className="inline-block px-4 py-1 mb-4 rounded-full bg-red-50 text-red-700 text-sm font-semibold">
          404 • Page Not Found
        </span> */}

        <h3 className="font-extrabold text-slate-800 mb-4">
          Oops — we can’t find that page!
        </h3>

        <p className="text-slate-600 mb-8">
          It seems like the page you’re looking for got lost in a snow globe.  
          No worries — head back home.
        </p>

        {/* Buttons Section */}
        <div className="flex flex-col sm:flex-row items-center gap-4">

          {/* PRIMARY BUTTON — match your HRMS theme */}
          <button
            onClick={goHome}
            className="px-4 py-2 rounded-full bg-primary text-white font-semibold shadow"
          >
            Go to Homepage
          </button>

          {/* SECONDARY BUTTON */}
          {/* <button
            onClick={contactSupport}
            className="px-4 py-2 rounded-full border border-slate-300 bg-white text-slate-700 font-semibold shadow-sm"
          >
            Contact Support
          </button> */}
        <button
          onClick={() => router.back()}
          className="px-4 py-2 rounded-full border border-slate-300 bg-white text-slate-700 font-semibold shadow-sm"
        >
          ← Go Back
        </button>
        </div>


        {/* <p className="mt-4 text-xs text-slate-400">
          If you believe this is a mistake, please let support know.
        </p> */}
      </div>

      <div className="h-10" />
    </div>
  );
}

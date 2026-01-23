// app/components/ModernUnauthorizedClient.jsx
"use client";

import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  function goHome(e) {
    e?.preventDefault();
    router.push("/");
  }

  function goBack(e) {
    e?.preventDefault();
    router.back();
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">

      {/* Top Animation */}
      <div className="w-full flex items-center justify-center py-10">
        <div className="w-150">
          <DotLottieReact
            src="https://lottie.host/2c6f8d5b-0a7a-4c9b-9a18-1a9c1d9fd5f6/unauthorized.lottie"
            loop
            autoplay
            className="w-full h-auto"
          />
        </div>
      </div>

      {/* Text Content */}
      <div className="flex flex-col items-center text-center px-6 max-w-2xl">

        <h3 className="font-extrabold text-slate-800 mb-4">
          Access Denied
        </h3>

        <p className="text-slate-600 mb-8">
          You don’t have permission to view this page.  
          If you believe this is a mistake, please contact your administrator.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4">

          {/* PRIMARY */}
          <button
            onClick={goHome}
            className="px-4 py-2 rounded-full bg-primary text-white font-semibold shadow"
          >
            Go to Dashboard
          </button>

          {/* SECONDARY */}
          <button
            onClick={goBack}
            className="px-4 py-2 rounded-full border border-slate-300 bg-white text-slate-700 font-semibold shadow-sm"
          >
            ← Go Back
          </button>
        </div>
      </div>

      <div className="h-10" />
    </div>
  );
}

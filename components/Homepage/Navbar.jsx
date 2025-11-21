"use client";

import React from "react";
import { navLinks } from "../../constants/Homepage";
import { SignUpButtonText } from "@/text";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  return (
    <div className="w-full flex justify-center py-4 container">
      <div className="w-[70%] flex items-center justify-between bg-white rounded-xl px-6 py-[6px] border border-solid border-[#E0E0E0]">
        <div className="flex items-center gap-2 text-xl font-semibold">
          <div className="w-6 h-6 bg-gray-300 rounded"></div>
          <span>MoonDive</span>
        </div>
        <div className="flex items-center gap-8 text-sm font-normal text-primaryText">
          {navLinks.map((item, index) => (
            <button key={index}>{item.label}</button>
          ))}
        </div>
        <button
          onClick={() => router.push("/signup")}   
          className="bg-primary text-whiteText px-8 py-2 rounded-[58px] text-sm font-semibold"
        >
          {SignUpButtonText}
        </button>
      </div>
    </div>
  );
}

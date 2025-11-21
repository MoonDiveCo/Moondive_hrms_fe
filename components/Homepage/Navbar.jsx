"usel client"
import React, { useState } from "react";
import { navLinks } from "../../constants/Homepage";
import { SignInText } from "@/text";
import { GetStartedText } from "@/text";
import Image from "next/image";
import Link from "next/link";
import MoondiveNavbar from "../../public/Homepage/MoondiveNavbar.png"




export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full flex justify-center py-4 px-4">
      <div className="w-full container ">
        <div
          className={`relative bg-whiteBg border border-[#E0E0E0] rounded-[14px] px-6 py-2 flex items-center`}
        >
        
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-30 h-8 relative flex-shrink-0">
              <Image
                src={MoondiveNavbar}
                alt="MoonDive"
                fill
                style={{ objectFit: "contain" }}

                priority
              />
            </div>
          
          </div>

          <nav
            className="hidden md:flex absolute left-1/2 transform -translate-x-1/2"
          >
            <ul className="flex gap-8 text-sm font-medium text-primaryText">
              {navLinks.map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.href ?? "#"}
                    className="px-2 py-2 rounded-lg transition-transform transition-colors duration-150 inline-block hover:text-primary hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="#signin"
                className="text-[18px] text-blackText hover:text-primary transition-colors"
              >
                {SignInText}
              </Link>
              <Link
                href="#get-started"
                className="inline-flex items-center px-6 py-2 rounded-full font-semibold text-sm text-white bg-primary hover:bg-whiteBg hover:border-1 hover:border-primary hover:text-primary"
              >
                {GetStartedText}
              </Link>
            </div>
            <button
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg hover:bg-blackText focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen((s) => !s)}
            >
              <span className="sr-only">Toggle navigation</span>
              <svg
                className={`w-6 h-6 transition-transform ${open ? "transform rotate-90" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {open ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>

          <div
            id="mobile-menu"
            className={`md:hidden absolute left-0 right-0 top-full mt-3 px-4 ${
              open ? "block" : "hidden"
            }`}
          >
            <div className="bg-white border border-[#EAEAEA] rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-4">
                <ul className="flex flex-col gap-3">
                  {navLinks.map((item, idx) => (
                    <li key={idx}>
                      <Link
                        href={item.href ?? "#"}
                        onClick={() => setOpen(false)}
                        className="block px-3 py-2 rounded-md text-sm text-primaryText hover:text-primary transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 border-t border-[#F3F4F6] pt-4 flex flex-col gap-3">
                  <Link
                    href="#signin"
                    className="text-sm text-shadow-primaryText hover:underline"
                    onClick={() => setOpen(false)}
                  >
                    {SignInText}
                  </Link>
                  <Link
                    href="#get-started"
                    className="inline-block text-center px-4 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-b from-[#ff7a33] to-[#f7651a]"
                    onClick={() => setOpen(false)}
                  >
                    {GetStartedText}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

"use"
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion"; 
import Link from "next/link";
import MoondiveLogo from "../../public/Homepage/MoondiveLogo.png";
import Facebook from "../../public/Homepage/Facebook.png";
import Youtube from "../../public/Homepage/Youtube.png";
import Linkedin from "../../public/Homepage/Linkedin.png";
import Instagram from "../../public/Homepage/Instagram.png";

export default function Footer() {
  const navLinks = [
    { label: "Zoho Home", href: "#" },
    { label: "Contact Us", href: "#" },
    { label: "Security", href: "#" },
    { label: "Compliance", href: "#" },
    { label: "IPR Complaints", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ];

  const socials = [
    { alt: "Facebook", src: Facebook, href: "#" },
    { alt: "YouTube", src: Youtube, href: "#" },
    { alt: "LinkedIn", src: Linkedin, href: "#" },
    { alt: "Instagram", src: Instagram, href: "#" },
  ];

  return (
    <footer className="bg-transparent py-8" role="contentinfo">
      <div className="container mx-auto px-4">
        <div className="bg-whiteBg border border-[#EDEDED] rounded-3xl w-full p-6 md:p-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            {/* Left: Logo + Description */}
            <div className="flex-1 max-w-2xl">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <Image
                    src={MoondiveLogo}
                    alt="MoonDive Logo"
                    className="object-contain"
                    width={160}
                    height={48}
                    priority={false}
                  />
                </motion.div>
              </div>

              <p className="mt-4 text-blackText text-sm md:text-lg leading-relaxed font-normal">
                Streamline HR in minutes and manage your entire workforce from one
                simple platform. Enjoy powerful tools for attendance, leaves,
                payroll, and employee data.
              </p>
            </div>

            {/* Right: Socials */}
            <div className="flex-shrink-0 flex flex-col items-start md:items-end gap-4">
              <div className="flex items-center gap-3">
                {socials.map((s, i) => (
                  <Link key={i} href={s.href} aria-label={s.alt} className="inline-flex items-center justify-center rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primaryText">
  <Image src={s.src} alt={s.alt} width={40} height={40} />
</Link>
                ))}
              </div>
            </div>
          </div>

          <hr className="my-6 border-[#EBEBEB]" />

          {/* Links: responsive grid */}
          <nav aria-label="footer navigation">
            <ul className="grid grid-cols-2 sm:grid-cols-4 md:flex md:justify-center gap-2 text-sm text-blackText">
              {navLinks.map((link, idx) => (
                <li key={idx} className="text-center md:text-left">
                  <Link href={link.href} className="inline-block px-2 py-1 hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primaryText">
  {link.label}
</Link>
                </li>
              ))}
            </ul>
          </nav>

          <hr className="my-6 border-[#EBEBEB]" />

          <p className="text-center text-sm text-primaryText font-normal mt-2">
            © {new Date().getFullYear()} Moondive Pvt. Ltd. – MoonDive Private Limited, All Rights
            Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

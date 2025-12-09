"use client";
import React from "react";
import Toggle from "../../public/Dashboard/Toggle.png"
import Notification from "../../public/Dashboard/Notification.png"
import Image from "next/image";
import { usePathname } from "next/navigation";
export default function MainNavbar({params}) {
  const pathname = usePathname()
  const parts = pathname.split("/").filter(Boolean);
  console.log(parts)
  return (
    <div className="w-full px-6 md:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center gap-4">
          
        </div>

        <div className="flex items-center gap-4">
          <input
            type="search"
            placeholder="Search employee"
            className="w-52 md:w-80 bg-[#0000000A]   rounded-4xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <div>         
             <Image src={Notification} width={20}alt="Notification"/>
</div>
                </div>
      </div>
    </div>
  );
}

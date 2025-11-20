import React from "react";
import MoondiveLogo from "../../public/Homepage/MoondiveLogo.png"
import Image from "next/image";
import Facebook from "../../public/Homepage/Facebook.png"
import Youtube from "../../public/Homepage/Youtube.png"
import Linkedin from "../../public/Homepage/Linkedin.png"
import Instagram from "../../public/Homepage/Instagram.png"

export default function Footer() {
  return (
    <div className="py-16">
      <div className="container">
 <div className=" bg-whiteBg border-3 border-[#8F8F8F0F] rounded-4xl w-full p-8">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Image
                src={MoondiveLogo}
                alt="MoonDive Logo"
                className="object-contain"
              />
            </div>
            <div className="text-blackText text-xl leading-relaxed font-normal ">
              Streamline HR in minutes and manage your entire workforce from one
              simple platform. Enjoy powerful tools for attendance, leaves,
              payroll, and employee data.
            </div>
          </div>
          <div className="flex items-center gap-4 self-start md:self-center">
            
 <div className="flex items-center gap-4 self-start md:self-center">

              <Image
                src={Facebook}
                alt="Facebook"
                width={50}
                height={50}
                className="cursor-pointer"
              />

              <Image
                src={Youtube}
                alt="Youtube"
                 width={50}
                height={50}
                className="cursor-pointer"
              />

              <Image
                src={Linkedin}
                alt="LinkedIn"
                width={50}
                height={50}
                className="cursor-pointer"
              />

              <Image
                src={Instagram}
                alt="Instagram"
             width={50}
                height={50}
                className="cursor-pointer"
              />
            </div>
          </div>
        </div>

        <hr className="my-6 border-[#EBEBEB]" />

        <div className="flex flex-wrap justify-center gap-4 text-md text-blackText">
          <span>Zoho Home</span>|
          <span>Contact Us</span>|
          <span>Security</span>|
          <span>Compliance</span>|
          <span>IPR Complaints</span>|
          <span>Terms of Service</span>|
          <span>Privacy Policy</span>|
          <span>Cookie Policy</span>
        </div>
         <hr className="my-6 border-[#EBEBEB]" />
        <p className="text-center text-md text-primaryText font-normal mt-6">
          © 2025 Moondive Pvt. Ltd. – MoonDive Private Limited, All Rights
          Reserved.
        </p>
      </div>
      </div>
     
    </div>
  );
}

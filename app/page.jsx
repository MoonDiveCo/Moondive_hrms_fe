'use client';

import FeatuedTools from "@/components/Homepage/FeaturedTools";
import Footer from "@/components/Homepage/Footer";
import { HeroSection } from "@/components/Homepage/HeroSection";
import LeaveBalances from "@/components/Homepage/LeaveBalances";
import MoreFeature from "@/components/Homepage/MoreFeature";
import Navbar from "@/components/Homepage/Navbar";
import TrustedBySlider from "@/components/Homepage/TrustedBy";

import PlatformSection from "@/components/Homepage/PlatformSection";


export default function Page() {
  return (
    <div>
   {/* <div aria-hidden className="pointer-events-none z-[1] fixed inset-0">
    <div
    className="hidden md:block absolute left-0 top-0 h-full"
    style={{
      width: 220,
      backgroundImage: `url("/Homepage/LeftDashedLine.png")`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "left top",
      backgroundSize: "contain",
    }}
  />
  <div
    className="hidden md:block absolute right-0 top-0 h-full"
    style={{
      width: 220,
      backgroundImage: `url("/Homepage/RightDashedLine.png")`, 
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right top",
      backgroundSize: "contain",
    }}
  />
</div> */}
     

      <Navbar/>
      <HeroSection/>
      <TrustedBySlider/>
      <PlatformSection/>
      <FeatuedTools/>
      <LeaveBalances/>
      <MoreFeature/>
      <Footer/>
    </div>
  );
}

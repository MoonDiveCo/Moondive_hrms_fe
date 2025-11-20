'use client';

import FeatuedTools from "@/components/Homepage/FeaturedTools";
import Footer from "@/components/Homepage/Footer";
import { HeroSection } from "@/components/Homepage/HeroSection";
import LeaveBalances from "@/components/Homepage/LeaveBalances";
import MoreFeature from "@/components/Homepage/MoreFeature";
import Navbar from "@/components/Homepage/Navbar";
import TrustedBySlider from "@/components/Homepage/TrustedBy";


export default function Page() {
  return (
    <div>
      {/* <div className="relative container w-full ">
   <Image
        src={BgLine}
        alt="Background Left"
        className="pointer-events-none absolute left-0 top-0 "
      />
       <Image
        src={BgLine}
        alt="Background Right"
        className="pointer-events-none absolute right-0 top-0"
      />
      </div> */}
     

      <Navbar/>
      <HeroSection/>
      <TrustedBySlider/>
      <FeatuedTools/>
      <LeaveBalances/>
      <MoreFeature/>
      <Footer/>
    </div>
  );
}

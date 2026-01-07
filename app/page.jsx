'use client';

import FeatuedTools from "@/components/Homepage/FeaturedTools";
import Footer from "@/components/Homepage/Footer";
import { HeroSection } from "@/components/Homepage/HeroSection";
import LeaveBalances from "@/components/Homepage/LeaveBalances";
import MoreFeature from "@/components/Homepage/MoreFeature";
import Navbar from "@/components/Homepage/Navbar";
import TrustedBySlider from "@/components/Homepage/TrustedBy";

import PlatformSection from "@/components/Homepage/PlatformSection";
import ScrollCards from "@/components/Homepage/ScrollCard";


export default function Page() {
  return (
    <div>


      <Navbar/>
      <HeroSection/>
      <TrustedBySlider/>
      <PlatformSection/>
      <ScrollCards/>
      <FeatuedTools/>
      <LeaveBalances/>
      <MoreFeature/>
      <Footer/>
    </div>
  );
}

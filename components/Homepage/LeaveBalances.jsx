import React from "react";
import Graph from "../../public/Homepage/Graph.png"
import Image from "next/image";
export default function LeaveBalances() {
  return (
    <div className="p-16">
         <div className="p-8 bg-primary flex container rounded-3xl">
    <div className="w-full  p-16 flex flex-col md:flex-row items-center justify-between gap-10">
      <div className="text-white px-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          A smoother leave experience for everyone on your team.
        </h2>
        <div className="text-whiteText text-xl leading-relaxed ">
          Simplify the entire process with real-time leave balances, instant
          notifications, and easy approval flows. Employees get clarity,
          managers get control, and HR gets automated, error-free leave
          management — all in one place.
        </div>
      </div>
      
    </div>
    <div className="w-full max-w-md">
        <Image
          src={Graph}
          alt="Dashboard preview"
          className="rounded-xl w-full shadow-lg"
        />
      </div>
    </div>
    </div>
   

  );
}

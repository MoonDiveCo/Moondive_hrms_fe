'use client';

import { AuthContext } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import AdminOverview from '../../../../components/Overview/adminOverview'

export default function OverviewPage() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      setChecked(true);
      return;
    }

    if (!user.userRole?.includes("SuperAdmin")) {
      router.replace("/hrms/dashboard/overview/myspace");
      return;
    }

    setChecked(true);
  }, [user, loading, router]);

  if (!checked) {
    return (
      <div className='flex items-center justify-center h-screen fixed inset-0 bg-black/5 backdrop-blur-sm'>
        <DotLottieReact
          src='https://lottie.host/ae5fb18b-4cf0-4446-800f-111558cf9122/InmwUHkQVs.lottie'
          loop
          autoplay
          style={{ width: 100, height: 100 }}
        />
      </div>
    );
  }

  return <AdminOverview />;
}

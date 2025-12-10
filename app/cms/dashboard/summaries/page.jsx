'use client'
import ExecSummaryEditor from '@/components/ManageSummaries/ExecutiveSummaryEditior'
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

function ManageSummaries() {
 const [modData, setModData] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchAllModerations = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_MOONDIVE_API}/admin/moderation-data`
      );

      const data = response?.data?.result || {};
      setModData(data);
      setLoading(false);
    } catch (error) {
      console.log("SEO Fetch Error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllModerations();
  }, []);

  
  if(loading){
    return(
      <div className='flex items-center justify-center h-screen fixed inset-0 bg-black/5 backdrop-blur-sm'>
        <DotLottieReact
          src='https://lottie.host/ae5fb18b-4cf0-4446-800f-111558cf9122/InmwUHkQVs.lottie'
          loop
          autoplay
          style={{ width: 100, height: 100, alignItems: 'center' }} // add this
        />
      </div>
    )
  }


    return (
        <div className="p-6">
            <ExecSummaryEditor title="MVP Development" categoryKey="mvpServiceSEO" moderation={modData} />
            <ExecSummaryEditor title="Enterprise AI Solutions" categoryKey="enterpriseAIServiceSEO" moderation={modData} />
            <ExecSummaryEditor title="Web Development" categoryKey="webServiceSEO" moderation={modData} />
            <ExecSummaryEditor title="Mobile App Development" categoryKey="appServiceSEO" moderation={modData} />
            <ExecSummaryEditor title="UI/UX Design" categoryKey="uiDesignServiceSEO" moderation={modData} />
            <ExecSummaryEditor title="Cloud Engineering" categoryKey="cloudEngineeringServiceSEO" moderation={modData} />
            <ExecSummaryEditor title="Data Analytics" categoryKey="dataAnalyticsServiceSEO" moderation={modData} />
        </div>
    )
}

export default ManageSummaries
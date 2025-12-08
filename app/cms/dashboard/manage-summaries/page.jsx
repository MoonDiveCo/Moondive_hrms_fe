'use client'
import ExecSummaryEditor from '@/components/ManageSummaries/ExecutiveSummaryEditior'
import axios from 'axios';
import React, { useEffect, useState } from 'react'

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
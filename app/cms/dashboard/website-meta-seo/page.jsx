"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

import EditWebLink from "@/components/WebsiteMetaSEO/EditWebLink";
import { InputFieldsShimmer } from "@/components/UI/ShimmerComponents";

export default function WebsiteMetaSeo() {
  const [modData, setModData] = useState({});
  const [loading, setLoading] = useState(true);

  const [seoValues, setSeoValues] = useState({});

  const fetchAllModerations = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_MOONDIVE_API}/admin/moderation-data`
      );

      const data = response?.data?.result || {};
      setModData(data);
      setSeoValues(data); 
      setLoading(false);
    } catch (error) {
      console.log("SEO Fetch Error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllModerations();
  }, []);

  if (loading) {
    return (
      <div className="p-10">
        <InputFieldsShimmer />
      </div>
    );
  }

  const seoSections = [
    { key: "homePageSEO", title: "Home Page" },
    { key: "aboutUsSEO", title: "Life at MoonDive" },
    { key: "aboutSEO", title: "About Us" },
    { key: "ourWorkSEO", title: "Our Work" },
    { key: "careerSEO", title: "Careers" },
    { key: "mvpServiceSEO", title: "MVP Development" },
    { key: "dataAnalyticsServiceSEO", title: "Data Analytics" },
    { key: "cloudEngineeringServiceSEO", title: "Cloud Engineering" },
    { key: "enterpriseAIServiceSEO", title: "Enterprise AI Solutions" },
    { key: "uiDesignServiceSEO", title: "UI/UX Designing" },
    { key: "webMobileServiceSEO", title: "Web & Mobile App Development" },
    { key: "contactSEO", title: "Contact Us" },
    { key: "letsConnectSEO", title: "Let's Connect" },
  ];

  return (
    <div className="p-6 relative">

      <div className="mb-6">
        <h4 className=" text-primaryText">Website Meta SEO</h4>
        <p className="text-primaryText mt-1">
          Manage SEO (Title, Description, OG Tags) for all pages.
        </p>
      </div>

      <div className=" grid grid-cols-2 gap-8">
        {seoSections.map((section) => (
          <div
            key={section.key}
            className="bg-white w-fit rounded-xl p-5 shadow-md border border-gray-200"
          >
            <EditWebLink
              webLink={seoValues[section.key] || ""}
              setWebLink={(updatedData) =>
                setSeoValues((prev) => ({ ...prev, [section.key]: updatedData }))
              }
              pageTitle={section.title}
              category={section.key}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

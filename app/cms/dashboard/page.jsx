"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { FileText, Users, Edit3, Zap, TrendingUp, MoreHorizontal } from "lucide-react";

const API = process.env.NEXT_PUBLIC_MOONDIVE_API;

export default function CMSDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState([]);
  const [caseStudies, setCaseStudies] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [industryStats, setIndustryStats] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [blogsRes, caseRes, modRes, indRes] = await Promise.allSettled([
          axios.get(`${API}/blogs/get-all-blogs-admin`),
          axios.get(`${API}/admin/get-case-study`),
          axios.get(`${API}/admin/moderation-data`),
          axios.get(`${API}/admin/get-industry-pages-statistics`),
        ]);

        const blogsData = blogsRes.status === "fulfilled" ? (blogsRes.value?.data?.data || []) : [];
        setBlogs(blogsData);
        const caseData = caseRes.status === "fulfilled" ? caseRes.value?.data : [];
        setCaseStudies(Array.isArray(caseData) ? caseData : (Array.isArray(caseData?.data) ? caseData.data : []));
        const modResult = modRes.status === "fulfilled" ? modRes.value?.data?.result : {};
        setTestimonials(modResult?.testimonial || []);
        const indData = indRes.status === "fulfilled" ? indRes.value?.data?.data : null;
        setIndustryStats(indData);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const totalBlogs = blogs.length;
  const publishedBlogs = blogs.filter(
    (b) => b.status?.toLowerCase() === "published"
  ).length;
  const draftBlogs = blogs.filter(
    (b) => b.status?.toLowerCase() === "draft"
  ).length;
  const totalCaseStudies = caseStudies.length;
  const totalTestimonials = testimonials.length;
  const totalIndustryPages = industryStats?.overview?.totalPages ?? 0;
  const publishedIndustryPages = industryStats?.overview?.publishedPages ?? 0;

  const categoryMap = {};
  blogs.forEach((b) => {
    const cat = b.category || b.blogCategory || "Uncategorized";
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });
  const topCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const recentBlogs = [...blogs]
    .filter((b) => b.status?.toLowerCase() === "published")
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 3);
  const monthLabels = [];
  const monthBuckets = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push(d.toLocaleString("en-US", { month: "short" }));
    monthBuckets.push(0);
  }
  blogs.forEach((b) => {
    if (!b.createdAt && !b.updatedAt) return;
    const d = new Date(b.createdAt || b.updatedAt);
    for (let i = 5; i >= 0; i--) {
      const ref = new Date(now.getFullYear(), now.getMonth() - i, 1);
      if (d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear()) {
        monthBuckets[5 - i] += 1;
        break;
      }
    }
  });
  const monthMax = Math.max(...monthBuckets, 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen fixed inset-0 bg-black/5 backdrop-blur-sm z-50">
        <DotLottieReact
          src="https://lottie.host/ae5fb18b-4cf0-4446-800f-111558cf9122/InmwUHkQVs.lottie"
          loop
          autoplay
          style={{ width: 100, height: 100, alignItems: "center" }}
        />
      </div>
    );
  }

  return (
    <div className="p-8 w-full">
      {/* Welcome Section */}
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-blackText">
            System Overview
          </h2>
          <p className="text-gray-500 mt-1 text-sm">
            Real-time metrics for your content network.
          </p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <KpiCard
          icon={<FileText className="w-5 h-5" />}
          iconBg="bg-blue-50 text-blue-600"
          label="Total Posts"
          value={totalBlogs}
          badge={publishedBlogs > 0 ? `${publishedBlogs} live` : null}
          badgeColor="text-emerald-500 bg-emerald-50"
        />
        <KpiCard
          icon={<Users className="w-5 h-5" />}
          iconBg="bg-orange-50 text-orange-600"
          label="Case Studies"
          value={totalCaseStudies}
          badge={null}
          badgeColor=""
        />
        <KpiCard
          icon={<Edit3 className="w-5 h-5" />}
          iconBg="bg-purple-50 text-purple-600"
          label="Drafts"
          value={draftBlogs}
          badge="Pending"
          badgeColor="text-gray-400 bg-gray-50"
        />
        <KpiCard
          icon={<Zap className="w-5 h-5" />}
          iconBg="bg-emerald-50 text-emerald-600"
          label="Industry Pages"
          value={totalIndustryPages}
          badge={
            publishedIndustryPages > 0
              ? `${publishedIndustryPages} published`
              : null
          }
          badgeColor="text-emerald-500 bg-emerald-50"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-blackText">
                Content Published Over Time
              </h3>
              <p className="text-sm text-gray-500">
                Monthly breakdown (last 6 months)
              </p>
            </div>
            <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
              <TrendingUp className="w-4 h-4" />
              {totalBlogs} total
            </div>
          </div>
          <div className="relative h-48 w-full">
            <MonthlyLineChart buckets={monthBuckets} max={monthMax} />
            <div className="flex justify-between px-2 pt-4 border-t border-gray-100 mt-4">
              {monthLabels.map((d, i) => (
                <span key={i} className="text-xs text-gray-400 font-medium">
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Category distribution */}
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-blackText">
                Posts by Category
              </h3>
              <p className="text-sm text-gray-500">
                Distribution of blog content
              </p>
            </div>
            <MoreHorizontal className="w-5 h-5 text-gray-400" />
          </div>
          <CategoryBarChart categories={topCategories} total={totalBlogs} />
        </div>
      </div>

      {/* Stat row for testimonials */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <MiniStatCard label="Testimonials" value={totalTestimonials} />
        <MiniStatCard label="Published Blogs" value={publishedBlogs} />
        <MiniStatCard
          label="Published Industries"
          value={publishedIndustryPages}
        />
      </div>

      {/* Trending Content */}
      {recentBlogs.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-blackText mb-6">
            Recent Content
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentBlogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Helper Components ───────────────────────────────── */

function KpiCard({ icon, iconBg, label, value, badge, badgeColor }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${iconBg}`}>{icon}</div>
        {badge && (
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full ${badgeColor}`}
          >
            {badge}
          </span>
        )}
      </div>
      <p className="text-gray-500 text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold mt-1 text-blackText">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

function MiniStatCard({ label, value }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
      <div className="p-2 bg-primary/5 rounded-lg">
        <FileText className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-gray-500 text-xs font-medium">{label}</p>
        <p className="text-xl font-bold text-blackText">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
      </div>
    </div>
  );
}

function MonthlyLineChart({ buckets, max }) {
  const w = 400;
  const h = 150;
  const pad = 10;

  const points = buckets.map((v, i) => {
    const x = pad + (i / (buckets.length - 1)) * (w - pad * 2);
    const y = h - pad - (v / max) * (h - pad * 2);
    return `${x},${y}`;
  });

  const pathD = `M${points.join(" L")}`;
  const areaD = `${pathD} L${w - pad},${h} L${pad},${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id="cmsAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,123,48,0.15)" />
          <stop offset="100%" stopColor="rgba(255,123,48,0)" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#cmsAreaGrad)" />
      <path
        d={pathD}
        fill="none"
        stroke="#FF7B30"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CategoryBarChart({ categories, total }) {
  const max = categories.length
    ? Math.max(...categories.map(([, c]) => c), 1)
    : 1;

  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-52 text-gray-400 text-sm">
        No category data available
      </div>
    );
  }

  return (
    <div className="grid items-end gap-6 h-52 px-4" style={{ gridTemplateColumns: `repeat(${categories.length}, 1fr)` }}>
      {categories.map(([cat, count]) => {
        const pct = (count / max) * 100;
        return (
          <div key={cat} className="flex flex-col items-center gap-4 h-full justify-end">
            <div
              className="w-full bg-primary/10 rounded-t-lg relative group transition-all hover:bg-primary/30"
              style={{ height: `${Math.max(pct, 8)}%` }}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                {count}
              </div>
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter text-center truncate w-full">
              {cat}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function BlogCard({ blog }) {
  const imgSrc =
    blog?.featuredImage?.[0]?.url ||
    blog?.heroImage?.[0]?.url ||
    blog?.openGraphImage ||
    blog?.coverImage ||
    "/placeholder-blog.jpg";
  const category = blog.category || blog.blogCategory || "Blog";
  const title = blog.title || blog.blogTitle || "Untitled";

  return (
    <div className="group relative overflow-hidden rounded-xl aspect-[16/10] bg-gray-200">
      <img
        src={imgSrc}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
        <span className="text-[10px] font-bold text-white bg-primary px-2 py-0.5 rounded uppercase w-fit mb-2">
          {category}
        </span>
        <h4 className="text-white font-bold leading-tight line-clamp-2">
          {title}
        </h4>
        {blog.createdAt && (
          <p className="text-white/60 text-xs mt-2">
            {new Date(blog.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import ComparisonForm from "@/components/ManageComparisons/ComparisonForm"; 

const CATEGORIES = [
  "All",
  "Mobile",
  "Cloud",
  "Frontend",
  "Backend",
  "Database",
  "Process",
  "Other",
];
const STATUSES = ["All", "published", "draft"];

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_MOONDIVE_API || process.env.NEXT_PUBLIC_API || "",
  // Add interceptors or default headers if needed
});

export default function ManageComparisons() {
  const router = useRouter();
  const [comparisons, setComparisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0 });

  // controls
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortBy, setSortBy] = useState("createdAt");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // modal controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", "10");
    params.append("sort", sortBy);
    if (debouncedSearch) params.append("search", debouncedSearch);
    if (selectedCategory !== "All") params.append("category", selectedCategory);
    if (selectedStatus !== "All") params.append("status", selectedStatus);
    return params.toString();
  }, [page, sortBy, debouncedSearch, selectedCategory, selectedStatus]);

  const fetchComparisons = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/comparisons?${queryParams}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });

      if (res?.data?.responseCode === 200) {
        setComparisons(res.data.result.comparisons || []);
        setTotalPages(res.data.result.totalPages || 1);
      } else {
        setComparisons([]);
        setTotalPages(1);
        toast.error(res?.data?.responseMessage || "Failed to fetch comparisons");
      }
    } catch (err) {
      console.error("Fetch comparisons err:", err);
      toast.error("Failed to fetch comparisons");
      setComparisons([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/comparisons-stats", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });
      if (res?.data?.responseCode === 200) {
        setStats({
          total: res.data.result.total || 0,
          published: res.data.result.published || 0,
          draft: res.data.result.draft || 0,
        });
      }
    } catch (err) {
      console.error("Fetch stats err:", err);
    }
  };

  useEffect(() => {
    fetchComparisons();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  // delete
  const handleDelete = async (id, title) => {
    const ok = window.confirm(`Delete "${title}"? This action cannot be undone.`);
    if (!ok) return;

    try {
      const res = await api.delete(`/admin/comparisons/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });

      if (res?.data?.responseCode === 200) {
        toast.success("Comparison deleted");
        // refresh
        fetchComparisons();
        fetchStats();
      } else {
        toast.error(res?.data?.responseMessage || "Failed to delete");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete comparison");
    }
  };

  // open modal for add
  const openAddModal = () => {
    setEditingId(null);
    setIsModalOpen(true);
  };

  // open modal for edit
  const openEditModal = (id) => {
    setEditingId(id);
    setIsModalOpen(true);
  };

  // close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  // on saved callback to refresh list and close modal
  const onSaved = () => {
    fetchComparisons();
    fetchStats();
    closeModal();
  };

  const openExternal = (path) => {
    const url = path.startsWith("http") ? path : `https://moondive.co${path.startsWith("/") ? "" : "/"}${path}`;
    window.open(url, "_blank");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h4 className="text-primaryText">Comparisons</h4>
          <p className="text-primaryText mt-1">Manage technology comparison pages</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full hover:opacity-95 transition"
          >
            <Plus size={16} />
            Add New
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Comparisons</p>
          <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-gray-500">Published</p>
          <p className="text-2xl font-semibold text-green-600">{stats.published}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-gray-500">Drafts</p>
          <p className="text-2xl font-semibold text-orange-600">{stats.draft}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search comparisons..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-full focus:ring-0 focus:border-primary"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-full focus:ring-0 focus:border-primary appearance-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === "All" ? "All Categories" : c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-0 focus:border-primary appearance-none"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === "All" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-full focus:ring-0 focus:border-primary appearance-none"
            >
              <option value="createdAt">Newest First</option>
              <option value="title">Title A–Z</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white w-full rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-500">Loading comparisons...</p>
          </div>
        ) : comparisons.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600 text-lg">No comparisons found</p>
            <p className="text-gray-400 mt-2">
              {searchQuery || selectedCategory !== "All" || selectedStatus !== "All"
                ? "Try adjusting filters"
                : "Create your first comparison to get started"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto max-w-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left  text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Options</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                  <th className="px-6 py-3 text-righttext-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {comparisons.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 align-top">
                      <div className="text-sm font-medium text-gray-900 line-clamp-2 min-w-[220px]">{c.title}</div>
                      <div className="text-sm text-gray-500">/{c.slug}</div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {c.category || "Other"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-2 min-w-[150px]">
                        {Array.isArray(c.options) ? c.options.join(" vs ") : "-"}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${c.status === "published" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}`}>
                        {c.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.viewCount || 0}</td>

                    <td className="px-6 py-4 text-sm text-gray-500">{c.lastUpdated ? new Date(c.lastUpdated).toLocaleDateString() : "—"}</td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openExternal(`/resources/comparisons/${c.slug}`)} className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition" title="View">
                          <Eye size={16} />
                        </button>

                        <button onClick={() => openEditModal(c._id)} className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition" title="Edit">
                          <Edit size={16} />
                        </button>

                        <button onClick={() => handleDelete(c._id, c.title)} className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border border-gray-300 rounded-full disabled:opacity-50">Previous</button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 border border-gray-300 rounded-full disabled:opacity-50">Next</button>
          </div>
        </div>
      )}

      {/* Modal (Add/Edit) */}
      {isModalOpen && (
        <ComparisonForm
          comparisonId={editingId}
          onClose={() => {
            setIsModalOpen(false);
            setEditingId(null);
          }}
          onSaved={() => onSaved()}
        />
      )}
    </div>
  );
}

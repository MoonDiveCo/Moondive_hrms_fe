'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BlogTableRow from '@/components/ManageBlogs/BlogTableRow';
import { ROUTE_ALL_BLOGS_ADMIN } from '@/text';
import BlogModal from '@/components/ManageBlogs/BlogModal';

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [openModal, setOpenModal] = useState(false);
const [editBlog, setEditBlog] = useState(null);

  const fetchBlogs = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_MOONDIVE_API}/${ROUTE_ALL_BLOGS_ADMIN}?status=${selectedFilter}&search=${searchQuery}`
      );
      setBlogs(data?.data || []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [selectedFilter, searchQuery]);

  return (
    <div className="p-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-primaryText font-semibold">Manage Blogs</h4>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search blogs..."
            className="rounded-full border border-gray-300 bg-transparent px-4 py-2 text-sm outline-none focus:border-primary focus:ring-primary"
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="rounded-full border border-gray-300 bg-transparent px-4 py-2 text-sm outline-none focus:border-primary focus:ring-primary"
          >
            <option value="">All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <button
            className="bg-primary text-white rounded-full px-4 py-2"
            onClick={() => { setEditBlog(null); setOpenModal(true); }}
          >
            Add Blog
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-primaryText">
            <tr>
              <th className="p-3 w-[120px]">Image</th>
              <th className="p-3">Title</th>
              <th className="p-3">Category</th>
              <th className="p-3">Status</th>
              <th className="p-3">Published</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {blogs?.length > 0 ? (
              blogs.map((blog) => <BlogTableRow key={blog._id} blog={blog} openEditModal={(blog) => {
                  setEditBlog(blog);
                  setOpenModal(true);
              }} />)
            ) : (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={6}>
                  No blogs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <BlogModal 
      isOpen={openModal} 
      initialData={editBlog}
      onClose={() => { 
        setOpenModal(false); 
        fetchBlogs(); 
      }} 
    />
    </div>
  );
};

export default Blog;

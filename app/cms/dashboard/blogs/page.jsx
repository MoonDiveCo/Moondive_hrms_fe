'use client';

import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import BlogTableRow from '@/components/ManageBlogs/BlogTableRow';
import { ROUTE_ALL_BLOGS_ADMIN } from '@/text';
import BlogModal from '@/components/ManageBlogs/BlogModal';
import FilterDropdown from '@/components/UI/FilterDropdown';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { RBACContext } from '@/context/rbacContext';
import ConfirmDeleteModal from '@/components/OrganizationFileComponent/ConfirmDeleteModal';
import { toast } from 'sonner';


const Blog = () => {
  const { canPerform } = useContext(RBACContext);
  const [blogs, setBlogs] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [openModal, setOpenModal] = useState(false);
const [editBlog, setEditBlog] = useState(null);
const [loading, setLoading] = useState(true)
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
const [blogToDelete, setBlogToDelete] = useState(null);
const [isDeleting, setIsDeleting] = useState(false);

  const fetchBlogs = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_MOONDIVE_API}/${ROUTE_ALL_BLOGS_ADMIN}?status=${selectedFilter}&search=${searchQuery}`
      );
      setLoading(false)
      setBlogs(data?.data || []);
    } catch (error) {
      setLoading(false)
      console.error("Error fetching blogs:", error);
    }
  };
  
  useEffect(() => {
    fetchBlogs();
  }, [selectedFilter, searchQuery]);

  const handleDelete = async () => {
    if (!blogToDelete) return;
    setIsDeleting(true);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_MOONDIVE_API}/blogs/delete/${blogToDelete._id}`
      );
      toast.success("Blog deleted successfully");
      setIsDeleteModalOpen(false);
      setBlogToDelete(null);
      fetchBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error(error?.response?.data?.message || "Failed to delete blog");
    } finally {
      setIsDeleting(false);
    }
  };

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
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-primaryText font-semibold">Manage Blogs</h4>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search blogs..."
            className="rounded-full border border-gray-300 bg-transparent px-3 py-1 text-xs outline-none focus:border-primary focus:ring-primary"
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <FilterDropdown
            label="Filter"
            value={selectedFilter}
            options={[
              { label: "All", value: "" },
              { label: "Published", value: "published" },
              { label: "Draft", value: "draft" },
            ]}
            onChange={(v) => setSelectedFilter(v)}
          />

          {canPerform("WRITE", "CMS", "BLOGS") && (
          <button
            className="bg-primary text-white rounded-full px-3 py-1"
            onClick={() => { setEditBlog(null); setOpenModal(true); }}
          >
            <span className='text-xs flex item-center'>Add Blog</span>
          </button>
          )}
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
              blogs.map((blog) => <BlogTableRow key={blog._id} blog={blog}
                canEdit={canPerform("EDIT", "CMS", "BLOGS")}
                canDelete={canPerform("DELETE", "CMS", "BLOGS")}
                openEditModal={(blog) => {
                  setEditBlog(blog);
                  setOpenModal(true);
              }} 
                onDelete={(blog) => {
                  setBlogToDelete(blog);
                  setIsDeleteModalOpen(true);
                }}
              />)
            ) : (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={6}>
                   {loading ? (
                    <div className="animate-pulse flex justify-center">
                      <div className="h-4 w-24 bg-gray-300 rounded"></div>
                    </div>
                  ) : (
                    <span className="text-gray-500">No blogs found</span>
                  )}
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

      <ConfirmDeleteModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Blog"
        message="Are you sure you want to delete this blog? This action cannot be undone."
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default Blog;

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, Edit, Trash2 } from "lucide-react";

const BlogTableRow = ({ blog, openEditModal  }) => {
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      
      {/* Image */}
      <td className="p-3">
        <Image
          src={blog?.featuredImage?.[0]?.url || blog.heroImage[0]?.url}
          alt="Featured"
          width={120}
          height={80}
          className="rounded-md object-cover w-[120px] h-[80px]"
          unoptimized
        />
      </td>

      {/* Title */}
      <td className="p-3 font-medium text-gray-900">
        {blog?.title}
      </td>

      {/* Category */}
      <td className="p-3">
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm">
          {blog?.category || "General"}
        </span>
      </td>

      {/* Status */}
      <td className="p-3">
        {blog?.status === "published" ? (
          <span className="text-green-600 font-medium">Published</span>
        ) : (
          <span className="text-red-600 font-medium">Draft</span>
        )}
      </td>

      {/* Published Date */}
      <td className="p-3 text-gray-700">
        {blog?.publishedAt
          ? new Date(blog.publishedAt).toLocaleDateString()
          : "—"}
      </td>

      {/* Actions */}
      <td className="p-3 text-center">
        <div className="flex justify-center gap-3">
          
          <Link href={`/admin/blogs/${blog?.slug}`} target="_blank">
            <Eye className="w-5 h-5 text-blue-600 cursor-pointer" />
          </Link>

          <button onClick={() => openEditModal(blog)}>
            <Edit className="w-5 h-5 text-yellow-600 cursor-pointer" />
          </button>

          <button onClick={() => console.log("Delete", blog._id)}>
            <Trash2 className="w-5 h-5 text-red-600 cursor-pointer" />
          </button>

        </div>
      </td>
    </tr>
  );
};

export default BlogTableRow;

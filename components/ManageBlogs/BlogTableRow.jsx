import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

const BlogTableRow = ({ blog, openEditModal  }) => {
  const router =  useRouter()
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      
      {/* Image */}
      <td className="p-3">
        <Image
          src={blog?.featuredImage?.[0]?.url || blog.heroImage[0]?.url}
          alt="Featured"
          width={100}
          height={50}
          className="rounded-md object-cover w-[100px] h-[50px]"
          unoptimized
        />
      </td>

      {/* Title */}
      <td className="p-3 text-gray-900">
        <p>{blog?.title}</p>
      </td>

      {/* Category */}
      <td className="p-3">
        <span className="bg-primary text-whiteText px-3 py-1 rounded-lg text-sm">
          {blog?.category || "General"}
        </span>
      </td>

      {/* Status */}
      <td className="p-3">
        {blog?.status === "published" ? (
          <p className=" text-green-600">Published</p>
        ) : (
          <p className="text-primary">Draft</p>
        )}
      </td>

      {/* Published Date */}
      <td className="p-3 text-gray-700">
        {blog?.updatedAt
          ? new Date(blog.updatedAt).toLocaleDateString()
          : "—"}
      </td>

      {/* Actions */}
      <td className="p-3 text-center">
        <div className="flex justify-center gap-3">
          
          <button  
            onClick={() =>
                window.open(`https://moondive.co/blog/${blog?.slug}`, "_blank")
              }>
            <Eye className="w-4 h-4 text-blue-600 cursor-pointer" />
          </button>

          <button onClick={() => openEditModal(blog)}>
            <Edit className="w-4 h-4 text-yellow-600 cursor-pointer" />
          </button>

          <button onClick={() => console.log("Delete", blog._id)}>
            <Trash2 className="w-4 h-4 text-red-600 cursor-pointer" />
          </button>

        </div>
      </td>
    </tr>
  );
};

export default BlogTableRow;

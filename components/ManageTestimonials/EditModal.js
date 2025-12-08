"use client";
import React, { useState } from "react";
import Image from "next/image";
import axios from "axios";

import crossIcon from "@/public/CMS/cross-icon.svg";
import defaultImage from "@/public/CMS/default_image.svg";

import {
  BTN_DONE,
  BTN_UPDATE,
  BTN_UPLOAD_PROFILE_IMAGE,
  BTN_UPLOAD_OG_IMAGE,
  ENDPOINT_CREATE_TESTIMONIAL,
  ENDPOINT_EDIT_TESTIMONIAL,
  ENDPOINT_EDIT_WEB_LINK,
  TEXT_ENTER_DESIGNATION,
  TEXT_ENTER_LINK,
  TEXT_ENTER_NAME,
  TEXT_ENTER_OG_TITLE,
  TEXT_ENTER_OG_DESCRIPTION,
  TEXT_ENTER_TESTIMONIAL,
  TEXT_ENTER_WEBSITE_NAME,
  TEXT_HOME_PAGE_META_DESCRIPTION,
  TEXT_HOME_PAGE_META_TITLE,
  TEXT_SMALL_TESTIMONIAL,
  POST_REQUEST,
} from "@/text";

export default function EditModal({
  openModal,
  setOpenModal,
  onClose,
  testimonial,
  setTestimonials,
  editIndex,
  isAddMode,
  descriptionblog,
  setBlogs,
  isBlogMode,
  webLink,
  setWebLink,
  editWebLink,
  category,
}) {
  const [profileImage, setProfileImage] = useState(
    testimonial?.profileImage || webLink?.linkImage || defaultImage.src
  );

  const [ogImage, setOgImage] = useState(
    testimonial?.ogImage || webLink?.ogImage || defaultImage.src
  );

  const [name, setName] = useState(testimonial?.name || descriptionblog?.title || "");
  const [designation, setDesignation] = useState(testimonial?.designation || "");
  const [webName, setWebName] = useState(testimonial?.websiteName || "");
  const [ogTitle, setOgTitle] = useState(webLink?.ogTitle || "");
  const [ogDescription, setOgDescription] = useState(webLink?.ogDescription || "");
  const [webSiteLink, setWebSiteLink] = useState(testimonial?.link || "");
  const [description, setDescription] = useState(
    testimonial?.description || descriptionblog?.description || ""
  );

  const [editTitle, setEditTitle] = useState(webLink?.title || "");
  const [editDescription, setEditDescription] = useState(webLink?.description || "");

  const uploadImage = async (file, setter) => {
    const formData = new FormData();
    formData.append("testimonialImage", file);

    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_MOONDIVE_API}/contact/aws-image`,
        formData
      );

      setter(data?.result?.imageUrls?.[0]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileImageUpdate = (e) => uploadImage(e.target.files[0], setProfileImage);
  const handleOgImageUpdate = (e) => uploadImage(e.target.files[0], setOgImage);

  const handleSubmit = async () => {
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_MOONDIVE_API}/${ENDPOINT_EDIT_TESTIMONIAL}/${editIndex}/${TEXT_SMALL_TESTIMONIAL}`,
        {
          name,
          description,
          profileImage,
          ogImage,
          websiteName: webName,
          link: webSiteLink,
          designation,
          ogTitle,
          ogDescription,
        }
      );

      setTestimonials(data?.result?.testimonial);
      setOpenModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateWebLink = async () => {
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_MOONDIVE_API}/${ENDPOINT_EDIT_WEB_LINK}${category}`,
        {
          title: editTitle,
          description: editDescription,
          linkImage: profileImage,
          ogImage,
          ogTitle,
          ogDescription,
        }
      );

      setWebLink(data?.result?.[category]);
      setOpenModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  const addTestimonial = async () => {
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_MOONDIVE_API}/${ENDPOINT_CREATE_TESTIMONIAL}`,
        {
          name,
          description,
          profileImage,
          ogImage,
          websiteName: webName,
          link: webSiteLink,
          designation,
        }
      );

      setTestimonials(data?.result?.testimonial);
      setOpenModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleClick = () => {
    if (isAddMode) return addTestimonial();
    if (editWebLink) return handleUpdateWebLink();
    handleSubmit();
  };

  if (!openModal) return null;
  
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex justify-center items-center">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-xl p-6 shadow-xl relative hide-scrollbar">

        <button onClick={onClose} className="absolute top-4 right-4">
          <Image src={crossIcon} width={28} height={28} alt="close" />
        </button>

        <div className="flex justify-center gap-10 pb-6">
          {/* Profile Image */}
          <div className="flex flex-col items-center">
            <img
              src={profileImage}
              className="rounded-full w-32 h-32 object-cover border"
              alt="profile"
            />
            <label
              htmlFor="profileImageInput"
              className="text-blue-600 underline text-sm cursor-pointer mt-2"
            >
              {BTN_UPLOAD_PROFILE_IMAGE}
            </label>
            <input
              type="file"
              id="profileImageInput"
              accept="image/*"
              className="hidden"
              onChange={handleProfileImageUpdate}
            />
          </div>

          {editWebLink && (
            <div className="flex flex-col items-center">
              <img
                src={ogImage}
                className="rounded-full w-32 h-32 object-cover border"
                alt="og image"
              />
              <label
                htmlFor="ogImageInput"
                className="text-blue-600 underline text-sm cursor-pointer mt-2"
              >
                {BTN_UPLOAD_OG_IMAGE}
              </label>
              <input
                type="file"
                id="ogImageInput"
                accept="image/*"
                className="hidden"
                onChange={handleOgImageUpdate}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">

          {/* Name + Designation */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-600 text-sm mb-1 block">
                {editWebLink ? TEXT_HOME_PAGE_META_TITLE : TEXT_ENTER_NAME}
              </label>
              <input
                value={editWebLink ? editTitle : name}
                onChange={(e) => (editWebLink ? setEditTitle(e.target.value) : setName(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-full focus:border-primary focus:outline-none"
              />
            </div>

            {!editWebLink && (
              <div>
                <label className="text-gray-600 text-sm mb-1 block">
                  {TEXT_ENTER_DESIGNATION}
                </label>
                <input
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-full focus:border-primary focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* OG Title */}
          {editWebLink && (
            <div>
              <label className="text-gray-600 text-sm mb-1 block">{TEXT_ENTER_OG_TITLE}</label>
              <input
                value={ogTitle}
                onChange={(e) => setOgTitle(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-full focus:border-primary focus:outline-none"
              />
            </div>
          )}

          {/* OG Description */}
          {editWebLink && (
            <div>
              <label className="text-gray-600 text-sm mb-1 block">{TEXT_ENTER_OG_DESCRIPTION}</label>
              <textarea
                rows={3}
                value={ogDescription}
                onChange={(e) => setOgDescription(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
              />
            </div>
          )}

          {/* Website Name + URL */}
          {!editWebLink && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-600 text-sm mb-1 block">{TEXT_ENTER_WEBSITE_NAME}</label>
                <input
                  value={webName}
                  onChange={(e) => setWebName(e.target.value)}
                  className="w-full p-3 border rounded-full border-gray-300 focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-600 text-sm mb-1 block">{TEXT_ENTER_LINK}</label>
                <input
                  value={webSiteLink}
                  onChange={(e) => setWebSiteLink(e.target.value)}
                  className="w-full p-3 border rounded-full border-gray-300 focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* DESCRIPTION */}
          <div>
            <label className="text-gray-600 text-sm mb-1 block">
              {editWebLink ? TEXT_HOME_PAGE_META_DESCRIPTION : TEXT_ENTER_TESTIMONIAL}
            </label>
            <textarea
              rows={3}
              value={editWebLink ? editDescription : description}
              onChange={(e) =>
                editWebLink ? setEditDescription(e.target.value) : setDescription(e.target.value)
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <button
          className="mt-6 w-full bg-primary text-whiteText py-3 rounded-full text-base hover:bg-primary/90 transition"
          onClick={handleClick}
        >
          {isAddMode || isBlogMode ? BTN_DONE : BTN_UPDATE}
        </button>
      </div>
    </div>
  );
}

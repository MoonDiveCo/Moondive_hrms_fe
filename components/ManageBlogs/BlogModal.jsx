"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { X } from "lucide-react";

import {
  PLACEHOLDER_TITLE,
  PLACEHOLDER_META_DESCRIPTION,
  PLACEHOLDER_WRITE_SOMETHING,
  LABEL_SELECT_INDUSTRY,
  LABEL_UPLOAD_HERO_IMAGE,
  LABEL_HERO_IMAGE_ALT_TEXT,
  LABEL_ENABLE_CTA_SECTION,
  LABEL_CTA_TITLE,
  LABEL_CTA_DESCRIPTION,
  LABEL_BUTTON_TEXT,
  LABEL_BUTTON_LINK,
  TEXT_START_WRITING,
  TEXT_ADD_META_DESCRIPTION,
  TEXT_EDIT_URL,
  TEXT_WORD_COUNT,
  TEXT_ESTIMATED_READING_TIME,
  TEXT_ENTER_OPEN_GRAPH_TITLE,
  TEXT_UPLOAD_OPEN_GRAPH_IMAGE,
  TEXT_OPEN_GRAPH_PREVIEW,
  BTN_PUBLISH,
  BTN_DRAFT,
  NOTE_DEFAULT_META_DESCRIPTION,
  NOTE_BETTER_SEO,
  INDUSTRY_OPTIONS,
  DEFAULT_TAG_VALUES,
  CTA_DEFAULT_TITLE,
  CTA_DEFAULT_DESCRIPTION,
  CTA_DEFAULT_BUTTON_TEXT,
  CTA_DEFAULT_BUTTON_LINK,
  CTA_DEFAULT_BACKGROUND,
  META_DESCRIPTION_MAX_LENGTH,
  META_DESCRIPTION_PREVIEW_LENGTH,
  WORDS_PER_MINUTE_READING,
  MAX_TAGS_ALLOWED,
  MSG_MAX_TAGS_LIMIT,
} from "@/text";
import "react-quill-new/dist/quill.snow.css";
import MDNote from "@/components/ManageBlogs/MDNote/MDNote";
import OpenGraphPreviewCard from "@/components/ManageBlogs/openGraphPreviewCard/OpenGraphPreviewCard";

const Tags = dynamic(() => import("@/components/ManageBlogs/Tag/Tag"), { ssr: false });
const ImageUploader = dynamic(() => import("@/components/ManageBlogs/imageUpload/Upload"), { ssr: false });
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function BlogModal({ isOpen, onClose, initialData }) {
  if (!isOpen) return null;

  const isEditing = Boolean(initialData);
  const [loading, setLoading] = useState(false);

  // MAIN FORM STATES
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [industry, setIndustry] = useState(initialData?.industry || "");
  const [body, setBody] = useState(initialData?.body || "");
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || "");
  const [tags, setTags] = useState(initialData?.tags || DEFAULT_TAG_VALUES);

  // IMAGE STATES
  const [heroImage, setHeroImage] = useState(initialData?.heroImage || []);
  const [heroAltText, setHeroAltText] = useState(initialData?.heroAltText || "");

  const [ogImage, setOgImage] = useState(initialData?.openGraphImage || []);
  const [ogTitle, setOgTitle] = useState(initialData?.ogTitle || title);

  // CTA STATES
  const [ctaEnabled, setCtaEnabled] = useState(initialData?.ctaSection?.enabled ?? true);
  const [ctaTitle, setCtaTitle] = useState(initialData?.ctaSection?.title || CTA_DEFAULT_TITLE);
  const [ctaDescription, setCtaDescription] = useState(initialData?.ctaSection?.description || CTA_DEFAULT_DESCRIPTION);
  const [ctaButtonText, setCtaButtonText] = useState(initialData?.ctaSection?.buttonText || CTA_DEFAULT_BUTTON_TEXT);
  const [ctaButtonLink, setCtaButtonLink] = useState(initialData?.ctaSection?.buttonLink || CTA_DEFAULT_BUTTON_LINK);

  // WORD COUNT
  const wordCount = body.replace(/<[^>]+>/g, "").trim().split(/\s+/).length;
  const estimatedTime = Math.ceil(wordCount / WORDS_PER_MINUTE_READING);

  /** IMAGE UPLOAD HANDLER */
  const uploadImage = async (files, setter) => {
    const fd = new FormData();
    files.forEach((f, i) => fd.append(`images[${i}]`, f));

    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_MOONDIVE_API}/blogs/upload-open-graph-image`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const urls = data?.data?.imageUrls?.map((url) => ({ url }));
      setter(urls);
    } catch (err) {
      console.log("UPLOAD ERROR", err);
    }
  };

  /** SUBMIT BLOG */
  const handleSubmit = async (status) => {
    setLoading(true);

    const payload = {
      title,
      slug,
      body,
      metaDescription,
      industry,
      tags,
      heroImage,
      heroAltText,
      openGraphImage: ogImage,
      ogTitle,
      ctaSection: {
        enabled: ctaEnabled,
        title: ctaTitle,
        description: ctaDescription,
        buttonText: ctaButtonText,
        buttonLink: ctaButtonLink,
        backgroundColor: CTA_DEFAULT_BACKGROUND,
      },
      status,
    };

    try {
      if (isEditing) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_MOONDIVE_API}/blogs/publish-blog/${initialData._id}`,
          payload
        );
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_MOONDIVE_API}/blogs/publish-blog`,
          payload
        );
      }

      onClose(true);
    } catch (err) {
      console.log("Blog Save Error", err);
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center">
      <div className="bg-white w-[90%] max-w-6xl h-[90vh] rounded-xl overflow-hidden shadow-lg flex flex-col">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h4 className="">
            {isEditing ? "Edit Blog" : "Create New Blog"}
          </h4>

          <button onClick={onClose}>
            <X className="w-6 h-6 text-gray-600 hover:text-black" />
          </button>
        </div>

        {/* CONTENT - SCROLLABLE */}
        <div className="overflow-y-auto p-6 space-y-6">

          {/* TITLE */}
          <input
            className="w-full border-b border-gray-300 focus:border-primary font-medium outline-none"
            placeholder={PLACEHOLDER_TITLE}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setSlug(e.target.value.toLowerCase().replace(/ /g, "-"));
            }}
          />

          {/* SEO NOTE */}
          <MDNote type="warning">{NOTE_BETTER_SEO}</MDNote>

          {/* INDUSTRY */}
          <div>
            <label className="text-gray-500">{LABEL_SELECT_INDUSTRY}</label>
            <select
              value={industry}
              className="mt-1 w-full p-3 border rounded-full border-gray-300 focus:border-primary"
              onChange={(e) => setIndustry(e.target.value)}
            >
              <option value="">Select Industry</option>
              {INDUSTRY_OPTIONS.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* TAGS */}
          <Tags defaultSelectedValues={tags} setTagValues={(v) => {
            if (v.length > MAX_TAGS_ALLOWED) return alert(MSG_MAX_TAGS_LIMIT);
            setTags(v);
          }} />

          {/* HERO IMAGE */}
          <div>
            <div className="gap-2 flex ">
            <p className="text-gray-500">{LABEL_UPLOAD_HERO_IMAGE}</p>
            <ImageUploader
              onFileSelect={(files) => uploadImage(files, setHeroImage)}
              photoURLs={heroImage}
              deletePhoto={() => setHeroImage([])}
            /></div>

            <input
              className="mt-2 w-full border p-3 rounded-full border-gray-300 focus:border-primary"
              placeholder={LABEL_HERO_IMAGE_ALT_TEXT}
              value={heroAltText}
              onChange={(e) => setHeroAltText(e.target.value)}
            />
          </div>

          {/* EDITOR */}
          <div>
            <label className="text-gray-600 mb-2">{TEXT_START_WRITING}</label>
            <ReactQuill
              theme="snow"
              placeholder={PLACEHOLDER_WRITE_SOMETHING}
              value={body}
              onChange={setBody}
              className="min-h-[100px]"
            />
          </div>

          {/* CTA */}
          <div className="border border-gray-300 p-4 rounded-lg bg-gray-50">
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={ctaEnabled} onChange={(e) => setCtaEnabled(e.target.checked)} />
              <label>{LABEL_ENABLE_CTA_SECTION}</label>
            </div>

            {ctaEnabled && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <input className="border border-gray-300 focus:border-primary focus:ring-0 focus:outline-none p-3 rounded-full" placeholder={LABEL_CTA_TITLE} value={ctaTitle} onChange={(e) => setCtaTitle(e.target.value)} />
                <input className="border border-gray-300 focus:border-primary focus:ring-0 focus:outline-none p-3 rounded-full" placeholder={LABEL_BUTTON_TEXT} value={ctaButtonText} onChange={(e) => setCtaButtonText(e.target.value)} />
                <textarea className="border border-gray-300 focus:border-primary focus:ring-0 focus:outline-none p-3 rounded-lg col-span-2" placeholder={LABEL_CTA_DESCRIPTION} rows={3} value={ctaDescription} onChange={(e) => setCtaDescription(e.target.value)} />
                <input className="border border-gray-300 focus:border-primary focus:ring-0 focus:outline-none p-3 rounded-full col-span-2" placeholder={LABEL_BUTTON_LINK} value={ctaButtonLink} onChange={(e) => setCtaButtonLink(e.target.value)} />
              </div>
            )}
          </div>

          {/* META DESCRIPTION */}
          <div>
            <label className="text-gray-600 mb-1">{TEXT_ADD_META_DESCRIPTION}</label>
            <MDNote type="warning">{NOTE_DEFAULT_META_DESCRIPTION}</MDNote>

            <textarea
              rows={3}
              className="border border-gray-300 focus:border-primary focus:ring-0 focus:outline-none  p-4 w-full rounded-lg mt-2"
              placeholder={PLACEHOLDER_META_DESCRIPTION}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
            />
          </div>

          {/* SLUG */}
          <div className="gap-2 flex items-center">
            <label className="text-gray-600">{TEXT_EDIT_URL}</label>
            <input
              className="border border-gray-300 focus:border-primary focus:ring-0 focus:outline-none  p-2 rounded-full mt-1"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </div>

          {/* OG IMAGE */}
          <div className="gap-2 flex">
            <label className="text-gray-600">{TEXT_UPLOAD_OPEN_GRAPH_IMAGE}</label>
            <ImageUploader
              onFileSelect={(files) => uploadImage(files, setOgImage)}
              photoURLs={ogImage}
              deletePhoto={() => setOgImage([])}
            />
          </div>

          {/* OG TITLE */}
          <div className="gap-2 flex items-center">
            <label className="text-gray-600">{TEXT_ENTER_OPEN_GRAPH_TITLE}</label>
            <input
              className="border  border-gray-300 focus:border-primary focus:ring-0 focus:outline-none  p-2 rounded-full mt-1"
              value={ogTitle}
              onChange={(e) => setOgTitle(e.target.value)}
            />
          </div>

          {/* OG PREVIEW */}
          {ogImage?.length > 0 && (
            <div>
              <label className="text-gray-600 mb-2">{TEXT_OPEN_GRAPH_PREVIEW}</label>
              <OpenGraphPreviewCard
                title={ogTitle || title}
                description={metaDescription}
                image={ogImage[0].url}
              />
            </div>
          )}

        </div>

        {/* FOOTER BUTTONS */}
        <div className="flex justify-end gap-4 p-4 border-t">
          <button
            disabled={loading}
            onClick={() => handleSubmit("draft")}
            className="px-4 py-2 border border-primary text-blackText rounded-full"
          >
            {BTN_DRAFT}
          </button>

          <button
            disabled={loading}
            onClick={() => handleSubmit("published")}
            className="px-4 py-2 bg-primary text-whiteText rounded-full"
          >
            {BTN_PUBLISH}
          </button>
        </div>

      </div>
    </div>
  );
}

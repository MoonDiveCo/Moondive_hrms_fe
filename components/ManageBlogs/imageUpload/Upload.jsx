"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Eye, Trash2 } from "lucide-react";
import ImagePreviewModal from "./ImagePreviewModal";
import { toast } from "react-toastify";

export default function ImageUploader({
  onFileSelect,
  photoURLs = [],
  deletePhoto,
  onlyButton = false,
  upload,
  setUpload,
  key,
}) {
  const [previewImages, setPreviewImages] = useState([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

  const openPreview = (index) => {
    setCurrentPreviewIndex(index);
    setIsPreviewOpen(true);
  };
  const closePreview = () => setIsPreviewOpen(false);

  const showNextImage = () =>
    setCurrentPreviewIndex((i) => (i + 1) % photoURLs.length);

  const showPrevImage = () =>
    setCurrentPreviewIndex((i) => (i - 1 + photoURLs.length) % photoURLs.length);

  const handleChange = (e) => {
    const newFiles = Array.from(e.target.files);
    if (!newFiles.length) return;

    const previews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviewImages((prev) => [...prev, ...previews]);

    onFileSelect(newFiles);
    if (setUpload) setUpload(true);
  };

  return (
    <div className="">

      {!onlyButton && (
        <label className="inline-block bg-primary border border-white text-whiteText text-sm px-3 py-1 rounded-full cursor-pointer hover:bg-white hover:text-blackText hover:border-primary hover:border">
          Upload Image
          <input
            type="file"
            className="hidden"
            key={key}
            onChange={handleChange}
            multiple
          />
        </label>
      )}

      {onlyButton && (
        <input
          type="file"
          onChange={handleChange}
          key={key}
          className="block text-sm"
          multiple
        />
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
        {photoURLs?.map((photo, index) => (
          <div key={index} className="relative group">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-50 relative cursor-pointer">
              <Image
                src={photo?.url || photo}
                alt="uploaded"
                fill
                className="object-cover"
                onClick={() => openPreview(index)}
                unoptimized
              />

              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => openPreview(index)}
                  className="bg-black/60 p-1 rounded-full"
                >
                  <Eye className="w-4 h-4 text-white" />
                </button>

                <button
                  onClick={() => deletePhoto(index, photo?.url, setUpload)}
                  className="bg-black/60 p-1 rounded-full"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ImagePreviewModal
        isOpen={isPreviewOpen}
        images={photoURLs}
        selectedIndex={currentPreviewIndex}
        onClose={closePreview}
        onNext={showNextImage}
        onPrevious={showPrevImage}
        onSelect={(index) => setCurrentPreviewIndex(index)}
      />
    </div>
  );
}

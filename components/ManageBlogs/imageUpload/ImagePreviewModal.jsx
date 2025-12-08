"use client";
import React from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function ImagePreviewModal({
  isOpen,
  images,
  selectedIndex,
  onClose,
  onNext,
  onPrevious,
  onSelect,
}) {
  if (!isOpen || !images?.length) return null;

  const selectedImage = images[selectedIndex];

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">

      <div className="relative bg-white/5 rounded-xl w-full max-w-5xl h-[80vh] flex flex-col border border-white/10 shadow-xl">

        <button
          onClick={(e)=>onClose()}
          className="absolute top-4 right-1 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 transition z-99"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 flex items-center justify-center relative px-10">

          <button
            onClick={onPrevious}
            className="absolute left-4 md:left-6 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full shadow transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="relative w-full h-full flex items-center justify-center">
            {selectedImage?.url?.toLowerCase().endsWith(".pdf") ? (
              <iframe
                src={`https://docs.google.com/gview?embedded=true&url=${selectedImage.url}`}
                className="w-full h-full rounded-lg bg-white pointer-events-none"
              />
            ) : (
              <Image
                src={selectedImage.url}
                alt="Preview"
                fill
                className="object-contain rounded-lg"
                unoptimized
              />
            )}
          </div>

          <button
            onClick={onNext}
            className="absolute right-4 md:right-6 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full shadow transition"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {!selectedImage?.url?.toLowerCase().endsWith(".pdf") && (
          <div className="w-full px-4 py-3 overflow-x-auto flex gap-4 bg-black/30 rounded-b-xl">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => onSelect(index)}
                className={`w-20 h-20 relative flex-shrink-0 rounded-md border-2 overflow-hidden transition
                  ${
                    index === selectedIndex
                      ? "border-blue-500 scale-105"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }
                `}
              >
                <Image
                  src={img.url}
                  alt="Thumbnail"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

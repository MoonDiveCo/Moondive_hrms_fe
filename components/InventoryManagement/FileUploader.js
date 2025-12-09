import { useState } from "react";
import { Eye, Trash2, FileText } from "lucide-react";
import Image from "next/image";
import ImagePreviewModal from "./ImagePreviewModal";

export default function FileUploader({
  heading = "Upload File",
  onUpload,      
  files = [],         
  setFiles,          
  loading = false,
}) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const openPreview = (index) => {
    setPreviewIndex(index);
    setIsPreviewOpen(true);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = await onUpload(file);   
    if (url) setFiles([url]);
  };

  const deleteFile = () => {
    setFiles([]);
  };

  return (
    <div className="w-full">
      <label className="font-medium text-sm">{heading}</label>

      <div className="mt-2">
        <input 
          type="file" 
          onChange={handleFileSelect}
          className="w-full border p-2 rounded cursor-pointer"
          accept="image/*,application/pdf"
        />
      </div>

      {/* Loader */}
      {loading && <p className="text-blue-600 text-xs mt-1">Uploading...</p>}

      {/* Thumbnails */}
      <div className="mt-3 grid grid-cols-3 gap-3">
        {files.map((file, i) => {
          const isPDF = typeof file === "string" && file.toLowerCase().endsWith(".pdf");

          return (
            <div key={i} className="relative group">
              
              {/* IMAGE PREVIEW */}
              {!isPDF ? (
                <div
                  className="w-28 h-28 rounded-lg overflow-hidden bg-gray-100 border shadow cursor-pointer"
                  onClick={() => openPreview(i)}
                >
                  <Image
                    src={file}
                    alt="preview"
                    width={120}
                    height={120}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                /* PDF PREVIEW */
                <div className="w-28 h-28 rounded-lg flex items-center justify-center bg-red-50 border cursor-pointer"
                    //  onClick={() => window.open(file, "_blank")}
                      onClick={() => openPreview(i)}
                >
                  <FileText size={36} className="text-red-600" />
                </div>
              )}

              {/* Buttons */}
              <div className="absolute top-1 right-1 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                {!isPDF && (
                  <button
                    className="bg-black/50 p-1 rounded-full"
                    onClick={() => openPreview(i)}
                  >
                    <Eye size={14} className="text-white" />
                  </button>
                )}

                <button
                  className="bg-black/50 p-1 rounded-full"
                  onClick={deleteFile}
                >
                  <Trash2 size={14} className="text-white" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Image Viewer */}
      <ImagePreviewModal
         isOpen={isPreviewOpen}
            images={files.map((url) => ({ url }))} 
            selectedIndex={previewIndex}
            onClose={() => setIsPreviewOpen(false)}
            onNext={() => setPreviewIndex((previewIndex + 1) % files.length)}
            onPrevious={() =>
                setPreviewIndex((previewIndex - 1 + files.length) % files.length)
            }
            onSelect={(idx) => setPreviewIndex(idx)}
      />
    </div>
  );
}

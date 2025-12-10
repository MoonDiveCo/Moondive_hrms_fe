import React, { useEffect, useState } from "react";
import LaptopForm from "./LaptopForm.js";
import AccessoryForm from "./AccessoryForm";
import axios from "axios";
import { toast } from "react-toastify";
import FileUploader from "./FileUploader";

export default function AddInventoryModal({ open, onClose, onSave,mode = "add", initialData = null   }) {

  const [category, setCategory] = useState("");
  const [form, setForm] = useState({});
  const [uploading, setUploading] = useState({ productImage: false, receipt: false });
const [productImages, setProductImages] = useState([]);
const [receiptFiles, setReceiptFiles] = useState([]);
  const [uploadedUrls, setUploadedUrls] = useState({
    productImageUrl: "",
    receiptUrl: "",
  });

   useEffect(() => {
    if (mode === "edit" && initialData) {
      setCategory(initialData.category);
      setForm(initialData.specs || {});
      setProductImages(initialData.productImage ? [initialData.productImage] : []);
    setReceiptFiles(initialData.receipt ? [initialData.receipt] : []);
      setUploadedUrls({
        productImageUrl: initialData.productImage || "",
        receiptUrl: initialData.receipt || "",
      });
    } else {
      setCategory("");
      setForm({});
      setUploadedUrls({ productImageUrl: "", receiptUrl: "" });
    }
  }, [initialData, mode]);

  const uploadReceiptPDF = async (file) => {
  try {
    setUploading(prev => ({ ...prev, receipt: true }));

    const fd = new FormData();
    fd.append("file", file);

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API}/cms/inventory/product-receipt-upload`,
      fd
    );
    console.log(response)
    const url = response?.data?.result?.brochureUrl;

    setUploadedUrls(prev => ({ ...prev, receiptUrl: url }));
    setReceiptFiles([url]);

    return url;
  } catch {
    toast.error("Error uploading PDF");
    return null;
  } finally {
    setUploading(prev => ({ ...prev, receipt: false }));
  }
};

  const uploadProductImage = async (file) => {
  try {
    setUploading(prev => ({ ...prev, productImage: true }));

    const fd = new FormData();
    fd.append("file", file);

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API}/cms/inventory/product-image-add`,
      fd
    );

    const url = response?.data?.result?.imageUrls?.[0];
    setUploadedUrls(prev => ({ ...prev, productImageUrl: url }));
    setProductImages([url]);

    return url;
  } catch {
    toast.error("Error uploading image");
    return null;
  } finally {
    setUploading(prev => ({ ...prev, productImage: false }));
  }
};

const handleAutoGenerate = async () => {
  if (!uploadedUrls.receiptUrl) {
    toast.error("Please upload a receipt PDF first.");
    return;
  }
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API}/cms/inventory/inventory/auto-generate`,
      { receiptUrl: uploadedUrls.receiptUrl }
    );
    setForm(response.data.specs);
    toast.success("Specs auto-generated successfully.");
  } catch (error) {
    toast.error("Error auto-generating specs.");
  } 
};
  
const handleSubmit = () => {
  const fd = new FormData();

  fd.append("category", category);

  Object.keys(form).forEach((key) => {
    fd.append(`specs.${key}`, form[key]);
  });

  if (uploadedUrls.productImageUrl)
    fd.append("productImage", uploadedUrls.productImageUrl);

  if (uploadedUrls.receiptUrl)
    fd.append("receipt", uploadedUrls.receiptUrl);

  onSave(fd);
  setForm({});
  setCategory("");
  setUploadedUrls({ productImageUrl: "", receiptUrl: "" });
  setUploading({ productImage: false, receipt: false });
  setProductImages([]);
  setReceiptFiles([]);
};

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[850px] shadow-lg text-black max-h-[90vh] hide-scrollbar overflow-y-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xl text-primaryText">
            Add New {category || "Item"}
          </h4>
          <button onClick={onClose} className="text-xl font-bold">×</button>
        </div>

        {/* CATEGORY SELECT */}
       <div className="mb-6">
  <label className="text-sm font-medium">Category</label>

  <select
    className={`w-full border border-gray-300 p-2 rounded mt-1 ${initialData ? "bg-gray-100 cursor-not-allowed" : ""}`}
    value={category}
    disabled={!!initialData}   
    onChange={(e) => {
      if (!initialData) {      
        setCategory(e.target.value);
        setForm({});
      }
    }}
  >
    <option value="">Choose Category</option>
    <option value="Laptop">Laptop</option>
    <option value="Monitor">Monitor</option>
    <option value="Mouse">Mouse</option>
    <option value="Keyboard">Keyboard</option>
    <option value="Accessories">Accessories</option>
    <option value="OfficeInventory">Office Inventory</option>
  </select>

  {initialData && (
    <p className="text-xs text-gray-500 mt-1">
      Category cannot be changed while editing.
    </p>
  )}
</div>


        {category &&  <div className="grid grid-cols-2 gap-4 my-4">
           <div>
             <FileUploader
             heading="Product Image *"
             files={productImages}
             setFiles={setProductImages}
             loading={uploading.productImage}
             onUpload={(file) => uploadProductImage(file)} 
           />
           </div>
 
           <div>
             <FileUploader
             heading="Receipt (PDF) *"
             files={receiptFiles}
             setFiles={setReceiptFiles}
             loading={uploading.receipt}
             onUpload={(file) => uploadReceiptPDF(file)}
           />
           <button
            onClick={handleAutoGenerate}
            className="
               px-2 py-1
              text-xs font-semibold
              bg-primary text-white
              rounded-md
              hover:bg-primary-600
              transition
              cursor-pointer
            "
          >
            Auto Generate
          </button>
           </div>
 
         </div>}
        {/* DYNAMIC FORM */}
        {category === "Laptop" && <LaptopForm form={form} setForm={setForm} />}
        {category !== "Laptop" && category !== "" && (
          <AccessoryForm form={form} setForm={setForm} />
        )}


        {/* FOOTER */}
        <div className="flex justify-end gap-3 mt-6">
          <button className="px-4 py-2 bg-white text-primaryText rounded-full border border-primary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-primary hover:bg-indigo-700 text-white rounded-full"
            onClick={handleSubmit || onclose}
          >
            {mode==='add'?'Add':'Edit'} {category}
          </button>
        </div>

      </div>
    </div>
  );
}

import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import AddInventoryModal from "./AddInventoryModal";
import { EditIcon } from "lucide-react";
import ImagePreviewModal from "./ImagePreviewModal";

export default function EditInventoryModal({ open, item, users = [], onClose, onSave }) {
  const [form, setForm] = useState({
    assignedTo: "",
    remarks: "",
    agreement: null,
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploading, setUploading] = useState({ agreement: false });
  const [uploadedUrls, setUploadedUrls] = useState({ agreementUrl: "" });
  const [unassignUserId, setUnassignUserId] = useState(null);
  const [showHistory, setShowHistory] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewFiles, setPreviewFiles] = useState([]);

  useEffect(() => {
    if (item) {
      setForm({
        assignedTo: item?.assignedTo?.id || "",
        remarks: item?.remarks || "",
        agreement: null,
      });
      setUnassignUserId(null);
      setUploadedUrls({ agreementUrl: "" });
    }
  }, [item]);

  const handlePdfUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Only PDF format allowed!");
      return;
    }

    try {
      setUploading((p) => ({ ...p, [field]: true }));
      const fd = new FormData();
      fd.append("file", file);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/cms/inventory/product-image-add`,
        fd
      );

      const url = response?.data?.result?.brochureUrl;
      if (url) {
        setUploadedUrls((p) => ({ ...p, [`${field}Url`]: url }));
        toast.success("PDF uploaded successfully!");
      } else {
        toast.error("Upload failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error uploading PDF!");
    } finally {
      setUploading((p) => ({ ...p, [field]: false }));
    }
  };

const openPreview = (fileUrl) => {
  if (!fileUrl) return;

  setIsPreviewOpen(true);
  setPreviewIndex(0);

  setPreviewFiles([{ url: fileUrl }]);
};


  const handleSubmit = () => {
    const fd = new FormData();

    if (form.assignedTo === "") {
      fd.append("isAssigned", "false");
    } else if (form.assignedTo && form.assignedTo.trim() !== "") {
      fd.append("isAssigned", "true");
      fd.append("assignedTo", form.assignedTo);
    }

    if (form.remarks && form.remarks.trim() !== "") {
      fd.append("remarks", form.remarks);
    }

    if (uploadedUrls.agreementUrl) {
      fd.append("userAgreement", uploadedUrls.agreementUrl);
    }

    if (item?.specs) {
      fd.append("specs", JSON.stringify(item.specs));
    }

    if (unassignUserId) {
      fd.append("unassignUserId", unassignUserId);
    }

    onSave(fd, item._id);
    setUnassignUserId(null);
  };

  if (!open || !item) return null;

  function LaptopRightSection(props) {
    const { item, users } = props;
    return (
      <div className="pl-4 overflow-y-auto max-h-[60vh]">
        {/* CURRENT USER */}
        <div className="mb-6">
          <h4 className="text-primaryText mb-3">Current User</h4>
          {item.assignedTo ? (
            <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-indigo-800">{item.assignedTo.name}</p>
                  <p className="text-sm text-gray-600">{item.assignedTo.email}</p>
                </div>
                <span className="text-xs bg-indigo-600 text-white px-2 py-1 rounded">
                  Assigned
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border p-4 rounded text-gray-500">
              Not assigned yet
            </div>
          )}
        </div>

        {/* ASSIGN NEW USER */}
        <div className="mb-6">
          <label className="text-sm font-medium">Assign To User</label>
          <select
            className="w-full border p-2 rounded mt-1"
            value={form.assignedTo}
            onChange={(e) => setForm((p) => ({ ...p, assignedTo: e.target.value }))}
          >
            <option value="">Not Assigned</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.fullName}
              </option>
            ))}
          </select>
        </div>

        {form.assignedTo && form.assignedTo !== item.assignedTo?.id && (
          <>
            <div className="mb-4">
              <label className="text-sm font-medium">Upload Agreement (PDF)</label>
              <input
                type="file"
                accept="application/pdf"
                className="mt-1 w-full border p-2 rounded"
                onChange={(e) => handlePdfUpload(e, "agreement")}
              />
              {uploading.agreement && <p className="text-xs text-blue-600 mt-1">Uploading...</p>}
              {uploadedUrls.agreementUrl && <p className="text-xs text-green-600 mt-1">Uploaded ✔</p>}
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium">Remarks</label>
              <textarea
                className="w-full border p-2 rounded mt-1"
                rows="4"
                value={form.remarks}
                onChange={(e) => setForm((p) => ({ ...p, remarks: e.target.value }))}
                placeholder="Enter reason for changing assignment..."
              />
            </div>
          </>
        )}
      </div>
    );
  }

  function AccessoryRightSection(props) {
    const { item, users } = props;
    return (
      <div className="pl-4 overflow-y-auto max-h-[60vh]">

        <div className="mb-6">
          <h4 className="text-primaryText mb-2">Stock Information</h4>
          <div className="bg-gray-50 border rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600">Available Quantity</p>
            <p className={`text-2xl font-bold ${Number(item.specs?.quantity) > 0 ? "text-green-600" : "text-red-600"}`}>
              {Number(item.specs?.quantity) || 0}
            </p>
          </div>
          {Number(item.specs?.quantity) <= 0 && (
            <p className="text-red-600 text-sm mt-1">⚠ No quantity available — cannot assign new user.</p>
          )}
        </div>

 
        <div className="mb-6">
          <h4 className="text-primaryText mb-3">Currently Assigned Users</h4>
          <div className="space-y-3">
            {item.usersHistory?.filter((u) => !u.returnedDate).length === 0 && (
              <div className="bg-gray-50 border p-4 rounded text-gray-600">No users currently using this item.</div>
            )}

            {item.usersHistory
              ?.filter((u) => !u.returnedDate)
              .map((user, idx) => {
                const keyVal = user.user || idx;
                const selected = unassignUserId === keyVal;
                return (
                  <div key={keyVal} className={`p-4 rounded-lg shadow-sm border ${selected ? "bg-red-50 border-red-300" : "bg-indigo-50 border-indigo-200"}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-indigo-800">{user.userName}</p>
                        <p className="text-sm text-gray-600">{user.userEmail}</p>
                        {selected && <p className="text-xs text-red-600 font-medium mt-1">Will be returned on save</p>}
                      </div>
                      <button
                        onClick={() => setUnassignUserId(selected ? null : keyVal)}
                        className={`text-xs px-2 py-1 rounded ${selected ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 text-white"}`}
                        disabled={selected}
                      >
                        {selected ? "Selected" : "Return"}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Assigned on: {new Date(user.assignedDate).toDateString()}</p>
                  </div>
                );
              })}
          </div>
        </div>

        {/* ASSIGN NEW USER */}
        <div className="mb-6">
          <h4 className="text-primaryText mb-2">Assign to User</h4>
          <select
            className="w-full border p-2 rounded mt-1"
            value={form.assignedTo}
            onChange={(e) => setForm((p) => ({ ...p, assignedTo: e.target.value }))}
            disabled={Number(item.specs?.quantity) <= 0}
          >
            <option value="">Select User</option>
            {users.map((u) => <option key={u._id} value={u._id}>{u.fullName}</option>)}
          </select>

          {Number(item.specs?.quantity) <= 0 && (
            <p className="text-xs text-red-600 mt-1">No units left — assignment disabled.</p>
          )}
        </div>

        {form.assignedTo && form.assignedTo !== item.assignedTo?.id && (
          <div className="mb-6">
            <label className="text-sm font-medium">Remarks</label>
            <textarea
              className="w-full border p-2 rounded mt-1"
              rows="4"
              value={form.remarks}
              onChange={(e) => setForm((p) => ({ ...p, remarks: e.target.value }))}
              placeholder="Reason for assignment or notes…"
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 w-full max-w-6xl rounded-lg shadow-xl text-black">
        <h4 className="text-primaryText mb-4 text-2xl font-semibold">Edit / Assign Inventory</h4>

        <div className="grid grid-cols-2 gap-6 h-[75vh] overflow-hidden">
          <div className="pr-4 border-r overflow-y-auto h-full">

            <div className="mb-6">
              <div className="flex gap-2 items-center cursor-pointer" onClick={() => setShowEditModal(true)}>
                <h5 className="font-semibold text-lg">Item Information</h5>
                <EditIcon width={15} height={15} />
              </div>

              <div className="bg-gray-50 border rounded-xl p-4 mt-2 shadow-sm flex justify-between">
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-500 uppercase text-xs tracking-wide">Category</p>
                    <p className="font-medium text-gray-800">{item.category}</p>
                  </div>

                  <div>
                    <p className="text-gray-500 uppercase text-xs tracking-wide">Model</p>
                    <p className="font-medium text-gray-800">{item.specs?.modelName || item.specs?.brand || "N/A"}</p>
                  </div>

                  {item.specs?.serialNumber && (
                    <div>
                      <p className="text-gray-500 uppercase text-xs tracking-wide">Serial Number</p>
                      <p className="font-medium text-gray-800">{item.specs.serialNumber}</p>
                    </div>
                  )}

                  {item.specs?.quantity && (
                    <div>
                      <p className="text-gray-500 uppercase text-xs tracking-wide">Quantity</p>
                      <p className="font-medium text-gray-800">{item.specs.quantity}</p>
                    </div>
                  )}

                  {item.specs?.purchaseDate && (
                    <div>
                      <p className="text-gray-500 uppercase text-xs tracking-wide">Purchase Date</p>
                      <p className="font-medium text-gray-800">{new Date(item.specs.purchaseDate).toDateString()}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center">
                  {item.productImage ? (
                    <img src={item.productImage} className="w-20 h-20 rounded-lg shadow-md border object-cover" />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">No Image</div>
                  )}

                  {item.receipt && (
                   <button
                  onClick={() => openPreview(item.receipt)}
                  className="mt-3 px-3 py-1 text-sm bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition"
                >
                  View Receipt
                </button>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center cursor-pointer mb-2" onClick={() => setShowHistory((s) => !s)}>
                <h4 className="text-primaryText font-semibold">User Chain / History</h4>
              </div>

              {showHistory && (
                <div className="max-h-60 bg-gray-50 p-4 rounded-lg">
                  {item.usersHistory?.length === 0 && <p className="text-gray-500 text-sm">No history available</p>}

                  <div className="relative">
                    <div className="absolute left-5 top-0 bottom-0 w-[2px] bg-indigo-300"></div>

                    {[...item.usersHistory].reverse().map((h, i, arr) => (
                      <div key={i} className="relative pl-12 pb-3">
                        <div className="absolute left-[12px] top-1 w-4 h-4 bg-indigo-600 rounded-full shadow"></div>

                        <div className="bg-white border rounded-lg p-3 shadow-sm">
                          <div className="flex justify-between">
                            <h4 className="font-semibold text-indigo-700">{h.userName}</h4>
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">{h.designation || "—"}</span>
                          </div>

                          <p className="text-sm text-gray-600">{h.userEmail}</p>
                          <p className="text-sm text-gray-600">{h.department}</p>

                          {h.userAgreement &&  <button
                          onClick={() => openPreview(h.userAgreement)}
                          className="text-xs text-blue-600 underline"
                        >
                          User Agreement
                        </button>}

                          <div className="mt-2 bg-yellow-50 border border-yellow-200 text-xs p-2 rounded">
                            <strong>Remarks:</strong> {h.remarks?.trim() ? h.remarks : "No remarks"}
                          </div>

                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(h.assignedDate).toDateString()} →
                            {h.returnedDate ? new Date(h.returnedDate).toDateString() : " Not Returned"}
                          </p>
                        </div>

                        {i !== arr.length - 1 && (
                          <div className="flex justify-center mt-1">
                            <div className="w-3 h-3 border-t-2 border-l-2 rotate-45 border-indigo-400"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pl-4 overflow-y-auto">
            {item.category === "Laptop" ? (
              <LaptopRightSection item={item} users={users} />
            ) : (
              <AccessoryRightSection item={item} users={users} />
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button className="px-4 py-2 bg-gray-400 text-white rounded-lg" onClick={onClose}>Cancel</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg" onClick={handleSubmit}>Save Changes</button>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <AddInventoryModal
          open={showEditModal}
          mode="edit"
          initialData={item}
          onClose={() => setShowEditModal(false)}
          onSave={(fd) => onSave(fd, item._id)}
        />
      )}

      <ImagePreviewModal
        isOpen={isPreviewOpen}
        images={previewFiles}    
        selectedIndex={previewIndex}
        onClose={() => setIsPreviewOpen(false)}
        onNext={() => setPreviewIndex((previewIndex + 1) % previewFiles.length)}
        onPrevious={() =>
          setPreviewIndex((previewIndex - 1 + previewFiles.length) % previewFiles.length)
        }
        onSelect={(idx) => setPreviewIndex(idx)}
      />

    </div>
  );
}

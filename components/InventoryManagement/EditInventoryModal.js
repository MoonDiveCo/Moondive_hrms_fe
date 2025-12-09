import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";
import AddInventoryModal from "./AddInventoryModal";
import { EditIcon } from "lucide-react";

export default function EditInventoryModal({ open, item, users, onClose, onSave }) {

  const [form, setForm] = React.useState({
    assignedTo: "",
    remarks: "",
    agreement: null,
  });
  const [showEditModal, setShowEditModal] = useState("");
    const [uploading, setUploading] = useState({ ImageUrl: false, agreementUrl: false });
    const [uploadedUrls, setUploadedUrls] = useState({
      ImageUrl: "",
      agreementUrl: "",
    });
    const [unassignUserId, setUnassignUserId] = useState(null);

  React.useEffect(() => {
    if (item) {
      setForm({
        assignedTo: item?.assignedTo?.id || "",
        remarks: item?.remarks || "",
        agreement: null,
      });
    }
  }, [item]);

    const handlePdfUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF format allowed!");
      return;
    }

    try {
      setUploading((prev) => ({ ...prev, [field]: true }));

      const fd = new FormData();
      fd.append("file", file);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/cms/inventory/product-image-add`,
        fd
      );

      const url = response?.data?.result?.brochureUrl;

      setUploadedUrls((prev) => ({
        ...prev,
        [`${field}Url`]: url,
      }));

      toast.success("PDF uploaded successfully!");

    } catch(error) {
      console.log(error);
      toast.error("Error uploading PDF!");
    } finally {
      setUploading((prev) => ({ ...prev, [field]: false }));
    }
  };

const handleSubmit = () => {
  const fd = new FormData();

  if(form.assignedTo === ""){
    fd.append("isAssigned", "false");
  }
  else if (form.assignedTo && form.assignedTo.trim() !== "") {
    fd.append("isAssigned", "true");
    fd.append("assignedTo", form.assignedTo);
  }
  if(form.remarks && form.remarks.trim() !== ""){
  fd.append("remarks", form.remarks);
  }

  if (uploadedUrls.agreementUrl) {
      fd.append("userAgreement", uploadedUrls.agreementUrl);
  }

  if (item?.specs) {
    fd.append("specs", JSON.stringify(item.specs));
  }

   if (unassignUserId) {
    console.log(unassignUserId._id)
    fd.append("unassignUserId",unassignUserId._id);  
  }

  onSave(fd, item._id);
  setUnassignUserId(null); 
};


  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[900px] p-6 rounded-lg shadow-xl text-black">

        <h2 className="text-xl font-semibold mb-4">Edit / Assign Inventory</h2>

        <div className="grid grid-cols-2 gap-6">

          {/* LEFT SECTION */}
          <div className="border-r pr-4">

           {/* ITEM INFO CARD */}
          <div className="mb-6">
            <div className="flex gap-2 items-center cursor-pointer"  onClick={(e)=>setShowEditModal(true)} >
            <h3 className="font-semibold text-lg">Item Information</h3>
             <EditIcon width={15} height={15}/></div>
            <div className="bg-gray-50 border rounded-xl p-4 shadow-sm flex justify-between items-start">

              {/* LEFT SIDE DETAILS */}
              <div className="space-y-2 text-sm">

                <div>
                  <p className="text-gray-500 uppercase text-xs tracking-wide">Category</p>
                  <p className="font-medium text-gray-800">{item.category}</p>
                </div>

                <div>
                  <p className="text-gray-500 uppercase text-xs tracking-wide">Model</p>
                  <p className="font-medium text-gray-800">
                    {item.specs?.modelName || item.specs?.brand || "N/A"}
                  </p>
                </div>

               {item.specs?.serialNumber &&  <div>
                  <p className="text-gray-500 uppercase text-xs tracking-wide">Serial Number</p>
                  <p className="font-medium text-gray-800">
                    {item.specs?.serialNumber || "N/A"}
                  </p>
                </div>}

                {item.specs?.quantity &&  <div>
                  <p className="text-gray-500 uppercase text-xs tracking-wide">Quantity</p>
                  <p className="font-medium text-gray-800">
                    {item.specs?.quantity || "N/A"}
                  </p>
                </div>}

                {item.specs?.purchaseDate && (
                  <div>
                    <p className="text-gray-500 uppercase text-xs tracking-wide">Purchase Date</p>
                    <p className="font-medium text-gray-800">
                      {new Date(item.specs.purchaseDate).toDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* RIGHT SIDE IMAGE + RECEIPT */}
              <div className="flex flex-col items-center">

                {item.productImage ? (
                  <img
                    src={item.productImage}
                    className="w-20 h-20 rounded-lg shadow-md border object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}

                {item.receipt && (
                  <a
                    href={item.receipt}
                    target="_blank"
                    className="mt-3 px-3 py-1 text-sm bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition"
                  >
                    View Receipt
                  </a>
                )}
              </div>
            </div>
          </div>


            {/* User Chain History */}
            <div>
              <h3 className="font-semibold text-lg mb-2">User Chain / History</h3>

             <div className="max-h-60 overflow-y-auto bg-gray-50 p-4 rounded-lg">

            {item.usersHistory?.length === 0 && (
              <p className="text-gray-500 text-sm">No history available</p>
            )}

            <div className="relative">

              {/* Vertical timeline line */}
              <div className="absolute left-5 top-0 bottom-0 w-[2px] bg-indigo-300"></div>

              {[...item.usersHistory].reverse().map((h, i, arr) => (
            <div key={i} className="relative pl-12 pb-2">

              {/* Timeline Dot */}
              <div className="absolute left-[12px] top-1 w-4 h-4 bg-indigo-600 rounded-full shadow"></div>

              {/* Card */}
             <div className="bg-white border shadow-sm rounded-lg p-4">

            {/* USER NAME + ROLE */}
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-indigo-700">{h.userName}</h4>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                {h.designation || "—"}
              </span>
            </div>

            {/* EMAIL + DEPARTMENT + AGREEMENT */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{h.userEmail}</p>
                <p className="text-sm text-gray-600">{h.department}</p>
              </div>

              {h.userAgreement && (
                <a
                  href={h.userAgreement}
                  target="_blank"
                  className="underline text-blue-600 block mt-2 text-xs"
                >
                  User Agreement
                </a>
              )}
            </div>

            <div className="mt-3 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs p-3 rounded-md">
            <span className="font-semibold">Remarks: </span>
            {h.remarks?.trim() ? h.remarks : "No remarks provided."}
          </div>

            {/* DATES */}
            <p className="text-xs text-gray-500 mt-2">
              {new Date(h.assignedDate).toDateString()}
              <span className="mx-2">→</span>
              {h.returnedDate
                ? new Date(h.returnedDate).toDateString()
                : "Not Returned"}
            </p>

              {/* ISSUES SECTION */}
              {h.issues?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-grey-600 mb-1">Issues</p>

                  <div className="max-h-24 overflow-y-auto space-y-2 p-2 rounded-lg">

                    {[...h.issues].reverse().map((issue, index) => (
                      <div key={index} className="p-2 bg-white border rounded shadow-sm">
                        
                        {/* Issue Type Badge */}
                        <div className="flex gap-2">
                        <span className="bg-gray-100  text-[10px] px-2 py-0.5 rounded font-medium">
                          {issue.issueType}
                        </span>

                        <span className={`${issue.status==="Open"? 'bg-red-100' : 'bg-green-100'}  text-[10px] px-2 py-0.5 rounded font-medium`}>
                          {issue.status}
                        </span>
                        </div>

                        {/* Description (truncated) */}
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {issue.description}
                        </p>

                        {/* Date */}
                         <div className="mt-2 text-[11px] text-gray-500">
                        <div>Raised: {new Date(issue.dateRaised).toDateString()}</div>

                        {issue.dateResolved && (
                          <div>
                            Resolved: {new Date(issue.dateResolved).toDateString()}
                          </div>
                        )}
                      </div>

                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>


              {/* Arrow Indicator */}
              {i !== arr.length - 1 && (
                <div className="flex justify-center mt-1">
                  <div className="w-3 h-3 border-t-2 border-l-2 rotate-45 border-indigo-400"></div>
                </div>
              )}

            </div>
          ))}

            </div>

          </div>

            </div>

          </div>

          {/* RIGHT SIDE */}
          { item.category=== "Laptop" && <div>

          {/* CURRENT USER SECTION */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-3">Current User</h3>

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

        {/* ASSIGN NEW USER SECTION */}
        <div className="mb-6">
          <label className="text-sm font-medium">Assign To User</label>
          <select
            className="w-full border p-2 rounded mt-1"
            value={form.assignedTo}
            onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
          >
            <option value="">Not Assigned</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>{u.fullName}</option>
            ))}
          </select>
        </div>

        {form.assignedTo && form.assignedTo !== item.assignedTo?.id && (
          <>
            {/* Agreement Upload */}
            <div className="mb-4">
              <label className="text-sm font-medium">Upload Agreement (PDF)</label>
              <input
                type="file"
                accept="application/pdf"
                className="mt-1 w-full border p-2 rounded"
                onChange={(e) => handlePdfUpload(e, "agreement")}
              />

              {uploading.agreement && (
                <p className="text-xs text-blue-600 mt-1">Uploading...</p>
              )}

              {uploadedUrls.agreementUrl && (
                <p className="text-xs text-green-600 mt-1">Uploaded ✔</p>
              )}
            </div>

            {/* Remarks */}
            <div className="mb-4">
              <label className="text-sm font-medium">Remarks</label>
              <textarea
                className="w-full border p-2 rounded mt-1"
                rows="4"
                value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                placeholder="Enter reason for changing assignment..."
              />
            </div>
          </>
        )}


            <div className="flex justify-end gap-3 mt-6">
              <button className="px-4 py-2 bg-gray-400 text-white rounded-lg" onClick={onClose}>
                Cancel
              </button>

              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg" onClick={handleSubmit}>
                Save Changes
              </button>
            </div>

          </div>}

        {/* RIGHT SIDE FOR ACCESSORIES */}
        {item.category !== "Laptop" && (
          <div className="pl-4 max-h-[600px] overflow-y-auto">

            {/* AVAILABLE QUANTITY */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Stock Information</h3>

              <div className="bg-gray-50 border rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600">Available Quantity</p>

                <p className={`text-2xl font-bold ${
                  item.specs.quantity > 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {item.specs.quantity}
                </p>
              </div>

              {item.specs.quantity <= 0 && (
                <p className="text-red-600 text-sm mt-1">
                  ⚠ No quantity available — cannot assign new user.
                </p>
              )}
            </div>

            {/* CURRENTLY ASSIGNED USERS */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">Currently Assigned Users</h3>

              <div className="space-y-3">

                {item.usersHistory?.filter(u => !u.returnedDate).length === 0 && (
                  <div className="bg-gray-50 border p-4 rounded text-gray-600">
                    No users currently using this item.
                  </div>
                )}

                {item.usersHistory
                  ?.filter(u => !u.returnedDate)
                  .map((user, idx) => (
                    <div
                key={idx}
                className={`
                  p-4 rounded-lg shadow-sm border
                  ${unassignUserId === ( user.user)
                    ? "bg-red-50 border-red-300"
                    : "bg-indigo-50 border-indigo-200"
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-indigo-800">{user.userName}</p>
                    <p className="text-sm text-gray-600">{user.userEmail}</p>

                    {unassignUserId === ( user.user) && (
                      <p className="text-xs text-red-600 font-medium mt-1">
                        Will be returned on save
                      </p>
                    )}
                  </div>

                  {/* RETURN BUTTON */}
                  <button
                    onClick={() =>
                      setUnassignUserId( user.user)
                    }
                    className={`
                      text-xs px-2 py-1 rounded
                      ${unassignUserId === ( user.user)
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700 text-white"
                      }
                    `}
                    disabled={unassignUserId === ( user.user)}
                  >
                    {unassignUserId === ( user.user)
                      ? "Selected"
                      : "Return"}
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Assigned on: {new Date(user.assignedDate).toDateString()}
                </p>
              </div>

                  ))}
              </div>
            </div>

            {/* ASSIGN NEW USER */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Assign to User</h3>

              <select
                className="w-full border p-2 rounded mt-1"
                value={form.assignedTo}
                onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                disabled={item.specs.quantity <= 0}
              >
                <option value="">Select User</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.fullName}
                  </option>
                ))}
              </select>

              {item.specs.quantity <= 0 && (
                <p className="text-xs text-red-600 mt-1">
                  No units left — assignment disabled.
                </p>
              )}
            </div>

            {/* REMARKS */}
            {form.assignedTo && form.assignedTo !== item.assignedTo?.id && (
              <div className="mb-6">
                <label className="text-sm font-medium">Remarks</label>
                <textarea
                  className="w-full border p-2 rounded mt-1"
                  rows="4"
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  placeholder="Reason for assignment or notes…"
                />
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded"
                onClick={onClose}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleSubmit}
              >
                Save Changes
              </button>
            </div>

          </div>
        )}
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
    </div>
  );
}

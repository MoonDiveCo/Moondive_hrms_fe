'use client'
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import axios from "axios";

export default function AddLocationModal({
  isVisible,
  onClose,
  locations,
  setLocations,
  editingLocation,
  location,
  mode = "add",        // "add" | "edit" | "view"
  onSaved,             // parent callback receives savedItem
  onSave               // parent fetch function (refetch) - optional
}) {

  const empty = {
    name: "",
    addressType: "",
    addressLabel: "",
    country: "",
    state: "",
    city: "",
    locality: "",
    postalCode: "",
    timeZone: "",
    description: "",
    contactNumber: "",
    mailAlias: "",
    latitude: "",
    longitude: ""
  };
  

  const activeData = location || editingLocation || null;
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";

  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isVisible) return;

    if (activeData) {
      setForm({
        name: activeData.name || "",
        addressType: activeData.addressType || "",
        addressLabel: activeData.addressLabel || "",
        country: activeData.country || "",
        state: activeData.state || "",
        city: activeData.city || "",
        locality: activeData.locality || "",
        postalCode: activeData.postalCode || "",
        timeZone: activeData.timeZone || "",
        description: activeData.description || "",
        contactNumber: activeData.contactNumber || "",
        mailAlias: activeData.mailAlias || "",
        latitude: activeData.latitude || "",
        longitude: activeData.longitude || ""
      });
    } else {
      setForm(empty);
    }
    setError("");
  }, [activeData, isVisible]);

  const handleChange = (e) => {
    if (isViewMode) return;
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // tolerant extractor
  const extractSavedItem = (res) => {
    if (!res) return null;
    if (res.data) {
      if (res.data.result) return res.data.result;
      if (res.data.location) return res.data.location;
      if (typeof res.data === 'object' && (res.data._id || res.data.id || Object.keys(res.data).length)) return res.data;
    }
    if (res._id || res.id) return res;
    return null;
  };

  const handleSubmit = async () => {
    if (isViewMode) return onClose();

    setError("");
    const required = ["addressType","addressLabel","country","state","city","locality","postalCode","latitude","longitude"];
    for (const f of required) {
      if (!form[f] || form[f].toString().trim() === "") {
        setError("Please fill all required fields.");
        return;
      }
    }

    setLoading(true);
    try {
      let res;
      if (isEditMode && activeData?._id) {
        res = await axios.put(`/hrms/organization/update-location/${activeData._id}`, form);
      } else {
        res = await axios.post("/hrms/organization/add-locations", form);
      }

      const savedItem = extractSavedItem(res) || null;
      // optimistic local update if parent didn't provide onSaved
      if (typeof onSaved !== 'function') {
        if (savedItem) {
          if (isEditMode && activeData?._id) {
            if (typeof setLocations === "function") {
              setLocations(prev => (prev || []).map(l => (l._id === savedItem._id ? savedItem : l)));
            }
          } else {
            if (typeof setLocations === "function") {
              setLocations(prev => [savedItem, ...(prev || [])]);
            }
          }
        }
      }

      // 1) notify parent with savedItem
      if (typeof onSaved === "function") {
        try { await onSaved(savedItem); } catch (e) { console.warn('onSaved error', e); }
      }

      // 2) if parent requested refetch (onSave), call it — ensures authoritative data and prevents empty cells
      if (typeof onSave === "function") {
        try { await onSave(); } catch (e) { console.warn('onSave (refetch) error', e); }
      }

      onClose();
    } catch (err) {
      console.error("Failed to save location", err);
      const msg = err?.response?.data?.responseMessage || err?.message || "Failed to save. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black-50 backdrop-blur-sm flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 hide-scrollbar max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 sticky top-0 bg-white">
          <h4 className="text-md font-semibold text-gray-800">{isViewMode ? "View Location" : isEditMode ? "Edit Location" : "Add Location"}</h4>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>

        <div className="p-6">
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
              <input name="name" value={form.name} onChange={handleChange} disabled={isViewMode} className="w-full px-3 py-2 border rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Type <span className="text-red-500">*</span></label>
              <input name="addressType" value={form.addressType} onChange={handleChange} disabled={isViewMode} className="w-full px-3 py-2 border rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Label <span className="text-red-500">*</span></label>
              <input name="addressLabel" value={form.addressLabel} onChange={handleChange} disabled={isViewMode} className="w-full px-3 py-2 border rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Country <span className="text-red-500">*</span></label>
              <input name="country" value={form.country} onChange={handleChange} disabled={isViewMode} className="w-full px-3 py-2 border rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">State <span className="text-red-500">*</span></label>
              <input name="state" value={form.state} onChange={handleChange} disabled={isViewMode} className="w-full px-3 py-2 border rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">City <span className="text-red-500">*</span></label>
              <input name="city" value={form.city} onChange={handleChange} disabled={isViewMode} className="w-full px-3 py-2 border rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Locality <span className="text-red-500">*</span></label>
              <input name="locality" value={form.locality} onChange={handleChange} disabled={isViewMode} className="w-full px-3 py-2 border rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Postal Code <span className="text-red-500">*</span></label>
              <input name="postalCode" value={form.postalCode} onChange={handleChange} disabled={isViewMode} className="w-full px-3 py-2 border rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Time Zone </label>
              <input name="timeZone" value={form.timeZone} onChange={handleChange} disabled={isViewMode} className="w-full px-3 py-2 border rounded" placeholder="e.g. Asia/Kolkata" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Number</label>
              <input name="contactNumber" value={form.contactNumber} onChange={handleChange} disabled={isViewMode} className="w-full px-3 py-2 border rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mail Alias</label>
              <input name="mailAlias" type="email" value={form.mailAlias} onChange={handleChange} disabled={isViewMode} className="w-full px-3 py-2 border rounded" placeholder="location@company.com" />
            </div>

             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Latitude</label>
              <input name="latitude" type="email" value={form.latitude} onChange={handleChange} disabled={isViewMode} className="w-full px-3 py-2 border rounded" />
            </div>

             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Longitude</label>
              <input name="longitude" type="email" value={form.longitude} onChange={handleChange} disabled={isViewMode} className="w-full px-3 py-2 border rounded" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} disabled={isViewMode} rows="3" className="w-full px-3 py-2 border rounded resize-none" />
            </div>
            
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button onClick={onClose} disabled={loading} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              {isViewMode ? "Close" : "Cancel"}
            </button>

            {!isViewMode && (
              <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 text-white bg-orange-500 rounded-md">
                {loading ? (isEditMode ? "Updating..." : "Adding...") : (isEditMode ? "Update Location" : "Add Location")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

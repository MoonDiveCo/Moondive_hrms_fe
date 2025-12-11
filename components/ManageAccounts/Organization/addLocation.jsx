'use client'
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import axios from "axios";

export default function AddLocationModal({ isVisible, onClose, locations, setLocations, editingLocation ,onSaved }) {
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
    mailAlias: ""
  };

  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingLocation) {
      setForm({
        name: editingLocation.name || "",
        addressType: editingLocation.addressType || "",
        addressLabel: editingLocation.addressLabel || "",
        country: editingLocation.country || "",
        state: editingLocation.state || "",
        city: editingLocation.city || "",
        locality: editingLocation.locality || "",
        postalCode: editingLocation.postalCode || "",
        timeZone: editingLocation.timeZone || "",
        description: editingLocation.description || "",
        contactNumber: editingLocation.contactNumber || "",
        mailAlias: editingLocation.mailAlias || ""
      });
    } else {
      setForm(empty);
    }
  }, [editingLocation, isVisible]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
  setError("");
  // basic required check according to your Joi: addressType, addressLabel, country, state, city, locality, postalCode, timeZone
  const required = ["addressType","addressLabel","country","state","city","locality","postalCode","timeZone"];
  for (const f of required) {
    if (!form[f] || form[f].toString().trim() === "") {
      setError("Please fill all required fields.");
      return;
    }
  }

  setLoading(true);
  try {
    if (editingLocation) {
      const res = await axios.put(`hrms/organization/update-location/${editingLocation._id}`, form);
      const updated = res.data.result || res.data.updatedLocation || res.data;
      // optimistic update
      setLocations((prev) => prev.map((l) => (l._id === editingLocation._id ? updated : l)));

      // notify parent to refresh authoritative data
      if (typeof onSaved === "function") {
        try { await onSaved(); } catch (e) { /* ignore refresh errors */ }
      }
    } else {
      const res = await axios.post("hrms/organization/add-locations", form);
      // API returns created location in res.data.result or res.data.location
      const newLoc = res.data.result || res.data.location || res.data;
      // optimistic update
      setLocations((prev) => [newLoc, ...(prev || [])]);

      // notify parent to refresh authoritative data (gets server-generated _id, fields)
      if (typeof onSaved === "function") {
        try { await onSaved(); } catch (e) { /* ignore refresh errors */ }
      }
    }

    onClose();
  } catch (err) {
    console.error("Failed to save location", err);
    setError("Failed to save. Please try again.");
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
          <h4 className="text-md font-semibold text-gray-800">{editingLocation ? "Edit Location" : "Add Location"}</h4>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>

        <div className="p-6">
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
              <input name="name" value={form.name} onChange={handleChange} className="w-full px-3 py-2 border rounded" placeholder="Location name (optional)" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Type <span className="text-red-500">*</span></label>
              <input name="addressType" value={form.addressType} onChange={handleChange} className="w-full px-3 py-2 border rounded" placeholder="e.g. Head Office" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Label <span className="text-red-500">*</span></label>
              <input name="addressLabel" value={form.addressLabel} onChange={handleChange} className="w-full px-3 py-2 border rounded" placeholder="Street address" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Country <span className="text-red-500">*</span></label>
              <input name="country" value={form.country} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">State <span className="text-red-500">*</span></label>
              <input name="state" value={form.state} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">City <span className="text-red-500">*</span></label>
              <input name="city" value={form.city} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Locality <span className="text-red-500">*</span></label>
              <input name="locality" value={form.locality} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Postal Code <span className="text-red-500">*</span></label>
              <input name="postalCode" value={form.postalCode} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Time Zone <span className="text-red-500">*</span></label>
              <input name="timeZone" value={form.timeZone} onChange={handleChange} className="w-full px-3 py-2 border rounded" placeholder="e.g. Asia/Kolkata" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Number</label>
              <input name="contactNumber" value={form.contactNumber} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mail Alias</label>
              <input name="mailAlias" type="email" value={form.mailAlias} onChange={handleChange} className="w-full px-3 py-2 border rounded" placeholder="location@company.com" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows="3" className="w-full px-3 py-2 border rounded resize-none" />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button onClick={onClose} disabled={loading} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
            <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 text-white bg-orange-500 rounded-md hover:bg-orange-600">
              {loading ? (editingLocation ? "Updating..." : "Adding...") : (editingLocation ? "Update Location" : "Add Location")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

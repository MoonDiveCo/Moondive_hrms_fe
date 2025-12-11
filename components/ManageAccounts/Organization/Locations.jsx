'use client'
import { useEffect, useState } from "react";
import axios from "axios";
import AddLocationModal from "./addLocation"; // put next to this file or adjust path
import { Pencil, Trash } from "lucide-react";

export default function Locations() {
  const [locations, setLocations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/hrms/organization/get-allLocations");
      // adapt if response nest differs
      setLocations(res?.data?.result || res?.data?.result || res?.data || []);
    } catch (err) {
      console.error("Error while fetching locations", err);
      setError("Failed to load locations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this location?")) return;
    try {
      const res = await axios.delete(`hrms/organization/delete-location/${id}`);
      // optimistic update
      setLocations((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      console.error("Failed to delete location", err);
      alert("Failed to delete location. Try again.");
    }
  };

  const handleEditClick = (location) => {
    setEditingLocation(location);
    setIsVisible(true);
  };

  const handleAddClick = () => {
    setEditingLocation(null);
    setIsVisible(true);
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="w-full -z-10">
      <div className="bg-white h-full rounded-2xl border-[0.3px] border-[#D0D5DD] p-4">
        <div className="p-6 border-b border-gray-200 flex flex-row justify-between items-center">
          <h4 className="text-lg font-semibold text-gray-900">Locations</h4>
          <div className="flex gap-2">
            <button
              onClick={handleAddClick}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded hover:bg-orange-600"
            >
              Add Location
            </button>
            
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City / Locality</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Postal Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Zone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mail Alias</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {locations && locations.length > 0 ? (
                locations.map((loc, index) => (
                  <tr key={loc._id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{loc.name || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loc.addressType || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loc.addressLabel || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loc.city ? `${loc.city} / ${loc.locality || "-"}` : "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loc.postalCode || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loc.timeZone || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loc.contactNumber || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loc.mailAlias || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(loc)}
                          title="Edit"
                          className="p-2 rounded hover:bg-gray-100"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(loc._id)}
                          title="Delete"
                          className="p-2 rounded hover:bg-red-50 text-red-600"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">No locations found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddLocationModal
        isVisible={isVisible}
        onClose={() => { setIsVisible(false); setEditingLocation(null); }}
        locations={locations}
        setLocations={setLocations}
        editingLocation={editingLocation}
        onSaved={fetchData}
      />
    </div>
  );
}

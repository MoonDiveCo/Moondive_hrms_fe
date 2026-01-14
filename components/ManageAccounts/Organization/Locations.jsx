'use client'
import { useEffect, useState, useRef, useContext } from "react";
import axios from "axios";
import AddLocationModal from "./addLocation";
import { Eye, Edit2, Trash2 } from "lucide-react";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { AuthContext } from "@/context/authContext";
import { toast } from "sonner";

export default function Locations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] =   useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // add | edit | view
  const [selectedLocation, setSelectedLocation] = useState(null);
  const lastFocusedRef = useRef(null);
  const {allUserPermissions}=useContext(AuthContext)

  async function fetchData() {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/hrms/organization/get-allLocations');
      const data = res?.data?.result || res?.data || [];
      setLocations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error while fetching locations', err);
      setError('Failed to fetch locations.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function openAdd(e) {
    lastFocusedRef.current = e?.currentTarget || null;
    setModalMode('add');
    setSelectedLocation(null);
    setModalVisible(true);
  }

  function openEdit(loc, e) {
    e?.stopPropagation();
    lastFocusedRef.current = e?.currentTarget || null;
    setSelectedLocation(loc);
    setModalMode('edit');
    setModalVisible(true);
  }

  function openView(loc, e) {
    e?.stopPropagation();
    lastFocusedRef.current = e?.currentTarget || null;
    setSelectedLocation(loc);
    setModalMode('view');
    setModalVisible(true);
  }

  async function handleDelete(locId) {
    const ok = window.confirm('Delete this location?');
    if (!ok) return;
    try {
      await axios.delete(`/hrms/organization/delete-location/${locId}`);
      setLocations((prev) => prev.filter((l) => l._id !== locId));
    } catch (err) {
      console.error('Delete failed', err);
      toast.error('Failed to delete location');
    }
  }

  // Parent handler used by modal to update list correctly:
  // - If item exists: replace (preserve index)
  // - If item doesn't exist: add to front
  function handleSaved(loc) {
    console.log("[Locations] onSaved called with:", loc);
    if (!loc) return;

    setLocations((prev = []) => {
      // find index of existing item
      const idx = prev.findIndex((p) => p._id === loc._id);
      if (idx !== -1) {
        // replace at same index
        const copy = [...prev];
        copy[idx] = loc;
        return copy;
      } else {
        // add new at front
        return [loc, ...prev];
      }
    });
  }

  function handleDeletedFromModal(id) {
    setLocations((prev) => prev.filter((l) => l._id !== id));
    handleModalClose();
  }

  function handleModalClose() {
    setModalVisible(false);
    setSelectedLocation(null);
    if (lastFocusedRef.current) lastFocusedRef.current.focus();
  }

    // if (loading) return <div className="p-4">Loading...</div>;
      if(loading){
        return(
          <div className='absolute inset-0 z-20 flex items-center justify-center bg-black/5 backdrop-blur-sm rounded-2xl'>
            <DotLottieReact
              src='https://lottie.host/ae5fb18b-4cf0-4446-800f-111558cf9122/InmwUHkQVs.lottie'
              loop
              autoplay
              style={{ width: 100, height: 100, alignItems: 'center' }} 
            />
          </div>
        )
      }
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="w-full -z-10">
      <div className="bg-white h-full rounded-2xl border-[0.3px] border-[#D0D5DD] p-4">
        <div className="p-6 border-b border-gray-200 flex flex-row justify-between items-center">
          <h4 className="text-lg font-semibold text-gray-900">Locations</h4>
          {allUserPermissions.includes("HRMS:MANAGE_ACCOUNT:VIEW")&&
            <div className="flex gap-2">
              <button onClick={openAdd} className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded " >
                Add Location
              </button>
            </div>}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address Type</th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label</th> */}
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
                  <tr key={loc._id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} onClick={(e) => openView(loc, e)} style={{ cursor: 'pointer' }}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{loc.name || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loc.addressType || "-"}</td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loc.addressLabel || "-"}</td> */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loc.city ? `${loc.city} / ${loc.locality || "-"}` : "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loc.postalCode || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loc.timeZone || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loc.contactNumber || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loc.mailAlias || "-"}</td>

                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="inline-flex items-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); openView(loc, e); }} aria-label={`View ${loc.name}`} title="View" className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
                          <Eye size={16} className="text-[var(--color-primary)]" />
                        </button>

                        {allUserPermissions.includes("HRMS:MANAGE_ACCOUNT:VIEW") && <button onClick={(e) => { e.stopPropagation(); openEdit(loc, e); }} aria-label={`Edit ${loc.name}`} title="Edit" className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" disabled={!allUserPermissions.includes("HRMS:MANAGE_ACCOUNT:VIEW")}>
                          <Edit2 size={16} className="text-[var(--color-primaryText)]" />
                        </button>}

                        {allUserPermissions.includes("HRMS:MANAGE_ACCOUNT:VIEW") && <button onClick={(e) => { e.stopPropagation(); handleDelete(loc._id); }} aria-label={`Delete ${loc.name}`} title="Delete" className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-300" disabled={!allUserPermissions.includes("HRMS:MANAGE_ACCOUNT:VIEW")}>
                          <Trash2 size={16} className="text-red-600" />
                        </button>}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">No locations found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddLocationModal
  mode={modalMode}
  location={selectedLocation}
  locations={locations}
  setLocations={setLocations}
  isVisible={modalVisible}
  onClose={handleModalClose}
  onSaved={handleSaved}    // parent will update ordering correctly
  onSave={fetchData}       // <- pass fetchData so modal can refetch authoritative data
/>
    </div>
  );
}

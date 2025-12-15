'use client'
import React, { useEffect, useState } from "react";
import axios from "axios";
import InventoryCard from "@/components/InventoryManagement/InventoryCard";
import AddInventoryModal from "@/components/InventoryManagement/AddInventoryModal";
import EditInventoryModal from "@/components/InventoryManagement/EditInventoryModal";
import { toast } from "react-toastify";
import FilterDropdown from "@/components/UI/FilterDropdown";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const categories = ["Laptop", "Monitor", "Mouse", "Keyboard", "Accessories", "OfficeInventory"];

function InventoryManagement() {
  const [inventory, setInventory] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Laptop");
  const [isAssigned, setIsAssigned] = useState("");
  const [addOpen, setAddOpen] = useState(false);  
  const [editOpen, setEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [overall, setOverall] = useState(0);
  const [fullInventory, setFullInventory] = useState([])
  const [quantityRange, setQuantityRange] = useState("");
  const [page, setPage] = useState(1);
  const [laptopCondition, setLaptopCondition] = useState("");
  const [laptopStatus, setLaptopStatus] = useState("");
  const [userFilter, setUserFilter] = useState(null);
  const [limit] = useState(12); 
  const [totalPages, setTotalPages] = useState(1);
  const [issues, setIssues] = useState(0);
  const [loading, setLoading] = useState(true)
const fetchData = async () => {
  try {
    setLoading(true);

    let filter = "";
    if (activeCategory === "Laptop") {
      filter =
        isAssigned === "isassigned"
          ? "true"
          : isAssigned === "Unassigned"
          ? "false"
          : "";
    }

    let qr = quantityRange;

    const res = await axios.get(
      `/cms/inventory/inventory-status/?category=${activeCategory}&filter=${filter}&range=${qr}&condition=${laptopCondition}&status=${laptopStatus}&page=${page}&limit=${limit}&userId=${userFilter || ""}`
    );

    setInventory(res.data.inventory || []);
    setUsers(res.data.users || []);
    setOverall(res.data.total || 0);
    setIssues(res.data.issues || 0);
    setTotalPages(res.data.totalPages || 1);
  } catch (error) {
    console.error("Error fetching inventory:", error);
  } finally {
    setLoading(false);
  }
};

const fetchAllInventory = async () => {
  try {
    const res = await axios.get(`/cms/inventory/inventory-status`);
    console.log(res)
    setFullInventory(res.data.inventory || []);
  } catch (error) {
    console.error("Error fetching full inventory:", error);
  }
};

useEffect(()=>{
  fetchAllInventory()
},[])

const overallStats = fullInventory.reduce(
  (acc, item) => {
    const category = item.category || "Unknown";

    if (!acc.breakdown[category]) {
      acc.breakdown[category] = { total: 0, assigned: 0, available: 0 };
    }

    if (category === "Laptop") {
      acc.total += 1;
      acc.breakdown[category].total += 1;

      if (item.isAssigned) {
        acc.assigned += 1;
        acc.breakdown[category].assigned += 1;
      } else {
        acc.available += 1;
        acc.breakdown[category].available += 1;
      }

    } else {
      const qty = Number(item.specs?.quantity || 0);
      const assignedCount = item.usersHistory.filter(u => !u.returnedDate).length;

      acc.total += qty+assignedCount;
      acc.assigned += assignedCount;
      acc.available += qty - assignedCount;

      acc.breakdown[category].total += qty+assignedCount;
      acc.breakdown[category].assigned += assignedCount;
      acc.breakdown[category].available +=  acc.breakdown[category].total - assignedCount;
    }

    return acc;
  },
  {
    total: 0,
    assigned: 0,
    available: 0,
    breakdown: {} 
  }
);


    const laptopTotal = inventory.length;
    const laptopAssigned = inventory.filter(i => i.isAssigned).length;
    const laptopAvailable = inventory.filter(i => !i.isAssigned).length;

    let accessoryTotal = 0;
    let accessoryAssigned = 0;
    let accessoryAvailable = 0;

    if (activeCategory !== "Laptop") {
      inventory.forEach(item => {
        const assignedCount = item.usersHistory.filter(u => !u.returnedDate).length;
        const qty = Number(item.specs?.quantity || 0)+assignedCount;
        accessoryTotal += qty;

        accessoryAssigned += assignedCount;

        accessoryAvailable += (qty - assignedCount);
      });
    }

  useEffect(() => {
    fetchData();
  }, [activeCategory, isAssigned,  quantityRange, page,  laptopCondition, laptopStatus, userFilter]);

const handleSaveNewItem = async (formData) => {
  const category = formData.get("category");
  
  const specs = {};
  for (let [key, value] of formData.entries()) {
    if (key.startsWith("specs.")) {
      const specKey = key.replace("specs.", "");
      specs[specKey] = value;
    }
  }

  
  const productImage = formData.get("productImage");
  const receipt = formData.get("receipt");

  if (!productImage) {
    toast.error("Product image is required");
    return false;
  }
  
  if (category === "Laptop") {
    const requiredLaptopFields = [
      "modelName",
      "serialNumber",
      "purchaseDate",
      "ram",
      "expiryDate",
    ];
    
    const missing = requiredLaptopFields.filter((f) => !specs[f]);
    
    if (missing.length > 0) {
      toast.error(`${missing.join(", ")} is Missing`);
      return false;
    }
  } else {
    const requiredAccessoryFields = [
      "type",
      "quantity",
      "brand",
      "condition",
      "model",
      "lowStock",
    ];
    
    const missing = requiredAccessoryFields.filter((f) => !specs[f]);
    
    if (missing.length > 0) {
      toast.error(`${missing.join(", ")} is Missing`);
      return false;
    }
  }
  
  // If we reach here, validation passed
  try {
    await axios.post("/cms/inventory/inventory/add", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    toast.success("Item added successfully!");
    setAddOpen(false);
    fetchData();
  } catch (error) {
    toast.error(error.response?.data?.message || "Error adding item");
  }
};

const handleEditItem = async (formData, id) => {
  try {
    await axios.patch(`/cms/inventory/inventory-status/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    toast.success("Inventory updated successfully");
    setEditOpen(false);
    fetchData();

  } catch (error) {
    toast.error(error.response?.data?.message || "Error updating inventory");
  }
};

const handleDeleteInventory = async (id) => {
  await axios.delete(`/cms/inventory/delete-inventory/${id}`);
  setEditOpen(false);
  fetchData();
};

  const handleEdit = (item) => {
  setSelectedItem(item);

  setEditOpen(true);
  };

  // Filter by selected category
  const filteredInventory = inventory.filter(
    (i) => i.category?.toLowerCase() === activeCategory.toLowerCase()
  );

    if(loading){
    return(
      <div className='flex items-center justify-center h-screen fixed inset-0 bg-black/5 backdrop-blur-sm'>
        <DotLottieReact
          src='https://lottie.host/ae5fb18b-4cf0-4446-800f-111558cf9122/InmwUHkQVs.lottie'
          loop
          autoplay
          style={{ width: 100, height: 100, alignItems: 'center' }} // add this
        />
      </div>
    )
  }


  return (
    <div className="p-6">

   <div className="grid grid-cols-3 gap-4 mb-6">
      <OverallStatCard 
        title="OVERALL" 
        value={overall} 
        breakdown={overallStats.breakdown} 
        mode="total"
      />
      <OverallStatCard 
        title="ASSIGNED" 
        value={overallStats.assigned} 
        breakdown={overallStats.breakdown} 
        mode="assigned"
      />
      <OverallStatCard 
        title="AVAILABLE" 
        value={overallStats.available} 
        breakdown={overallStats.breakdown} 
        mode="available"
      />
    </div>


      {/* Category Tabs */}
      <div className="flex gap-6 border-b border-gray-300 mb-4">
        {categories.map((cat) => (
          <button
          key={cat}
          className={`pb-1 ${
            activeCategory === cat ? "border-b-2 border-primary text-primary font-semibold" : "text-gray-500"
          }`}
          onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}

        <button
          className="ml-auto bg-primary text-xs flex justify-center items-center text-white px-3 py-2 rounded-full mb-2"
          onClick={() => setAddOpen(true)}
          >
            + Add Item
        </button>
      </div>

        {activeCategory === "Laptop" && (
          <div className="flex gap-4 mb-3">

            <FilterDropdown
              label="Assigned"
              value={isAssigned}
              options={[
                { label: "All", value: "" },
                { label: "Assigned", value: "isassigned" },
                { label: "Unassigned", value: "Unassigned" },
              ]}
              onChange={(v) => setIsAssigned(v)}
              />

            <FilterDropdown
              label="Condition"
              value={laptopCondition}
              options={[
                { label: "Condition", value: "" },
                { label: "New", value: "New" },
                { label: "Good", value: "Good" },
                { label: "Average", value: "Average" },
                { label: "Damaged", value: "Damaged" },
              ]}
              onChange={(v) => setLaptopCondition(v)}
              />

            <FilterDropdown
              label="Status"
              value={laptopStatus}
              options={[
                { label: "Status", value: "" },
                { label: "Working", value: "Working" },
                { label: "Not Working", value: "Not Working" },
                { label: "In Repair", value: "In Repair" },
              ]}
              onChange={(v) => setLaptopStatus(v)}
              />

            <FilterDropdown
              label="User"
              value={userFilter}
              options={[
                { label: "User", value: "" },
                ...users.map((u) => ({
                  label: u.fullName,
                  value: u._id,
                })),
              ]}
              onChange={(v) => setUserFilter(v)}
              />

          </div>
        )}

        {activeCategory !== "Laptop" && (
          <div className="mb-3">
            <FilterDropdown
              label="Quantity"
              value={quantityRange}
              options={[
                { label: "Quantity", value: "" },
                { label: "1 - 5", value: "1-5" },
                { label: "6 - 10", value: "6-10" },
                { label: "11 - 25", value: "11-25" },
                { label: "25+", value: "25+" },
              ]}
              onChange={(v) => setQuantityRange(v)}
              />
          </div>
        )}


     <div className="grid grid-cols-4 gap-4 mb-6"> 
        {activeCategory === "Laptop" ? (
          <>
            <StatCard title="TOTAL" value={laptopTotal} />
            <StatCard title="ASSIGNED" value={laptopAssigned} />
            <StatCard title="AVAILABLE" value={laptopAvailable} />
            <StatCard title="ISSUES" value={issues} />
          </>
        ) : (
          <>
            <StatCard title="TOTAL" value={accessoryTotal} />
            <StatCard title="ASSIGNED" value={accessoryAssigned} />
            <StatCard title="AVAILABLE" value={accessoryAvailable} />
          </>
        )}</div>
      {filteredInventory.length === 0 ? (
      <div className="text-center text-gray-500 py-10 text-lg font-medium">
        No items in inventory
      </div>
    ) : (
      <div className="grid grid-cols-3 gap-4">
        {filteredInventory.map((item) => (
          <InventoryCard
            key={item._id}
            item={item}
            onClick={() => handleEdit(item)}
          />
        ))}
      </div>
    )}

    {totalPages > 1 && (
      <div className="flex justify-center mt-6 gap-3">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-40"
        >
          Prev
        </button>

        <span className="font-medium text-gray-700">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>
    )}


      {/* Modals */}
      <AddInventoryModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={(fd) => handleSaveNewItem(fd)}
      />

      <EditInventoryModal
        open={editOpen}
        users={users}
        item={selectedItem}
        onClose={() => setEditOpen(false)}
        onSave={(form, _id) => handleEditItem(form, _id)}
        onDelete={(id)=>handleDeleteInventory(id)}
      />
    </div>
  );
}

const StatCard = ({ title, value }) => (
  <div className="border border-gray-300 p-2 rounded shadow bg-white text-center gap-4 flex items-center justify-center">
    <p className="text-primaryText text-sm">{title} - {value}</p>
  </div>
);

const OverallStatCard = ({ title, value, breakdown, mode }) => {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="border border-gray-300 p-4 rounded shadow bg-white text-center h-[150px] flex flex-col justify-center transition-all duration-200"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <h5 className="text-primaryText text-sm mb-1">{title}</h5>

      {!hover && (
        <p className="text-2xl text-primaryText font-semibold">
          {value}
        </p>
      )}

      {hover && (
        <div className="text-xs text-gray-700 space-y-1 max-h-[90px] overflow-y-auto px-2">
          {Object.keys(breakdown).map((cat) => (
            <div key={cat} className="flex justify-between">
              <span>{cat}</span>
              <span>
                {mode === "total" && breakdown[cat].total}
                {mode === "assigned" && breakdown[cat].assigned}
                {mode === "available" && breakdown[cat].available}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;

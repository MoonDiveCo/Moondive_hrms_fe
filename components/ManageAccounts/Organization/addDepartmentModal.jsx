import { useEffect, useState } from "react";
import { X } from "lucide-react";
import axios from "axios";

export default function AddDepartmentModal({ departments,setDepartments,isVisible, onClose, }) {
  const [department, setDepartment] = useState({
    name: "",
    description: "",
    parentDepartment: "",
    departmentLead: "",
    mailAlias: ""
  });
  const [users,setUsers]=useState(null)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setDepartment(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    if(department?.name===""|| department?.description===""|| department?.departmentLead==="" || department?.mailAlias===""){
        setError("Please fill all required fields")
        setLoading(false)
        return
    }
    try {
        const res=await axios.post("hrms/organization/add-department",department)
        setDepartments((prev)=>([...prev,res.data.result]))

        setDepartment({
            name: "",
            description: "",
            parentDepartment: "",
            departmentLead: "",
            mailAlias: ""
        });
      
        onClose();
    } catch (err) {
      console.error("Error while adding new department", err);
      setError("Failed to add department. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers=async()=>{
    try{
      const res=await axios.get("/hrms/employee/list")
      setUsers(res.data.result)
    }catch(err){
      console.log("err",err)
    }
  }

  useEffect(()=>{
    fetchUsers()
  },[])

  if (!isVisible) return null;
  return(
<div className="fixed inset-0 z-[999] bg-black-50 backdrop-blur-sm flex items-center justify-center">
      {/* Dark overlay */}
      <div 
        className="absolute inset-0 bg-black/40 "
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 hide-scrollbar max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 sticky top-0 bg-white">
          <h4 className="text-md font-semibold text-gray-800">Add Department</h4>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-5">
            {/* Department Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                Department Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={department.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter department name"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={department.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                placeholder="Enter department description"
              />
            </div>

            {/* Parent Department */}
            <div>
              <label htmlFor="parentDepartment" className="block text-sm font-medium text-gray-700 mb-1.5">
                Parent Department
              </label>
              <select
                id="parentDepartment"
                name="parentDepartment"
                value={department.parentDepartment}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select parent department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Department Lead */}
            <div>
              <label htmlFor="departmentLead" className="block text-sm font-medium text-gray-700 mb-1.5">
                Department Head <span className="text-red-500">*</span>
              </label>
              <select
                id="departmentLead"
                name="departmentLead"
                value={department.departmentLead}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select department head</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.firstName +" "+ user.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Mail Alias */}
            <div>
              <label htmlFor="mailAlias" className="block text-sm font-medium text-gray-700 mb-1.5">
                Mail Alias
              </label>
              <input
                type="email"
                id="mailAlias"
                name="mailAlias"
                value={department.mailAlias}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="department@moondive.co"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-white bg-orange-500 rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Department"}
            </button>
          </div>
        </div>
      </div>
    </div>

  )
    
  
}
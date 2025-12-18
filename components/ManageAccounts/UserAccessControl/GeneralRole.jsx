'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import axios from 'axios';
import AddUserRole from './AddUserRole';

export default function GeneralRole() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addRoleVisible,setAddRoleVisible]=useState(false)

  const fetchRoles=async()=>{
    try{
        const res=await axios.get(`/hrms/roles/fetch-user-role`);
        console.log("---------",res.data.result.roles)
        setRoles(res.data.result.roles)
        setLoading(false);

    }catch(err){
        console.log("error while fetching roles: ",err)
    }
  }

  useEffect(() => {
    // mock data
    // setTimeout(() => {

    //   setRoles([
    //     {
    //       id: 'admin',
    //       name: 'Admin',
    //       users: [
    //         {
    //           id: 1,
    //           name: 'ubaid example',
    //           designation: 'Super Administrator',
    //         },
    //       ],
    //     },
    //     { id: 'director', name: 'Director', users: [] },
    //     { id: 'manager', name: 'Manager', users: [] },
    //     { id: 'team-incharge', name: 'Team Incharge', users: [] },
    //     { id: 'team-member', name: 'Team member', users: [] },
    //   ]);
    //   setLoading(false);
    // }, 500);
    
    fetchRoles()
  }, []);

  /* =======================
     Loading
  ======================= */
  if (loading) {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-white rounded-2xl">
        <DotLottieReact
          src="https://lottie.host/ae5fb18b-4cf0-4446-800f-111558cf9122/InmwUHkQVs.lottie"
          loop
          autoplay
          style={{ width: 90, height: 90 }}
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* ✅ OUTER CONTAINER (same as Departments) */}
      <div className="bg-white rounded-2xl border border-[#d0d5dd] shadow-sm">

        {/* Header */}
        <div className="p-6 border-b flex border-[#E4E7EC] justify-between">
          <h4 className="text-lg font-semibold text-gray-900">
            General Role
          </h4>
          <button
            onClick={()=>{setAddRoleVisible(!addRoleVisible)}}
            className='px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded hover:bg-orange-600'
          >Add Role</button>
        </div>

        {/* Content */}
        <div className="p-6">
        <div className="columns-1 md:columns-2 gap-6">
            {roles.map((role) => (
            <div
                key={role._id || role.name}
                className="rounded-xl bg-white p-4 border border-[#D0D5DD] break-inside-avoid mb-6"
            >
                {/* Role header */}
                <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-semibold text-gray-900">
                    {role.name}
                </h4>

                <div className="flex items-center gap-2">
                    <button className="p-1 rounded hover:bg-gray-100">
                    <Plus size={16} className="text-gray-500" />
                    </button>
                    <button className="p-1 rounded hover:bg-gray-100">
                    <Pencil size={15} className="text-gray-500" />
                    </button>
                </div>
                </div>

                {/* Users */}
                {role.users.length > 0 ? (
                <div className="space-y-2">
                    {role.users.map((user) => (
                    <div
                        key={user._id || `${role.name}-${user.name}`}
                        className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700">
                            {user.name?.[0]?.toUpperCase()}
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-900">
                            {user.name}
                            </p>
                            <p className="text-sm text-gray-500">
                            {user.designation}
                            </p>
                        </div>
                        </div>

                        <button className="p-1 rounded hover:bg-gray-200">
                        <Pencil size={14} className="text-gray-500" />
                        </button>
                    </div>
                    ))}
                </div>
                ) : (
                <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-500 shadow-inner">
                    No Users assigned to this Role
                </div>
                )}
            </div>
            ))}
        </div>
        </div>

        


      </div>

    {addRoleVisible && (
    <AddUserRole
        onClose={() => setAddRoleVisible(false)}
        onSuccess={fetchRoles}
    />
    )}
    </div>
  );
}

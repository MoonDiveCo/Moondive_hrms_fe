'use client';

import React, { useRef, useState } from 'react';
import ProfileSlideOver from './ProfileSlideOver'; // adjust path if needed
import { useRouter } from 'next/navigation';
import { useTheme } from "next-themes";

export default function MainNavbar({setCollapsed, collapsed}) {
    const { theme, setTheme } = useTheme();
    const router = useRouter();
  const [openProfile, setOpenProfile] = useState(false);
  const avatarRef = useRef(null);

  // NOTE: Replace with actual logged-in user's avatar if you store it in context or props
  const avatarUrl = '/avatar-placeholder.png'; // fallback

  function openPanel() {
    setOpenProfile(true);
  }
  function closePanel() {
    setOpenProfile(false);
    // return focus to avatar button
    if (avatarRef.current) avatarRef.current.focus();
  }

  return (
    <div className='w-full px-6 md:px-8 z-20'>
      <div className='flex items-center justify-between h-16'>
        <div className='flex items-center gap-2'>
                    <button
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed(!collapsed)}
            className=" rounded hover:bg-primary/20 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            title={collapsed ? "Expand" : "Collapse"}
          >
            {/* chevron icon rotates based on state */}
            <svg
              className={`w-5 h-5 transform transition-transform duration-200 ${
                collapsed ? "rotate-180" : "rotate-0"
              }`}
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M6 4L14 10L6 16V4Z" fill="orange" />
            </svg>
          </button>
            <button
      onClick={() => router.back()}
      className="px-4 py-2 text-xs rounded-full bg-white  text-primaryText hover:text-primary"
    >
      ← Back
    </button>

        </div>

        <div className='flex items-center gap-4'>

          {/* avatar button */}
          <button
            ref={avatarRef}
            onClick={openPanel}
            className='flex items-center gap-2 rounded-full px-1 py-1 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]'
            aria-expanded={openProfile}
            aria-controls='profile-slideover'
          >
            <img
              src={'https://i.pravatar.cc/160?img=2'}
              alt='Profile'
              className='w-9 h-9 rounded-full object-cover border border-gray-100'
            />
          </button>
        </div>
      </div>

      <ProfileSlideOver
        isOpen={openProfile}
        onClose={closePanel}
        onProfileUpdated={(updated) => {
          // optional: update local state / show toast
          console.log('profile updated', updated);
        }}
      />
    </div>
  );
}

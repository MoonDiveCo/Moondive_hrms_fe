'use client';

import React, { useRef, useState } from 'react';
import ProfileSlideOver from './ProfileSlideOver'; // adjust path if needed
import { useRouter } from 'next/navigation';

export default function MainNavbar() {
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
        <div className='flex items-center gap-4'>
            <button
      onClick={() => router.back()}
      className="px-4 py-2 text-xs rounded-full bg-white border border-primary  hover:bg-primary text-primary hover:text-white"
    >
      ← Back
    </button>
        </div>

        <div className='flex items-center gap-4'>
          <input
            type='search'
            placeholder='Search employee'
            className='w-52 md:w-80 bg-[#0000000A] rounded-4xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]'
          />

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

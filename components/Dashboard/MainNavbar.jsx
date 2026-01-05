'use client';

import React, { useContext } from 'react';
import ProfileSlideOver from './ProfileSlideOver';
import { useRouter } from 'next/navigation';
import { Bell, Clock, LogIn, LogOut, Coffee } from 'lucide-react';
import { AuthContext } from '@/context/authContext';
import { useAttendance } from '@/context/attendanceContext';
import { toast } from 'sonner';

export default function MainNavbar({ setCollapsed, collapsed }) {
  const router = useRouter();
  const avatarRef = React.useRef(null);
  const [openProfile, setOpenProfile] = React.useState(false);
  const { user } = useContext(AuthContext);

  const {
    isCheckedIn,
    isOnBreak,
    workedSeconds,
    breakSeconds,
    currentBreakElapsed,
    checkIn,
    checkOut,
    breakIn,
    breakOut,
  } = useAttendance();

  const formatTime = (secs) => {
    if (secs === undefined || secs === null || secs < 0) return "00:00:00";
    const h = String(Math.floor(secs / 3600)).padStart(2, '0');
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const handleCheckIn = () => toast.promise(checkIn(), {
    loading: 'Checking in...',
    success: 'Checked in successfully! 👋',
    error: (err) => err.message || 'Failed to check in',
  });

  const handleCheckOut = () => {
    if (isOnBreak) {
      toast.error('Please end your break before checking out.');
      return;
    }
    toast.promise(checkOut(), {
      loading: 'Checking out...',
      success: 'Checked out successfully! 💼',
      error: (err) => err.message || 'Failed to check out',
    });
  };

  const handleBreakIn = () => toast.promise(breakIn(), {
    loading: 'Starting break...',
    success: 'Enjoy your break! ☕',
    error: (err) => err.message || 'Could not start break',
  });

  const handleBreakOut = () => toast.promise(breakOut(), {
    loading: 'Ending break...',
    success: 'Back to work!',
    error: (err) => err.message || 'Could not end break',
  });

  return (
    <div className="w-full px-6 md:px-8 z-20 bg-white shadow-sm">
      <div className="flex items-center justify-between h-16">

        <div className="flex items-center gap-3">
          <button onClick={() => setCollapsed(!collapsed)} className="rounded hover:bg-primary/20 p-1">
            <svg className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="orange">
              <path d="M6 4L14 10L6 16V4Z" />
            </svg>
          </button>

          <button onClick={() => router.back()} className="px-4 py-1.5 text-xs rounded-full bg-gray-100 hover:bg-gray-200">
            ← Back
          </button>
        </div>

        <div className="flex items-center gap-4">

          {/* Worked Time */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-xs font-medium">
            <Clock size={14} className="text-gray-500" />
            <span>{formatTime(workedSeconds)}</span>
          </div>

          {/* Total Break Time (only if breaks taken) */}
      
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-xs font-medium">
              <Coffee size={14} className="text-gray-500" />
              <span>{formatTime(breakSeconds)}</span>
            </div>
          

          {/* Current Break Live Timer */}
          {/* {isOnBreak && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-xs font-medium">
              <Coffee size={14} className="text-amber-600" />
              <span>{formatTime(currentBreakElapsed)}</span>
            </div>
          )} */}

          {/* Check In / Out */}
          <button
            onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
            disabled={isOnBreak}
            className={`flex items-center gap-2 px-4 py-1.5 w-[130px] justify-center rounded-full text-xs font-semibold transition ${
              isCheckedIn
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-primary text-white hover:opacity-90'
            } ${isOnBreak ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isCheckedIn  ? (
              <>
                <LogOut size={14} />
                Check Out
              </>
            ) : (
              <>
                <LogIn size={14} />
                Check In
              </>
            )}
          </button>

          {/* Break Button - Always shows "Break" when not on break */}
          {isCheckedIn && (
            <button
              onClick={isOnBreak ? handleBreakOut : handleBreakIn}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                isOnBreak
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              <Coffee size={14} />
              {isOnBreak ? 'End Break' : 'Break'}
            </button>
          )}

          <button className="relative p-2 rounded-full hover:bg-gray-100">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] flex items-center justify-center rounded-full bg-orange-500 text-white">
              3
            </span>
          </button>

          <button
            ref={avatarRef}
            onClick={() => setOpenProfile(true)}
            className="flex items-center gap-2 rounded-full hover:bg-gray-50 p-1"
          >
            <img src={user?.imageUrl || null} alt="Profile" className="w-9 h-9 rounded-full" />
          </button>
        </div>
      </div>

      <ProfileSlideOver isOpen={openProfile} onClose={() => setOpenProfile(false)} />
    </div>
  );
}
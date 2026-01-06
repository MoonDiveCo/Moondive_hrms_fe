'use client';

import React, { useContext, useRef, useState } from 'react';
import ProfileSlideOver from './ProfileSlideOver';
import { useRouter } from 'next/navigation';
import { Clock, LogIn, LogOut, Bell } from 'lucide-react';
import { AuthContext } from '@/context/authContext';
import NotificationSlideOver from '@/components/Notification/NotificationList';
import { useNotifications } from '@/context/notificationcontext';
import { Bell, Clock, LogIn, LogOut, Coffee } from 'lucide-react';
import { AuthContext } from '@/context/authContext';
import { useAttendance } from '@/context/attendanceContext';
import { toast } from 'sonner';

export default function MainNavbar({
  collapsed,
  setCollapsed,
  onCheckInClick,
}) {
  const router = useRouter();

  const {
    isCheckedIn,
    isOnBreak,
    workedSeconds,
    breakSeconds,
    breakIn,
    breakOut,
    isCheckedOut,
  } = useAttendance();

  const avatarRef = useRef(null);
  const [openProfile, setOpenProfile] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const { user } = useContext(AuthContext);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  // Add unread count state (you'll need to fetch this from your API)
  const {unreadCount} = useNotifications();
  useEffect(() => {
    console.log("=======================", unreadCount);
  }, [unreadCount]);

  useEffect(() => {
    if (!isCheckedIn) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isCheckedIn]);



  const handleCheckToggle = () => {
    if (isCheckedIn) {
      setIsCheckedIn(false);
      setElapsedSeconds(0);
    } else {
      setIsCheckedIn(true);
    }
  };
  const { user } = useContext(AuthContext);
  const canCheckInNow = !isCheckedIn || isCheckedOut; // either never checked in or already checked out
  const showAsCheckedIn = isCheckedIn && !isCheckedOut; // only this state should show "Check Out"
  const isActiveCheckIn = isCheckedIn && !isCheckedOut;

  const formatTime = (secs) => {
    if (secs === undefined || secs === null || secs < 0) return '00:00:00';
    const h = String(Math.floor(secs / 3600)).padStart(2, '0');
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="w-full px-6 md:px-8 z-20 bg-white shadow-sm">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
  const handleBreakIn = () =>
    toast.promise(breakIn(), {
      loading: 'Starting break...',
      success: 'Enjoy your break! ☕',
      error: (err) => err.message || 'Could not start break',
    });

  const handleBreakOut = () =>
    toast.promise(breakOut(), {
      loading: 'Ending break...',
      success: 'Back to work!',
      error: (err) => err.message || 'Could not end break',
    });

  // Always open face modal – the modal will decide check-in or check-out
  const handleMainButtonClick = () => {
    if (isOnBreak) {
      toast.error('Please end your break first.');
      return;
    }

    // This tells the modal what action to perform after verification
    onFaceModalOpen(isCheckedIn ? 'checkOut' : 'checkIn');
  };

  return (
    <div className='w-full px-6 md:px-8 z-20 bg-white shadow-sm'>
      <div className='flex items-center justify-between h-16'>
        {/* LEFT */}
        <div className='flex items-center gap-3'>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className='rounded hover:bg-primary/20 p-1'
          >
            <svg
              className={`w-5 h-5 transition-transform ${
                collapsed ? 'rotate-180' : ''
              }`}
              viewBox='0 0 20 20'
              fill='orange'
            >
              <path d='M6 4L14 10L6 16V4Z' />
            </svg>
          </button>
          <button
            onClick={() => router.back()}
            className='px-4 py-1.5 text-xs rounded-full bg-gray-100 hover:bg-gray-200'
          >
            ← Back
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-xs font-medium">
            <Clock size={14} className="text-gray-500" />
            <span>{formatTime(elapsedSeconds)}</span>
        {/* RIGHT */}
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-xs font-medium'>
            <Clock size={14} className='text-gray-500' />
            <span>{formatTime(workedSeconds)}</span>
          </div>

          <div className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-xs font-medium'>
            <Coffee size={14} className='text-gray-500' />
            <span>{formatTime(breakSeconds)}</span>
          </div>

          {/* Unified Check In / Out Button */}
          <button
            onClick={() => onCheckInClick(isCheckedIn ? 'checkOut' : 'checkIn')}
            disabled={isOnBreak}
            className={`flex items-center gap-2 px-4 py-1.5 w-[130px] justify-center rounded-full text-xs font-semibold ${
              isActiveCheckIn
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-primary text-white hover:opacity-90'
            }`}
          >
            {isCheckedIn ? (
              <>
                <LogOut size={14} /> Check Out
              </>
            ) : (
              <>
                <LogIn size={14} /> Check In
              </>
            )}
          </button>

          {/* Notification Button with Badge */}
          <button
            onClick={() => setOpenNotifications(true)}
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Bell size={20} className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center text-xs text-white bg-red-500 rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          {/* Break Button */}
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

          <button className='relative p-2 rounded-full hover:bg-gray-100'>
            <Bell size={18} />
            <span className='absolute -top-1 -right-1 w-4 h-4 text-[10px] flex items-center justify-center rounded-full bg-orange-500 text-white'>
              3
            </span>
          </button>

          <button
            ref={avatarRef}
            onClick={() => setOpenProfile(true)}
            className='flex items-center gap-2 rounded-full hover:bg-gray-50 p-1'
          >
            <img
              src={user?.imageUrl || '/default-avatar.png'}
              alt="Profile"
              className="w-9 h-9 rounded-full object-cover"
              alt='Profile'
              className='w-9 h-9 rounded-full object-cover'
            />
          </button>
        </div>
      </div>

      <ProfileSlideOver
        isOpen={openProfile}
        onClose={() => setOpenProfile(false)}
      />
      
      <NotificationSlideOver
        isOpen={openNotifications}
        onClose={() => setOpenNotifications(false)}
      />
    </div>
  );
}
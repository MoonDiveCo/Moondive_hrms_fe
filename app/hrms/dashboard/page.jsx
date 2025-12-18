'use client';

import { getGeolocation } from '@/helper/tracking';
import React, { useEffect, useRef, useState } from 'react';

export default function HRMSOverviewPage() {
  const [activeTab, setActiveTab] = useState('leave');

  // 🔥 ADD YOUR IMAGE URL HERE
  const avatarUrl =
    'https://img.freepik.com/free-photo/young-entrepreneur_1098-18139.jpg?semt=ais_se_enriched&w=740&q=80';

  const tabs = [
    { id: 'leave', label: 'Leave', badge: 2 },
    { id: 'feeds', label: 'Feeds' },
    { id: 'profile', label: 'Profile' },
    { id: 'approvals', label: 'Approvals', badge: 1 },
    { id: 'files', label: 'Files' },
  ];

  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [startTs, setStartTs] = useState(null);
  const [elapsed, setElapsed] = useState(0); // ms
  const timerRef = useRef(null);

  useEffect(() => {
    if (isCheckedIn && startTs) {
      // update elapsed every 1s
      timerRef.current = window.setInterval(() => {
        setElapsed(Date.now() - startTs);
      }, 1000);
      return () => {
        if (timerRef.current) window.clearInterval(timerRef.current);
        timerRef.current = null;
      };
    } else {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setElapsed(0);
    }
  }, [isCheckedIn, startTs]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  function formatDuration(ms) {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600)
      .toString()
      .padStart(2, '0');
    const m = Math.floor((totalSec % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

async function handleCheckIn() {
  try {
    
    const { latitude, longitude } = await getGeolocation();
    if (!latitude || !longitude) {
      return;
    }

    // 2️⃣ Call backend API
    // await axios.post("/api/attendance/check-in", {
    //   latitude,
    //   longitude
    // });

    setIsCheckedIn(true);
    setStartTs(Date.now());
    setElapsed(0);
  } catch (err) {
    console.error("Check-in failed:", err);
    alert("Unable to fetch location or check-in failed");
  }
}


  function handleCheckOut() {
    setIsCheckedIn(false);
    setStartTs(null);
    setElapsed(0);
  }

  return (
    <div className='max-w-full mx-auto px-6 md:px-8 py-6'>
      {/* HERO CARD with right-side status card */}
      <div className='flex flex-col md:flex-row gap-6 md:items-stretch'>
        {/* LEFT BOX (70%) */}
        <div className='md:w-[75%] w-full'>
          <div className='bg-white rounded-xl p-6 shadow-md h-full flex items-center'>
            <img
              src={avatarUrl}
              alt='Aman Singh'
              className='w-28 h-28 rounded-full object-cover shrink-0'
            />

            <div className='ml-6 min-w-0'>
              <h3 className='text-xl font-semibold text-[#0D1B2A] leading-tight'>
                Aman Singh
              </h3>
              <p className='text-lg text-gray-500 mt-1'>
                Software Engineer - 2
              </p>
              <p className='text-sm text-gray-400 '>Engineer Department</p>
            </div>
          </div>
        </div>

        {/* RIGHT BOX (30%) */}
        <div className='md:w-[25%] w-full'>
          <div
            className='bg-white rounded-xl p-4 shadow-md border border-gray-100 h-full flex flex-col justify-center'
            style={{ minHeight: 144 }} /* adjust to match your desired height */
          >
            <div className='text-xs font-medium text-gray-400 uppercase tracking-wide text-center'>
              Status
            </div>

            <div className='relative mt-4 flex-1'>
              {/* NOT CHECKED IN panel */}
              <div
                aria-hidden={isCheckedIn}
                className={`absolute inset-0 px-2 transition-all duration-300 ease-out ${
                  isCheckedIn
                    ? 'opacity-0 -translate-y-2 pointer-events-none'
                    : 'opacity-100 translate-y-0'
                }`}
              >
                <div className='text-center flex flex-col h-full justify-center'>
                  <div className='text-primary font-semibold text-lg'>
                    Yet to check-in
                  </div>

                  <button
                    onClick={handleCheckIn}
                    className='mt-4 w-full inline-block px-4 py-3 border hover:bg-primary hover:text-white border-primary rounded-lg  text-black font-semibold shadow transition'
                    aria-pressed='false'
                  >
                    Check-in
                  </button>
                </div>
              </div>

              {/* CHECKED IN panel */}
              <div
                aria-hidden={!isCheckedIn}
                className={`absolute inset-0 px-2 transition-all duration-300 ease-out ${
                  isCheckedIn
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-2 pointer-events-none'
                }`}
              >
                <div className='text-center flex flex-col h-full justify-center'>
                  <div className='mt-1 text-lg font-mono text-primary font-semibold'>
                    {formatDuration(elapsed)}
                  </div>

                  <button
                    onClick={handleCheckOut}
                    className='mt-4 w-full inline-block px-4 py-3 rounded-lg bg-red-500 text-white font-semibold shadow hover:bg-red-600 transition'
                    aria-pressed='true'
                  >
                    Check-out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Reporting + Department Members */}
      <div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Reporting To */}
        <div className='bg-white rounded-lg p-5 shadow-md flex items-center gap-4'>
          <img
            src={avatarUrl}
            alt='Reporting Manager'
            className='w-12 h-12 rounded-full object-cover'
          />

          <div>
            <div className='text-sm text-gray-500'>Reporting To</div>
            <div className='text-base font-semibold text-[#0D1B2A]'>
              Esther Howard
            </div>
            <div className='text-xs text-gray-400'>Head of Design</div>
          </div>
        </div>

        {/* Department Members */}
        <div className='bg-white rounded-lg p-5 shadow-md flex items-center justify-between'>
          <div>
            <div className='text-sm text-gray-500'>Department Members</div>

            <div className='flex items-center gap-3 mt-2'>
              <div className='flex -space-x-2'>
                <img
                  src={avatarUrl}
                  alt='Member A'
                  className='w-8 h-8 rounded-full border-2 border-white object-cover'
                />
                <img
                  src={avatarUrl}
                  alt='Member B'
                  className='w-8 h-8 rounded-full border-2 border-white object-cover'
                />
                <img
                  src={avatarUrl}
                  alt='Member C'
                  className='w-8 h-8 rounded-full border-2 border-white object-cover'
                />
                <div className='w-8 h-8 rounded-full bg-[#FFEDEC] border-2 border-white flex items-center justify-center text-xs text-[#FF7B30]'>
                  +2
                </div>
              </div>

              <div className='text-base font-semibold text-[#0D1B2A]'>
                5 Members
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Activities Section */}
      <section className='mt-8'>
        <h3 className='text-xl font-semibold text-[#0D1B2A] mb-4'>
          Activities
        </h3>

        <div className='bg-white rounded-lg shadow-md overflow-hidden'>
          <div className='px-6 pt-4'>
            <nav
              className='flex items-center gap-6 border-b border-gray-100 pb-3'
              role='tablist'
            >
              {tabs.map((t) => {
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`relative pb-3 px-3 transition-colors duration-150 ${
                      isActive ? 'font-semibold' : 'text-gray-500'
                    } hover:text-[var(--color-primary)]`}
                    style={{
                      borderBottom: isActive
                        ? '3px solid var(--color-primary)'
                        : '3px solid transparent',
                    }}
                  >
                    <span className='flex items-center gap-2'>
                      {t.label}
                      {t.badge && (
                        <span className='bg-[#FFECEC] text-[var(--color-primary)] px-2 py-0.5 rounded-full text-xs font-medium'>
                          {t.badge}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className='p-6'>
            {activeTab === 'leave' && (
              <div className='bg-white rounded-lg border border-gray-50 p-6'>
                <p className='text-xs'>
                  Your upcoming annual leave is from <b>Dec 24, 2024</b> to{' '}
                  <b>Jan 2, 2025</b>. You have <b>2 pending leave requests</b>{' '}
                  and a remaining balance of <b>8 days</b>.
                </p>

                <button className='mt-4 px-4 py-2 bg-[#FFE6DB] text-[var(--color-primary)] font-semibold rounded-md'>
                  View Details
                </button>
              </div>
            )}

            {activeTab === 'feeds' && <p>No feeds yet.</p>}
            {activeTab === 'profile' && <p>Profile section here.</p>}
            {activeTab === 'approvals' && <p>Pending approvals.</p>}
            {activeTab === 'files' && <p>Files list.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}

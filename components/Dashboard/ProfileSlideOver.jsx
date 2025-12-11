'use client';

import React, { useContext, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { X, LogOut, Edit, Save } from 'lucide-react';
import { AuthContext } from '@/context/authContext';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function ProfileSlideOver({
  isOpen,
  onClose,
  onProfileUpdated,
  onSignOut,
}) {
  const panelRef = useRef(null);
  const firstInputRef = useRef(null);

  const [portalEl] = useState(() => {
    if (typeof document === 'undefined') return null;
    const el = document.createElement('div');
    el.setAttribute('id', 'profile-slideover-root');
    return el;
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [initialProfile, setInitialProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // local UI state to hide slide-over when logout modal shows
  const [panelHidden, setPanelHidden] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { isSignedIn, user, logout } = useContext(AuthContext);

  useEffect(() => {
    if (!portalEl) return;
    document.body.appendChild(portalEl);
    return () => {
      if (portalEl.parentElement) portalEl.parentElement.removeChild(portalEl);
    };
  }, [portalEl]);

  // fetch profile when opened
  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    setLoading(true);
    setError('');
    axios
      .get('/user/get-profile', { withCredentials: true })
      .then((res) => {
        const data = res?.data?.result || res?.data?.data || res?.data;
        const userObj = data?.user ?? data;
        if (!mounted) return;
        const prepared = {
          firstName: userObj?.firstName || '',
          lastName: userObj?.lastName || '',
          email: userObj?.email || '',
          gender: userObj?.gender || '',
          country: userObj?.address?.[0]?.country || 'India',
          state: userObj?.address?.[0]?.state || '',
          city: userObj?.address?.[0]?.city || '',
          language: 'English',
          about: userObj?.about || '',
          imageUrl: userObj?.imageUrl || '',
          mobileNumber: userObj?.mobileNumber || '',
          rawUser: userObj,
        };
        setProfile(prepared);
        setInitialProfile(prepared);
        setIsEditing(false);
        setPanelHidden(false);
      })
      .catch((err) => {
        console.error('Failed to fetch profile', err);
        if (mounted) setError('Failed to fetch profile');
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [isOpen]);

  // close on ESC or outside click
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        if (showLogoutModal) {
          // if modal open, close modal and reopen panel
          setShowLogoutModal(false);
          setPanelHidden(false);
          return;
        }
        if (isEditing) {
          handleCancelEdit();
        } else {
          onClose();
        }
      }
    }
    function onDocClick(e) {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target)) {
        if (isEditing) handleCancelEdit();
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', onKey);
      document.addEventListener('mousedown', onDocClick);
    }
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDocClick);
    };
  }, [isOpen, onClose, isEditing, showLogoutModal]);

  function updateField(name, value) {
    setProfile((p) => ({ ...p, [name]: value }));
  }

  function handleStartEdit() {
    setIsEditing(true);
    setTimeout(() => {
      firstInputRef.current?.focus();
    }, 50);
  }

  function handleCancelEdit() {
    setProfile(initialProfile);
    setIsEditing(false);
    setError('');
  }

  async function handleSave() {
    if (!profile) return;
    setError('');
    setSaving(true);
    try {
      const payload = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        imageUrl: profile.imageUrl,
        mobileNumber: profile.mobileNumber,
        gender: profile.gender,
        about: profile.about,
        address: [
          {
            addressLine: '',
            locality: '',
            city: profile.city,
            state: profile.state,
            postalCode: '',
            country: profile.country,
            addresstype: 'Current',
          },
        ],
      };

      // prefer PATCH/PUT depending on your backend - using PUT here matches your existing code
      const res = await axios.put('/user/edit-profile', payload, {
        withCredentials: true,
      });

      const updated = res?.data?.result || res?.data || {};
      const merged = { ...profile, ...updated };
      setProfile(merged);
      setInitialProfile(merged);
      setIsEditing(false);
      onProfileUpdated && onProfileUpdated(merged);
    } catch (err) {
      console.error('Failed to save profile', err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        'Failed to update profile';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  // when user clicks the Logout button in slide-over footer/header
  function openLogoutConfirm() {
    // hide panel visually but keep it mounted so we can reopen
    setPanelHidden(true);
    setShowLogoutModal(true);
  }

  async function confirmLogout() {
    // call context logout (clears client cookies/localstorage) and try backend logout, then reload
    try {
      if (typeof logout === 'function') logout();
      if (typeof onSignOut === 'function') {
        onSignOut();
      } else {
        // try backend endpoint as extra
        try {
          await axios.post('/auth/logout', {}, { withCredentials: true });
        } catch (e) {
          // ignore if it fails
        }
      }
    } finally {
      // close modal and slide-over and reload to clear app state
      setShowLogoutModal(false);
      setPanelHidden(true);
      // reload page to ensure auth state cleared
      window.location.reload();
    }
  }

  function cancelLogout() {
    // close modal and reopen slide-over
    setShowLogoutModal(false);
    setPanelHidden(false);
  }

  if (!portalEl) return null;

  // slide-over visibility respects parent isOpen and local panelHidden
  const panelVisible = Boolean(isOpen) && !panelHidden;

  const content = (
    <div className='fixed inset-0 z-[9999] pointer-events-none'>
      {/* Overlay for slide-over */}
      <div
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          panelVisible
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* The slide-over */}
      <aside
        id='profile-slideover'
        ref={panelRef}
        className={`absolute right-0 top-1 rounded-md h-full w-full md:w-[580px] bg-white shadow-2xl border-l border-gray-100 transform transition-transform duration-300 ease-in-out pointer-events-auto
          ${panelVisible ? 'translate-x-0' : 'translate-x-[100%]'}`}
        role='dialog'
        aria-modal='true'
      >
        {/* header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100'>
          <div>
            <h3 className='text-lg font-semibold text-[var(--color-blackText)]'>
              My Account
            </h3>
            <div className='text-sm text-[var(--color-primaryText)]'>
              View and edit your profile
            </div>
          </div>

          <div className='flex items-center gap-3'>
            {/* Logout (opens confirmation modal) */}
            <button
              onClick={openLogoutConfirm}
              className='px-4 py-2 text-red-600 bg-red-50 border border-red-200 rounded-md text-sm font-medium hover:bg-red-100'
            >
              Logout
            </button>

            <button
              onClick={() => {
                if (isEditing) handleCancelEdit();
                onClose();
              }}
              aria-label='Close profile panel'
              className='p-2 rounded-md hover:bg-gray-100'
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* body */}
        <div className='p-6 overflow-y-auto h-[calc(100%-80px)]'>
          {loading ? (
            <div className='p-8 text-center text-sm text-gray-500'>
              Loading profile...
            </div>
          ) : error ? (
            <div className='p-4 text-sm text-red-600'>{error}</div>
          ) : profile ? (
            <div className='space-y-6'>
              {/* avatar + name + edit button aligned right */}
              <div className='flex items-center justify-between gap-4'>
                <div className='flex items-center gap-4 min-w-0'>
                  <img
                    src={profile.imageUrl || 'https://i.pravatar.cc/160?img=1'}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    className='w-20 h-20 rounded-full object-cover border border-gray-100 flex-shrink-0'
                  />
                  <div className='min-w-0'>
                    <div className='text-xl font-semibold text-[var(--color-blackText)] truncate'>
                      {profile.firstName} {profile.lastName}
                    </div>
                    <div className='text-sm text-[var(--color-primaryText)] truncate'>
                      {profile.email}
                    </div>
                  </div>
                </div>

                {/* Edit / Save button group */}
                <div className='flex items-center gap-2'>
                  {!isEditing ? (
                    <button
                      onClick={handleStartEdit}
                      className='inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white border border-gray-200 text-sm shadow-sm hover:bg-gray-50'
                      title='Edit profile'
                    >
                      <Edit size={16} /> <span>Edit profile</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className='inline-flex items-center gap-2 px-3 py-2 rounded-md bg-[var(--color-primary)] text-white text-sm font-medium shadow-sm hover:brightness-95 disabled:opacity-60'
                      title='Save profile'
                    >
                      <Save size={16} />{' '}
                      <span>{saving ? 'Saving...' : 'Save'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* form */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    First Name
                  </label>
                  <input
                    ref={firstInputRef}
                    value={profile.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    disabled={!isEditing}
                    className={`mt-1 w-full px-3 py-2 border rounded-md focus:outline-none ${
                      isEditing
                        ? 'border-gray-300 focus:border-[var(--color-primary)]'
                        : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    }`}
                  />
                </div>

                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Last Name
                  </label>
                  <input
                    value={profile.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    disabled={!isEditing}
                    className={`mt-1 w-full px-3 py-2 border rounded-md focus:outline-none ${
                      isEditing
                        ? 'border-gray-300 focus:border-[var(--color-primary)]'
                        : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    }`}
                  />
                </div>

                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Email
                  </label>
                  <input
                    value={profile.email}
                    readOnly
                    className='mt-1 w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 cursor-not-allowed'
                  />
                </div>

                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Mobile
                  </label>
                  <input
                    value={profile.mobileNumber}
                    onChange={(e) =>
                      updateField('mobileNumber', e.target.value)
                    }
                    disabled={!isEditing}
                    className={`mt-1 w-full px-3 py-2 border rounded-md focus:outline-none ${
                      isEditing
                        ? 'border-gray-300 focus:border-[var(--color-primary)]'
                        : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    }`}
                  />
                </div>

                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Gender
                  </label>
                  <select
                    value={profile.gender}
                    onChange={(e) => updateField('gender', e.target.value)}
                    disabled={!isEditing}
                    className={`mt-1 w-full px-3 py-2 border rounded-md focus:outline-none ${
                      isEditing
                        ? 'border-gray-300 focus:border-[var(--color-primary)]'
                        : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    }`}
                  >
                    <option value=''>Prefer not to say</option>
                    <option value='Male'>Male</option>
                    <option value='Female'>Female</option>
                    <option value='Other'>Other</option>
                  </select>
                </div>

                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Country
                  </label>
                  <select
                    value={profile.country}
                    onChange={(e) => updateField('country', e.target.value)}
                    disabled={!isEditing}
                    className={`mt-1 w-full px-3 py-2 border rounded-md focus:outline-none ${
                      isEditing
                        ? 'border-gray-300 focus:border-[var(--color-primary)]'
                        : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    }`}
                  >
                    <option>India</option>
                    <option>United States</option>
                    <option>United Kingdom</option>
                  </select>
                </div>

                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    State
                  </label>
                  <input
                    value={profile.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    disabled={!isEditing}
                    className={`mt-1 w-full px-3 py-2 border rounded-md focus:outline-none ${
                      isEditing
                        ? 'border-gray-300 focus:border-[var(--color-primary)]'
                        : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    }`}
                  />
                </div>

                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Language
                  </label>
                  <select
                    value={profile.language}
                    onChange={(e) => updateField('language', e.target.value)}
                    disabled={!isEditing}
                    className={`mt-1 w-full px-3 py-2 border rounded-md focus:outline-none ${
                      isEditing
                        ? 'border-gray-300 focus:border-[var(--color-primary)]'
                        : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    }`}
                  >
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Spanish</option>
                  </select>
                </div>
              </div>

              <div>
                <label className='text-sm font-medium text-gray-700'>
                  About
                </label>
                <textarea
                  value={profile.about}
                  onChange={(e) => updateField('about', e.target.value)}
                  rows={4}
                  disabled={!isEditing}
                  className={`mt-1 w-full px-3 py-2 border rounded-md focus:outline-none resize-none ${
                    isEditing
                      ? 'border-gray-300 focus:border-[var(--color-primary)]'
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>

              {error && <div className='text-sm text-red-600'>{error}</div>}
            </div>
          ) : (
            <div className='p-8 text-center text-sm text-gray-500'>
              No profile data
            </div>
          )}
        </div>

        {/* footer */}
        <div className='px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4'>
          <div />
          <div className='flex items-center gap-3'>
            <button
              onClick={() => {
                if (isEditing) {
                  handleCancelEdit();
                } else {
                  onClose();
                }
              }}
              className='px-4 py-2 bg-white border border-gray-200 rounded-md text-sm'
            >
              {isEditing ? 'Cancel' : 'Close'}
            </button>

            <button
              onClick={() => {
                if (isEditing) handleSave();
                else handleStartEdit();
              }}
              disabled={!isEditing || saving}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                isEditing
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-white border border-gray-200 text-[var(--color-primaryText)]'
              } ${saving ? 'opacity-60' : ''}`}
            >
              {saving ? 'Saving...' : isEditing ? 'Save changes' : 'Edit'}
            </button>
          </div>
        </div>
      </aside>

      {/* Logout confirmation modal (centered) */}
      {showLogoutModal &&
        ReactDOM.createPortal(
          <div className='fixed inset-0 z-[10000] flex items-center justify-center'>
            {/* backdrop */}
            <div
              className='absolute inset-0 bg-black/40 backdrop-blur-sm'
              onClick={cancelLogout}
            />
            <div className='relative bg-white rounded-xl shadow-2xl w-[min(500px,90%)] p-6 z-10'>
              {/* lottie centered */}
              <div className='flex justify-center'>
                <div className='w-48 '>
                  <DotLottieReact
                    src='https://lottie.host/6ea42a0b-7716-4eff-a01d-6a486e150a49/TCdIGyunvu.lottie'
                    loop
                    autoplay
                  />
                </div>
              </div>

              <div className='text-center'>
                <h3 className='text-lg font-semibold text-[var(--color-blackText)]'>
                  Sign out
                </h3>
                <p className='text-sm text-[var(--color-primaryText)] mt-1'>
                  Are you sure you want to sign out?
                </p>
              </div>

              <div className='mt-6 flex justify-center gap-3'>
                <button
                  onClick={cancelLogout}
                  className='px-4 py-2 bg-white border border-gray-200 rounded-md text-sm'
                >
                  Cancel
                </button>

                <button
                  onClick={confirmLogout}
                  className='px-4 py-2 bg-[var(--color-primary)] text-white rounded-md text-sm font-medium'
                >
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );

  return ReactDOM.createPortal(content, portalEl);
}

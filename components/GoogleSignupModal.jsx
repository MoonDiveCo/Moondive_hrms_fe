"use client";
import React from "react";
import { SIGNUP_BRAND_NAME } from "../text";

export default function GoogleSignupModal({
  isOpen,
  onClose,
  userData,
  onUserDataChange,
  onCreateAccount,
  onLinkAccounts,
  isCreating,
}) {
  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    onUserDataChange({
      ...userData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  return (
  
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50 p-4 overflow-hidden">
  <div className="bg-white rounded-lg w-full max-w-md border border-gray-200 shadow-lg max-h-[95vh] overflow-y-auto">
    {/* Welcome Header */}
    <div className="text-center p-6 pb-3">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
        Welcome {userData.firstName}!
      </h2>
      <p className="text-sm text-gray-600">
        A new account will be created for the email address
      </p>
      <p className="text-sm font-semibold text-gray-900 mt-1">
        {userData.email}
      </p>
    </div>

    {/* Form Fields */}
    <div className="space-y-3 px-6 py-3">
      <div>
        <label className="text-sm text-gray-700 font-medium mb-1.5 block">
          First Name
        </label>
        <input
          name="firstName"
          value={userData.firstName}
          onChange={handleChange}
          type="text"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400 bg-gray-50"
          readOnly
        />
      </div>

      <div>
        <label className="text-sm text-gray-700 font-medium mb-1.5 block">
          Last Name <span className="text-red-500">*</span>
        </label>
        <input
          name="lastName"
          value={userData.lastName}
          onChange={handleChange}
          type="text"
          placeholder="Enter your last name"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
          required
        />
      </div>

      <div>
        <label className="text-sm text-gray-700 font-medium mb-1.5 block">
          Email Address
        </label>
        <input
          name="email"
          value={userData.email}
          onChange={handleChange}
          type="email"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400 bg-gray-50"
          readOnly
        />
      </div>
    </div>

    {/* Terms Checkbox */}
    <div className="flex items-start gap-3 px-6 py-3">
      <input
        name="acceptedTerms"
        checked={userData.acceptedTerms}
        onChange={handleChange}
        type="checkbox"
        className="h-4 w-4 mt-0.5 rounded border-gray-300 text-amber-600 focus:ring-amber-500 flex-shrink-0"
      />
      <span className="text-sm text-gray-700 leading-snug">
        I agree to the Terms of service and Privacy policies of {SIGNUP_BRAND_NAME}
      </span>
    </div>

    {/* Create Account Button */}
    <div className="px-6 py-3">
      <button
        onClick={onCreateAccount}
        disabled={isCreating}
        className="w-full bg-amber-700 text-white rounded-full px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-60 hover:bg-amber-800 transition-colors"
      >
        {isCreating ? "Creating Account..." : "Create Account"}
      </button>
    </div>

    {/* Link Existing Accounts */}
    <div className="text-center border-t pt-3 px-6 pb-5">
      <p className="text-sm text-gray-600 mb-2">Link existing accounts</p>
      <p className="text-xs text-gray-500 mb-2">
        If you have a {SIGNUP_BRAND_NAME} account, you can link your Google account with it.
      </p>
      <button
        onClick={onLinkAccounts}
        className="text-sm text-amber-700 font-semibold hover:text-amber-800 transition-colors"
      >
        Link Accounts
      </button>
    </div>
  </div>
</div>
  );
}
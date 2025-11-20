"use client";
import React, { useState } from 'react';

const AddLocationForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    locationName: '',
    mailAlias: '',
    description: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    country: '',
    state: '',
    postalCode: '',
    timeZone: '',
  });

  const [errors, setErrors] = useState({});

  const countries = ['United States', 'Canada', 'United Kingdom', 'Australia', 'India'];
  const states = ['California', 'New York', 'Texas', 'Florida', 'Illinois'];
  const timeZones = [
    'UTC-08:00 (Pacific Time)',
    'UTC-05:00 (Eastern Time)',
    'UTC+00:00 (GMT)',
    'UTC+05:30 (India Standard Time)',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.locationName.trim()) {
      newErrors.locationName = 'Location name is required';
    }
    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.country) {
      newErrors.country = 'Country is required';
    }
    if (!formData.state) {
      newErrors.state = 'State is required';
    }
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    }
    if (!formData.timeZone) {
      newErrors.timeZone = 'Time zone is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e, submitAndNew = false) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData, submitAndNew);
      if (submitAndNew) {
        setFormData({
          locationName: '',
          mailAlias: '',
          description: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          country: '',
          state: '',
          postalCode: '',
          timeZone: '',
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-[#FFF8EE] bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#FEFEFE] rounded-b-sm shadow-xl w-full max-w-8xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 bg-gray-100 border-b border-gray-300">
          <h2 className="text-base font-semibold text-gray-800">Add Location</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <form className="px-6 py-6">
            {/* Location Details Section */}
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-base font-semibold text-gray-800 mb-6">
                Location Details
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Location Name */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Location Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="locationName"
                      value={formData.locationName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-full focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all outline-none text-sm"
                      placeholder=""
                    />
                  </div>

                  {/* Mail Alias */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Mail Alias
                    </label>
                    <input
                      type="text"
                      name="mailAlias"
                      value={formData.mailAlias}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-full focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all outline-none text-sm"
                      placeholder=""
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all outline-none resize-none text-sm"
                      placeholder=""
                    />
                  </div>
                </div>

                {/* Right Column - Address */}
                <div className="space-y-6">
                  {/* Address Section */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Address
                    </label>
                    <div className="space-y-4">
                      {/* Address Line 1 */}
                      <div>
                        <input
                          type="text"
                          name="addressLine1"
                          value={formData.addressLine1}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-full focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all outline-none text-sm"
                          placeholder="Address line 1"
                        />
                      </div>

                      {/* Address Line 2 */}
                      <div>
                        <input
                          type="text"
                          name="addressLine2"
                          value={formData.addressLine2}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-full focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all outline-none text-sm"
                          placeholder="Address line 2"
                        />
                      </div>

                      {/* City */}
                      <div>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-full focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all outline-none text-sm"
                          placeholder="City"
                        />
                      </div>

                      {/* Country and State */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Country */}
                        <div>
                          <label className="block text-sm text-gray-700 mb-2">
                            Country <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-full focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all outline-none bg-white text-sm text-gray-500"
                          >
                            <option value="">Select Country</option>
                            {countries.map((country) => (
                              <option key={country} value={country}>
                                {country}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* State */}
                        <div>
                          <label className="block text-sm text-gray-700 mb-2">
                            State <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-full focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all outline-none bg-white text-sm text-gray-500"
                          >
                            <option value="">Select State</option>
                            {states.map((state) => (
                              <option key={state} value={state}>
                                {state}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Postal Code */}
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">
                          Postal Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-full focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all outline-none text-sm"
                          placeholder="Postal Code"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Zone - Spanning both columns */}
              <div className="mt-6">
                <label className="block text-sm text-gray-700 mb-2">
                  Time Zone <span className="text-red-500">*</span>
                </label>
                <div className="lg:w-1/2">
                  <select
                    name="timeZone"
                    value={formData.timeZone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-full focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all outline-none bg-white text-sm text-gray-500"
                  >
                    <option value="">Select</option>
                    {timeZones.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer - Sticky at bottom */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={(e) => handleSubmit(e, false)}
              className="px-5 py-2 bg-[#E56E27] text-white text-sm rounded-full hover:bg-[#FF7B30] transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              Submit
            </button>
            <button
              onClick={(e) => handleSubmit(e, true)}
              className="px-5 py-2 bg-[#E56E27] text-white text-sm rounded-full hover:bg-[#FF7B30] transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              Submit and New
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-full hover:bg-gray-50 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLocationForm;
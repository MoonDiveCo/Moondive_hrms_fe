"use client";
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

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
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState({ countries: true, states: true });
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState({ country: '', state: '' });
  const countryDropdownRef = useRef(null);
  const stateDropdownRef = useRef(null);

  const timeZones = [
    'UTC-08:00 (Pacific Time)',
    'UTC-05:00 (Eastern Time)',
    'UTC+00:00 (GMT)',
    'UTC+05:30 (India Standard Time)',
  ];

  // Fetch countries from API
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(prev => ({ ...prev, countries: true }));
        const response = await axios.get('https://api.first.org/data/v1/countries');
        console.log('Fetched countries:', response.data);
        
        const countriesData = response.data.data;
        const countriesArray = Object.entries(countriesData).map(([code, countryData]) => ({
          name: countryData.country,
          code: code
        })).sort((a, b) => a.name.localeCompare(b.name));
        
        setCountries(countriesArray);
      } catch (error) {
        console.error('Error fetching countries:', error);
      } finally {
        setLoading(prev => ({ ...prev, countries: false }));
      }
    };

    fetchCountries();
  }, []);

  // Fetch states from the new API
  useEffect(() => {
    const fetchStates = async () => {
      try {
        setLoading(prev => ({ ...prev, states: true }));
        const response = await axios.get('https://countriesnow.space/api/v0.1/countries/states');
        console.log('Fetched states:', response.data);
        
        if (response.data && response.data.data) {
          const allStates = response.data.data.flatMap(country => 
            country.states.map(state => ({
              name: state.name,
              country: country.name
            }))
          ).sort((a, b) => a.name.localeCompare(b.name));
          
          setStates(allStates);
        }
      } catch (error) {
        console.error('Error fetching states:', error);
      } finally {
        setLoading(prev => ({ ...prev, states: false }));
      }
    };

    fetchStates();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
        setShowCountryDropdown(false);
      }
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(event.target)) {
        setShowStateDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.country.toLowerCase())
  );

  const filteredStates = states.filter(state =>
    state.name.toLowerCase().includes(searchTerm.state.toLowerCase())
  );

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Location Name validation
    if (!formData.locationName.trim()) {
      newErrors.locationName = 'Location name is required';
    }

    // Country validation
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    // State validation
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    // Postal Code validation
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    }

    // Time Zone validation
    if (!formData.timeZone) {
      newErrors.timeZone = 'Time zone is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Country handlers
  const handleCountrySelect = (countryName) => {
    setFormData(prev => ({
      ...prev,
      country: countryName
    }));
    setShowCountryDropdown(false);
    setSearchTerm(prev => ({ ...prev, country: '' }));
    
    // Clear error when field is filled
    if (errors.country) {
      setErrors(prev => ({
        ...prev,
        country: ''
      }));
    }
  };

  const handleCountryInputChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      country: value
    }));
    setSearchTerm(prev => ({ ...prev, country: value }));
    setShowCountryDropdown(true);
    
    // Clear error when user starts typing
    if (errors.country && value.trim()) {
      setErrors(prev => ({
        ...prev,
        country: ''
      }));
    }
  };

  const handleCountryInputFocus = () => {
    setShowCountryDropdown(true);
    setSearchTerm(prev => ({ ...prev, country: formData.country }));
  };

  const toggleCountryDropdown = () => {
    setShowCountryDropdown(!showCountryDropdown);
    if (!showCountryDropdown) {
      setSearchTerm(prev => ({ ...prev, country: formData.country }));
    }
  };

  const handleStateSelect = (stateName) => {
    setFormData(prev => ({
      ...prev,
      state: stateName
    }));
    setShowStateDropdown(false);
    setSearchTerm(prev => ({ ...prev, state: '' }));
    
    // Clear error when field is filled
    if (errors.state) {
      setErrors(prev => ({
        ...prev,
        state: ''
      }));
    }
  };

  const handleStateInputChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      state: value
    }));
    setSearchTerm(prev => ({ ...prev, state: value }));
    setShowStateDropdown(true);
    
    // Clear error when user starts typing
    if (errors.state && value.trim()) {
      setErrors(prev => ({
        ...prev,
        state: ''
      }));
    }
  };

  const handleStateInputFocus = () => {
    setShowStateDropdown(true);
    setSearchTerm(prev => ({ ...prev, state: formData.state }));
  };

  const toggleStateDropdown = () => {
    setShowStateDropdown(!showStateDropdown);
    if (!showStateDropdown) {
      setSearchTerm(prev => ({ ...prev, state: formData.state }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing/selecting
    if (errors[name] && value.trim()) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const isValid = validateForm();
    
    if (isValid) {
      // If validation passes, submit the form
      onSubmit(formData);
    } else {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
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
          <form onSubmit={handleSubmit} className="px-6 py-6">
            {/* Location Details Section */}
            <div className="bg-white p-12 rounded-lg">
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
                      className={`w-full px-3 py-2 border ${
                        errors.locationName ? 'border-red-500' : 'border-gray-300'
                      } rounded-full focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all outline-none text-sm`}
                      placeholder=""
                    />
                    {errors.locationName && (
                      <p className="mt-1 text-xs text-red-500">{errors.locationName}</p>
                    )}
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
                        <div className="relative" ref={countryDropdownRef}>
                          <label className="block text-sm text-gray-700 mb-2">
                            Country <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              name="country"
                              value={formData.country}
                              onChange={handleCountryInputChange}
                              onFocus={handleCountryInputFocus}
                              className={`w-full px-3 py-2 border ${
                                errors.country ? 'border-red-500' : 'border-gray-300'
                              } rounded-full focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all outline-none bg-white text-sm pr-10`}
                              placeholder="Select Country"
                              autoComplete="off"
                            />
                            {/* Arrow Icon */}
                            <div 
                              className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                              onClick={toggleCountryDropdown}
                            >
                              <svg 
                                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showCountryDropdown ? 'rotate-180' : ''}`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                          {errors.country && (
                            <p className="mt-1 text-xs text-red-500">{errors.country}</p>
                          )}
                          
                          {/* Custom Dropdown */}
                          {showCountryDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {loading.countries ? (
                                <div className="px-3 py-2 text-sm text-gray-500">Loading countries...</div>
                              ) : filteredCountries.length > 0 ? (
                                filteredCountries.map((country) => (
                                  <div
                                    key={country.code}
                                    className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                                    onClick={() => handleCountrySelect(country.name)}
                                  >
                                    {country.name}
                                  </div>
                                ))
                              ) : (
                                <div className="px-3 py-2 text-sm text-gray-500">No countries found</div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* State */}
                        <div className="relative" ref={stateDropdownRef}>
                          <label className="block text-sm text-gray-700 mb-2">
                            State <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              name="state"
                              value={formData.state}
                              onChange={handleStateInputChange}
                              onFocus={handleStateInputFocus}
                              className={`w-full px-3 py-2 border ${
                                errors.state ? 'border-red-500' : 'border-gray-300'
                              } rounded-full focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all outline-none bg-white text-sm pr-10`}
                              placeholder="Select State"
                              autoComplete="off"
                            />
                            {/* Arrow Icon */}
                            <div 
                              className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                              onClick={toggleStateDropdown}
                            >
                              <svg 
                                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showStateDropdown ? 'rotate-180' : ''}`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                          {errors.state && (
                            <p className="mt-1 text-xs text-red-500">{errors.state}</p>
                          )}
                          
                          {/* Custom Dropdown */}
                          {showStateDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {loading.states ? (
                                <div className="px-3 py-2 text-sm text-gray-500">Loading states...</div>
                              ) : filteredStates.length > 0 ? (
                                filteredStates.map((state) => (
                                  <div
                                    key={`${state.name}-${state.country}`}
                                    className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                                    onClick={() => handleStateSelect(state.name)}
                                  >
                                    {state.name}
                                  </div>
                                ))
                              ) : (
                                <div className="px-3 py-2 text-sm text-gray-500">No states found</div>
                              )}
                            </div>
                          )}
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
                          className={`w-full px-3 py-2 border ${
                            errors.postalCode ? 'border-red-500' : 'border-gray-300'
                          } rounded-full focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all outline-none text-sm`}
                          placeholder="Postal Code"
                        />
                        {errors.postalCode && (
                          <p className="mt-1 text-xs text-red-500">{errors.postalCode}</p>
                        )}
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
                    className={`w-full px-3 py-2 border ${
                      errors.timeZone ? 'border-red-500' : 'border-gray-300'
                    } rounded-full focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all outline-none bg-white text-sm ${
                      formData.timeZone ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    <option value="">Select</option>
                    {timeZones.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                  {errors.timeZone && (
                    <p className="mt-1 text-xs text-red-500">{errors.timeZone}</p>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer - Sticky at bottom */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-5 py-2 bg-[#E56E27] text-white text-sm rounded-full hover:bg-[#FF7B30] transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              Submit
            </button>
            <button
              type="button"
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
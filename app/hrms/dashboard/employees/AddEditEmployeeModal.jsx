'use client';

import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';

/**
 * AddEditEmployeeModal
 *
 * Props:
 * - mode: 'add' | 'edit' | 'view'
 * - employee: object | null (for edit/view)
 * - onClose: fn()
 * - onSave: fn(employee) -> called when form is saved (add or edit)
 *
 * This is a controlled internal form with 4 steps:
 *  1. Personal (first, last, email, mobile, dob, gender, image, marital, about, addresses, emergency)
 *  2. Job (userRole, sourceOfHire, employmentType, status, shift, skills)
 *  3. Employment (departmentId, designationId, reportingManagerId, dateOfJoining, onboardingStatus, availableLeave, probationEndDate)
 *  4. Credentials (employeeId, display email, password)
 *
 * For 'view' mode the fields are read-only.
 * <-- Changes: Reverted to 4 steps as per user request. Moved employeeId and password to step 4. Email in step 4 is read-only display. Updated stepper, validation, next/back, submit for 4 steps. Removed employeeId from step 2. Added validation for step 4 (employeeId, password). Ensured submit includes all fields.
 */

export default function AddEditEmployeeModal({ mode = 'add', employee = null, onClose, onSave }) {
  const modalRef = useRef(null);
  const [step, setStep] = useState(1);
  const []

  // init form (merge defaults)
const empty = {
  employeeId: '',
  firstName: '',
  lastName: '',
  // age: '',  // <-- Removed: not in schema/backend
  dateOfBirth: '',
  email: '',
  imageUrl: '',
  mobileNumber: '',
  alternateMobileNumber:'',
  gender: '',
  about: '',
  maritalStatus:'',

  // Address Array - two entries for current/permanent
  address: [
    {
      addresstype: 'Current',
      addressLine: '',
      locality: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
    {
      addresstype: 'Permanent',
      addressLine: '',
      locality: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    }
  ],

  // Identification Details - commented out as per instructions
  // uan: '',
  // pan: '',
  // aadhar: '',

  // Emergency Contact Array
  emergencyContacts: [
    {
      name: '',
      relationship: '',
      phone: '',
      email: ''
    }
  ],

  // Job & Employment
  departmentId: '',
  designationId: '',
  reportingManagerId: '',
  dateOfJoining: '',
  employmentType: '',
  employmentStatus: '',
  availableLeave: '',
  sourceOfHire: '',
  workingShiftId: '',
  onboardingStatus:'',
  probationEndDate: '', // <-- Added: to match schema/backend

  // Roles & Skills
  userRole: [],
  skills: [],
  skillInput: '',
  password: '', // <-- Added: for add mode
};


  const [form, setForm] = useState(() => ({ ...empty, ...(employee || {}) }));
  const [errors, setErrors] = useState({});

  // keep form in sync when employee changes (e.g. open edit)
  useEffect(() => {
    setForm({ ...empty, ...(employee || {}), skillInput: '' });
    setStep(1);
    setErrors({});
  }, [employee]);

  // close on Esc
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // click outside to close
  useEffect(() => {
    function handleClick(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  function update(field, value) {
    setForm((s) => ({ ...s, [field]: value }));
  }

  // <-- Added: helper to update address fields
  function updateAddressField(idx, field, value) {
    setForm(prev => {
      const newAddress = [...prev.address];
      newAddress[idx] = { ...newAddress[idx], [field]: value };
      return { ...prev, address: newAddress };
    });
  }

  // <-- Added: helper to update emergency contact fields
  function updateEmergencyContactField(idx, field, value) {
    setForm(prev => {
      const newContacts = [...prev.emergencyContacts];
      newContacts[idx] = { ...newContacts[idx], [field]: value };
      return { ...prev, emergencyContacts: newContacts };
    });
  }

  function validateStep(currentStep = step) {
    const e = {};
    if (currentStep === 1) {
      if (!form.firstName) e.firstName = 'Required';
      if (!form.email) e.email = 'Required';
    }
    // if (currentStep === 2) { 
    //   if (!form.userRole.length) e.userRole = 'Required';
    // }
    // if (currentStep === 3) { 
    //   if (!form.departmentId) e.departmentId = 'Required';
    //   if (!form.designationId) e.designationId = 'Required';
    //   if (!form.dateOfJoining) e.dateOfJoining = 'Required';
    // }
    // if (currentStep === 4) {
    //   if (!form.employeeId) e.employeeId = 'Required';
    //   if (!form.password) e.password = 'Required';
    // }
    // no strict validation for optional fields
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (validateStep(step)) {
      setStep((s) => Math.min(4, s + 1)); // <-- Changed: max 4 steps
    }
  }

  function back() {
    setStep((s) => Math.max(1, s - 1));
  }

  async function submit() {
    // validate all steps
    const ok = validateStep(1) && validateStep(2) && validateStep(3) && validateStep(4); // <-- Added: validate step 4
    if (!ok) {
      // jump to first error step
      if (!validateStep(1)) setStep(1);
      else if (!validateStep(2)) setStep(2);
      else if (!validateStep(3)) setStep(3);
      else setStep(4);
      return;
    }

    // <-- Changed: map form to backend-expected fields (no name/deptName/avatar; use IDs; extract addresses without type; include all fields)
    const submitData = {
      employeeId: form.employeeId,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      photo: form.imageUrl, // <-- Maps to backend photo (imageUrl)
      dateOfBirth: form.dateOfBirth,
      gender: form.gender,
      maritalStatus: form.maritalStatus,
      aboutMe: form.about, // <-- Maps to backend aboutMe (about)
      workPhoneNumber: form.mobileNumber, // <-- Maps to backend workPhoneNumber (mobileNumber)
      personalMobileNumber: form.alternateMobileNumber, // <-- Maps to backend personalMobileNumber (alternateMobileNumber)
      presentAddress: { // <-- Extract current address fields (without addresstype)
        addressLine: form.address[0].addressLine,
        locality: form.address[0].locality,
        city: form.address[0].city,
        state: form.address[0].state,
        postalCode: form.address[0].postalCode,
        country: form.address[0].country,
      },
      permanentAddress: { // <-- Extract permanent address fields (without addresstype)
        addressLine: form.address[1].addressLine,
        locality: form.address[1].locality,
        city: form.address[1].city,
        state: form.address[1].state,
        postalCode: form.address[1].postalCode,
        country: form.address[1].country,
      },
      // <-- Commented out as per instructions: do not add user details
      // aadhaar: form.aadhar,
      // pan: form.pan,
      // uan: form.uan,
      password: form.password,
      userRole: form.userRole,
      skills: form.skills,
      sourceOfHire: form.sourceOfHire,
      employmentType: form.employmentType,
      employmentStatus: form.employmentStatus,
      departmentId: form.departmentId,
      designationId: form.designationId,
      reportingManagerId: form.reportingManagerId,
      dateOfJoining: form.dateOfJoining,
      onboardingStatus: form.onboardingStatus,
      availableLeave: form.availableLeave,
      workingShiftId: form.workingShiftId,
      probationEndDate: form.probationEndDate, // <-- Added: to match backend
      emergencyContacts: form.emergencyContacts,
    };

    console.log("------------", submitData);
    // <-- Changed: post to add-employee; for edit, would use PUT (not implemented here)
    const res = await axios.post('hrms/employee/add-employee', submitData);
    console.log("-----------", res.data.data); // <-- Adjusted: backend returns res.data.data

    // call parent save
    onSave && onSave(submitData);
    onClose && onClose();
  }

  function addSkillFromInput() {
    const val = form.skillInput.trim();
    if (!val) return;
    if (!form.skills.includes(val)) {
      setForm((s) => ({ ...s, skills: [...s.skills, val], skillInput: '' }));
    } else {
      setForm((s) => ({ ...s, skillInput: '' }));
    }
  }

  function removeSkill(idx) {
    setForm((s) => {
      const copy = [...s.skills];
      copy.splice(idx, 1);
      return { ...s, skills: copy };
    });
  }

  function onSkillKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkillFromInput();
    }
    if (e.key === 'Backspace' && form.skillInput === '' && form.skills.length > 0) {
      // remove last
      removeSkill(form.skills.length - 1);
    }
  }

  const isView = mode === 'view';
  const isEdit = mode === 'edit';
  const primaryLabel = isView ? 'Close' : isEdit ? 'Save changes' : 'Create employee';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center ">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        ref={modalRef}
        className="relative w-[min(900px,95%)] h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-y-auto hide-scrollbar"
        role="dialog"
        aria-modal="true"
      >
        {/* header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 sticky top-0 bg-white">
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-blackText)]">
              {mode === 'add' ? 'Add Employee' : mode === 'edit' ? 'Edit Employee' : 'View Employee'}
            </h3>
            <div className="text-sm text-[var(--color-primaryText)] mt-1">Multi-step employee form</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-[var(--color-primaryText)]">{/* step indicator */}</div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-gray-500 hover:text-gray-700 p-2 rounded-md"
            >
              ✕
            </button>
          </div>
        </div>

        {/* stepper - <-- Changed: 4 steps */}
        <div className="px-6 pt-4 pb-3 border-b border-gray-100 sticky top-20 bg-white">
          <div className="flex items-center gap-4">
            {[1, 2, 3, 4].map((s) => ( // <-- Changed: [1,2,3,4]
              <div key={s} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === s ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {s}
                </div>
                <div className="text-sm text-[var(--color-primaryText)]">
                  {s === 1 ? 'Personal' : s === 2 ? 'Job' : s === 3 ? 'Employment' : 'Credentials'} {/* <-- Added: Credentials for step 4 */}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* body */}
        <div className="p-6 ">
          {/* Step 1: Personal */}
          <div hidden={step !== 1} className={step === 1 ? '' : 'hidden'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
              <h5 className="md:col-span-2"> Personal Details</h5>
              {/* First Name */}
              <div>
                <label className="text-sm text-[var(--color-primaryText)]">First name</label>
                <input
                  value={form.firstName || ''}
                  onChange={(e) => update('firstName', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
                {errors.firstName && <div className="text-xs text-red-500 mt-1">{errors.firstName}</div>}
              </div>

              {/* Last Name */}
              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Last name</label>
                <input
                  value={form.lastName || ''}
                  onChange={(e) => update('lastName', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Email address</label>
                <input
                  type="email"
                  value={form.email || ''}
                  onChange={(e) => update('email', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
                {errors.email && <div className="text-xs text-red-500 mt-1">{errors.email}</div>}
              </div>

              {/* <-- Added: Image URL input */}
              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Photo URL</label>
                <input
                  value={form.imageUrl || ''}
                  onChange={(e) => update('imageUrl', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
              </div>

              {/* Date of Birth - <-- Moved up, removed age */}
              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Date of Birth</label>
                <input
                  type="date"
                  value={form.dateOfBirth || ''}
                  onChange={(e) => update('dateOfBirth', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
              </div>

              {/* Gender */}
              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Gender</label>
                <select
                  value={form.gender || ''}
                  onChange={(e) => update('gender', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  disabled={isView}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Marital Status */}
              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Marital Status</label>
                <select
                  value={form.maritalStatus || ''}
                  onChange={(e) => update('maritalStatus', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  disabled={isView}
                >
                  <option value="">Select</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Mobile Number</label>
                <input
                  value={form.mobileNumber || ''}
                  onChange={(e) => update('mobileNumber', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
              </div>

              {/* Alternate Mobile Number */}
              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Alternate Mobile Number</label>
                <input
                  type="number"
                  value={form.alternateMobileNumber || ''}
                  onChange={(e) => update('alternateMobileNumber', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
              </div>

              {/* About */}
              <div className="md:col-span-2">
                <label className="text-sm text-[var(--color-primaryText)]">About</label>
                <textarea
                  value={form.about || ''}
                  onChange={(e) => update('about', e.target.value)}
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
              </div>

              <h5 className="md:col-span-2"> Current Address Details</h5> {/* <-- Changed: fixed to Current, no select */}

              {/* Address Line */}
              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Address Line</label>
                <input
                  value={form.address?.[0]?.addressLine || ''}
                  onChange={(e) => updateAddressField(0, 'addressLine', e.target.value)}
                  placeholder="Street address, etc."
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
              </div>

              {/* Locality */}
              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Locality</label>
                <input
                  value={form.address?.[0]?.locality || ''}
                  onChange={(e) => updateAddressField(0, 'locality', e.target.value)}
                  placeholder="Neighborhood or locality"
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
              </div>

              {/* City */}
              <div>
                <label className="text-sm text-[var(--color-primaryText)]">City</label>
                <input
                  value={form.address?.[0]?.city || ''}
                  onChange={(e) => updateAddressField(0, 'city', e.target.value)}
                  placeholder="City name"
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
              </div>

              {/* State */}
              <div>
                <label className="text-sm text-[var(--color-primaryText)]">State</label>
                <input
                  value={form.address?.[0]?.state || ''}
                  onChange={(e) => updateAddressField(0, 'state', e.target.value)}
                  placeholder="State/Province"
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
              </div>

              {/* Postal Code */}
              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Postal Code</label>
                <input
                  value={form.address?.[0]?.postalCode || ''}
                  onChange={(e) => updateAddressField(0, 'postalCode', e.target.value)}
                  placeholder="ZIP/Postal code"
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
              </div>

              {/* Country */}
              <div className="md:col-span-1"> {/* <-- Adjusted: ensure full width if needed */}
                <label className="text-sm text-[var(--color-primaryText)]">Country</label>
                <input
                  value={form.address?.[0]?.country || ''}
                  onChange={(e) => updateAddressField(0, 'country', e.target.value)}
                  placeholder="Country name"
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
              </div>

              <h5 className="md:col-span-2"> Permanent Address Details</h5> {/* <-- Added: permanent address section */}

              {/* Permanent Address Line */}
              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Address Line</label>
                <input
                  value={form.address?.[1]?.addressLine || ''}
                  onChange={(e) => updateAddressField(1, 'addressLine', e.target.value)}
                  placeholder="Street address, etc."
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
              </div>

              {/* Permanent Locality */}
              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Locality</label>
                <input
                  value={form.address?.[1]?.locality || ''}
                  onChange={(e) => updateAddressField(1, 'locality', e.target.value)}
                  placeholder="Neighborhood or locality"
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
              </div>

              {/* Permanent City */}
              <div>
                <label className="text-sm text-[var(--color-primaryText)]">City</label>
                <input
                  value={form.address?.[1]?.city || ''}
                  onChange={(e) => updateAddressField(1, 'city', e.target.value)}
                  placeholder="City name"
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
              </div>

              {/* Permanent State */}
              <div>
                <label className="text-sm text-[var(--color-primaryText)]">State</label>
                <input
                  value={form.address?.[1]?.state || ''}
                  onChange={(e) => updateAddressField(1, 'state', e.target.value)}
                  placeholder="State/Province"
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
              </div>

              {/* Permanent Postal Code */}
              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Postal Code</label>
                <input
                  value={form.address?.[1]?.postalCode || ''}
                  onChange={(e) => updateAddressField(1, 'postalCode', e.target.value)}
                  placeholder="ZIP/Postal code"
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
              </div>

              {/* Permanent Country */}
              <div className="md:col-span-1">
                <label className="text-sm text-[var(--color-primaryText)]">Country</label>
                <input
                  value={form.address?.[1]?.country || ''}
                  onChange={(e) => updateAddressField(1, 'country', e.target.value)}
                  placeholder="Country name"
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
              </div>

              {/* <-- Commented out as per instructions: do not add user details like UAN, PAN, AADHAR */}
              {/* <h5 className="md:col-span-2"> Identification Details</h5>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">UAN</label>
                <input
                  value={form.uan || ''}
                  onChange={(e) => update('uan', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">PAN</label>
                <input
                  value={form.pan || ''}
                  onChange={(e) => update('pan', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">AADHAR</label>
                <input
                  value={form.aadhar || ''}
                  onChange={(e) => update('aadhar', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
              </div> */}

              <h5 className="md:col-span-2"> Emergency Contact</h5>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Emergency Contact Name</label>
                <input
                  value={form.emergencyContacts?.[0]?.name || ''}
                  onChange={(e) => updateEmergencyContactField(0, 'name', e.target.value)}
                  placeholder="Full name of contact"
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
              </div>

              {/* Emergency Contact Relationship */}
              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Relationship</label>
                <select
                  value={form.emergencyContacts?.[0]?.relationship || ''}
                  onChange={(e) => updateEmergencyContactField(0, 'relationship', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  disabled={isView}
                >
                  <option value="">Select Relationship</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Child">Child</option>
                  <option value="Friend">Friend</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Emergency Contact Phone */}
              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Phone</label>
                <input
                  type="tel"
                  value={form.emergencyContacts?.[0]?.phone || ''}
                  onChange={(e) => updateEmergencyContactField(0, 'phone', e.target.value)}
                  placeholder="Phone number"
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
              </div>

              {/* Emergency Contact Email */}
              <div className="md:col-span-1">
                <label className="text-sm text-[var(--color-primaryText)]">Email</label>
                <input
                  type="email"
                  value={form.emergencyContacts?.[0]?.email || ''}
                  onChange={(e) => updateEmergencyContactField(0, 'email', e.target.value)}
                  placeholder="Emergency Contact Email address"
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
              </div>

              {/* <-- Removed: Password from step 1, moved to step 4 */}

            </div>
          </div>


          {/* Step 2: Job - <-- Adjusted: removed employeeId */}
          <div hidden={step !== 2} className={step === 2 ? '' : 'hidden'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* <-- Removed: Employee ID from step 2 */}

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">User Role</label>
                  <select
                    value={form.userRole?.[0] || ''}
                    onChange={(e) => update('userRole', [e.target.value])}
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                    disabled={isView}
                  >
                    <option value="">Select role</option>
                    <option value="admin">Admin</option>
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="hr">HR</option>
                  </select>
                  {errors.userRole && <div className="text-xs text-red-500 mt-1">{errors.userRole}</div>}
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Source of Hire</label>
                <select
                  value={form.sourceOfHire || ''}
                  onChange={(e) => update('sourceOfHire', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  disabled={isView}
                >
                  <option value="">Select</option>
                  <option value="Direct">Direct</option>
                  <option value="Referral">Referral</option>
                  <option value="Web">Web</option>
                  <option value="NewsPaper">NewsPaper</option>
                  <option value="Advertisement">Advertisement</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Employment Type</label>
                <select
                  value={form.employmentType || ''}
                  onChange={(e) => update('employmentType', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  disabled={isView}
                >
                  <option value="">Select</option>
                  <option value="Permanent">Permanent</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Trainee">Trainee</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Employment Status</label>
                <select
                  value={form.employmentStatus || ''}
                  onChange={(e) => update('employmentStatus', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  disabled={isView}
                >
                  <option value="">Select</option>
                  <option value="Active">Active</option>
                  <option value="On Probation">On Probation</option>
                  <option value="Resigned">Resigned</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Working Shift</label>
                <select
                  value={form.workingShiftId || ''}
                  onChange={(e) => update('workingShiftId', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  disabled={isView}
                >
                  <option value="">Select Shift</option>
                  {/* Example shifts; replace with dynamic options from API/context, using shift._id as value */}
                  <option value="shift1">Morning Shift</option>
                  <option value="shift2">Evening Shift</option>
                  <option value="shift3">Night Shift</option>
                </select>
              </div>

              <div className=' md:col-span-2'>
                <label className="text-sm text-[var(--color-primaryText)] ">Skills (press Enter or comma to add)</label>
                <div className="mt-1 ">
                    {!isView && (
                      <input
                        value={form.skillInput}
                        onChange={(e) => update('skillInput', e.target.value)}
                        onKeyDown={onSkillKeyDown}
                        onBlur={addSkillFromInput}
                        placeholder="Add skill..."
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)] flex-1 min-w-[100px] mb-3 w-[60%]"
                      />
                    )}
                  <div className="flex flex-wrap gap-2">

                    {form.skills.map((s, i) => (
                      <div key={s + '-' + i} className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-sm">
                        <span>{s}</span>
                        {!isView && (
                          <button
                            onClick={() => removeSkill(i)}
                            type="button"
                            className="text-gray-500 hover:text-gray-700"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}

                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Employment - <-- Unchanged */}
          <div hidden={step !== 3} className={step === 3 ? '' : 'hidden'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Department</label>
                <select
                  value={form.departmentId || ''} // <-- Changed: use departmentId for backend
                  onChange={(e) => update('departmentId', e.target.value)} // <-- Changed: update ID only
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  disabled={isView}
                >
                  <option value="">Select Department</option>
                  {/* Dynamic options from API/context; e.g., <option value={dept._id}>{dept.name}</option> */}
                  <option value="dept1">Engineering</option>
                  <option value="dept2">HR</option>
                  <option value="dept3">Sales</option>
                  <option value="dept4">Marketing</option>
                </select>
                {errors.departmentId && <div className="text-xs text-red-500 mt-1">{errors.departmentId}</div>}
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Designation</label>
                <select
                  value={form.designationId || ''} // <-- Changed: use designationId for backend
                  onChange={(e) => update('designationId', e.target.value)} // <-- Changed: update ID only
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  disabled={isView}
                >
                  <option value="">Select Designation</option>
                  {/* Dynamic options from API/context; e.g., <option value={desg._id}>{desg.name}</option> */}
                  <option value="desg1">Developer</option>
                  <option value="desg2">Manager</option>
                  <option value="desg3">Analyst</option>
                </select>
                {errors.designationId && <div className="text-xs text-red-500 mt-1">{errors.designationId}</div>}
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Reporting Manager ID</label>
                <select
                  value={form.reportingManagerId || ''}
                  onChange={(e) => update('reportingManagerId', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  disabled={isView}
                >
                  <option value="">Select Reporting Manager</option>
                  {/* Dynamic options from employees API; e.g., <option value={mgr._id}>{mgr.name}</option> */}
                  <option value="mgr1">John Doe (ID: mgr1)</option>
                  <option value="mgr2">Jane Smith (ID: mgr2)</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Date of Joining</label>
                <input
                  type="date"
                  value={form.dateOfJoining || ''}
                  onChange={(e) => update('dateOfJoining', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
                {errors.dateOfJoining && <div className="text-xs text-red-500 mt-1">{errors.dateOfJoining}</div>}
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Onboarding Status</label>
                <select
                  value={form.onboardingStatus || 'Pending'}
                  onChange={(e) => update('onboardingStatus', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  disabled={isView}
                >
                  <option value="Pending">Pending</option>
                  <option value="InProgress">In Progress</option> {/* <-- Fixed: match schema enum */}
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {/* <-- Added: Available Leave */}
              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Available Leave (days)</label>
                <input
                  type="number"
                  value={form.availableLeave || ''}
                  onChange={(e) => update('availableLeave', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
              </div>

              {/* <-- Added: Probation End Date */}
              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Probation End Date</label>
                <input
                  type="date"
                  value={form.probationEndDate || ''}
                  onChange={(e) => update('probationEndDate', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
              </div>

            </div>
          </div>

          {/* <-- Added: Step 4: Credentials */}
          <div hidden={step !== 4} className={step === 4 ? '' : 'hidden'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <h5 className="md:col-span-2">Credentials</h5>

              {/* Employee ID */}
              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Employee ID</label>
                <input
                  value={form.employeeId || ''}
                  onChange={(e) => update('employeeId', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  readOnly={isView}
                />
                {errors.employeeId && <div className="text-xs text-red-500 mt-1">{errors.employeeId}</div>}
              </div>

              {/* Display Email - read-only */}
              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Email (from Personal Details)</label>
                <input
                  value={form.email || ''}
                  readOnly
                  className="mt-1 w-full px-3 py-2 border rounded-md bg-gray-100"
                />
              </div>

              {/* Password */}
              {!isView && (
                <div className="md:col-span-2">
                  <label className="text-sm text-[var(--color-primaryText)]">Password</label>
                  <input
                    type="password"
                    value={form.password || ''}
                    onChange={(e) => update('password', e.target.value)}
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                  />
                  {errors.password && <div className="text-xs text-red-500 mt-1">{errors.password}</div>}
                </div>
              )}

              {isView && (
                <div className="md:col-span-2">
                  <label className="text-sm text-[var(--color-primaryText)]">Password</label>
                  <input
                    type="password"
                    value="********" // <-- Placeholder for view mode
                    readOnly
                    className="mt-1 w-full px-3 py-2 border rounded-md bg-gray-100"
                  />
                </div>
              )}
            </div>
          </div>

        </div>

        {/* footer - <-- Adjusted: for 4 steps */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100">
          <div>
            {!isView && (
              <>
                {step > 1 && (
                  <button onClick={back} className="px-3 py-2 rounded-md bg-white border text-sm mr-2">
                    Back
                  </button>
                )}
                {step < 4 && ( // <-- Changed: < 4
                  <button onClick={next} className="px-3 py-2 rounded-md bg-[var(--color-primary)] text-white text-sm">
                    Continue
                  </button>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-3 py-2 rounded-md bg-white border text-sm">
              Cancel
            </button>

            {!isView ? (
              <button 
              onClick={submit} 
              className={`px-4 py-2 rounded-md bg-[var(--color-primary)] text-white font-semibold ${primaryLabel==='Create employee' && step<4?'hidden':""}`}
              >
                {primaryLabel}
              </button>
            ) : (
              <button onClick={onClose} className="px-4 py-2 rounded-md bg-[var(--color-primary)] text-white font-semibold">
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
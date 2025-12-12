'use client';

import axios from 'axios';
import React, { useEffect, useCallback, useRef, useState } from 'react';
import Image from "next/image";

export default function AddEditEmployeeModal({ mode = 'add', employee = null, onClose, onSave }) {
  const modalRef = useRef(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [existingEmployees, setExistingEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageHovered, setImageHovered] = useState(false);

  const empty = {
    employeeId: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    imageUrl: '',
    mobileNumber: '',
    alternateMobileNumber: '',
    gender: '',
    about: '',
    maritalStatus: '',
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
    emergencyContacts: [
      {
        name: '',
        relationship: '',
        phone: '',
        email: ''
      }
    ],
    departmentId: '',
    designationId: '',
    reportingManagerId: '',
    dateOfJoining: '',
    employmentType: '',
    employmentStatus: '',
    availableLeave: '',
    sourceOfHire: '',
    workingShiftId: '',
    onboardingStatus: '',
    probationEndDate: '',
    userRole: [],
    skills: [],
    skillInput: '',
    password: '',
  };

  function formatDateForInput(dateString) {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch (error) {
      return '';
    }
  }

  const [form, setForm] = useState(() => {
    if (employee && mode === 'edit') {
      const imageUrl = employee.photo || employee.imageUrl || '';
      // Set initial image preview
      if (imageUrl) {
        setImagePreview(imageUrl);
      }
      return {
        ...empty,
        employeeId: employee.employeeId || '',
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        dateOfBirth: formatDateForInput(employee.dateOfBirth),
        email: employee.email || '',
        imageUrl: imageUrl,
        mobileNumber: String(employee.mobileNumber || ''),
        alternateMobileNumber: String(employee.alternateMobileNumber || ''),
        gender: employee.gender || '',
        about: employee.aboutMe || employee.about || '',
        maritalStatus: employee.maritalStatus || '',
        address: [
          {
            addresstype: 'Current',
            addressLine: employee.address?.[0]?.addressLine || employee.presentAddress?.addressLine || '',
            locality: employee.address?.[0]?.locality || employee.presentAddress?.locality || '',
            city: employee.address?.[0]?.city || employee.presentAddress?.city || '',
            state: employee.address?.[0]?.state || employee.presentAddress?.state || '',
            postalCode: employee.address?.[0]?.postalCode || employee.presentAddress?.postalCode || '',
            country: employee.address?.[0]?.country || employee.presentAddress?.country || '',
          },
          {
            addresstype: 'Permanent',
            addressLine: employee.address?.[1]?.addressLine || employee.permanentAddress?.addressLine || '',
            locality: employee.address?.[1]?.locality || employee.permanentAddress?.locality || '',
            city: employee.address?.[1]?.city || employee.permanentAddress?.city || '',
            state: employee.address?.[1]?.state || employee.permanentAddress?.state || '',
            postalCode: employee.address?.[1]?.postalCode || employee.permanentAddress?.postalCode || '',
            country: employee.address?.[1]?.country || employee.permanentAddress?.country || '',
          }
        ],
        emergencyContacts: employee.emergencyContacts?.length > 0 
          ? employee.emergencyContacts.map(contact => ({
              name: contact.name || '',
              relationship: contact.relationship || '',
              phone: String(contact.phone || ''),
              email: contact.email || ''
            }))
          : empty.emergencyContacts,
        departmentId: typeof employee.departmentId === 'object' 
          ? employee.departmentId._id 
          : employee.departmentId || '',
        designationId: typeof employee.designationId === 'object' 
          ? employee.designationId._id 
          : employee.designationId || '',
        reportingManagerId: typeof employee.reportingManagerId === 'object'
          ? employee.reportingManagerId._id
          : employee.reportingManagerId || '',
        dateOfJoining: formatDateForInput(employee.dateOfJoining),
        employmentType: employee.employmentType || '',
        employmentStatus: employee.employmentStatus || '',
        availableLeave: employee.availableLeave?.toString() || '',
        sourceOfHire: employee.sourceOfHire || '',
        workingShiftId: typeof employee.workingShiftId === 'object'
          ? employee.workingShiftId._id
          : employee.workingShiftId || '',
        onboardingStatus: employee.onboardingStatus || '',
        probationEndDate: formatDateForInput(employee.probationEndDate),
        userRole: employee.userRole || [],
        skills: employee.skills || [],
        skillInput: '',
        password: '',
      };
    }
    return { ...empty };
  });

  const [errors, setErrors] = useState({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [departmentRes, employeeRes, designationRes] = await Promise.all([
        axios.get("/hrms/organization/get-allDepartment"),
        axios.get("/hrms/employee/list"),
        axios.get("/hrms/organization/get-alldesignation"),
      ]);

      setDepartments(departmentRes?.data?.result || []);
      setExistingEmployees(employeeRes?.data?.result || []);
      setDesignations(designationRes?.data?.result || []);
    } catch (err) {
      console.error("Failed to load dropdown data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (employee && mode === 'edit') {
      const imageUrl = employee.photo || employee.imageUrl || '';
      setImagePreview(imageUrl);
      setForm({
        ...empty,
        employeeId: employee.employeeId || '',
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        dateOfBirth: formatDateForInput(employee.dateOfBirth),
        email: employee.email || '',
        imageUrl: imageUrl,
        mobileNumber: String(employee.mobileNumber || ''),
        alternateMobileNumber: String(employee.alternateMobileNumber || ''),
        gender: employee.gender || '',
        about: employee.aboutMe || employee.about || '',
        maritalStatus: employee.maritalStatus || '',
        address: [
          {
            addresstype: 'Current',
            addressLine: employee.address?.[0]?.addressLine || employee.presentAddress?.addressLine || '',
            locality: employee.address?.[0]?.locality || employee.presentAddress?.locality || '',
            city: employee.address?.[0]?.city || employee.presentAddress?.city || '',
            state: employee.address?.[0]?.state || employee.presentAddress?.state || '',
            postalCode: employee.address?.[0]?.postalCode || employee.presentAddress?.postalCode || '',
            country: employee.address?.[0]?.country || employee.presentAddress?.country || '',
          },
          {
            addresstype: 'Permanent',
            addressLine: employee.address?.[1]?.addressLine || employee.permanentAddress?.addressLine || '',
            locality: employee.address?.[1]?.locality || employee.permanentAddress?.locality || '',
            city: employee.address?.[1]?.city || employee.permanentAddress?.city || '',
            state: employee.address?.[1]?.state || employee.permanentAddress?.state || '',
            postalCode: employee.address?.[1]?.postalCode || employee.permanentAddress?.postalCode || '',
            country: employee.address?.[1]?.country || employee.permanentAddress?.country || '',
          }
        ],
        emergencyContacts: employee.emergencyContacts?.length > 0 
          ? employee.emergencyContacts.map(contact => ({
              name: contact.name || '',
              relationship: contact.relationship || '',
              phone: String(contact.phone || ''),
              email: contact.email || ''
            }))
          : empty.emergencyContacts,
        departmentId: typeof employee.departmentId === 'object' 
          ? employee.departmentId._id 
          : employee.departmentId || '',
        designationId: typeof employee.designationId === 'object' 
          ? employee.designationId._id 
          : employee.designationId || '',
        reportingManagerId: typeof employee.reportingManagerId === 'object'
          ? employee.reportingManagerId._id
          : employee.reportingManagerId || '',
        dateOfJoining: formatDateForInput(employee.dateOfJoining),
        employmentType: employee.employmentType || '',
        employmentStatus: employee.employmentStatus || '',
        availableLeave: employee.availableLeave?.toString() || '',
        sourceOfHire: employee.sourceOfHire || '',
        workingShiftId: typeof employee.workingShiftId === 'object'
          ? employee.workingShiftId._id
          : employee.workingShiftId || '',
        onboardingStatus: employee.onboardingStatus || '',
        probationEndDate: formatDateForInput(employee.probationEndDate),
        userRole: employee.userRole || [],
        skills: employee.skills || [],
        skillInput: '',
        password: '',
      });
    } else {
      setForm({ ...empty, skillInput: '' });
      setImagePreview(null);
    }
    setStep(1);
    setErrors({});
  }, [employee, mode]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    function handleClick(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  function update(field, value) {
    setForm((s) => ({ ...s, [field]: value }));
    if (errors[field]) {
      setErrors((e) => {
        const newErrors = { ...e };
        delete newErrors[field];
        return newErrors;
      });
    }
  }

  function updateAddressField(idx, field, value) {
    setForm(prev => {
      const newAddress = [...prev.address];
      newAddress[idx] = { ...newAddress[idx], [field]: value };
      return { ...prev, address: newAddress };
    });
    const errorKey = `address[${idx}].${field}`;
    if (errors[errorKey]) {
      setErrors((e) => {
        const newErrors = { ...e };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  }

  function updateEmergencyContactField(idx, field, value) {
    setForm(prev => {
      const newContacts = [...prev.emergencyContacts];
      newContacts[idx] = { ...newContacts[idx], [field]: value };
      return { ...prev, emergencyContacts: newContacts };
    });
    const errorKey = `emergencyContacts[${idx}].${field}`;
    if (errors[errorKey]) {
      setErrors((e) => {
        const newErrors = { ...e };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  }

  const handleImageChange = async (e) => {
    const imageFile = e.target.files[0];
    if (!imageFile) return;

    const formData = new FormData();
    formData.append('imageFile', imageFile);
    try {
      const { data } = await axios.post('/user/aws-image', formData);
      console.log("Image upload response:", data.result.imageUrls[0]);
      if (data?.result?.imageUrls) {
        const newImageUrl = data.result.imageUrls[0];
        update('imageUrl', newImageUrl);
        setImagePreview(newImageUrl);
      }
    } catch (err) {
      console.error("error while changing employee photo", err);
      setErrors(prev => ({ ...prev, imageUrl: 'Failed to upload image' }));
    }
  };

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function isValidPhone(phone) {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  function isValidURL(url) {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  function validateStep(currentStep = step) {
    const e = {};
    
    if (currentStep === 1) {
      if (!form.firstName?.trim()) e.firstName = 'First name is required';
      if (!form.lastName?.trim()) e.lastName = 'Last name is required';
      
      if (!form.email?.trim()) {
        e.email = 'Email is required';
      } else if (!isValidEmail(form.email)) {
        e.email = 'Please enter a valid email address';
      }
      
      if (!form.dateOfBirth) {
        e.dateOfBirth = 'Date of birth is required';
      } else {
        const dob = new Date(form.dateOfBirth);
        const today = new Date();
        
        if (dob > today) {
          e.dateOfBirth = 'Date of birth cannot be in the future';
        } else {
          const age = today.getFullYear() - dob.getFullYear();
          const monthDiff = today.getMonth() - dob.getMonth();
          const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()) 
            ? age - 1 
            : age;
          
          if (actualAge < 18) {
            e.dateOfBirth = 'Employee must be at least 18 years old';
          }
        }
      }
      
      if (!form.gender) e.gender = 'Gender is required';
      if (!form.maritalStatus) e.maritalStatus = 'Marital status is required';
      
      if (!form.mobileNumber?.trim()) {
        e.mobileNumber = 'Mobile number is required';
      } else if (!isValidPhone(form.mobileNumber)) {
        e.mobileNumber = 'Please enter a valid phone number (e.g., +1234567890 or 1234567890)';
      }
      
      if (form.alternateMobileNumber && !isValidPhone(form.alternateMobileNumber)) {
        e.alternateMobileNumber = 'Please enter a valid phone number (e.g., +1234567890 or 1234567890)';
      }

      if (form.imageUrl && !isValidURL(form.imageUrl)) {
        e.imageUrl = 'Please enter a valid URL';
      }

      if (!form.address[0]?.addressLine?.trim()) e['address[0].addressLine'] = 'Address line is required';
      if (!form.address[0]?.locality?.trim()) e['address[0].locality'] = 'Locality is required';
      if (!form.address[0]?.city?.trim()) e['address[0].city'] = 'City is required';
      if (!form.address[0]?.state?.trim()) e['address[0].state'] = 'State is required';
      if (!form.address[0]?.postalCode?.trim()) e['address[0].postalCode'] = 'Postal code is required';
      if (!form.address[0]?.country?.trim()) e['address[0].country'] = 'Country is required';

      if (!form.address[1]?.addressLine?.trim()) e['address[1].addressLine'] = 'Address line is required';
      if (!form.address[1]?.locality?.trim()) e['address[1].locality'] = 'Locality is required';
      if (!form.address[1]?.city?.trim()) e['address[1].city'] = 'City is required';
      if (!form.address[1]?.state?.trim()) e['address[1].state'] = 'State is required';
      if (!form.address[1]?.postalCode?.trim()) e['address[1].postalCode'] = 'Postal code is required';
      if (!form.address[1]?.country?.trim()) e['address[1].country'] = 'Country is required';

      if (!form.emergencyContacts[0]?.name?.trim()) e['emergencyContacts[0].name'] = 'Emergency contact name is required';
      if (!form.emergencyContacts[0]?.relationship?.trim()) e['emergencyContacts[0].relationship'] = 'Relationship is required';
      
      if (!form.emergencyContacts[0]?.phone?.trim()) {
        e['emergencyContacts[0].phone'] = 'Emergency contact phone is required';
      } else if (!isValidPhone(form.emergencyContacts[0].phone)) {
        e['emergencyContacts[0].phone'] = 'Please enter a valid phone number';
      }

      if (form.emergencyContacts[0]?.email && !isValidEmail(form.emergencyContacts[0].email)) {
        e['emergencyContacts[0].email'] = 'Please enter a valid email address';
      }
    }
    
    if (currentStep === 2) {
      if (!form.userRole || form.userRole.length === 0) e.userRole = 'User role is required';
      if (!form.employmentType) e.employmentType = 'Employment type is required';
      if (!form.employmentStatus) e.employmentStatus = 'Employment status is required';
    }
    
    if (currentStep === 3) {
      if (!form.departmentId) e.departmentId = 'Department is required';
      if (!form.designationId) e.designationId = 'Designation is required';
      
      if (!form.dateOfJoining) {
        e.dateOfJoining = 'Date of joining is required';
      } else if (form.dateOfBirth) {
        const doj = new Date(form.dateOfJoining);
        const dob = new Date(form.dateOfBirth);
        if (doj < dob) {
          e.dateOfJoining = 'Date of joining cannot be before date of birth';
        }
      }

      if (form.availableLeave && (isNaN(form.availableLeave) || parseInt(form.availableLeave) < 0)) {
        e.availableLeave = 'Available leave must be a positive number';
      }

      if (form.probationEndDate && form.dateOfJoining) {
        const probEnd = new Date(form.probationEndDate);
        const doj = new Date(form.dateOfJoining);
        if (probEnd < doj) {
          e.probationEndDate = 'Probation end date must be after date of joining';
        }
      }
    }
    
    if (currentStep === 4) {
      if (!form.employeeId?.trim()) e.employeeId = 'Employee ID is required';
      
      if (mode === 'add') {
        if (!form.password?.trim()) {
          e.password = 'Password is required';
        } else if (form.password.length < 8) {
          e.password = 'Password must be at least 8 characters long';
        }
      }
    }
    
    return e;
  }

  function next() {
    const stepErrors = validateStep(step);
    setErrors(stepErrors);
    
    if (Object.keys(stepErrors).length === 0) {
      setStep((s) => Math.min(4, s + 1));
    }
  }

  function back() {
    setStep((s) => Math.max(1, s - 1));
  }

  async function submit() {
    // Validate all steps
    const allErrors = {};
    
    for (let i = 1; i <= 4; i++) {
      const stepErrors = validateStep(i);
      Object.assign(allErrors, stepErrors);
    }
    
    // Set all errors
    setErrors(allErrors);
    
    // If there are errors, navigate to the first step with errors
    if (Object.keys(allErrors).length > 0) {
      const step1Errors = validateStep(1);
      const step2Errors = validateStep(2);
      const step3Errors = validateStep(3);
      const step4Errors = validateStep(4);
      
      if (Object.keys(step1Errors).length > 0) {
        setStep(1);
      } else if (Object.keys(step2Errors).length > 0) {
        setStep(2);
      } else if (Object.keys(step3Errors).length > 0) {
        setStep(3);
      } else if (Object.keys(step4Errors).length > 0) {
        setStep(4);
      }
      return;
    }

    setSubmitting(true);

    const submitData = {
      employeeId: form.employeeId,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      photo: form.imageUrl,
      dateOfBirth: form.dateOfBirth,
      gender: form.gender,
      maritalStatus: form.maritalStatus,
      aboutMe: form.about,
      mobileNumber: String(form.mobileNumber || ''),
      alternateMobileNumber: String(form.alternateMobileNumber || ''),
      presentAddress: {
        addressLine: form.address[0].addressLine,
        locality: form.address[0].locality,
        city: form.address[0].city,
        state: form.address[0].state,
        postalCode: form.address[0].postalCode,
        country: form.address[0].country,
      },
      permanentAddress: {
        addressLine: form.address[1].addressLine,
        locality: form.address[1].locality,
        city: form.address[1].city,
        state: form.address[1].state,
        postalCode: form.address[1].postalCode,
        country: form.address[1].country,
      },
      userRole: form.userRole,
      skills: form.skills,
      sourceOfHire: form.sourceOfHire,
      employmentType: form.employmentType,
      employmentStatus: form.employmentStatus,
      departmentId: form.departmentId,
      designationId: form.designationId,
      reportingManagerId: form.reportingManagerId || '',
      dateOfJoining: form.dateOfJoining,
      onboardingStatus: form.onboardingStatus || 'Pending',
      availableLeave: form.availableLeave ? parseInt(form.availableLeave) : undefined,
      workingShiftId: form.workingShiftId || '',
      probationEndDate: form.probationEndDate || null,
      emergencyContacts: form.emergencyContacts.filter(ec => ec.name && ec.phone),
    };

    if (mode === 'add') {
      submitData.password = form.password;
    }

    try {
      console.log("Submitting data:", submitData);
      
      let res;
      if (mode === 'add') {
        res = await axios.post('/hrms/employee/add-employee', submitData);
        console.log("Add response:", res.data);
      } else if (mode === 'edit') {
        const empId = employee._id || employee.id;
        res = await axios.put(`/hrms/employee/update-employee/${empId}`, submitData);
        console.log("Update response:", res.data);
      }

      onSave && onSave(res.data.data || res.data.result);
      onClose && onClose();
    } catch (error) {
      console.error("Failed to save employee:", error);
      
      // Handle API validation errors
      if (error.response?.data?.details) {
        const apiErrors = {};
        error.response.data.details.forEach(detail => {
          const field = detail.field;
          apiErrors[field] = detail.message;
        });
        setErrors(apiErrors);
        
        // Navigate to the step with errors
        if (apiErrors.employeeId || apiErrors.password) {
          setStep(4);
        } else if (apiErrors.departmentId || apiErrors.designationId || apiErrors.dateOfJoining || apiErrors.probationEndDate || apiErrors.availableLeave || apiErrors.reportingManagerId) {
          setStep(3);
        } else if (apiErrors.userRole || apiErrors.employmentType || apiErrors.employmentStatus) {
          setStep(2);
        } else {
          setStep(1);
        }
      } else {
        const errorMessage = error.response?.data?.message || `Failed to ${mode === 'add' ? 'add' : 'update'} employee. Please try again.`;
        setErrors({ submit: errorMessage });
      }
    } finally {
      setSubmitting(false);
    }
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
      removeSkill(form.skills.length - 1);
    }
  }

  function handleNumberInput(e, field) {
    const value = e.target.value;
    if (field === 'mobileNumber' || field === 'alternateMobileNumber') {
      if (/^[\+]?[0-9]*$/.test(value)) {
        update(field, value);
      }
    } else if (field === 'availableLeave') {
      if (/^[0-9]*$/.test(value)) {
        update(field, value);
      }
    }
  }

  function handleEmergencyPhoneInput(e, idx) {
    const value = e.target.value;
    if (/^[\+]?[0-9]*$/.test(value)) {
      updateEmergencyContactField(idx, 'phone', value);
    }
  }

  const isView = mode === 'view';
  const isEdit = mode === 'edit';
  const primaryLabel = isView ? 'Close' : isEdit ? 'Save changes' : 'Create employee';

  const errorMessages = Object.entries(errors)
    .filter(([key]) => key !== 'submit')
    .map(([key, value]) => value);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="relative bg-white rounded-2xl p-8 shadow-2xl">
          <div className="text-center">Loading form data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        ref={modalRef}
        className="relative w-[min(900px,95%)] h-[85vh] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-y-auto hide-scrollbar"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-blackText)]">
              {mode === 'add' ? 'Add Employee' : mode === 'edit' ? 'Edit Employee' : 'View Employee'}
            </h3>
            <div className="text-sm text-[var(--color-primaryText)] mt-1">Multi-step employee form</div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-500 hover:text-gray-700 p-2 rounded-md"
          >
            ✕
          </button>
        </div>

        {/* Stepper */}
        <div className="px-6 pt-4 pb-3 border-b border-gray-100 sticky top-[60px] bg-white z-10">
          <div className="flex items-center gap-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === s ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {s}
                </div>
                <div className="text-sm text-[var(--color-primaryText)]">
                  {s === 1 ? 'Personal' : s === 2 ? 'Job' : s === 3 ? 'Employment' : 'Credentials'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {(errorMessages.length > 0 || errors.submit) && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-red-800 mb-1">
                  {errors.submit ? 'Error' : 'Please fix the following errors:'}
                </h4>
                {errors.submit ? (
                  <p className="text-sm text-red-700">{errors.submit}</p>
                ) : (
                  <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                    {errorMessages.map((msg, idx) => (
                      <li key={idx}>{msg}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="p-6">
          {/* Step 1: Personal */}
          <div hidden={step !== 1}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <h5 className="md:col-span-2 font-semibold text-lg mb-2">Personal Details</h5>

              {/* Photo Upload - Full Width at Top */}
              <div className="md:col-span-2">
                <label className="text-sm text-[var(--color-primaryText)] block mb-2">Employee Photo</label>
                <div className="flex items-center justify-center">
                  <div
                    className="relative w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center cursor-pointer overflow-hidden"
                    onMouseEnter={() => !isView && setImageHovered(true)}
                    onMouseLeave={() => !isView && setImageHovered(false)}
                  >
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Employee photo"
                        fill
                        className="object-cover rounded-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-xs">No photo</span>
                      </div>
                    )}
                    {!isView && (
                      <div
                        className={`
                          absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg
                          transition-opacity duration-200 ease-in-out
                          ${imageHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                        `}
                      >
                        <label
                          htmlFor="image-upload"
                          className="bg-[var(--color-primary)] text-white px-4 py-2 rounded text-sm font-medium hover:bg-opacity-90 cursor-pointer"
                        >
                          {mode === 'edit' ? 'Edit' : 'Add'}
                        </label>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-[var(--color-primaryText)] text-center mt-2">
                  {mode === 'view' ? 'Employee photo' : 'Click to upload employee photo'}
                </p>
                {!isView && (
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                )}
                {errors.imageUrl && (
                  <p className="text-red-500 text-sm mt-1 text-center">{errors.imageUrl}</p>
                )}
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">First name <span className="text-red-500">*</span></label>
                <input
                  value={form.firstName || ''}
                  onChange={(e) => update('firstName', e.target.value)}
                  className={`mt-1 w-full px-3 py-2 border rounded-md ${errors.firstName ? 'border-red-500' : ''}`}
                  readOnly={isView}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Last name <span className="text-red-500">*</span></label>
                <input
                  value={form.lastName || ''}
                  onChange={(e) => update('lastName', e.target.value)}
                  className={`mt-1 w-full px-3 py-2 border rounded-md ${errors.lastName ? 'border-red-500' : ''}`}
                  readOnly={isView}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Email address <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={form.email || ''}
                  onChange={(e) => update('email', e.target.value)}
                  className={`mt-1 w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : ''}`}
                  readOnly={isView}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Date of Birth <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={form.dateOfBirth || ''}
                  onChange={(e) => update('dateOfBirth', e.target.value)}
                  className={`mt-1 w-full px-3 py-2 border rounded-md ${errors.dateOfBirth ? 'border-red-500' : ''}`}
                  readOnly={isView}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Gender <span className="text-red-500">*</span></label>
                <select
                  value={form.gender || ''}
                  onChange={(e) => update('gender', e.target.value)}
                  className={`mt-1 w-full px-3 py-2 border rounded-md ${errors.gender ? 'border-red-500' : ''}`}
                  disabled={isView}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Marital Status <span className="text-red-500">*</span></label>
                <select
                  value={form.maritalStatus || ''}
                  onChange={(e) => update('maritalStatus', e.target.value)}
                  className={`mt-1 w-full px-3 py-2 border rounded-md ${errors.maritalStatus ? 'border-red-500' : ''}`}
                  disabled={isView}
                >
                  <option value="">Select</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Mobile Number <span className="text-red-500">*</span></label>
                <input
                  value={form.mobileNumber || ''}
                  onChange={(e) => handleNumberInput(e, 'mobileNumber')}
                  className={`mt-1 w-full px-3 py-2 border rounded-md ${errors.mobileNumber ? 'border-red-500' : ''}`}
                  readOnly={isView}
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Alternate Mobile Number</label>
                <input
                  value={form.alternateMobileNumber || ''}
                  onChange={(e) => handleNumberInput(e, 'alternateMobileNumber')}
                  className={`mt-1 w-full px-3 py-2 border rounded-md ${errors.alternateMobileNumber ? 'border-red-500' : ''}`}
                  readOnly={isView}
                  placeholder="+1234567890"
                />
              </div>

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

              <h5 className="md:col-span-2 font-semibold text-lg mb-2 mt-4">Current Address Details</h5>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Address Line <span className="text-red-500">*</span></label>
                <input
                  value={form.address?.[0]?.addressLine || ''}
                  onChange={(e) => updateAddressField(0, 'addressLine', e.target.value)}
                  placeholder="Street address, etc."
                  className={`mt-1 w-full px-3 py-2 border rounded-md ${errors['address[0].addressLine'] ? 'border-red-500' : ''}`}
                  readOnly={isView}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Locality <span className="text-red-500">*</span></label>
                <input
                  value={form.address?.[0]?.locality || ''}
                  onChange={(e) => updateAddressField(0, 'locality', e.target.value)}
                  placeholder="Neighborhood or locality"
                  className={`mt-1 w-full px-3 py-2 border rounded-md ${errors['address[0].locality'] ? 'border-red-500' : ''}`}
                  readOnly={isView}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">City <span className="text-red-500">*</span></label>
                <input
                  value={form.address?.[0]?.city || ''}
                  onChange={(e) => updateAddressField(0, 'city', e.target.value)}
                  placeholder="City name"
                  className={`mt-1 w-full px-3 py-2 border rounded-md ${errors['address[0].city'] ? 'border-red-500' : ''}`}
                  readOnly={isView}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">State <span className="text-red-500">*</span></label>
                <input
                  value={form.address?.[0]?.state || ''}
                  onChange={(e) => updateAddressField(0, 'state', e.target.value)}
                  placeholder="State/Province"
                  className={`mt-1 w-full px-3 py-2 border rounded-md ${errors['address[0].state'] ? 'border-red-500' : ''}`}
                  readOnly={isView}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Postal Code <span className="text-red-500">*</span></label>
                <input
                  value={form.address?.[0]?.postalCode || ''}
                  onChange={(e) => updateAddressField(0, 'postalCode', e.target.value)}
                  placeholder="ZIP/Postal code"
                  className={`mt-1 w-full px-3 py-2 border rounded-md ${errors['address[0].postalCode'] ? 'border-red-500' : ''}`}
                  readOnly={isView}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Country <span className="text-red-500">*</span></label>
                <input
                  value={form.address?.[0]?.country || ''}
                  onChange={(e) => updateAddressField(0, 'country', e.target.value)}
                  placeholder="Country name"
                  className={`mt-1 w-full px-3 py-2 border rounded-md ${errors['address[0].country'] ? 'border-red-500' : ''}`}
                  readOnly={isView}
                />
              </div>

              <h5 className="md:col-span-2 font-semibold text-lg mb-2 mt-4">Permanent Address Details</h5>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Address Line <span className="text-red-500">*</span></label>
                <input
                  value={form.address?.[1]?.addressLine || ''}
                  onChange={(e) => updateAddressField(1, 'addressLine', e.target.value)}
                  placeholder="Street address, etc."
                  className={`mt-1 w-full px-3 py-2 border rounded-md ${errors['address[1].addressLine'] ? 'border-red-500' : ''}`}
                  readOnly={isView}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Locality <span className="text-red-500">*</span></label>
                <input
                  value={form.address?.[1]?.locality || ''}
                  onChange={(e) => updateAddressField(1, 'locality', e.target.value)}
                  placeholder="Neighborhood or locality"
                  className={`mt-1 w-full px-3 py-2 border rounded-md ${errors['address[1].locality'] ? 'border-red-500' : ''}`}
                  readOnly={isView}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">City <span className="text-red-500">*</span></label>
                <input
                  value={form.address?.[1]?.city || ''}
                  onChange={(e) => updateAddressField(1, 'city', e.target.value)}
                  placeholder="City name"
                  className={`mt-1 w-full px-3 py-2 border rounded-md ${errors['address[1].city'] ? 'border-red-500' : ''}`}
                  readOnly={isView}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">State <span className="text-red-500">*</span></label>
                <input
                  value={form.address?.[1]?.state || ''}
                  onChange={(e) => updateAddressField(1, 'state', e.target.value)}
                  placeholder="State/Province"
                  className={`mt-1 w-full px-3 py-2 border rounded-md ${errors['address[1].state'] ? 'border-red-500' : ''}`}
                  readOnly={isView}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Postal Code <span className="text-red-500">*</span></label>
                <input
                  value={form.address?.[1]?.postalCode || ''}
                  onChange={(e) => updateAddressField(1, 'postalCode', e.target.value)}
                  placeholder="ZIP/Postal code"
                  className={`mt-1 w-full px-3 py-2 border rounded-md ${errors['address[1].postalCode'] ? 'border-red-500' : ''}`}
                  readOnly={isView}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Country <span className="text-red-500">*</span></label>
                <input
                  value={form.address?.[1]?.country || ''}
                  onChange={(e) => updateAddressField(1, 'country', e.target.value)}
                  placeholder="Country name"
                  className={`mt-1 w-full px-3 py-2 border rounded-md ${errors['address[1].country'] ? 'border-red-500' : ''}`}
                  readOnly={isView}
                />
              </div>

              <h5 className="md:col-span-2 font-semibold text-lg mb-2 mt-4">Emergency Contact</h5>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Contact Name <span className="text-red-500">*</span></label>
                <input
                  value={form.emergencyContacts?.[0]?.name || ''}
                  onChange={(e) => updateEmergencyContactField(0, 'name', e.target.value)}
                  placeholder="Full name of contact"
                  className={`mt-1 w-full px-3 py-2 border rounded-md ${errors['emergencyContacts[0].name'] ? 'border-red-500' : ''}`}
                  readOnly={isView}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Relationship <span className="text-red-500">*</span></label>
                <select
                  value={form.emergencyContacts?.[0]?.relationship || ''}
                  onChange={(e) => updateEmergencyContactField(0, 'relationship', e.target.value)}
                  className={`mt-1 w-full px-3 py-2 border rounded-md ${errors['emergencyContacts[0].relationship'] ? 'border-red-500' : ''}`}
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

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Phone <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  value={form.emergencyContacts?.[0]?.phone || ''}
                  onChange={(e) => handleEmergencyPhoneInput(e, 0)}
                  placeholder="+1234567890"
                  className={`mt-1 w-full px-3 py-2 border rounded-md ${errors['emergencyContacts[0].phone'] ? 'border-red-500' : ''}`}
                  readOnly={isView}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Email</label>
                <input
                  type="email"
                  value={form.emergencyContacts?.[0]?.email || ''}
                  onChange={(e) => updateEmergencyContactField(0, 'email', e.target.value)}
                  placeholder="Emergency contact email"
                  className={`mt-1 w-full px-3 py-2 border rounded-md ${errors['emergencyContacts[0].email'] ? 'border-red-500' : ''}`}
                  readOnly={isView}
                />
              </div>
            </div>
          </div>

          {/* Step 2: Job */}
          <div hidden={step !== 2}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <h5 className="md:col-span-2 font-semibold text-lg mb-2">Job Details</h5>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">User Role <span className="text-red-500">*</span></label>
                <select
                  value={form.userRole?.[0] || ''}
                  onChange={(e) => update('userRole', [e.target.value])}
                  className={`mt-1 w-full px-3 py-2 border rounded-md ${errors.userRole ? 'border-red-500' : ''}`}
                  disabled={isView}
                >
                  <option value="">Select role</option>
                  <option value="Admin">Admin</option>
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                  <option value="HR">HR</option>
                </select>
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
                <label className="text-sm text-[var(--color-primaryText)]">Employment Type <span className="text-red-500">*</span></label>
                <select
                  value={form.employmentType || ''}
                  onChange={(e) => update('employmentType', e.target.value)}
                  className={`mt-1 w-full px-3 py-2 border rounded-md ${errors.employmentType ? 'border-red-500' : ''}`}
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
                <label className="text-sm text-[var(--color-primaryText)]">Employment Status <span className="text-red-500">*</span></label>
                <select
                  value={form.employmentStatus || ''}
                  onChange={(e) => update('employmentStatus', e.target.value)}
                  className={`mt-1 w-full px-3 py-2 border rounded-md ${errors.employmentStatus ? 'border-red-500' : ''}`}
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
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-[var(--color-primaryText)]">Skills (press Enter or comma to add)</label>
                <div className="mt-1">
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

          {/* Step 3: Employment */}
          <div hidden={step !== 3}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <h5 className="md:col-span-2 font-semibold text-lg mb-2">Employment Details</h5>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Department <span className="text-red-500">*</span></label>
                <select
                  value={form.departmentId || ''}
                  onChange={(e) => update('departmentId', e.target.value)}
                  className={`mt-1 w-full px-3 py-2 border rounded-md ${errors.departmentId ? 'border-red-500' : ''}`}
                  disabled={isView}
                >
                  <option value="">Select Department</option>
                  {departments?.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Designation <span className="text-red-500">*</span></label>
                <select
                  value={form.designationId || ''}
                  onChange={(e) => update('designationId', e.target.value)}
                  className={`mt-1 w-full px-3 py-2 border rounded-md ${errors.designationId ? 'border-red-500' : ''}`}
                  disabled={isView}
                >
                  <option value="">Select Designation</option>
                  {designations?.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Reporting Manager</label>
                <select
                  value={form.reportingManagerId || ''}
                  onChange={(e) => update('reportingManagerId', e.target.value)}
                  className={`mt-1 w-full px-3 py-2 border rounded-md ${errors.reportingManagerId ? 'border-red-500' : ''}`}
                  disabled={isView}
                >
                  <option value="">Select Reporting Manager</option>
                  {existingEmployees?.map((e) => (
                    <option key={e._id} value={e._id}>
                      {e.firstName} {e.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Date of Joining <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={form.dateOfJoining || ''}
                  onChange={(e) => update('dateOfJoining', e.target.value)}
                  className={`mt-1 w-full px-3 py-2 border rounded-md ${errors.dateOfJoining ? 'border-red-500' : ''}`}
                  readOnly={isView}
                />
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
                  <option value="InProgress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Available Leave (days)</label>
                <input
                  type="text"
                  value={form.availableLeave || ''}
                  onChange={(e) => handleNumberInput(e, 'availableLeave')}
                  className={`mt-1 w-full px-3 py-2 border rounded-md ${errors.availableLeave ? 'border-red-500' : ''}`}
                  readOnly={isView}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Probation End Date</label>
                <input
                  type="date"
                  value={form.probationEndDate || ''}
                  onChange={(e) => update('probationEndDate', e.target.value)}
                  className={`mt-1 w-full px-3 py-2 border rounded-md ${errors.probationEndDate ? 'border-red-500' : ''}`}
                  readOnly={isView}
                />
              </div>
            </div>
          </div>

          {/* Step 4: Credentials */}
          <div hidden={step !== 4}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <h5 className="md:col-span-2 font-semibold text-lg mb-2">Credentials</h5>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Employee ID <span className="text-red-500">*</span></label>
                <input
                  value={form.employeeId || ''}
                  onChange={(e) => update('employeeId', e.target.value)}
                  className={`mt-1 w-full px-3 py-2 border rounded-md ${errors.employeeId ? 'border-red-500' : ''}`}
                  readOnly={isView}
                />
                {errors.employeeId && (
                  <p className="text-red-500 text-sm mt-1">{errors.employeeId}</p>
                )}
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">Email (from Personal Details)</label>
                <input
                  value={form.email || ''}
                  readOnly
                  className="mt-1 w-full px-3 py-2 border rounded-md bg-gray-100"
                />
              </div>

              {!isView && mode === 'add' && (
                <div className="md:col-span-2">
                  <label className="text-sm text-[var(--color-primaryText)]">Password <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    value={form.password || ''}
                    onChange={(e) => update('password', e.target.value)}
                    className={`mt-1 w-full px-3 py-2 border rounded-md ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="Minimum 8 characters"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                  )}
                </div>
              )}

              {isView && (
                <div className="md:col-span-2">
                  <label className="text-sm text-[var(--color-primaryText)]">Password</label>
                  <input
                    type="password"
                    value="********"
                    readOnly
                    className="mt-1 w-full px-3 py-2 border rounded-md bg-gray-100"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100 sticky bottom-0 bg-white">
          <div>
            {!isView && (
              <>
                {step > 1 && (
                  <button
                    onClick={back}
                    className="px-3 py-2 rounded-md bg-white border text-sm mr-2"
                    disabled={submitting}
                  >
                    Back
                  </button>
                )}
                {step < 4 && (
                  <button
                    onClick={next}
                    className="px-3 py-2 rounded-md bg-[var(--color-primary)] text-white text-sm"
                    disabled={submitting}
                  >
                    Continue
                  </button>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-md bg-white border text-sm"
              disabled={submitting}
            >
              Cancel
            </button>

            {!isView ? (step==4 &&
              <button
                onClick={submit}
                disabled={submitting}
                className={`px-4 py-2 rounded-md bg-[var(--color-primary)] text-white font-semibold ${
                  submitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {submitting ? 'Saving...' : primaryLabel}
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
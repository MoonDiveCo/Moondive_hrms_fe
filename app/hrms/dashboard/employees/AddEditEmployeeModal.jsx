"use client";

import axios from "axios";
import React, { useEffect, useCallback, useRef, useState, use } from "react";
import Image from "next/image";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { toast } from "sonner";

export default function AddEditEmployeeModal({
  mode = "add",
  employee = null,
  onClose,
  onSave,
  organizationData,
  employeeList,
}) {
  const modalRef = useRef(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageHovered, setImageHovered] = useState(false);
  const [autoEmployee, setAutoEmployee] = useState(false);
  const [sameAsCurrentAddress, setSameAsCurrentAddress] = useState(false);
  const [expandedDocSections, setExpandedDocSections] = useState({});
  const [uploadedDocuments, setUploadedDocuments] = useState({
    idProofs: { aadhaar: null, pan: null, passportOrDL: null, presentAddressProof: null, permanentAddressProof: null },
    academicDocuments: { 
      tenth: { certificate: null, marksheet: null },
      twelth: { certificate: null, marksheet: null },
      graduation: { name: '', semester: '', certificate: null, marksheets: [] },
      postGraduation: { name: '', semester: '', certificate: null, marksheets: [] },
      nocFromCollege: null
    },
    employmentHistory: [],
    otherDocuments: [],
  });
  const [documentUploadingStates, setDocumentUploadingStates] = useState({});

  function handleSameAsCurrentAddress(checked) {
    setSameAsCurrentAddress(checked);
    if (checked) {
      setForm((prev) => {
        const newAddress = [...prev.address];
        newAddress[1] = {
          addresstype: "Permanent",
          addressLine: newAddress[0].addressLine,
          locality: newAddress[0].locality,
          city: newAddress[0].city,
          state: newAddress[0].state,
          postalCode: newAddress[0].postalCode,
          country: newAddress[0].country,
        };
        return { ...prev, address: newAddress };
      });

      // Clear any errors for permanent address fields
      setErrors((e) => {
        const newErrors = { ...e };
        delete newErrors["address[1].addressLine"];
        delete newErrors["address[1].locality"];
        delete newErrors["address[1].city"];
        delete newErrors["address[1].state"];
        delete newErrors["address[1].postalCode"];
        delete newErrors["address[1].country"];
        return newErrors;
      });
    }
  }

  const empty = {
    employeeId: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    email: "",
    imageUrl: "",
    mobileNumber: "",
    alternateMobileNumber: "",
    gender: "",
    about: "",
    maritalStatus: "",
    address: [
      {
        addresstype: "Current",
        addressLine: "",
        locality: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      },
      {
        addresstype: "Permanent",
        addressLine: "",
        locality: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      },
    ],
    emergencyContacts: [
      {
        name: "",
        relationship: "",
        phone: "",
        email: "",
      },
    ],
    departmentId: "",
    designationId: "",
    reportingManagerId: "",
    dateOfJoining: "",
    employmentType: "",
    employmentStatus: "",
    availableLeave: "",
    sourceOfHire: "",
    workingShiftId: "",
    onboardingStatus: "",
    probationEndDate: "",
    experienceLevel: "",
    userRole: [],
    skills: [],
    skillInput: "",
    password: "",
  };

  function formatDateForInput(dateString) {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split("T")[0];
    } catch (error) {
      return "";
    }
  }

    const [form, setForm] = useState(() => {
    if (employee && mode === 'edit') {
      const imageUrl = employee.photo || employee.imageUrl || '';
     
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
        // Fix: Add null checks before accessing _id
        departmentId: (employee.departmentId && typeof employee.departmentId === 'object')
          ? employee.departmentId._id
          : employee.departmentId || '',
        designationId: (employee.designationId && typeof employee.designationId === 'object')
          ? employee.designationId._id
          : employee.designationId || '',
        reportingManagerId: (employee.reportingManagerId && typeof employee.reportingManagerId === 'object')
          ? employee.reportingManagerId._id
          : employee.reportingManagerId || '',
        dateOfJoining: formatDateForInput(employee.dateOfJoining),
        employmentType: employee.employmentType || '',
        employmentStatus: employee.employmentStatus || '',
        availableLeave: employee.availableLeave?.toString() || '',
        sourceOfHire: employee.sourceOfHire || '',
        workingShiftId: (employee.workingShiftId && typeof employee.workingShiftId === 'object')
          ? employee.workingShiftId._id
          : employee.workingShiftId || '',
        onboardingStatus: employee.onboardingStatus || '',
        probationEndDate: formatDateForInput(employee.probationEndDate),
        experienceLevel: employee.experienceLevel || '',
        userRole: employee.userRole || [],
        skills: employee.skills || [],
        skillInput: '',
        password: '',
      };
    }
    return { ...empty };
  });
 

  const [errors, setErrors] = useState({});

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
        // Add null checks here too
        departmentId: (employee.departmentId && typeof employee.departmentId === 'object')
          ? employee.departmentId._id
          : employee.departmentId || '',
        designationId: (employee.designationId && typeof employee.designationId === 'object')
          ? employee.designationId._id
          : employee.designationId || '',
        reportingManagerId: (employee.reportingManagerId && typeof employee.reportingManagerId === 'object')
          ? employee.reportingManagerId._id
          : employee.reportingManagerId || '',
        dateOfJoining: formatDateForInput(employee.dateOfJoining),
        employmentType: employee.employmentType || '',
        employmentStatus: employee.employmentStatus || '',
        availableLeave: employee.availableLeave?.toString() || '',
        sourceOfHire: employee.sourceOfHire || '',
        workingShiftId: (employee.workingShiftId && typeof employee.workingShiftId === 'object')
          ? employee.workingShiftId._id
          : employee.workingShiftId || '',
        onboardingStatus: employee.onboardingStatus || '',
        probationEndDate: formatDateForInput(employee.probationEndDate),
        experienceLevel: employee.experienceLevel || '',
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
    if (employee && mode === 'edit' && employee._id) {
      const loadDocuments = async () => {
        try {
          const { data } = await axios.get(`/user/get-personal-details/${employee._id}`);
          
          if (data?.result) {
            const personalDetails = data.result;
            
            if (personalDetails.academicDocuments?.graduation?.marksheets && !Array.isArray(personalDetails.academicDocuments.graduation.marksheets)) {
              personalDetails.academicDocuments.graduation.marksheets = [];
            }
            if (personalDetails.academicDocuments?.postGraduation?.marksheets && !Array.isArray(personalDetails.academicDocuments.postGraduation.marksheets)) {
              personalDetails.academicDocuments.postGraduation.marksheets = [];
            }
            if (!Array.isArray(personalDetails.employmentHistory)) {
              personalDetails.employmentHistory = [];
            }
            
            if (personalDetails.employmentHistory && Array.isArray(personalDetails.employmentHistory)) {
              personalDetails.employmentHistory = personalDetails.employmentHistory.map(emp => ({
                ...emp,
                offerLetter: Array.isArray(emp.offerLetter) ? emp.offerLetter : (emp.offerLetter ? [emp.offerLetter] : []),
                experienceLetter: Array.isArray(emp.experienceLetter) ? emp.experienceLetter : (emp.experienceLetter ? [emp.experienceLetter] : []),
                salarySlips: Array.isArray(emp.salarySlips) ? emp.salarySlips : (emp.salarySlips ? [emp.salarySlips] : []),
                others: Array.isArray(emp.others) ? emp.others : (emp.others ? [emp.others] : [])
              }));
            }
            
            setUploadedDocuments({
              idProofs: personalDetails.idProofs || { aadhaar: null, pan: null, passportOrDL: null, presentAddressProof: null, permanentAddressProof: null },
              academicDocuments: personalDetails.academicDocuments || { 
                tenth: { certificate: null, marksheet: null },
                twelth: { certificate: null, marksheet: null },
                graduation: { name: '', semester: '', certificate: null, marksheets: [] },
                postGraduation: { name: '', semester: '', certificate: null, marksheets: [] },
                nocFromCollege: null
              },
              employmentHistory: personalDetails.employmentHistory || [],
              otherDocuments: personalDetails.otherDocuments || [],
            });
          }
        } catch (err) {
          console.error("Failed to load documents:", err);
        }
      };
      
      loadDocuments();
    } else {
      setUploadedDocuments({
        idProofs: { aadhaar: null, pan: null, passportOrDL: null, presentAddressProof: null, permanentAddressProof: null },
        academicDocuments: { 
          tenth: { certificate: null, marksheet: null },
          twelth: { certificate: null, marksheet: null },
          graduation: { name: '', semester: '', certificate: null, marksheets: [] },
          postGraduation: { name: '', semester: '', certificate: null, marksheets: [] },
          nocFromCollege: null
        },
        employmentHistory: [],
        otherDocuments: [],
      });
    }
  }, [employee, mode]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    function handleClick(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  useEffect(() => {
    if (organizationData) {
      setLoading(false);
    }
  }, [organizationData]);

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
    if (field === "postalCode") {
      if (!/^[0-9]*$/.test(value)) {
        return;
      }
    }
    setForm((prev) => {
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
    setForm((prev) => {
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
    formData.append("imageFile", imageFile);
    try {
      const { data } = await axios.post("/user/aws-image", formData);
      toast.success("Image Uploaded successfully")
      if (data?.result?.imageUrls) {
        const newImageUrl = data.result.imageUrls[0];
        update("imageUrl", newImageUrl);
        setImagePreview(newImageUrl);
      }
    } catch (err) {
      toast.error("Error While Adding Employee Photo");
      setErrors((prev) => ({ ...prev, imageUrl: "Failed to upload image" }));
    }
  };

  const handleDocumentUpload = async (e, docPath) => {
    const file = e.target.files[0];
    if (!file) return;

    setDocumentUploadingStates((prev) => ({ ...prev, [docPath]: true }));

    const formData = new FormData();
    formData.append("files", file);
    
    try {
      const { data } = await axios.post("/user/add-pdf", formData);
      
      if (data?.result?.pdfUrls && data.result.pdfUrls.length > 0) {
        const pdf = data.result.pdfUrls[0];
        
        setUploadedDocuments((prev) => {
          const updated = JSON.parse(JSON.stringify(prev));
          
          const arrayMatch = docPath.match(/\[(\d+)\]/);
          if (arrayMatch) {
            const index = parseInt(arrayMatch[1]);
            const pathWithoutIndex = docPath.replace(/\[\d+\]/, '');
            const keys = pathWithoutIndex.split(".");
            
            let obj = updated;
            for (let i = 0; i < keys.length - 1; i++) {
              if (keys[i] === 'employmentHistory') {
                obj = obj[keys[i]][index];
              } else {
                obj = obj[keys[i]];
              }
            }
            
            const lastKey = keys[keys.length - 1];
            if (Array.isArray(obj[lastKey])) {
              obj[lastKey].push({ url: pdf.url, key: pdf.key, fileName: file.name, uploadedAt: new Date() });
            } else {
              obj[lastKey] = { url: pdf.url, key: pdf.key, fileName: file.name, uploadedAt: new Date() };
            }
          } else {
            const keys = docPath.split(".");
            let obj = updated;
            
            for (let i = 0; i < keys.length - 1; i++) {
              if (!obj[keys[i]] || typeof obj[keys[i]] !== 'object') {
                obj[keys[i]] = {};
              }
              obj = obj[keys[i]];
            }
            
            const lastKey = keys[keys.length - 1];
            if (Array.isArray(obj[lastKey])) {
              obj[lastKey].push({ url: pdf.url, key: pdf.key, fileName: file.name, uploadedAt: new Date() });
            } else {
              obj[lastKey] = { url: pdf.url, key: pdf.key, fileName: file.name, uploadedAt: new Date() };
            }
          }
          
          return updated;
        });
        
        toast.success("Document uploaded successfully");
      }
    } catch (err) {
      toast.error("Failed to upload document");
      console.error("PDF upload error:", err);
    } finally {
      setDocumentUploadingStates((prev) => ({ ...prev, [docPath]: false }));
    }
  };

  const handleRemoveDocument = async (docPath, index) => {
    setDocumentUploadingStates((prev) => ({ ...prev, [docPath]: true }));

    try {
      let document = null;
      
      const arrayIndexMatch = docPath.match(/(\w+)\[(\d+)\]\.(\w+)/);
      if (arrayIndexMatch) {
        const [, arrayName, arrayIndex, fieldName] = arrayIndexMatch;
        const arrayIdx = parseInt(arrayIndex);
        const docs = uploadedDocuments[arrayName]?.[arrayIdx]?.[fieldName];
        if (index !== undefined && Array.isArray(docs)) {
          document = docs[index];
        } else if (docs && !Array.isArray(docs)) {
          document = docs;
        }
      } else {
        const keys = docPath.split(".");
        let obj = uploadedDocuments;
        
        for (let i = 0; i < keys.length; i++) {
          obj = obj[keys[i]];
          if (!obj) break;
        }
        
        if (index !== undefined && Array.isArray(obj)) {
          document = obj[index];
        } else if (obj && !Array.isArray(obj)) {
          document = obj;
        }
      }
      
      if (document?.key) {
        try {
          await axios.post("/user/remove-pdf", { key: document.key });
        } catch (backendErr) {
          console.warn("Backend PDF removal failed, removing from frontend:", backendErr);
        }
      }

      setUploadedDocuments((prev) => {
        const updated = JSON.parse(JSON.stringify(prev));
        
        const arrayIndexMatch = docPath.match(/(\w+)\[(\d+)\]\.(\w+)/);
        if (arrayIndexMatch) {
          const [, arrayName, arrayIndex, fieldName] = arrayIndexMatch;
          const arrayIdx = parseInt(arrayIndex);
          
          if (updated[arrayName]?.[arrayIdx]?.[fieldName]) {
            if (index !== undefined && Array.isArray(updated[arrayName][arrayIdx][fieldName])) {
              updated[arrayName][arrayIdx][fieldName].splice(index, 1);
            } else {
              updated[arrayName][arrayIdx][fieldName] = null;
            }
          }
        } else {
          let updateObj = updated;
          const pathKeys = docPath.split(".");
          
          for (let i = 0; i < pathKeys.length - 1; i++) {
            updateObj = updateObj[pathKeys[i]];
            if (!updateObj) return prev;
          }
          
          const lastKey = pathKeys[pathKeys.length - 1];
          
          if (index !== undefined && Array.isArray(updateObj[lastKey])) {
            updateObj[lastKey].splice(index, 1);
          } else if (updateObj[lastKey]) {
            updateObj[lastKey] = null;
          }
        }
        
        return updated;
      });
      
      toast.success("Document removed successfully");
    } catch (err) {
      console.error("PDF removal error:", err);
      toast.error("Failed to remove document");
    } finally {
      setDocumentUploadingStates((prev) => ({ ...prev, [docPath]: false }));
    }
  };

  const toggleDocSection = (section) => {
    const isDisabled =
      !form.employmentType || !form.experienceLevel;
    if (isDisabled) return;
    
    setExpandedDocSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const checkAllRequiredDocumentsUploaded = () => {
    const requiredDocs = getRequiredDocuments();
    
    if (requiredDocs.idProofs) {
      const hasIdProof = 
        !!uploadedDocuments.idProofs?.aadhaar ||
        !!uploadedDocuments.idProofs?.pan ||
        !!uploadedDocuments.idProofs?.passportOrDL ||
        !!uploadedDocuments.idProofs?.presentAddressProof ||
        !!uploadedDocuments.idProofs?.permanentAddressProof;
      
      if (!hasIdProof) {
        return false;
      }
    }
    
    if (requiredDocs.academicDocuments) {
      const has10th = !!uploadedDocuments.academicDocuments?.tenth?.certificate && 
                      !!uploadedDocuments.academicDocuments?.tenth?.marksheet;
      
      const has12th = !!uploadedDocuments.academicDocuments?.twelth?.certificate && 
                      !!uploadedDocuments.academicDocuments?.twelth?.marksheet;
      
      const gradSemester = parseInt(uploadedDocuments.academicDocuments?.graduation?.semester) || 0;
      const gradMarksheetCount = uploadedDocuments.academicDocuments?.graduation?.marksheets?.length || 0;
      const hasGraduation = !!uploadedDocuments.academicDocuments?.graduation?.certificate && 
                            gradSemester > 0 && 
                            gradMarksheetCount === gradSemester;
      
      if (!has10th && !has12th && !hasGraduation) {
        return false;
      }
    }
    
    if (requiredDocs.employmentHistory) {
      if (!uploadedDocuments.employmentHistory || uploadedDocuments.employmentHistory.length === 0) {
        return false;
      }
      
      const hasCompleteEmploymentHistory = uploadedDocuments.employmentHistory.every(emp => 
        emp.companyName &&
        emp.designation &&
        emp.employmentPeriod?.startDate &&
        emp.employmentPeriod?.endDate &&
        emp.offerLetter &&
        emp.experienceLetter &&
        emp.relievingLetter &&
        emp.salarySlips?.length === 3 
      );
      
      if (!hasCompleteEmploymentHistory) {
        return false;
      }
    }
    
    return true;
  };

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function isValidMoondiveEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isMoondive = email.toLowerCase().endsWith("@moondive.co");
    return emailRegex.test(email) && isMoondive;
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

  function getDigits(str) {
    return str ? str.replace(/\D/g, "") : "";
  }

  function validateStep(currentStep = step) {
    const e = {};

    if (currentStep === 1) {
      if (!form.firstName?.trim()) e.firstName = "First name is required";
      if (!form.lastName?.trim()) e.lastName = "Last name is required";

      if (!form.email?.trim()) {
        e.email = "Email is required";
      } else if (!isValidMoondiveEmail(form.email)) {
        e.email = "Please enter a valid moondive  email address";
      }

      if (!form.dateOfBirth) {
        e.dateOfBirth = "Date of birth is required";
      } else {
        const dob = new Date(form.dateOfBirth);
        const today = new Date();

        if (dob > today) {
          e.dateOfBirth = "Date of birth cannot be in the future";
        } else {
          const age = today.getFullYear() - dob.getFullYear();
          const monthDiff = today.getMonth() - dob.getMonth();
          const actualAge =
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < dob.getDate())
              ? age - 1
              : age;

          if (actualAge < 18) {
            e.dateOfBirth = "Employee must be at least 18 years old";
          }
        }
      }

      if (!form.gender) e.gender = "Gender is required";
      if (!form.maritalStatus) e.maritalStatus = "Marital status is required";

      if (!form.mobileNumber?.trim()) {
        e.mobileNumber = "Mobile number is required";
      } else {
        const mobileDigits = getDigits(form.mobileNumber);
        if (mobileDigits.length !== 10) {
          e.mobileNumber = "Mobile number must be exactly 10 digits";
        } else if (!isValidPhone(form.mobileNumber)) {
          e.mobileNumber =
            "Please enter a valid phone number (e.g., +1234567890 or 1234567890)";
        }
      }

      if (form.alternateMobileNumber?.trim()) {
        const altDigits = getDigits(form.alternateMobileNumber);
        if (altDigits.length !== 10) {
          e.alternateMobileNumber =
            "Alternate mobile number must be exactly 10 digits";
        } else if (!isValidPhone(form.alternateMobileNumber)) {
          e.alternateMobileNumber =
            "Please enter a valid phone number (e.g., +1234567890 or 1234567890)";
        }
      }

      if (form.imageUrl && !isValidURL(form.imageUrl)) {
        e.imageUrl = "Please enter a valid URL";
      }

      if (!form.address[0]?.addressLine?.trim())
        e["address[0].addressLine"] = "Address line is required";
      if (!form.address[0]?.locality?.trim())
        e["address[0].locality"] = "Locality is required";
      if (!form.address[0]?.city?.trim())
        e["address[0].city"] = "City is required";
      if (!form.address[0]?.state?.trim())
        e["address[0].state"] = "State is required";
      if (!form.address[0]?.postalCode?.trim())
        e["address[0].postalCode"] = "Postal code is required";
      if (!form.address[0]?.country?.trim())
        e["address[0].country"] = "Country is required";

      if (!form.address[1]?.addressLine?.trim())
        e["address[1].addressLine"] = "Address line is required";
      if (!form.address[1]?.locality?.trim())
        e["address[1].locality"] = "Locality is required";
      if (!form.address[1]?.city?.trim())
        e["address[1].city"] = "City is required";
      if (!form.address[1]?.state?.trim())
        e["address[1].state"] = "State is required";
      if (!form.address[1]?.postalCode?.trim())
        e["address[1].postalCode"] = "Postal code is required";
      if (!form.address[1]?.country?.trim())
        e["address[1].country"] = "Country is required";

      if (!form.emergencyContacts[0]?.name?.trim())
        e["emergencyContacts[0].name"] = "Emergency contact name is required";
      if (!form.emergencyContacts[0]?.relationship?.trim())
        e["emergencyContacts[0].relationship"] = "Relationship is required";

      if (!form.emergencyContacts[0]?.phone?.trim()) {
        e["emergencyContacts[0].phone"] = "Emergency contact phone is required";
      } else {
        const emergencyDigits = getDigits(form.emergencyContacts[0].phone);
        if (emergencyDigits.length !== 10) {
          e["emergencyContacts[0].phone"] =
            "Emergency contact phone must be exactly 10 digits";
        } else if (!isValidPhone(form.emergencyContacts[0].phone)) {
          e["emergencyContacts[0].phone"] = "Please enter a valid phone number";
        }
      }

      if (
        form.emergencyContacts[0]?.email &&
        !isValidEmail(form.emergencyContacts[0].email)
      ) {
        e["emergencyContacts[0].email"] = "Please enter a valid email address";
      }
      if (!form.emergencyContacts[0]?.phone?.trim()) {
        e["emergencyContacts[0].phone"] = "Emergency contact phone is required";
      } else {
        const emergencyDigits = getDigits(form.emergencyContacts[0].phone);
        if (emergencyDigits.length !== 10) {
          e["emergencyContacts[0].phone"] =
            "Emergency contact phone must be exactly 10 digits";
        } else if (!isValidPhone(form.emergencyContacts[0].phone)) {
          e["emergencyContacts[0].phone"] = "Please enter a valid phone number";
        } else {
          // NEW VALIDATION: Check if emergency contact phone matches mobile or alternate mobile
          const mobileDigits = getDigits(form.mobileNumber);
          const altMobileDigits = getDigits(form.alternateMobileNumber);

          if (emergencyDigits === mobileDigits) {
            e["emergencyContacts[0].phone"] =
              "Emergency contact number cannot be the same as mobile number";
          } else if (
            form.alternateMobileNumber &&
            emergencyDigits === altMobileDigits
          ) {
            e["emergencyContacts[0].phone"] =
              "Emergency contact number cannot be the same as alternate mobile number";
          }
        }
      }
    }

    if (currentStep === 2) {
      if (!form.userRole || form.userRole.length === 0)
        e.userRole = "User role is required";
      if (!form.employmentType)
        e.employmentType = "Employment type is required";
      if (!form.employmentStatus)
        e.employmentStatus = "Employment status is required";
      if (!form.experienceLevel)
        e.experienceLevel = "Experience level is required";
    }

    if (currentStep === 3) {
      if (!form.departmentId) e.departmentId = "Department is required";
      if (!form.designationId) e.designationId = "Designation is required";

      if (!form.dateOfJoining) {
        e.dateOfJoining = "Date of joining is required";
      } else if (form.dateOfBirth) {
        const doj = new Date(form.dateOfJoining);
        const dob = new Date(form.dateOfBirth);
        if (doj < dob) {
          e.dateOfJoining = "Date of joining cannot be before date of birth";
        }
      }

      if (
        form.availableLeave &&
        (isNaN(form.availableLeave) || parseInt(form.availableLeave) < 0)
      ) {
        e.availableLeave = "Available leave must be a positive number";
      }

      if (form.probationEndDate && form.dateOfJoining) {
        const probEnd = new Date(form.probationEndDate);
        const doj = new Date(form.dateOfJoining);
        if (probEnd < doj) {
          e.probationEndDate =
            "Probation end date must be after date of joining";
        }
      }
    }

    if (currentStep === 4) {
      if (!form.employeeId?.trim()) e.employeeId = "Employee ID is required";

      if (mode === "add") {
        if (!form.password?.trim()) {
          e.password = "Password is required";
        } else if (form.password.length < 8) {
          e.password = "Password must be at least 8 characters long";
        }
      }
    }

    return e;
  }

  function next() {
    const stepErrors = validateStep(step);
    setErrors(stepErrors);

    if (Object.keys(stepErrors).length === 0) {
      setStep((s) => Math.min(5, s + 1));
    }
  }

  function back() {
    setStep((s) => Math.max(1, s - 1));
  }

  async function submit(type = "add") {
    if (type === "auto") {
      setSubmitting(true);
    } else if (type === "add") {
      const allErrors = {};

      for (let i = 1; i <= 4; i++) {
        const stepErrors = validateStep(i);
        Object.assign(allErrors, stepErrors);
      }

      setErrors(allErrors);

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
    }
    setSubmitting(true);

    const requiredDocs = getRequiredDocuments();

    const missingDocs = [];

    if (!requiredDocs.idProofs) {
      missingDocs.push("ID Proofs");
    }
    if (!requiredDocs.academicDocuments) {
      missingDocs.push("Academic Documents");
    }
    if (!requiredDocs.employmentHistory) {
      missingDocs.push("Employment History");
    }

    const allRequiredDocsUploaded = checkAllRequiredDocumentsUploaded();
    const onboardingStatusValue = allRequiredDocsUploaded ? "Completed" : "Pending";

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
      mobileNumber: String(form.mobileNumber || ""),
      alternateMobileNumber: String(form.alternateMobileNumber || ""),
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
      reportingManagerId: form.reportingManagerId || "",
      dateOfJoining: form.dateOfJoining,
      onboardingStatus: onboardingStatusValue,
      availableLeave: form.availableLeave
        ? parseInt(form.availableLeave)
        : undefined,
      workingShiftId: form.workingShiftId || "",
      probationEndDate: form.probationEndDate || null,
      experienceLevel: form.experienceLevel,
      emergencyContacts: form.emergencyContacts.filter(
        (ec) => ec.name && ec.phone
      ),
      documents: uploadedDocuments,
    };

    if (mode === "add") {
      submitData.password = form.password;
    }

    try {

      let res;
      if (mode === "add") {
        res = await axios.post("/hrms/employee/add-employee", submitData);
        toast.success("Employee Added Successfully");
        
        if (missingDocs.length > 0) {
          toast.info(
            `Remember to upload ${missingDocs.join(", ")} to complete onboarding.`,
            { duration: 5000 }
          );
        }
      } else if (mode === "edit") {
        const empId = employee._id || employee.id;
        res = await axios.put(
          `/hrms/employee/update-employee/${empId}`,
          submitData
        );
        toast.success("Employee Updated");
        
        if (missingDocs.length > 0) {
          toast.info(
            `Remember to upload ${missingDocs.join(", ")} to complete onboarding.`,
            { duration: 5000 }
          );
        }
      }

      onSave && onSave(res.data.data || res.data.result);
      onClose && onClose();
    } catch (error) {
      toast.error("Failed To Save Employee");

      if (type === "auto") {
        const errorMessage =
          error.response?.data?.message ||
          `Failed to add employee. Please try again.`;
        setErrors({ submit: errorMessage });
      } else {
        if (error.response?.data?.details) {
          const apiErrors = {};
          error.response.data.details.forEach((detail) => {
            const field = detail.field;
            apiErrors[field] = detail.message;
          });
          setErrors(apiErrors);

          if (apiErrors.employeeId || apiErrors.password) {
            setStep(4);
          } else if (
            apiErrors.departmentId ||
            apiErrors.designationId ||
            apiErrors.dateOfJoining ||
            apiErrors.probationEndDate ||
            apiErrors.availableLeave ||
            apiErrors.reportingManagerId
          ) {
            setStep(3);
          } else if (
            apiErrors.userRole ||
            apiErrors.employmentType ||
            apiErrors.employmentStatus
          ) {
            setStep(2);
          } else {
            setStep(1);
          }
        } else {
          const errorMessage =
            error.response?.data?.message ||
            `Failed to ${
              mode === "add" ? "add" : "update"
            } employee. Please try again.`;
          setErrors({ submit: errorMessage });
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  function addSkillFromInput() {
    const val = form.skillInput.trim();
    if (!val) return;
    if (!form.skills.includes(val)) {
      setForm((s) => ({ ...s, skills: [...s.skills, val], skillInput: "" }));
    } else {
      setForm((s) => ({ ...s, skillInput: "" }));
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
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkillFromInput();
    }
    if (
      e.key === "Backspace" &&
      form.skillInput === "" &&
      form.skills.length > 0
    ) {
      removeSkill(form.skills.length - 1);
    }
  }

  function handleNumberInput(e, field) {
    const value = e.target.value;
    if (field === "mobileNumber" || field === "alternateMobileNumber") {
      if (/^[\+]?[0-9]*$/.test(value)) {
        update(field, value);
      }
    } else if (field === "availableLeave") {
      if (/^[0-9]*$/.test(value)) {
        update(field, value);
      }
    }
  }

  function handleEmergencyPhoneInput(e, idx) {
    const value = e.target.value;
    if (/^[\+]?[0-9]*$/.test(value)) {
      updateEmergencyContactField(idx, "phone", value);
    }
  }

  function generateRandomEmail(domain = "example.com", length = 8) {
    const username = Array.from({ length }, () => Math.random().toString(36)[2])
      .join("")
      .slice(0, length);
    return `${username}@${domain}`;
  }

  function generateRandomPersonImage(size = 300, seed = null) {
    if (seed === null) {
      seed = Math.floor(Math.random() * 70) + 1;
    } else if (seed > 70 || seed < 1) {
      seed = Math.floor(Math.random() * 70) + 1;
    }
    return `https://i.pravatar.cc/${size}?img=${seed}`;
  }

  function generateRandomString(length = 10, includeSpecial = true) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let allChars = chars;
    if (includeSpecial) {
      allChars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    }
    let result = "";
    const allCharsLength = allChars.length;
    for (let i = 0; i < length; i++) {
      result += allChars.charAt(Math.floor(Math.random() * allCharsLength));
    }
    return result;
  }
  const getRequiredDocuments = () => {
  const isPermanentOrProbation =
    ["Permanent", "Probation"].includes(form.employmentType);

  const isInternship = form.employmentType === "Internship";

  return {
    idProofs: true,

    academicDocuments: isPermanentOrProbation, 

    showAcademicSection: isPermanentOrProbation || isInternship, 

    employmentHistory:
      isPermanentOrProbation && form.experienceLevel === "Experienced",
  };
};


  const isView = mode === "view";
  const isEdit = mode === "edit";
  const primaryLabel = isView
    ? "Close"
    : isEdit
    ? "Save changes"
    : "Create employee";

  const errorMessages = Object.entries(errors)
    .filter(([key]) => key !== "submit")
    .map(([key, value]) => value);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

        <div className="relative bg-white rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-center">
            <div className="w-48 ">
              <DotLottieReact
                src="https://lottie.host/6ea42a0b-7716-4eff-a01d-6a486e150a49/TCdIGyunvu.lottie"
                loop
                autoplay
              />
            </div>
          </div>
          <div className="text-center">Loading please wait...</div>
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
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-blackText)]">
              {mode === "add"
                ? "Add Employee"
                : mode === "edit"
                ? "Edit Employee"
                : "View Employee"}
            </h3>
            <div className="text-sm text-[var(--color-primaryText)] mt-1">
              Multi-step employee form
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-500 hover:text-gray-700 p-2 rounded-md"
          >
            ✕
          </button>
        </div>

        <div className="px-6 pt-4 pb-3 border-b border-gray-100 sticky top-[60px] bg-white z-10">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((s, index) => (
              <React.Fragment key={s}>
                {index > 0 && (
                  <div
                    className={`flex-1 h-1 border-t-2 border-dotted mx-4 ${
                      step >= s
                        ? "border-[var(--color-primary)]"
                        : "border-gray-400"
                    }`}
                  />
                )}
                <div
                  className={`flex items-center gap-3 shrink-0 ${
                    !isView ? "cursor-pointer" : ""
                  }`}
                  onClick={() => {
                    if (!isView) {
                      setStep(s);
                    }
                  }}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      step >= s
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-gray-100 text-gray-600"
                    } ${!isView ? "hover:opacity-80" : ""}`}
                  >
                    {s}
                  </div>
                  <div className="text-sm text-[var(--color-primaryText)] whitespace-nowrap">
                    {s === 1
                      ? "Personal"
                      : s === 2
                      ? "Employment"
                      : s === 3
                      ? "Job"
                      : s === 4
                      ? "Credentials"
                      : "Documents"}
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {(errorMessages.length > 0 || errors.submit) && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-red-800 mb-1">
                  {errors.submit ? "Error" : "Please fix the following errors:"}
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

        <div className="p-6">
          <div hidden={step !== 1}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <h5 className="md:col-span-2 font-semibold text-lg mb-2">
                Personal Details
              </h5>

              <div className="md:col-span-2">
                <label className="text-sm text-[var(--color-primaryText)] block mb-2">
                  Employee Photo
                </label>
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
                        <svg
                          className="w-12 h-12 mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span className="text-xs">No photo</span>
                      </div>
                    )}
                    {!isView && (
                      <div
                        className={`
                          absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg
                          transition-opacity duration-200 ease-in-out
                          ${
                            imageHovered
                              ? "opacity-100"
                              : "opacity-0 pointer-events-none"
                          }
                        `}
                      >
                        <label
                          htmlFor="image-upload"
                          className="bg-[var(--color-primary)] text-white px-4 py-2 rounded text-sm font-medium hover:bg-opacity-90 cursor-pointer"
                        >
                          {mode === "edit" ? "Edit" : "Add"}
                        </label>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-[var(--color-primaryText)] text-center mt-2">
                  {mode === "view"
                    ? "Employee photo"
                    : "Click to upload employee photo"}
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
                  <p className="text-red-500 text-sm mt-1 text-center">
                    {errors.imageUrl}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">
                  First name <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.firstName || ""}
                  onChange={(e) => update("firstName", e.target.value)}
                  className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)] ${
                    errors.firstName ? "border-red-500" : ""
                  }`}
                  readOnly={isView }
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">
                  Last name <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.lastName || ""}
                  onChange={(e) => update("lastName", e.target.value)}
                  className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)] ${
                    errors.lastName ? "border-red-500" : ""
                  }`}
                  readOnly={isView}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">
                  Email address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.email || ""}
                  onChange={(e) => update("email", e.target.value)}
                  className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)] ${
                    errors.email ? "border-red-500" : ""
                  }`}
                  readOnly={isView }
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.dateOfBirth || ""}
                  onChange={(e) => update("dateOfBirth", e.target.value)}
                  className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)] ${
                    errors.dateOfBirth ? "border-red-500" : ""
                  }`}
                  readOnly={isView}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.gender || ""}
                  onChange={(e) => update("gender", e.target.value)}
                  className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)] ${
                    errors.gender ? "border-red-500" : ""
                  }`}
                  disabled={isView}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">
                  Marital Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.maritalStatus || ""}
                  onChange={(e) => update("maritalStatus", e.target.value)}
                  className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)] ${
                    errors.maritalStatus ? "border-red-500" : ""
                  }`}
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
                <label className="text-sm text-[var(--color-primaryText)]">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.mobileNumber || ""}
                  onChange={(e) => handleNumberInput(e, "mobileNumber")}
                  className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)] ${
                    sameAsCurrentAddress ? "bg-gray-100" : ""
                  }
                     ${errors.mobileNumber ? "border-red-500" : ""}`}
                  readOnly={isView }
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">
                  Alternate Mobile Number
                </label>
                <input
                  value={form.alternateMobileNumber || ""}
                  onChange={(e) =>
                    handleNumberInput(e, "alternateMobileNumber")
                  }
                  className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)]  ${
                    sameAsCurrentAddress ? "bg-gray-100" : ""
                  } ${errors.alternateMobileNumber ? "border-red-500" : ""}`}
                  readOnly={isView }
                  placeholder="+1234567890"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-[var(--color-primaryText)]">
                  About
                </label>
                <textarea
                  value={form.about || ""}
                  onChange={(e) => update("about", e.target.value)}
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)]"
                  readOnly={isView || sameAsCurrentAddress}
                />
              </div>

              <h5 className="md:col-span-2 font-semibold text-lg mb-2 mt-4">
                Current Address Details
              </h5>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">
                  Address Line <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.address?.[0]?.addressLine || ""}
                  onChange={(e) =>
                    updateAddressField(0, "addressLine", e.target.value)
                  }
                  placeholder="Street address, etc."
                  className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)] ${
                    errors["address[0].addressLine"] ? "border-red-500" : ""
                  }`}
                  readOnly={isView || sameAsCurrentAddress}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">
                  Locality <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.address?.[0]?.locality || ""}
                  onChange={(e) =>
                    updateAddressField(0, "locality", e.target.value)
                  }
                  placeholder="Neighborhood or locality"
                  className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)] ${
                    errors["address[0].locality"] ? "border-red-500" : ""
                  }`}
                  readOnly={isView || sameAsCurrentAddress}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.address?.[0]?.city || ""}
                  onChange={(e) =>
                    updateAddressField(0, "city", e.target.value)
                  }
                  placeholder="City name"
                  className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)] ${
                    errors["address[0].city"] ? "border-red-500" : ""
                  }`}
                  readOnly={isView || sameAsCurrentAddress}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.address?.[0]?.state || ""}
                  onChange={(e) =>
                    updateAddressField(0, "state", e.target.value)
                  }
                  placeholder="State/Province"
                  className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)]  
                   ${errors["address[0].state"] ? "border-red-500" : ""}`}
                  readOnly={isView}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">
                  Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  // type="text"
                  value={form.address?.[0]?.postalCode || ""}
                  onChange={(e) =>
                    updateAddressField(0, "postalCode", e.target.value)
                  }
                  placeholder="ZIP/Postal code"
                  className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)] ${errors["address[0].postalCode"] ? "border-red-500" : ""}`}
                  readOnly={isView}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.address?.[0]?.country || ""}
                  onChange={(e) =>
                    updateAddressField(0, "country", e.target.value)
                  }
                  placeholder="Country name"
                  className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)]  
 ${errors["address[0].country"] ? "border-red-500" : ""}`}
                  readOnly={isView || sameAsCurrentAddress}
                />
              </div>

              <h5 className="md:col-span-2 font-semibold text-lg mb-2 mt-4">
                Permanent Address Details
              </h5>
              {!isView && (
                <div className="md:col-span-2 -mt-2 mb-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameAsCurrentAddress}
                      onChange={(e) =>
                        handleSameAsCurrentAddress(e.target.checked)
                      }
                      className="w-4 h-4 rounded border-gray-300  cursor-pointer"
                    />
                    <span className="text-sm text-[var(--color-primaryText)]">
                      Same as Current Address
                    </span>
                  </label>
                </div>
              )}

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">
                  Address Line <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.address?.[1]?.addressLine || ""}
                  onChange={(e) =>
                    updateAddressField(1, "addressLine", e.target.value)
                  }
                  placeholder="Street address, etc."
                  className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)]  ${
                    sameAsCurrentAddress ? "bg-gray-100" : ""
                  } ${
                    errors["address[1].addressLine"] ? "border-red-500" : ""
                  }`}
                  readOnly={isView || sameAsCurrentAddress}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">
                  Locality <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.address?.[1]?.locality || ""}
                  onChange={(e) =>
                    updateAddressField(1, "locality", e.target.value)
                  }
                  placeholder="Neighborhood or locality"
                  className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)] ${
                    sameAsCurrentAddress ? "bg-gray-100" : ""
                  } ${errors["address[1].locality"] ? "border-red-500" : ""}`}
                  readOnly={isView || sameAsCurrentAddress}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.address?.[1]?.city || ""}
                  onChange={(e) =>
                    updateAddressField(1, "city", e.target.value)
                  }
                  placeholder="City name"
                  className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)]  ${
                    sameAsCurrentAddress ? "bg-gray-100" : ""
                  } ${errors["address[1].city"] ? "border-red-500" : ""}`}
                  readOnly={isView || sameAsCurrentAddress}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.address?.[1]?.state || ""}
                  onChange={(e) =>
                    updateAddressField(1, "state", e.target.value)
                  }
                  placeholder="State/Province"
                  className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)]  ${
                    sameAsCurrentAddress ? "bg-gray-100" : ""
                  } ${errors["address[1].state"] ? "border-red-500" : ""}`}
                  readOnly={isView || sameAsCurrentAddress}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">
                  Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.address?.[1]?.postalCode || ""}
                  onChange={(e) =>
                    updateAddressField(1, "postalCode", e.target.value)
                  }
                  placeholder="ZIP/Postal code"
                  className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)]  ${
                    sameAsCurrentAddress ? "bg-gray-100" : ""
                  } ${errors["address[1].postalCode"] ? "border-red-500" : ""}`}
                  readOnly={isView || sameAsCurrentAddress}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.address?.[1]?.country || ""}
                  onChange={(e) =>
                    updateAddressField(1, "country", e.target.value)
                  }
                  placeholder="Country name"
                  className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)]  ${
                    sameAsCurrentAddress ? "bg-gray-100" : ""
                  } ${errors["address[1].country"] ? "border-red-500" : ""}`}
                  readOnly={isView || sameAsCurrentAddress}
                />
              </div>

              <h5 className="md:col-span-2 font-semibold text-lg mb-2 mt-4">
                Emergency Contact
              </h5>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">
                  Contact Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.emergencyContacts?.[0]?.name || ""}
                  onChange={(e) =>
                    updateEmergencyContactField(0, "name", e.target.value)
                  }
                  placeholder="Full name of contact"
                  className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)]
                    errors["emergencyContacts[0].name"] ? "border-red-500" : ""
                  }`}
                  readOnly={isView}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">
                  Relationship <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.emergencyContacts?.[0]?.relationship || ""}
                  onChange={(e) =>
                    updateEmergencyContactField(
                      0,
                      "relationship",
                      e.target.value
                    )
                  }
                  className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)]
                  
                    errors["emergencyContacts[0].relationship"]
                      ? "border-red-500"
                      : ""
                  }`}
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
                <label className="text-sm text-[var(--color-primaryText)]">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={form.emergencyContacts?.[0]?.phone || ""}
                  onChange={(e) => handleEmergencyPhoneInput(e, 0)}
                  placeholder="+1234567890"
                  className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)] ${
                    errors["emergencyContacts[0].phone"] ? "border-red-500" : ""
                  }`}
                  readOnly={isView}
                />
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">
                  Email
                </label>
                <input
                  type="email"
                  value={form.emergencyContacts?.[0]?.email || ""}
                  onChange={(e) =>
                    updateEmergencyContactField(0, "email", e.target.value)
                  }
                  placeholder="Emergency contact email"
                  className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)] ${
                    errors["emergencyContacts[0].email"] ? "border-red-500" : ""
                  }`}
                  readOnly={isView}
                />
              </div>
            </div>
          </div>

          <div hidden={step !== 2}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <h5 className="md:col-span-2 font-semibold text-lg mb-2">
                Employement Details
              </h5>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">
                  Assigned Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.userRole?.[0] || ""}
                  onChange={(e) => update("userRole", [e.target.value])}
                  className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)] ${
                    errors.userRole ? "border-red-500" : ""
                  }`}
                  disabled={isView}
                >
                  <option value="">Select role</option>
                  {organizationData?.roles?.map((d) => (
                    <option key={d._id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">
                  Source of Hire
                </label>
                <select
                  value={form.sourceOfHire || ""}
                  onChange={(e) => update("sourceOfHire", e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)]"
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
                <label className="text-sm text-[var(--color-primaryText)]">
                  Employment Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.employmentType || ""}
                  onChange={(e) => update("employmentType", e.target.value)}
                  className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)] ${
                    errors.employmentType ? "border-red-500" : ""
                  }`}
                  disabled={isView}
                >
                  <option value="">Select</option>
                  <option value="Permanent">Permanent</option>
                  <option value="Probation">Probation</option>
                  <option value="Internship">Internship</option>
                  {/* <option value="Trainee">Trainee</option> */}
                </select>
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">
                  Employment Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.employmentStatus || ""}
                  onChange={(e) => update("employmentStatus", e.target.value)}
                  className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)] ${
                    errors.employmentStatus ? "border-red-500" : ""
                  }`}
                  disabled={isView}
                >
                  <option value="">Select</option>
                  <option value="Active">Active</option>
                  {/* <option value="On Probation">On Probation</option> */}
                  {/* <option value="Resigned">Resigned</option> */}
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">
                  Experience Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.experienceLevel || ""}
                  onChange={(e) => update("experienceLevel", e.target.value)}
                  className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)] ${
                    errors.experienceLevel ? "border-red-500" : ""
                  }`}
                  disabled={isView}
                >
                  <option value="">Select</option>
                  <option value="Fresher">Fresher</option>
                  <option value="Experienced">Experienced</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">
                  Working Shift
                </label>
                <select
                  value={form.workingShiftId || ""}
                  onChange={(e) => update("workingShiftId", e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)]"
                  disabled={isView}
                >
                  <option value="">Select Shift</option>
                  {organizationData?.shifts?.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-[var(--color-primaryText)]">
                  Skills (press Enter or comma to add)
                </label>
                <div className="mt-1">
                  {!isView && (
                    <input
                      value={form.skillInput}
                      onChange={(e) => update("skillInput", e.target.value)}
                      onKeyDown={onSkillKeyDown}
                      onBlur={addSkillFromInput}
                      placeholder="Add skill..."
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)] flex-1 min-w-[100px] mb-3 w-[60%]"
                    />
                  )}
                  <div className="flex flex-wrap gap-2">
                    {form.skills.map((s, i) => (
                      <div
                        key={s + "-" + i}
                        className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-sm"
                      >
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

          <div hidden={step !== 3}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <h5 className="md:col-span-2 font-semibold text-lg mb-2">
                Job Details
              </h5>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.departmentId || ""}
                  onChange={(e) => update("departmentId", e.target.value)}
                  className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)] ${
                    errors.departmentId ? "border-red-500" : ""
                  }`}
                  disabled={isView}
                >
                  <option value="">Select Department</option>
                  {organizationData?.departments?.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">
                  Designation <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.designationId || ""}
                  onChange={(e) => update("designationId", e.target.value)}
                  className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)] ${
                    errors.designationId ? "border-red-500" : ""
                  }`}
                  disabled={isView}
                >
                  <option value="">Select Designation</option>
                  {organizationData?.designations?.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">
                  Reporting Manager
                </label>
                <select
                  value={form.reportingManagerId || ""}
                  onChange={(e) => update("reportingManagerId", e.target.value)}
                  className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)] ${
                    errors.reportingManagerId ? "border-red-500" : ""
                  }`}
                  disabled={isView}
                >
                  <option value="">Select Reporting Manager</option>

                  {employeeList
                    .filter((mgr) => {
                      if (mode === "edit" && employee?._id) {
                        return mgr._id !== employee._id;
                      }
                      return true;
                    })
                    .map((mgr) => (
                      <option key={mgr._id} value={mgr._id}>
                        {mgr.firstName} {mgr.lastName}
                      </option>
                    ))}
                </select>

              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">
                  Date of Joining <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.dateOfJoining || ""}
                  onChange={(e) => update("dateOfJoining", e.target.value)}
                  className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)] ${
                    errors.dateOfJoining ? "border-red-500" : ""
                  }`}
                  readOnly={isView }
                />
              </div>

              {/* <div>
                <label className="text-sm text-[var(--color-primaryText)]">
                  Onboarding Status
                </label>
                <select
                  value={form.onboardingStatus || "Pending"}
                  onChange={(e) => update("onboardingStatus", e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)]"
                  disabled={isView}
                >
                  <option value="Pending">Pending</option>
                  <option value="InProgress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div> */}

              {/* <div>
                <label className="text-sm text-[var(--color-primaryText)]">
                  Available Leave (days per month)
                </label>
                <input
                  type="text"
                  value={form.availableLeave || ""}
                  onChange={(e) => handleNumberInput(e, "availableLeave")}
                  className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)] ${
                    errors.availableLeave ? "border-red-500" : ""
                  }`}
                  readOnly={isView }
                  placeholder="0"
                />
              </div> */}

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">
                  Probation End Date
                </label>
                <input
                  type="date"
                  value={form.probationEndDate || ""}
                  onChange={(e) => update("probationEndDate", e.target.value)}
                  className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)] ${
                    errors.probationEndDate ? "border-red-500" : ""
                  }`}
                  readOnly={isView}
                />
              </div>
            </div>
          </div>

          <div hidden={step !== 4}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <h5 className="md:col-span-2 font-semibold text-lg mb-2">
                Credentials
              </h5>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">
                  Employee ID <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.employeeId || ""}
                  onChange={(e) => update("employeeId", e.target.value)}
                  className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)] ${
                    errors.employeeId ? "border-red-500" : ""
                  }`}
                  readOnly={isView }
                />
                {errors.employeeId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.employeeId}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm text-[var(--color-primaryText)]">
                  Email (from Personal Details)
                </label>
                <input
                  value={form.email || ""}
                  readOnly
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none"
                />
              </div>

              {!isView && mode === "add" && (
                <div className="md:col-span-2">
                  <label className="text-sm text-[var(--color-primaryText)]">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={form.password || ""}
                    onChange={(e) => update("password", e.target.value)}
                    className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-[var(--color-primary)] ${
                      errors.password ? "border-red-500" : ""
                    }`}
                    placeholder="Minimum 8 characters"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>
              )}

              {isView && (
                <div className="md:col-span-2">
                  <label className="text-sm text-[var(--color-primaryText)]">
                    Password
                  </label>
                  <input
                    type="password"
                    value="********"
                    readOnly
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          <div hidden={step !== 5}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <h5 className="md:col-span-2 font-semibold text-lg mb-2">
                Documents
              </h5>

              {(() => {
                const requiredDocs = getRequiredDocuments();
                const isDisabled = !form.employmentType || !form.experienceLevel;

                const renderDocumentField = (label, docPath, isRequired = true) => {
                  let docs = uploadedDocuments;
                  
                  const arrayIndexMatch = docPath.match(/(\w+)\[(\d+)\]\.(\w+)/);
                  if (arrayIndexMatch) {
                    const [, arrayName, arrayIndex, fieldName] = arrayIndexMatch;
                    const index = parseInt(arrayIndex);
                    docs = uploadedDocuments[arrayName]?.[index]?.[fieldName];
                  } else {
                    const keys = docPath.split(".");
                    for (let i = 0; i < keys.length; i++) {
                      if (docs && typeof docs === 'object') {
                        docs = docs[keys[i]];
                      } else {
                        docs = undefined;
                        break;
                      }
                    }
                  }
                  
                  const isArray = Array.isArray(docs);
                  const docArray = isArray ? (docs || []) : (docs ? [docs] : []);
                  const showCheckmark = isArray ? docArray.length > 0 : !!docs;
                  const countText = isArray ? `(${docArray.length})` : '';

                  return (
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {label}
                        {showCheckmark && <span className="text-green-600 ml-2">✓ {countText}</span>}
                      </label>
                      <div className="mt-2 space-y-2">
                        {docArray.map((doc, idx) => {
                          let displayName = `Document ${idx + 1}`;
                          if (doc?.fileName) {
                            displayName = doc.fileName;
                          } else if (doc?.url) {
                            const urlParts = doc.url.split('/');
                            displayName = urlParts[urlParts.length - 1] || displayName;
                          } else if (typeof doc === 'string') {
                            displayName = doc.split('/').pop() || displayName;
                          }
                          
                          return (
                            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                              <a
                                href={doc?.url || doc}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm flex-1 truncate"
                              >
                                {displayName}
                              </a>
                              <button
                                type="button"
                                onClick={() => isArray ? handleRemoveDocument(docPath, idx) : handleRemoveDocument(docPath)}
                                disabled={documentUploadingStates[docPath]}
                                className="text-red-500 hover:text-red-700 text-sm font-medium ml-2"
                              >
                                Remove
                              </button>
                            </div>
                          );
                        })}

                        <label className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition text-center block">
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleDocumentUpload(e, docPath)}
                            className="hidden"
                            disabled={documentUploadingStates[docPath]}
                          />
                          <span className="text-sm text-gray-600">
                            {documentUploadingStates[docPath] ? "Uploading..." : "Click to upload documents"}
                          </span>
                        </label>
                      </div>
                    </div>
                  );
                };

                return (
                  <div className="md:col-span-2 space-y-4">
                    <div
                      className={`border rounded-lg overflow-hidden ${
                        isDisabled
                          ? "bg-gray-50 border-gray-200 opacity-50"
                          : "bg-blue-50 border-blue-200"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleDocSection("idProofs")}
                        disabled={isDisabled}
                        className={`w-full p-4 flex items-start justify-between ${
                          isDisabled ? "cursor-not-allowed" : "cursor-pointer hover:bg-blue-100"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <svg
                              className={`w-5 h-5 ${
                                isDisabled ? "text-gray-400" : "text-blue-600"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                            </svg>
                          </div>
                          <div className="text-left">
                            <h6 className="font-semibold text-gray-900">
                              ID Proofs (Aadhaar, PAN, Passport, etc.)
                            </h6>
                            <p className="text-sm text-gray-600 mt-1">
                              Required for all employees
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                            Required
                          </span>
                          <svg
                            className={`w-5 h-5 transition-transform ${
                              expandedDocSections.idProofs ? "rotate-180" : ""
                            } ${isDisabled ? "text-gray-400" : "text-gray-600"}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            />
                          </svg>
                        </div>
                      </button>

                      {expandedDocSections.idProofs && !isDisabled && (
                        <div className="border-t border-blue-200 p-4 space-y-4 bg-white">
                          {renderDocumentField("Aadhaar Card", "idProofs.aadhaar")}
                          {renderDocumentField("PAN Card", "idProofs.pan")}
                          {renderDocumentField("Passport / Driving License / Voter ID", "idProofs.passportOrDL")}
                          {renderDocumentField("Present Address Proof", "idProofs.presentAddressProof")}
                          {renderDocumentField("Permanent Address Proof", "idProofs.permanentAddressProof")}
                        </div>
                      )}
                    </div>

                    {requiredDocs.showAcademicSection  && (
                      <div
                        className={`border rounded-lg overflow-hidden ${
                          isDisabled
                            ? "bg-gray-50 border-gray-200 opacity-50"
                            : "bg-blue-50 border-blue-200"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleDocSection("academicDocuments")}
                          disabled={isDisabled}
                          className={`w-full p-4 flex items-start justify-between ${
                            isDisabled
                              ? "cursor-not-allowed"
                              : "cursor-pointer hover:bg-blue-100"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              <svg
                                className={`w-5 h-5 ${
                                  isDisabled ? "text-gray-400" : "text-blue-600"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3.5a1 1 0 000 1.814l.5.25v8.004c0 .596.231 1.17.645 1.574.413.403.97.645 1.555.645h1a1 1 0 001-1v-1a1 1 0 011-1h2a1 1 0 011 1v1a1 1 0 001 1h1c.585 0 1.142-.242 1.555-.645.414-.404.645-.978.645-1.574V7.654l.5-.25a1 1 0 000-1.814l-7-3.5z" />
                              </svg>
                            </div>
                            <div className="text-left">
                              <h6 className="font-semibold text-gray-900">
                                {form.employmentType === 'Internship' ? 'Internship Documents' : 'Academic Documents (10th, 12th, Graduation, etc.)'}
                              </h6>
                              <p className="text-sm text-gray-600 mt-1">
                                {form.employmentType === 'Internship' ? 'NOC from College' : `Required for ${form.employmentType} employees`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                              Required
                            </span>
                            <svg
                              className={`w-5 h-5 transition-transform ${
                                expandedDocSections.academicDocuments
                                  ? "rotate-180"
                                  : ""
                              } ${isDisabled ? "text-gray-400" : "text-gray-600"}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                              />
                            </svg>
                          </div>
                        </button>

                        {expandedDocSections.academicDocuments && !isDisabled && (
                          <div className="border-t border-blue-200 p-4 space-y-6 bg-white">
                            {form.employmentType === 'Internship' ? (
                              <div className="border rounded-lg p-4 bg-gray-50">
                                <h5 className="font-semibold text-gray-900 mb-3">No Objection Certificate (NOC)</h5>
                                <div className="space-y-3">
                                  {renderDocumentField("NOC from College", "academicDocuments.nocFromCollege")}
                                </div>
                              </div>
                            ) : (
                              <>
                                {/* 10th */}
                                <div className="border rounded-lg p-4 bg-gray-50">
                                  <h5 className="font-semibold text-gray-900 mb-3">10th Class</h5>
                                  <div className="space-y-3">
                                    {renderDocumentField("10th Certificate", "academicDocuments.tenth.certificate")}
                                    {renderDocumentField("10th Marksheet", "academicDocuments.tenth.marksheet")}
                                  </div>
                                </div>

                                {/* 12th */}
                                <div className="border rounded-lg p-4 bg-gray-50">
                                  <h5 className="font-semibold text-gray-900 mb-3">12th Class</h5>
                                  <div className="space-y-3">
                                    {renderDocumentField("12th Certificate", "academicDocuments.twelth.certificate")}
                                    {renderDocumentField("12th Marksheet", "academicDocuments.twelth.marksheet")}
                                  </div>
                                </div>

                                {/* Graduation */}
                                <div className="border rounded-lg p-4 bg-gray-50">
                                  <h5 className="font-semibold text-gray-900 mb-3">Graduation</h5>
                                  <div className="space-y-3">
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Degree Name</label>
                                      <input
                                        type="text"
                                        value={uploadedDocuments.academicDocuments?.graduation?.name || ''}
                                        onChange={(e) => setUploadedDocuments(prev => ({
                                          ...prev,
                                          academicDocuments: {
                                            ...prev.academicDocuments,
                                            graduation: { ...prev.academicDocuments.graduation, name: e.target.value }
                                          }
                                        }))}
                                        placeholder="e.g., B.Tech, B.Sc, etc."
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Number of Semesters</label>
                                      <input
                                        type="number"
                                        value={uploadedDocuments.academicDocuments?.graduation?.semester || ''}
                                        onChange={(e) => setUploadedDocuments(prev => ({
                                          ...prev,
                                          academicDocuments: {
                                            ...prev.academicDocuments,
                                            graduation: { ...prev.academicDocuments.graduation, semester: e.target.value }
                                          }
                                        }))}
                                        placeholder="e.g., 8"
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min="1"
                                      />
                                    </div>
                                    {renderDocumentField("Graduation Certificate", "academicDocuments.graduation.certificate")}
                                    {(uploadedDocuments.academicDocuments?.graduation?.name && uploadedDocuments.academicDocuments?.graduation?.semester) ? (
                                      renderDocumentField("Semester Marksheets", "academicDocuments.graduation.marksheets")
                                    ) : (
                                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-700">
                                          Please fill in Degree Name and Number of Semesters to upload marksheets
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                    {/* Post Graduation */}
                                <div className="border rounded-lg p-4 bg-gray-50">
                                  <h5 className="font-semibold text-gray-900 mb-3">Post Graduation</h5>
                                  <div className="space-y-3">
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Degree Name</label>
                                      <input
                                        type="text"
                                        value={uploadedDocuments.academicDocuments?.postGraduation?.name || ''}
                                        onChange={(e) => setUploadedDocuments(prev => ({
                                          ...prev,
                                          academicDocuments: {
                                            ...prev.academicDocuments,
                                            postGraduation: { ...prev.academicDocuments.postGraduation, name: e.target.value }
                                          }
                                        }))}
                                        placeholder="e.g., M.Tech, M.Sc, MBA, etc."
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Number of Semesters</label>
                                      <input
                                        type="number"
                                        value={uploadedDocuments.academicDocuments?.postGraduation?.semester || ''}
                                        onChange={(e) => setUploadedDocuments(prev => ({
                                          ...prev,
                                          academicDocuments: {
                                            ...prev.academicDocuments,
                                            postGraduation: { ...prev.academicDocuments.postGraduation, semester: e.target.value }
                                          }
                                        }))}
                                        placeholder="e.g., 4"
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min="1"
                                      />
                                    </div>
                                    {renderDocumentField("Post Graduation Certificate", "academicDocuments.postGraduation.certificate")}
                                    {(uploadedDocuments.academicDocuments?.postGraduation?.name && uploadedDocuments.academicDocuments?.postGraduation?.semester) ? (
                                      renderDocumentField("Semester Marksheets", "academicDocuments.postGraduation.marksheets")
                                    ) : (
                                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-700">
                                          Please fill in Degree Name and Number of Semesters to upload marksheets
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* NOC from College */}
                                <div className="border rounded-lg p-4 bg-gray-50">
                                  <h5 className="font-semibold text-gray-900 mb-3">No Objection Certificate (NOC) from College</h5>
                                  <div className="space-y-3">
                                    {renderDocumentField("NOC from College", "academicDocuments.nocFromCollege", false)}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Employment History */}
                    {requiredDocs.employmentHistory && (
                      <div
                        className={`border rounded-lg overflow-hidden ${
                          isDisabled
                            ? "bg-gray-50 border-gray-200 opacity-50"
                            : "bg-blue-50 border-blue-200"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleDocSection("employmentHistory")}
                          disabled={isDisabled}
                          className={`w-full p-4 flex items-start justify-between ${
                            isDisabled
                              ? "cursor-not-allowed"
                              : "cursor-pointer hover:bg-blue-100"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              <svg
                                className={`w-5 h-5 ${
                                  isDisabled ? "text-gray-400" : "text-blue-600"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                              </svg>
                            </div>
                            <div className="text-left">
                              <h6 className="font-semibold text-gray-900">
                                Employment History (Offer Letter, Experience Letter, etc.)
                              </h6>
                              <p className="text-sm text-gray-600 mt-1">
                                Required for Experienced {form.employmentType} employees
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                              Required
                            </span>
                            <svg
                              className={`w-5 h-5 transition-transform ${
                                expandedDocSections.employmentHistory
                                  ? "rotate-180"
                                  : ""
                              } ${isDisabled ? "text-gray-400" : "text-gray-600"}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                              />
                            </svg>
                          </div>
                        </button>

                        {expandedDocSections.employmentHistory && !isDisabled && (
                          <div className="border-t border-blue-200 p-4 space-y-6 bg-white">
                            {uploadedDocuments.employmentHistory?.map((employment, idx) => (
                              <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                                <div className="flex items-center justify-between mb-3">
                                  <h5 className="font-semibold text-gray-900">
                                    {employment.companyName || `Employment Record ${idx + 1}`}
                                  </h5>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setUploadedDocuments(prev => ({
                                        ...prev,
                                        employmentHistory: prev.employmentHistory.filter((_, i) => i !== idx)
                                      }));
                                    }}
                                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                                  >
                                    Remove
                                  </button>
                                </div>
                                <div className="space-y-3">
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="text-xs font-medium text-gray-600">Company Name</label>
                                      <input
                                        type="text"
                                        value={employment.companyName || ''}
                                        onChange={(e) => {
                                          const updated = [...uploadedDocuments.employmentHistory];
                                          updated[idx].companyName = e.target.value;
                                          setUploadedDocuments(prev => ({ ...prev, employmentHistory: updated }));
                                        }}
                                        className="mt-1 w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium text-gray-600">Designation</label>
                                      <input
                                        type="text"
                                        value={employment.designation || ''}
                                        onChange={(e) => {
                                          const updated = [...uploadedDocuments.employmentHistory];
                                          updated[idx].designation = e.target.value;
                                          setUploadedDocuments(prev => ({ ...prev, employmentHistory: updated }));
                                        }}
                                        className="mt-1 w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="text-xs font-medium text-gray-600">Start Date</label>
                                      <input
                                        type="date"
                                        value={employment.employmentPeriod?.startDate ? new Date(employment.employmentPeriod.startDate).toISOString().split('T')[0] : ''}
                                        onChange={(e) => {
                                          const updated = [...uploadedDocuments.employmentHistory];
                                          updated[idx].employmentPeriod = {
                                            ...updated[idx].employmentPeriod,
                                            startDate: e.target.value
                                          };
                                          setUploadedDocuments(prev => ({ ...prev, employmentHistory: updated }));
                                        }}
                                        className="mt-1 w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium text-gray-600">End Date</label>
                                      <input
                                        type="date"
                                        value={employment.employmentPeriod?.endDate ? new Date(employment.employmentPeriod.endDate).toISOString().split('T')[0] : ''}
                                        onChange={(e) => {
                                          const updated = [...uploadedDocuments.employmentHistory];
                                          updated[idx].employmentPeriod = {
                                            ...updated[idx].employmentPeriod,
                                            endDate: e.target.value
                                          };
                                          setUploadedDocuments(prev => ({ ...prev, employmentHistory: updated }));
                                        }}
                                        className="mt-1 w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      />
                                    </div>
                                  </div>
                                  {renderDocumentField("Offer Letter", `employmentHistory[${idx}].offerLetter`)}
                                  {renderDocumentField("Experience Letter", `employmentHistory[${idx}].experienceLetter`)}
                                  {renderDocumentField("Relieving Letter", `employmentHistory[${idx}].relievingLetter`)}
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">
                                      Last 3 Months Salary Slips (Upload each month separately)
                                    </label>
                                    <div className="mt-2 space-y-2">
                                      {employment.salarySlips?.map((slip, sipIdx) => (
                                        <div key={sipIdx} className="flex items-center justify-between p-2 bg-gray-100 rounded border border-gray-300">
                                          <a
                                            href={slip.documentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline text-sm flex-1 truncate"
                                          >
                                            {slip.fileName || slip.month || `Salary Slip ${sipIdx + 1}`}
                                          </a>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const updated = [...uploadedDocuments.employmentHistory];
                                              updated[idx].salarySlips = updated[idx].salarySlips.filter((_, i) => i !== sipIdx);
                                              setUploadedDocuments(prev => ({ ...prev, employmentHistory: updated }));
                                            }}
                                            className="text-red-500 hover:text-red-700 text-sm font-medium ml-2"
                                          >
                                            Remove
                                          </button>
                                        </div>
                                      ))}
                                      <label className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition text-center block">
                                        <input
                                          type="file"
                                          accept=".pdf,.jpg,.jpeg,.png"
                                          onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              setDocumentUploadingStates((prev) => ({ ...prev, [`salarySlip-${idx}`]: true }));
                                              const formData = new FormData();
                                              formData.append("files", file);
                                              
                                              try {
                                                const { data } = await axios.post("/user/add-pdf", formData);
                                                if (data?.result?.pdfUrls && data.result.pdfUrls.length > 0) {
                                                  const pdf = data.result.pdfUrls[0];
                                                  const updated = [...uploadedDocuments.employmentHistory];
                                                  if (!updated[idx].salarySlips) updated[idx].salarySlips = [];
                                                  updated[idx].salarySlips.push({
                                                    month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
                                                    fileName: file.name,
                                                    documentUrl: pdf.url
                                                  });
                                                  setUploadedDocuments(prev => ({ ...prev, employmentHistory: updated }));
                                                  toast.success("Salary slip uploaded successfully");
                                                }
                                              } catch (err) {
                                                toast.error("Failed to upload salary slip");
                                                console.error("Salary slip upload error:", err);
                                              } finally {
                                                setDocumentUploadingStates((prev) => ({ ...prev, [`salarySlip-${idx}`]: false }));
                                              }
                                            }
                                          }}
                                          className="hidden"
                                          disabled={documentUploadingStates[`salarySlip-${idx}`]}
                                        />
                                        <span className="text-sm text-gray-600">
                                          {documentUploadingStates[`salarySlip-${idx}`] ? "Uploading..." : "Click to upload salary slip"}
                                        </span>
                                      </label>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">
                                      Other Documents <span className="text-gray-500 text-xs">(Optional)</span>
                                    </label>
                                    <div className="mt-2 space-y-2">
                                      {employment.others?.map((doc, oIdx) => (
                                        <div key={oIdx} className="flex items-center justify-between p-2 bg-gray-100 rounded border border-gray-300">
                                          <a
                                            href={doc?.documentUrl || doc}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline text-sm flex-1 truncate"
                                          >
                                            {doc?.fileName || doc || `Document ${oIdx + 1}`}
                                          </a>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const updated = [...uploadedDocuments.employmentHistory];
                                              updated[idx].others = updated[idx].others.filter((_, i) => i !== oIdx);
                                              setUploadedDocuments(prev => ({ ...prev, employmentHistory: updated }));
                                            }}
                                            className="text-red-500 hover:text-red-700 text-sm font-medium ml-2"
                                          >
                                            Remove
                                          </button>
                                        </div>
                                      ))}
                                      <label className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition text-center block">
                                        <input
                                          type="file"
                                          accept=".pdf,.jpg,.jpeg,.png"
                                          onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              setDocumentUploadingStates((prev) => ({ ...prev, [`other-${idx}`]: true }));
                                              const formData = new FormData();
                                              formData.append("files", file);
                                              
                                              try {
                                                const { data } = await axios.post("/user/add-pdf", formData);
                                                if (data?.result?.pdfUrls && data.result.pdfUrls.length > 0) {
                                                  const pdf = data.result.pdfUrls[0];
                                                  const updated = [...uploadedDocuments.employmentHistory];
                                                  if (!updated[idx].others) updated[idx].others = [];
                                                  updated[idx].others.push({
                                                    fileName: file.name,
                                                    documentUrl: pdf.url
                                                  });
                                                  setUploadedDocuments(prev => ({ ...prev, employmentHistory: updated }));
                                                  toast.success("Document uploaded successfully");
                                                }
                                              } catch (err) {
                                                toast.error("Failed to upload document");
                                                console.error("Document upload error:", err);
                                              } finally {
                                                setDocumentUploadingStates((prev) => ({ ...prev, [`other-${idx}`]: false }));
                                              }
                                            }
                                          }}
                                          className="hidden"
                                          disabled={documentUploadingStates[`other-${idx}`]}
                                        />
                                        <span className="text-sm text-gray-600">
                                          {documentUploadingStates[`other-${idx}`] ? "Uploading..." : "Click to upload other document"}
                                        </span>
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            {/* Add New Employment Record */}
                            <button
                              type="button"
                              onClick={() => {
                                setUploadedDocuments(prev => ({
                                  ...prev,
                                  employmentHistory: [
                                    ...prev.employmentHistory,
                                    {
                                      companyName: '',
                                      designation: '',
                                      employmentPeriod: { startDate: null, endDate: null },
                                      offerLetter: [],
                                      experienceLetter: [],
                                      relievingLetterUrl: null,
                                      salarySlips: [],
                                      others: []
                                    }
                                  ]
                                }));
                              }}
                              className="w-full px-4 py-2 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                            >
                              + Add Employment Record
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Optional Documents */}
                    {/* <div
                      className={`border rounded-lg overflow-hidden ${
                        isDisabled
                          ? "bg-gray-50 border-gray-200 opacity-50"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="p-4 flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <svg
                              className="w-5 h-5 text-gray-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                              <path
                                fillRule="evenodd"
                                d="M4 5a2 2 0 012-2 1 1 0 000-2H6a6 6 0 016 6v3h1a1 1 0 100 2h-1a1 1 0 100 2h1a2 2 0 002-2v-3a8 8 0 00-8-8 2 2 0 00-2 2v2H2a1 1 0 100 2h2v2H2a1 1 0 100 2h2v1a2 2 0 002 2z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="text-left">
                            <h6 className="font-semibold text-gray-900">
                              Additional Documents
                            </h6>
                            <p className="text-sm text-gray-600 mt-1">
                              Bank Details, Health Insurance, Certificates, etc.
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                          Optional
                        </span>
                      </div>
                    </div> */}

                    {/* Status Banner */}
                    <div
                      className={`p-4 border rounded-lg ${
                        checkAllRequiredDocumentsUploaded()
                          ? "border-green-200 bg-green-50"
                          : "border-amber-200 bg-amber-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <svg
                            className={`w-5 h-5 ${
                              checkAllRequiredDocumentsUploaded()
                                ? "text-green-600"
                                : "text-amber-600"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            {checkAllRequiredDocumentsUploaded() ? (
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            ) : (
                              <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            )}
                          </svg>
                        </div>
                        <div>
                          <h6
                            className={`font-semibold ${
                              checkAllRequiredDocumentsUploaded()
                                ? "text-green-900"
                                : "text-amber-900"
                            }`}
                          >
                            {checkAllRequiredDocumentsUploaded()
                              ? "All Required Documents Uploaded"
                              : "Onboarding Status"}
                          </h6>
                          <p
                            className={`text-sm mt-1 ${
                              checkAllRequiredDocumentsUploaded()
                                ? "text-green-800"
                                : "text-amber-800"
                            }`}
                          >
                            {checkAllRequiredDocumentsUploaded()
                              ? "Your onboarding status will be marked as Completed when you save this employee."
                              : "Your onboarding status will automatically be set to Completed once all required documents are uploaded."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end  p-4 border-t border-gray-100 sticky bottom-0 bg-white">
          <div className="flex items-center gap-2">
            {!isView && (
              <>
                {step > 1 && (
                  <button
                    onClick={back}
                    className="px-3 py-2 rounded-md bg-white border text-sm"
                    disabled={submitting}
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-3 py-2 rounded-md bg-white border text-sm"
                  disabled={submitting}
                >
                  Cancel
                </button>
                {step < 5 && (
                  <button
                    onClick={next}
                    className="px-3 py-2 rounded-md bg-[var(--color-primary)] text-white text-sm hover:brightness-95"
                    disabled={submitting}
                  >
                    Continue
                  </button>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            {!isView ? (
              step === 5 && (
                <button
                  onClick={submit}
                  disabled={submitting}
                  className={`px-4 py-2 ml-2 rounded-md bg-[var(--color-primary)] hover:brightness-95 text-white font-semibold ${
                    submitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {submitting ? "Saving..." : primaryLabel}
                </button>
              )
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-md bg-[var(--color-primary)] text-white font-semibold"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



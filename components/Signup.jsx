"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Sign from "../public/signup/Sign.svg";
import Google from "../public/signup/Google.png";
import LinkedIn from "../public/signup/LinkedIn.png";
import { COUNTRY_CODES } from "../constants/CountryCodes";
import {
  SIGNUP_BRAND_LETTER,
  SIGNUP_BRAND_NAME,
  SIGNUP_HEADING_LINE1,
  SIGNUP_HEADING_LINE2,
  SIGNUP_DESCRIPTION,
  SIGNUP_LABEL_LASTNAME,
  SIGNUP_LABEL_FIRSTNAME,
  SIGNUP_LABEL_EMAIL,
  SIGNUP_LABEL_PASSWORD,
  SIGNUP_LABEL_PHONE,
  SIGNUP_LABEL_AGREE_PREFIX,
  SIGNUP_LABEL_TERMS,
  SIGNUP_FOOTER,
  SIGNUP_PLACEHOLDER_FIRSTNAME,
  SIGNUP_PLACEHOLDER_LASTNAME,
  SIGNUP_PLACEHOLDER_EMAIL,
  SIGNUP_PLACEHOLDER_PASSWORD,
  SIGNUP_PLACEHOLDER_PHONE,
  SIGNUP_SOCIAL_TEXT,
} from "../text";
import { userService } from "@/services/userService";
const initialFormState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  countryCode: "+91",
  mobileNumber: "",
  acceptedTerms: false,
};


export default function Signup() {
const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting,setIsSubmitting] = useState(false)
  const router = useRouter();

    function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
      api: "",
    }));
  }

  function validate(values) {
    const newErrors = {};

    if (!values.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!values.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!values.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email.trim())
    ) {
      newErrors.email = "Enter a valid email address";
    }

    if (!values.password) {
      newErrors.password = "Password is required";
    } else if (values.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!values.mobileNumber.trim()) {
      newErrors.mobileNumber = "Phone number is required";
    } else if (!/^\d{7,15}$/.test(values.mobileNumber.trim())) {
      newErrors.mobileNumber = "Enter a valid phone number";
    }

    if (!values.acceptedTerms) {
      newErrors.acceptedTerms = "You must agree to the terms & conditions";
    }

    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        mobileNumber: formData.mobileNumber.trim(),
        countryCode: formData.countryCode,
      };

      const response = await userService.register(payload);
      router.push(`/otp?email=${encodeURIComponent(payload.email)}`);
    } catch (error) {
      const message =
        error?.response?.data?.message || "Something went wrong. Please try again.";
      setErrors((prev) => ({ ...prev, api: message }));
    } finally {
      setIsSubmitting(false);
    }
  }


  return (
    <div className="min-h-screen flex flex-col md:flex-row z-2 bg-white">
      <div className="bg-white w-full md:w-[58%] md:rounded-r-4xl flex justify-center items-center px-6 md:px-20 py-8 md:py-12">
        <section className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-6 md:mb-8">
            <div className="h-6 w-6 md:h-8 md:w-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-semibold text-sm md:text-base">
              {SIGNUP_BRAND_LETTER}
            </div>
            <span className="font-semibold text-base md:text-lg text-gray-900">
              {SIGNUP_BRAND_NAME}
            </span>
          </div>

          <h3 className="text-lg md:text-2xl font-semibold text-gray-900 leading-snug mb-2">
            {SIGNUP_HEADING_LINE1}
            <br /> {SIGNUP_HEADING_LINE2}
          </h3>
          <span className="text-sm text-gray-500">{SIGNUP_DESCRIPTION}</span>

          <form
            className="mt-6 md:mt-8 space-y-4 md:space-y-5"
            onSubmit={handleSubmit}
          >
            {/* {errorMsg && <div className="text-sm text-red-600">{errorMsg}</div>}
            {successMsg && (
              <div className="text-sm text-green-600">{successMsg}</div>
            )} */}

            <div>
              <label className="text-sm text-gray-700 font-medium mb-1 block">
                {SIGNUP_LABEL_FIRSTNAME} <span className="text-red-800">*</span>
              </label>
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                type="text"
                placeholder={SIGNUP_PLACEHOLDER_FIRSTNAME}
                className="w-full rounded-full border border-gray-800 px-3 md:px-4 py-2 text-sm md:py-2.5 outline-none focus:ring-2 focus:ring-orange-400"
              />
               {errors.firstName && (
              <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
            )}
            </div>

            <div>
              <label className="text-sm text-gray-700 font-medium mb-1 block">
                {SIGNUP_LABEL_LASTNAME} <span className="text-red-800">*</span>
              </label>
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                type="text"
                placeholder={SIGNUP_PLACEHOLDER_LASTNAME}
                className="w-full rounded-full border border-gray-800 px-3 md:px-4 py-2 text-sm md:py-2.5 outline-none focus:ring-2 focus:ring-orange-400"
              />
               {errors.lastName && (
              <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
            )}
            </div>

            <div>
              <label className="text-sm text-gray-700 font-medium mb-1 block">
                {SIGNUP_LABEL_EMAIL} <span className="text-red-800">*</span>
              </label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                placeholder={SIGNUP_PLACEHOLDER_EMAIL}
                className="w-full rounded-full border border-gray-800 px-3 md:px-4 py-2 text-sm md:py-2.5 outline-none focus:ring-2 focus:ring-orange-400"
              />
               {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
            </div>

            <div>
              <label className="text-sm text-gray-700 font-medium mb-1 block">
                {SIGNUP_LABEL_PASSWORD} <span className="text-red-800">*</span>
              </label>
              <input
                name="password"
                value={formData.password}
                onChange={handleChange}
                type="password"
                placeholder={SIGNUP_PLACEHOLDER_PASSWORD}
                className="w-full rounded-full border border-gray-800 px-3 md:px-4 py-2 text-sm md:py-2.5 outline-none focus:ring-2 focus:ring-orange-400"
              />
              {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password}</p>
            )}
            </div>

            <div>
              <label className="text-sm text-gray-700 font-medium mb-1 block">
                {SIGNUP_LABEL_PHONE} <span className="text-red-800">*</span>
              </label>

              <div className="flex items-center w-full rounded-full border border-gray-800 px-2 py-2">
                <select
                  name="countryCode"
                  className="bg-transparent outline-none text-sm px-2 cursor-pointer"
                  value={formData.countryCode}
                  onChange={handleChange}
                >
                  {COUNTRY_CODES.map((item, index) => (
                    <option key={index} value={item.code}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <span className="h-6 w-px bg-gray-300 mx-2"></span>
                <input
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  type="tel"
                  placeholder={SIGNUP_PLACEHOLDER_PHONE}
                  className="w-full bg-transparent outline-none text-sm px-1"
                />
                 {errors.mobileNumber && (
            <p className="mt-1 text-xs text-red-600">{errors.mobileNumber}</p>
          )}
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                name="acceptedTerms"
                checked={formData.acceptedTerms}
                onChange={handleChange}
                type="checkbox"
                className="h-4 w-4 md:h-5 md:w-5 appearance-none rounded-full border-2 border-blue-600 checked:bg-blue-600 checked:border-blue-600 cursor-pointer transition-all"
              />
              
              <span className="text-black font-semibold text-sm">
                {SIGNUP_LABEL_AGREE_PREFIX}{" "}
                <span className="text-black font-semibold">
                  {SIGNUP_LABEL_TERMS}
                </span>
              </span>
               {errors.acceptedTerms && (
            <p className="mt-1 text-xs text-red-600">{errors.acceptedTerms}</p>
          )}
            </div>

            <div className="mt-4 md:mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-700 text-white rounded-full px-3 md:px-4 py-2 text-sm md:py-2.5 font-semibold outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-60"
              >
                {isSubmitting ? "Creating..." : "Get Started"}
              </button>
            </div>
          </form>

          <div className="flex flex-col items-center gap-3 mt-6 md:mt-8">
            <p className="text-xs text-gray-500">{SIGNUP_SOCIAL_TEXT}</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                <Image src={LinkedIn} width={18} height={18} alt="LinkedIn" />
              </button>
              <button
                type="button"
                className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                <Image src={Google} width={18} height={18} alt="Google" />
              </button>
            </div>
          </div>

          <p className="mt-6 md:mt-8 text-xs text-gray-400 text-center">
            {SIGNUP_FOOTER}
          </p>
        </section>
      </div>
      <div className="hidden md:block md:w-1/2 relative">
        <Image
          src={Sign}
          alt="MoonDive background"
          fill
          priority
          className="object-cover"
        />
      </div>
    </div>
  );
}

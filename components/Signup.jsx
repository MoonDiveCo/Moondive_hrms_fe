"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Sign from "../public/signup/Sign.svg";
import Google from "../public/signup/Google.png";
import LinkedIn from "../public/signup/LinkedIn.png";
import logo from "../public/signup/logo.png";
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

const initialFormState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  mobileNumber: "",
  acceptedTerms: false,
  countryCode:"+91"
  
};

export default function Signup() {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    if (!values.firstName.trim()) newErrors.firstName = "First name is required";
    if (!values.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!values.email.trim()) newErrors.email = "Email is required";
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email.trim()))
      newErrors.email = "Enter a valid email address";

    if (!values.password) newErrors.password = "Password is required";
    else if (values.password.length < 6) newErrors.password = "Password must be at least 6 characters";

    if (!values.mobileNumber.trim()) newErrors.mobileNumber = "Phone number is required";
    else if (!/^\d{7,15}$/.test(values.mobileNumber.trim())) newErrors.mobileNumber = "Enter a valid phone number";

    if (!values.acceptedTerms) newErrors.acceptedTerms = "You must agree to the terms & conditions";

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
        countryCode:formData.countryCode.trim()
      };

      const response = await userService.register(payload);
      router.push(`/otp?email=${encodeURIComponent(payload.email)}`);
    } catch (error) {
      const message = error?.response?.data?.message || "Something went wrong. Please try again.";
      setErrors((prev) => ({ ...prev, api: message }));
    } finally {
      setIsSubmitting(false);
    }
  }

 return (
  <div className="min-h-screen flex flex-col md:flex-row bg-white">
    <div className="w-full md:w-[60%] flex items-center justify-center px-6 md:px-12 lg:px-16 xl:px-24 2xl:px-32 py-8 md:py-2">
      <section className="w-full max-w-lg">
      <div className="flex items-center gap-3 mb-4 lg:mb-[25px]">
          <Image src={logo} alt="Brand Logo" width={150} height={150} />
        </div>

        <h3 className=" font-semibold text-gray-900 leading-snug mb-2">
          {SIGNUP_HEADING_LINE1}
          <br /> {SIGNUP_HEADING_LINE2}
        </h3>

        <p className="text-sm text-gray-500 mb-2">{SIGNUP_DESCRIPTION}</p>

        <form
          className="space-y-6 md:space-y-3"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                className="w-full rounded-full px-3 py-2 text-sm outline-none border border-gray-800 focus:border-primary  transition-colors duration-200"
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.firstName}
                </p>
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
                className="w-full rounded-full px-3 py-2 text-sm outline-none border border-gray-800   focus:border-primary transition-colors duration-200"
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
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
                className="w-full rounded-full px-3 py-2 text-sm outline-none border border-gray-800 focus:border-primary  transition-colors duration-200"
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
                className="w-full rounded-full px-3 py-2 text-sm outline-none border border-gray-800 focus:border-primary  transition-colors duration-200"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-700 font-medium mb-1 block">
              {SIGNUP_LABEL_PHONE} <span className="text-red-800">*</span>
            </label>
            <div className="flex items-center w-full rounded-full border border-gray-800 px-2 py-2 focus-within:border-primary  transition-colors duration-200">
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

              <span className="h-6 w-px bg-gray-300 mx-2" />

              <input
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                type="tel"
                inputMode="numeric"
                placeholder={SIGNUP_PLACEHOLDER_PHONE}
                className="outline-none border-none bg-transparent flex-1 text-sm px-2"
              />
            </div>
            {errors.mobileNumber && (
              <p className="mt-1 text-xs text-red-600">
                {errors.mobileNumber}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="acceptedTerms"
              checked={formData.acceptedTerms}
              onChange={handleChange}
              className="h-4 w-4 md:h-5 md:w-5 rounded-full border-2 border-black cursor-pointer"
            />

            <label className="text-black font-semibold text-sm">
              {SIGNUP_LABEL_AGREE_PREFIX}{" "}
              <span className="text-black font-semibold">
                {SIGNUP_LABEL_TERMS}
              </span>
            </label>
          </div>
          {errors.acceptedTerms && (
            <p className="mt-1 text-xs text-red-600">
              {errors.acceptedTerms}
            </p>
          )}

          {errors.api && (
            <p className="text-sm text-red-600">{errors.api}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-white rounded-full px-4 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-60"
            >
              {isSubmitting ? "Creating..." : "Get Started"}
            </button>
          </div>

          <div className="flex flex-col items-center gap-3 mt-2">
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

          <p className="mt-4 text-xs text-gray-400 text-center">
            {SIGNUP_FOOTER}
          </p>
        </form>
      </section>
    </div>
    <div className="hidden md:block md:w-[40%] relative">
      <Image
        src={Sign}
        alt="illustration"
        fill
        className="object-cover"
        priority
      />
    </div>
  </div>
);

}

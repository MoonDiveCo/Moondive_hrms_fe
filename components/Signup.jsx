"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    agree: false,
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.password ||
      !form.phone
    ) {
      setErrorMsg("Please fill all required fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:2000/api/v1/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          mobileNumber: form.phone,
        }),
      });

      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { _raw: text };
      }

      if (!res.ok) {
        console.error("Server returned error:", res.status, data);
        setErrorMsg(
          data?.message ||
            data?.error ||
            data?._raw ||
            `Registration failed (${res.status})`
        );
        return;
      }
      setSuccessMsg(data?.message || "Registered successfully");
      const params = new URLSearchParams({ email: form.email });
      router.push(`/otp?${params.toString()}`);
    } catch (err) {
      console.error("Network or fetch error:", err);
      setErrorMsg("Network error or backend not running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row z-2 bg-white">
      <div className="bg-white w-full md:w-[58%] md:rounded-r-4xl flex justify-center items-center px-6 md:px-20 py-8 md:py-12">
        <section className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-6 md:mb-8">
            <div className="h-6 w-6 md:h-8 md:w-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-semibold text-sm md:text-base">
              M
            </div>
            <span className="font-semibold text-base md:text-lg text-gray-900">
              MoonDive
            </span>
          </div>

          <h3 className="text-lg md:text-2xl font-semibold text-gray-900 leading-snug mb-2">
            Welcome to MoonDive’s CRM.
            <br /> Sign Up to get started.
          </h3>
          <span className="text-sm text-gray-500">
            Enter your details to proceed further
          </span>

          <form className="mt-6 md:mt-8 space-y-4 md:space-y-5" onSubmit={handleSubmit}>
            {errorMsg && <div className="text-sm text-red-600">{errorMsg}</div>}
            {successMsg && (
              <div className="text-sm text-green-600">{successMsg}</div>
            )}

            <div>
              <label className="text-sm text-gray-700 font-medium mb-1 block">
                First Name <span className="text-red-800">*</span>
              </label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                type="text"
                placeholder="john..."
                className="w-full rounded-full border border-gray-800 px-3 md:px-4 py-2 text-sm md:py-2.5 outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="text-sm text-gray-700 font-medium mb-1 block">
                Last Name <span className="text-red-800">*</span>
              </label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                type="text"
                placeholder="Singh..."
                className="w-full rounded-full border border-gray-800 px-3 md:px-4 py-2 text-sm md:py-2.5 outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="text-sm text-gray-700 font-medium mb-1 block">
                Email <span className="text-red-800">*</span>
              </label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                placeholder="abc@gmail.com"
                className="w-full rounded-full border border-gray-800 px-3 md:px-4 py-2 text-sm md:py-2.5 outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="text-sm text-gray-700 font-medium mb-1 block">
                Password <span className="text-red-800">*</span>
              </label>
              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                type="password"
                placeholder="*******"
                className="w-full rounded-full border border-gray-800 px-3 md:px-4 py-2 text-sm md:py-2.5 outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="text-sm text-gray-700 font-medium mb-1 block">
                Phone Number <span className="text-red-800">*</span>
              </label>

              <div className="flex items-center w-full rounded-full border border-gray-800 px-2 py-2">
                {/* Country Code */}
                <select
                  name="countryCode"
                  className="bg-transparent outline-none text-sm px-2 cursor-pointer"
                  defaultValue="+91"
                >
                  <option value="+91">+91</option>
                  <option value="+1">+11</option>
                  <option value="+44">+44</option>
                  <option value="+61">+61</option>
                  <option value="+971">+971</option>
                </select>
                <span className="h-6 w-px bg-gray-300 mx-2"></span>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  type="tel"
                  placeholder="Enter your phone number"
                  className="w-full bg-transparent outline-none text-sm px-1"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                name="agree"
                checked={form.agree}
                onChange={handleChange}
                type="checkbox"
                className="h-4 w-4 md:h-5 md:w-5 appearance-none rounded-full border-2 border-blue-600 checked:bg-blue-600 checked:border-blue-600 cursor-pointer transition-all"
              />
              <span className="text-black font-semibold text-sm">
                I agree with{" "}
                <span className="text-black font-semibold">terms & conditions</span>
              </span>
            </div>

            <div className="mt-4 md:mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-700 text-white rounded-full px-3 md:px-4 py-2 text-sm md:py-2.5 font-semibold outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-60"
              >
                {loading ? "Creating..." : "Get Started"}
              </button>
            </div>
          </form>

          <div className="flex flex-col items-center gap-3 mt-6 md:mt-8">
            <p className="text-xs text-gray-500">Or sign in with</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                <Image src="/LinkedIn.png" width={18} height={18} alt="LinkedIn" />
              </button>
              <button
                type="button"
                className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                <Image src="/Google.png" width={18} height={18} alt="Google" />
              </button>
            </div>
          </div>

          <p className="mt-6 md:mt-8 text-xs text-gray-400 text-center">
            © 2025 MoonDive Pvt. Ltd. – MoonDive Private Limited, All Rights
            Reserved.
          </p>
        </section>
      </div>
      <div className="hidden md:block md:w-1/2 relative">
        <Image
          src="/signup/Sign.svg"
          alt="MoonDive background"
          fill
          priority
          className="object-cover"
        />
      </div>
    </div>
  );
}

"use client";
import React, { useContext, useState } from "react";
import Image from "next/image";
import logo from '../../public/Dashboard/MoondiveLogo.svg';
import { useNotifications } from "@/context/notificationcontext";

import {
  LOGIN_HEADING_LINE1,
  LOGIN_HEADING_EMAIL_SUB,
  LOGIN_DESCRIPTION,
  LOGIN_LABEL_EMAIL,
  LOGIN_PLACEHOLDER_EMAIL,
  LOGIN_LABEL_PASSWORD,
  LOGIN_PLACEHOLDER_PASSWORD,
  LOGIN_BTN_SIGNIN,
  LOGIN_BTN_LOADING,
  LOGIN_FORGOT_PASSWORD,
} from "../../text";
import { AuthContext } from "@/context/authContext";
import axios from "axios";
import { useRouter } from "next/navigation";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { toast } from "sonner";

export default function LoginForm({
  email,
  setEmail,
  setShowForgotModal,
  redirectTo,
  isInvited,
}) {
  const { login } = useContext(AuthContext);
  const { requestNotificationPermission } = useNotifications();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email?.trim()) {
      toast.error("Please enter your email.");
      return;
    }
    if (!isValidEmail(email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!password) {
      toast.error("Please enter your password.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      const payload = { email, password, module: redirectTo };
      const res = await axios.post("/user/login", payload, {
        withCredentials: true,
      });

      if (res?.data?.responseCode !== 200) {
        toast.error(res?.data?.responseMessage || "Login failed.");
        return;
      }

      // First set the auth context (this sets the cookie)
      login({
        user: res?.data?.result?.user,
        roles: res?.data?.result?.user?.userRole,
        permissions: res?.data?.result?.userPermissions,
      });

      // Request notification permission and save FCM token
      try {
        console.log("Requesting notification permission...");
        const permissionGranted = await requestNotificationPermission();
        if (permissionGranted) {
          console.log("✅ Notification permission granted and FCM token saved");
        } else {
          console.log("⚠️ Notification permission denied or not available");
        }
      } catch (fcmError) {
        console.error("FCM token error:", fcmError);
        // Don't block the login flow if FCM fails
      }

      toast.success("Login successful! Redirecting...");
      router.push(`/${redirectTo}/dashboard`);
      setPassword("");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Login failed. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-between bg-white">
      {/* Form and Logo Section (Fixed Width) */}
      <div className="flex ml-0 w-full vw-40">
        <div className="flex flex-col justify-between min-h-screen px-6 md:px-12 lg:px-16 xl:px-24 2xl:px-32 max-w-xl lg:max-w-2xl w-full mx-auto">
          <div className="pt-8">
            <Image src={logo} alt="Brand Logo" width={160} height={36} />
          </div>
          <main className="flex-1 flex items-center">
            <div className="w-full max-w-md">
              <h3 className="text-2xl md:text-3xl font-semibold leading-snug text-gray-900">
                {LOGIN_HEADING_LINE1}
                <br />
                <span>{LOGIN_HEADING_EMAIL_SUB}</span>
              </h3>
              <p className="mt-3 text-sm text-gray-500">{LOGIN_DESCRIPTION}</p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    {LOGIN_LABEL_EMAIL}
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    disabled={isInvited}
                    placeholder={LOGIN_PLACEHOLDER_EMAIL}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-full border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {LOGIN_LABEL_PASSWORD}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      placeholder={LOGIN_PLACEHOLDER_PASSWORD}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-full border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-orange-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 5.05c5.756 0 9.773 3.162 10.066 7.95M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243 4.243 3 3 0 004.243 4.243zm-8.486-8.486a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.638 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <button type="button" onClick={() => setShowForgotModal(true)} className="text-sm cursor-pointer text-blue-500 font-bold">
                    {LOGIN_FORGOT_PASSWORD}
                  </button>
                </div>
                <div className="flex justify-center items-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full items-center justify-center cursor-pointer rounded-full bg-primary text-white px-6 py-2.5 text-sm font-semibold disabled:opacity-60"
                  >
                    {loading ? LOGIN_BTN_LOADING : LOGIN_BTN_SIGNIN}
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>

      {/* Animation Section (Responsive) */}
      <div className="hidden md:block relative h-screen overflow-hidden w-full vw-40 ">
        <DotLottieReact
          src="https://lottie.host/0d523132-0551-482f-8138-2aa24a4fa2fa/vOeYpnfxVe.lottie"
          loop
          autoplay
        />
      </div>
    </div>
  );
}
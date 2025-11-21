"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import ForgotFlowModal from "./ForgotFlowModal";
import Login from "../public/signup/Sign.svg";
import Google from "../public/signup/Google.png";
import LinkedIn from "../public/signup/LinkedIn.png";
import {
  LOGIN_BRAND_LETTER,
  LOGIN_BRAND_NAME,
  LOGIN_HEADING_LINE1,
  LOGIN_HEADING_EMAIL_SUB,
  LOGIN_HEADING_PASSWORD_SUB,
  LOGIN_DESCRIPTION,
  LOGIN_LABEL_EMAIL,
  LOGIN_PLACEHOLDER_EMAIL,
  LOGIN_LABEL_PASSWORD,
  LOGIN_PLACEHOLDER_PASSWORD,
  LOGIN_SIGNIN_WITH,
  LOGIN_BTN_SIGNIN,
  LOGIN_NO_ACCOUNT,
  LOGIN_BTN_LOADING,
  CHANGEEMAIL,
  LOGIN_CHANGE_EMAIL,
  LOGIN_FORGOT_PASSWORD,
  LOGIN_FOOTER_TEXT,
  LOGIN_SIGNUP_LINK_TEXT,
} from "../text";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    if (!email.trim()) {
      setErrorMsg(data?.responseMessage);
      return;
    }
    setStep("password");
  };
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // if (!password) {
    //   setErrorMsg(data?.responseMessage);
    //   return;
    // }
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:2000/api/v1/user/login",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );
      const data = res.data;
      if (data.responseMessage===success) {
        setSuccessMsg(data?.responseMessage || "Logged in successfully");
        setTimeout(() => router.push("/dashboard"), 600);
      } else {
        const server = err?.response?.data.responseMessage;
        setErrorMsg(server);
      }
    } catch (err) {
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
    // setTimeout(() => router.push("/dashboard"), 600);
  };
  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMsg("Please enter email first.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setForgotLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:2000/api/v1/user/forgot-password",
        { email },
        { headers: { "Content-Type": "application/json" } }
      );

      const data = res.data;
      setSuccessMsg(data?.message || "Password reset link sent.");
    } catch (err) {
      console.error("Forgot password error:", err);
      const server = err?.response?.data;
      setErrorMsg(server?.message || "Something went wrong");
    } finally {
      setForgotLoading(false);
    }
  };
  const handleEditEmail = () => {
    setErrorMsg("");
    setSuccessMsg("");
    setStep("email");
    setPassword("");
  };
  return (
    <div className="min-h-screen flex bg-white">
      <div className="w-full md:w-1/2 flex flex-col">
        <main className="flex-1 flex items-center justify-center px-6 md:px-16">
          <div className="w-full max-w-md">
            <div className="flex items-center gap-2 mb-8">
              <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-semibold">
                {LOGIN_BRAND_LETTER}
              </div>
              <span className="font-semibold text-lg text-gray-900">
                {LOGIN_BRAND_NAME}
              </span>
            </div>

            <h3 className="text-2xl md:text-3xl font-semibold leading-snug text-gray-900">
              {LOGIN_HEADING_LINE1}
              <br />
              <span>
                {step === "email"
                  ? LOGIN_HEADING_EMAIL_SUB
                  : LOGIN_HEADING_PASSWORD_SUB}
              </span>
            </h3>

            <p className="mt-3 text-sm text-gray-500">{LOGIN_DESCRIPTION}</p>

            {/* Messages */}
            {errorMsg && (
              <div className="mt-3 text-sm text-red-600">{errorMsg}</div>
            )}
            {successMsg && (
              <div className="mt-3 text-sm text-green-600">{successMsg}</div>
            )}

            {/* STEP 1: EMAIL */}
            {step === "email" ? (
              <form onSubmit={handleEmailSubmit} className="mt-8 space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {LOGIN_LABEL_EMAIL}
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    placeholder={LOGIN_PLACEHOLDER_EMAIL}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-full border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{LOGIN_SIGNIN_WITH}</span>

                  <button className="flex items-center justify-center border border-gray-300 rounded-md p-1.5">
                    <Image
                      src={LinkedIn}
                      width={18}
                      height={18}
                      alt="LinkedIn"
                    />
                  </button>

                  <button className="flex items-center justify-center border border-gray-300 rounded-md p-1.5">
                    <Image src={Google} width={18} height={18} alt="Google" />
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2.5"
                >
                  {LOGIN_BTN_SIGNIN}
                </button>
                <div className="text-sm mt-4">
                  {LOGIN_NO_ACCOUNT}
                  <span
                    onClick={() => router.push("/signup")}
                    className="text-blue-600 font-semibold cursor-pointer"
                  >
                    {LOGIN_SIGNUP_LINK_TEXT}
                  </span>
                </div>
              </form>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="mt-8 space-y-4">
                <div className="flex items-center font-bold gap-4">
                  <div className="text-md text-gray-700">{email}</div>
                  <button
                    type="button"
                    onClick={handleEditEmail}
                    className="text-sm text-blue-500"
                  >
                    {CHANGEEMAIL}
                  </button>
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
                      className="w-full rounded-full border border-gray-300 px-4 py-2.5 text-sm outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    // store email so /forgot page can prefill it
                    if (email) sessionStorage.setItem("forgotEmail", email);
                    router.push("/forgot"); // navigate to forgot page
                  }}
                  className="text-sm text-blue-500 font-bold"
                >
                  {LOGIN_FORGOT_PASSWORD}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-amber-700 text-white px-6 py-2.5 text-sm font-semibold disabled:opacity-60"
                >
                  {loading ? LOGIN_BTN_LOADING : LOGIN_BTN_SIGNIN}
                </button>
              </form>
            )}
          </div>
        </main>
      </div>
      <div className="hidden md:block md:w-1/2 relative ">
        <Image src={Login} alt="bg" fill priority className="object-cover" />
      </div>
      {showForgotModal && (
        <ForgotFlowModal
          initialEmail={email}
          onClose={() => setShowForgotModal(false)}
        />
      )}
    </div>
  );
}

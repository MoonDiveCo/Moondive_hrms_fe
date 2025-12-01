"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import ForgotFlowModal from "./ForgotModal";
import Login from "../../public/signup/Sign.svg";
import Google from "../../public/signup/Google.png";
import LinkedIn from "../../public/signup/LinkedIn.png";
import logo from "../../public/signup/logo.png";
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
} from "../../text";

export default function LoginForm({ email, setEmail, setShowForgotModal}){
  const router = useRouter();
  const [step, setStep] = useState("email");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email.trim()) {
      setErrorMsg("Please enter your email.");
      return;
    }

    if (!isValidEmail(email.trim())) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setStep("password");
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!password) {
      setErrorMsg("Please enter your password.");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await userService.login({ email, password });
      if (res?.data?.responseCode !== 202) {
        setErrorMsg(res.data.responseMessage);
        return;
      }

      dispatch(login(res.result));
      console.log(res?.data);
      if (res?.data) {
      }
      setPassword("");
    } catch (err) {
      setErrorMsg(
        server?.message ||
          "Login failed. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };
  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMsg("Please enter email first.");
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMsg("Please enter a valid email.");
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
      setErrorMsg("Something went wrong");
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
    <div className="w-full md:w-[60%] flex">
      <div
        className="
          flex flex-col justify-between min-h-screen
          px-6 md:px-12 lg:px-16 xl:px-24 2xl:px-32
          max-w-xl lg:max-w-2xl w-full mx-auto
        "
      >
        <div className="pt-8">
          <Image src={logo} alt="Brand Logo" width={150} height={150} />
        </div>
        <main className="flex-1 flex items-center">
          <div className="w-full max-w-md">
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
            {errorMsg && (
              <div className="mt-3 text-sm text-red-600">{errorMsg}</div>
            )}
            {successMsg && (
              <div className="mt-3 text-sm text-green-600">{successMsg}</div>
            )}
            {step === "email" ? (
              <form onSubmit={handleEmailSubmit} className="mt-8 space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-1"
                  >
                    {LOGIN_LABEL_EMAIL}
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    placeholder={LOGIN_PLACEHOLDER_EMAIL}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-full border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange-400  focus:ring-orange-400"
                  />
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <p>{LOGIN_SIGNIN_WITH}</p>

                  <button
                    type="button"
                    className="flex cursor-pointer items-center justify-center border border-gray-300 rounded-md p-1.5"
                  >
                    <Image
                      src={LinkedIn}
                      width={18}
                      height={18}
                      alt="LinkedIn"
                    />
                  </button>

                  <button
                    type="button"
                    className="flex cursor-pointer items-center justify-center border border-gray-300 rounded-md p-1.5"
                  >
                    <Image src={Google} width={18} height={18} alt="Google" />
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 cursor-pointer rounded-full bg-primary hover:bg-primary text-white text-sm font-medium py-2.5"
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
              // PASSWORD STEP
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
                      className="w-full rounded-full border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-orange-400  focus:ring-orange-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600 cursor-pointer"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-sm cursor-pointer text-blue-500 font-bold"
                >
                  {LOGIN_FORGOT_PASSWORD}
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full cursor-pointer rounded-full bg-primary text-white px-6 py-2.5 text-sm font-semibold disabled:opacity-60"
                >
                  {loading ? LOGIN_BTN_LOADING : LOGIN_BTN_SIGNIN}
                </button>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
    <div className="hidden md:block md:w-[40%] relative">
      <Image src={Login} alt="bg" fill priority className="object-cover" />
    </div>
  </div>
);

}

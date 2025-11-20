"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ForgotFlowModal from "./ForgotFlowModal";
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
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    if (!email.trim()) {
      setErrorMsg("Please enter your email.");
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
    setLoading(true);
    try {
      const res = await fetch("http://localhost:2000/api/v1/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { _raw: text };
      }
      if (!res.ok) {
        setErrorMsg(
          data?.message || data?._raw || `Login failed (${res.status})`
        );
        return;
      }
      setSuccessMsg(data?.message || "Logged in successfully");
      setTimeout(() => router.push("/dashboard"), 600);
    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg("Network error. Is backend running?");
    } finally {
      setLoading(false);
    }
  };
  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMsg("Please enter email first (in the email step).");
      return;
    }
    setErrorMsg("");
    setSuccessMsg("");
    setForgotLoading(true);
    try {
      const res = await fetch(
        "http://localhost:2000/api/v1/user/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { _raw: text };
      }

      if (!res.ok) {
        setErrorMsg(data?.message || data?._raw || `Failed (${res.status})`);
        return;
      }

      setSuccessMsg(data?.message || "Password reset link sent to your email.");
    } catch (err) {
      console.error("Forgot password error:", err);
      setErrorMsg("Network error. Is backend running?");
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
                M
              </div>
              <span className="font-semibold text-lg text-gray-900">
                MoonDive
              </span>
            </div>

            <h3 className="text-2xl md:text-3xl font-semibold leading-snug text-gray-900">
              Welcome to MoonDive&apos;s CRM.
              <br />
              <span>
                {step === "email"
                  ? "Sign in to continue."
                  : "Enter your password."}
              </span>
            </h3>

            <p className="mt-3 text-sm text-gray-500">
              Enter your details to proceed further
            </p>

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
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-full border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                    placeholder="Enter your email"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Or sign in with</span>
                  <button
                    type="button"
                    className="flex items-center justify-center border border-gray-300 rounded-md p-1.5 hover:bg-gray-100 transition"
                  >
                    <Image
                      src="/LinkedIn.png"
                      width={18}
                      height={18}
                      alt="LinkedIn"
                    />
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center border border-gray-300 rounded-md p-1.5 hover:bg-gray-100 transition"
                  >
                    <Image
                      src="/Google.png"
                      width={18}
                      height={18}
                      alt="Google"
                    />
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2.5 transition disabled:opacity-60"
                >
                  Sign In
                </button>
              </form>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="mt-8 space-y-4">
                <div>
                  <div className="flex items-center font-bold gap-4">
                    <div className="text-md text-gray-700">{email}</div>
                    <button
                      type="button"
                      onClick={handleEditEmail}
                      className="text-sm text-blue-500"
                    >
                      Change
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full rounded-full border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    // save email if user typed it so we can prefill on the forgot page
                    if (email) sessionStorage.setItem("forgotEmail", email);
                    router.push("/forgot");
                  }}
                  className="text-sm text-blue-500 font-bold"
                >
                  Forgot password?
                </button>

                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full bg-amber-700 text-white px-6 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-60"
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>

        <footer className="px-8 pb-6 text-[10px] md:text-xs text-gray-400 text-center">
          © 2025 Moondive Pvt. Ltd. – MoonDive Private Limited, All Rights
          Reserved.
        </footer>
      </div>

      <div className="hidden md:block md:w-1/2 relative ">
        <Image
          src="/signup/Sign.svg"
          alt="bg"
          fill
          priority
          className="object-cover"
        />
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

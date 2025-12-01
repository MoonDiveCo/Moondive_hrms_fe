"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/axiosClient";
const OTP_LEN = 6;
const RESEND_COOLDOWN = 60;

export default function ForgotModal({ email, onClose, setEmail }) {
  const router = useRouter();

  const [pageMsg, setPageMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [step, setStep] = useState("enter");
  const [otp, setOtp] = useState(new Array(OTP_LEN).fill(""));
  const otpRefs = useRef([]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef(null);

  useEffect(
    () => () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    },
    []
  );

  function startCooldown() {
    setCooldown(RESEND_COOLDOWN);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(cooldownRef.current);
          cooldownRef.current = null;
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }

  async function handleSendOtp(e) {
    e?.preventDefault();
    setPageMsg("");
    setModalMsg("");

    if (!validateEmailOrShow()) return;
    setSending(true);
    try {
      const res = await apiClient.put("user/sendForgot-PasswordOtp", { email });

      const msg =
        res?.data?.responseMessage || res?.data?.message || "OTP sent";
      setPageMsg(msg);
      setStep("verify");
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
      startCooldown();
    } catch (err) {
      console.error("sendOtp error:", err);
      const server = err?.response?.data;
      setPageMsg(
        server?.responseMessage || server?.message || "Failed to send OTP."
      );
    } finally {
      setSending(false);
    }
  }

  function isValidEmail(value) {
    return /^\S+@\S+\.\S+$/.test(String(value || "").trim());
  }

  function validateEmailOrShow() {
    if (!email || !String(email).trim()) {
      setPageMsg("Please enter your email.");
      return false;
    }
    if (!isValidEmail(email)) {
      setPageMsg("Please enter a valid email address.");
      return false;
    }
    setPageMsg("");
    return true;
  }

  function setOtpDigit(idx, val) {
    const d = val.replace(/\D/g, "").slice(-1);
    setOtp((p) => {
      const n = [...p];
      n[idx] = d;
      return n;
    });
    if (d && idx < OTP_LEN - 1) otpRefs.current[idx + 1]?.focus();
  }

  function handleOtpKeyDown(idx, e) {
    const k = e.key;
    if (k === "Backspace") {
      if (otp[idx]) {
        e.preventDefault();
        setOtp((p) => {
          const n = [...p];
          n[idx] = "";
          return n;
        });
        return;
      }
      if (idx > 0) {
        e.preventDefault();
        otpRefs.current[idx - 1]?.focus();
      }
    } else if (k === "ArrowLeft" && idx > 0) {
      e.preventDefault();
      otpRefs.current[idx - 1]?.focus();
    } else if (k === "ArrowRight" && idx < OTP_LEN - 1) {
      e.preventDefault();
      otpRefs.current[idx + 1]?.focus();
    }
  }

  async function handleVerifyOtp(e) {
    e?.preventDefault();
    setModalMsg("");
    const code = otp.join("");

    if (code.length !== OTP_LEN) {
      setModalMsg("Enter full OTP.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post("user/verifyotp", { email, otp });
      const data = res.data ?? {};
      const msg = data.responseMessage || data.message || "";
      if (data.responseCode === 200 || data.responseCode === "200") {
        setOtp(new Array(OTP_LEN).fill(""));
        setModalMsg("");
        setPageMsg("");
        setStep("reset");
      } else {
        setModalMsg(msg || "OTP verification failed.");
      }
    } catch (err) {
      console.error("verifyOtp error:", err);
      const server = err?.response?.data;
      setModalMsg(
        server?.responseMessage || server?.message || "OTP verify failed."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    if (cooldown > 0) return;
    setPageMsg("");
    try {
      const res = await apiClient.post("user/resendotp", { email });
      const msg =
        res?.data?.responseMessage || res?.data?.message || "OTP resent";
      setPageMsg(msg);
      startCooldown();
      setOtp(new Array(OTP_LEN).fill(""));
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch (err) {
      console.error("resendOtp error:", err);
      const server = err?.response?.data;
      setPageMsg(
        server?.responseMessage || server?.message || "Resend failed."
      );
    }
  }

  async function handleResetPassword(e) {
    e?.preventDefault();
    console.log("🔁 handleResetPassword called");

    setModalMsg("");
    if (!password || password.length < 6) {
      console.log("❌ password too short");
      setModalMsg("Password must be at least 6 chars.");
      return;
    }
    if (password !== confirm) {
      console.log("❌ passwords do not match");
      setModalMsg("Passwords do not match.");
      return;
    }

    const emailToUse = sessionStorage.getItem("forgotEmail") || email;
    console.log("Using email for reset:", emailToUse);

    setLoading(true);
    try {
      const res = await apiClient.put("user/forgot-password", {
      email,
       confirmNewPassword:confirm,
      newPassword:password
    });
      console.log("✅ resetPassword response", res.data);

      const msg =
        res?.data?.responseMessage ||
        res?.data?.message ||
        "Password reset successful";

      setModalMsg(msg);
      if (onClose) onClose();
      router.push("/login?reset=success");
    } catch (err) {
      console.error("resetPassword error:", err);
      const server = err?.response?.data;
      setModalMsg(
        server?.responseMessage || server?.message || "Reset failed."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleOtpPaste(e) {
    e.preventDefault();
    const paste =
      (e.clipboardData || window.clipboardData).getData("text") || "";
    const digits = paste.replace(/\D/g, "").slice(0, OTP_LEN).split("");
    if (!digits.length) return;
    setOtp((prev) => {
      const next = [...prev];
      for (let i = 0; i < next.length && i < digits.length; i++)
        next[i] = digits[i];
      return next;
    });
    setTimeout(() => {
      const firstEmpty = otpRefs.current.findIndex((el) => !el?.value);
      otpRefs.current[Math.max(0, firstEmpty)]?.focus();
    }, 0);
  }

  function closeAll() {
    if (onClose) onClose();
  }

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50 p-4 overflow-hidden">
      <div className="bg-white rounded-lg w-full max-w-md border border-gray-200 shadow-lg">
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900">
            Forgot password
          </h3>
          <button
            onClick={closeAll}
            className="text-sm cursor-pointer text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
        {(modalMsg || pageMsg) && (
          <div className="px-6 mb-2">
            <div className="text-sm text-red-600">{modalMsg || pageMsg}</div>
          </div>
        )}
        {step === "enter" && (
          <div className="px-6 pb-6">
            <p className="text-sm text-gray-600 mb-4">
              Enter your email and we&apos;ll send a verification code.
            </p>
            <form onSubmit={handleSendOtp} className="space-y-3">
              <input
                className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none  focus-within:border-primary "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                type="email"
              />
              <button
                className="w-full cursor-pointer px-4 py-2 bg-primary mt-4 text-white rounded-full text-sm font-semibold disabled:opacity-60 hover:bg-primary transition-colors"
                disabled={sending}
              >
                {sending ? "Sending..." : "Send code"}
              </button>
            </form>
          </div>
        )}
        {step === "verify" && (
          <div className="px-6 pb-6">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">We sent a code to</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {sessionStorage.getItem("forgotEmail") || email}
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} onPaste={handleOtpPaste}>
              <label className="text-sm text-gray-700 font-medium mb-3 block text-center">
                Enter 6-digit code
              </label>

              <div className="flex justify-between gap-2 mb-4">
                {otp.map((d, i) => {
                  const isFilled = d !== "";

                  return (
                    <input
                      key={i}
                      ref={(el) => (otpRefs.current[i] = el)}
                      value={d}
                      onChange={(e) => setOtpDigit(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      inputMode="numeric"
                      maxLength={1}
                      aria-label={`OTP ${i + 1}`}
                      className={`w-12 h-12 text-center rounded-full text-lg font-semibold border-2 outline-none transition-all
                      ${isFilled ? "border-primary" : "border-gray-300"}
                      focus:border-primary`}
                    />
                  );
                })}
              </div>

              <div className="flex gap-2 mb-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 cursor-pointer bg-primary text-white rounded-full text-sm font-semibold disabled:opacity-60 hover:bg-primary transition-colors"
                >
                  {loading ? "Verifying..." : "Verify"}
                </button>
              </div>
              <div className="mt-2 flex items-center  text-xs text-gray-600">
                <div>Didn&apos;t receive it?</div>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={cooldown > 0}
                  className="text-amber-700 cursor-pointer font-semibold hover:text-amber-800  disabled:opacity-60"
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                </button>
              </div>
            </form>
          </div>
        )}
        {step === "reset" && (
          <div className="px-6 pb-6">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">Create a new password</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {sessionStorage.getItem("forgotEmail")}
              </p>
            </div>
            <form onSubmit={handleResetPassword}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                className="w-full border border-gray-300 rounded-full px-4 py-3 mb-2 text-sm 
             focus:outline-none focus:border-primary focus:ring-0"
              />
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm password"
                className="w-full border border-gray-300 rounded-full px-4 py-3 mb-4 text-sm 
             focus:outline-none focus:border-primary focus:ring-0"
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="  flex-1 px-4 py-3 cursor-pointer
  bg-primary 
  text-white 
  rounded-full 
  text-sm font-semibold 
  disabled:opacity-60 
  hover:bg-[#e96f2c] 
  transition-colors"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

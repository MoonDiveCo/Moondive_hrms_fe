"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

/**
 * ForgotFlowModal
 * Props:
 *  - initialEmail (optional) : string to prefill
 *  - onClose(): called when user cancels or flow ends
 *
 * Backend endpoints used (adjust as needed):
 *  POST /api/v1/user/forgot-password         -> body { email }            (sends OTP)
 *  POST /api/v1/user/verify-forgot-otp      -> body { email, otp }       (returns { resetToken })
 *  POST /api/v1/user/reset-password         -> body { email, resetToken, password }
 */

const OTP_LEN = 6;
const RESEND_COOLDOWN = 60;

// Optional: set a baseURL for axios so calls are shorter.
// You can remove or change this if you prefer full URLs.
// axios.defaults.baseURL = "http://localhost:2000";

export default function ForgotFlowModal({ initialEmail = "", onClose }) {
  const router = useRouter();

  // page-level
  const [email, setEmail] = useState(initialEmail);
  const [pageMsg, setPageMsg] = useState("");
  const [sending, setSending] = useState(false);

  // modal/step control: "enter" -> "verify" -> "reset"
  const [step, setStep] = useState("enter");

  // OTP state
  const [otp, setOtp] = useState(new Array(OTP_LEN).fill(""));
  const otpRefs = useRef([]);

  // reset password
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalMsg, setModalMsg] = useState("");

  // resend cooldown
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef(null);
  useEffect(() => () => { if (cooldownRef.current) clearInterval(cooldownRef.current); }, []);

  function startCooldown() {
    setCooldown(RESEND_COOLDOWN);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(cooldownRef.current); cooldownRef.current = null; return 0; }
        return c - 1;
      });
    }, 1000);
  }

  // 1. Send OTP
  async function handleSendOtp(e) {
    e?.preventDefault();
    setPageMsg("");
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) { setPageMsg("Please enter a valid email."); return; }

    setSending(true);
    try {
      const res = await axios.post("http://localhost:2000/api/v1/user/forgot-password", { email });
      const data = res.data ?? {};
      // success
      sessionStorage.setItem("forgotEmail", email);
      setStep("verify");
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
      startCooldown();
    } catch (err) {
      console.error(err);
      const server = err?.response?.data;
      setPageMsg(server?.message || server?._raw || "Failed to send OTP.");
    } finally {
      setSending(false);
    }
  }

  // OTP handlers
  function setOtpDigit(idx, val) {
    const d = val.replace(/\D/g, "").slice(-1);
    setOtp((p) => { const n = [...p]; n[idx] = d; return n; });
    if (d && idx < OTP_LEN - 1) otpRefs.current[idx + 1]?.focus();
  }

  function handleOtpKeyDown(idx, e) {
    const k = e.key;
    if (k === "Backspace") {
      if (otp[idx]) {
        e.preventDefault();
        setOtp((p) => { const n = [...p]; n[idx] = ""; return n; });
        return;
      }
      if (idx > 0) {
        e.preventDefault();
        otpRefs.current[idx - 1]?.focus();
      }
    } else if (k === "ArrowLeft" && idx > 0) {
      e.preventDefault(); otpRefs.current[idx - 1]?.focus();
    } else if (k === "ArrowRight" && idx < OTP_LEN - 1) {
      e.preventDefault(); otpRefs.current[idx + 1]?.focus();
    }
  }

  async function handleVerifyOtp(e) {
    e?.preventDefault();
    setModalMsg("");
    const code = otp.join("");
    if (code.length !== OTP_LEN) { setModalMsg("Enter full OTP."); return; }

    setLoading(true);
    try {
      const storedEmail = sessionStorage.getItem("forgotEmail") || email;
      const res = await axios.post("http://localhost:2000/api/v1/user/verify-forgot-otp", { email: storedEmail, otp: code });
      const data = res.data ?? {};

      const resetToken = data?.resetToken;
      if (!resetToken) { setModalMsg("Reset token missing from server."); return; }

      sessionStorage.setItem("resetToken", resetToken);
      setOtp(new Array(OTP_LEN).fill(""));
      setShowResetModal();
    } catch (err) {
      console.error(err);
      const server = err?.response?.data;
      setModalMsg(server?.message || server?._raw || "OTP verify failed.");
    } finally {
      setLoading(false);
    }
  }

  function setShowResetModal() { setStep("reset"); setTimeout(() => { /* focus password if desired */ }, 50); }

  // resend OTP
  async function handleResendOtp() {
    if (cooldown > 0) return;
    setPageMsg("");
    try {
      const storedEmail = sessionStorage.getItem("forgotEmail") || email;
      const res = await axios.post("http://localhost:2000/api/v1/user/forgot-password", { email: storedEmail });
      // success
      startCooldown();
      setPageMsg("OTP resent.");
    } catch (err) {
      console.error(err);
      const server = err?.response?.data;
      setPageMsg(server?.message || server?._raw || "Resend failed.");
    }
  }

  // reset password
  async function handleResetPassword(e) {
    e?.preventDefault();
    setModalMsg("");
    if (!password || password.length < 6) { setModalMsg("Password must be at least 6 chars."); return; }
    if (password !== confirm) { setModalMsg("Passwords do not match."); return; }

    setLoading(true);
    try {
      const storedEmail = sessionStorage.getItem("forgotEmail");
      const resetToken = sessionStorage.getItem("resetToken");
      if (!storedEmail || !resetToken) { setModalMsg("Session expired. Start again."); return; }

      const res = await axios.post("http://localhost:2000/api/v1/user/reset-password", { email: storedEmail, resetToken, password });
      // success: clear session storage and close + redirect
      sessionStorage.removeItem("forgotEmail");
      sessionStorage.removeItem("resetToken");
      if (onClose) onClose();
      router.push("/login?reset=success");
    } catch (err) {
      console.error(err);
      const server = err?.response?.data;
      setModalMsg(server?.message || server?._raw || "Reset failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleOtpPaste(e) {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData("text") || "";
    const digits = paste.replace(/\D/g, "").slice(0, OTP_LEN).split("");
    if (!digits.length) return;
    setOtp((prev) => {
      const next = [...prev];
      for (let i = 0; i < next.length && i < digits.length; i++) next[i] = digits[i];
      return next;
    });
    setTimeout(() => {
      const firstEmpty = otpRefs.current.findIndex((el) => !el?.value);
      otpRefs.current[Math.max(0, firstEmpty)]?.focus();
    }, 0);
  }

  // small UI helpers
  function closeAll() {
    sessionStorage.removeItem("forgotEmail");
    sessionStorage.removeItem("resetToken");
    if (onClose) onClose();
  }

  return (
    <>
      {/* Overlay modal root */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-xl bg-white rounded-lg shadow p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Forgot password</h3>
            <button onClick={closeAll} className="text-sm text-gray-600">Close</button>
          </div>

          {/* Step: Enter email or show stored */}
          {step === "enter" && (
            <>
              <p className="text-sm text-gray-600 mb-3">Enter your email and we'll send a verification code.</p>
              {pageMsg && <div className="mb-3 text-sm text-red-600">{pageMsg}</div>}
              <form onSubmit={handleSendOtp} className="flex gap-3">
                <input
                  className="flex-1 border rounded px-3 py-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  type="email"
                />
                <button className="px-4 py-2 bg-orange-500 text-white rounded disabled:opacity-60" disabled={sending}>
                  {sending ? "Sending..." : "Send code"}
                </button>
              </form>
            </>
          )}

          {/* Step: Verify OTP */}
          {step === "verify" && (
            <>
              <p className="text-sm text-gray-600 mb-3">We sent a code to <strong>{sessionStorage.getItem("forgotEmail") || email}</strong></p>
              {modalMsg && <div className="mb-2 text-sm text-red-600">{modalMsg}</div>}
              <form onSubmit={handleVerifyOtp} onPaste={handleOtpPaste}>
                <div className="flex gap-2 mb-3">
                  {otp.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpRefs.current[i] = el)}
                      value={d}
                      onChange={(e) => setOtpDigit(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      inputMode="numeric"
                      maxLength={1}
                      aria-label={`OTP ${i + 1}`}
                      className="w-12 h-12 text-center border rounded"
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-orange-500 text-white rounded disabled:opacity-60">
                    {loading ? "Verifying..." : "Verify"}
                  </button>
                  <button type="button" onClick={() => { setStep("enter"); }} className="px-4 py-2 border rounded">Change email</button>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <div>Didn't receive it?</div>
                  <button type="button" onClick={handleResendOtp} disabled={cooldown > 0} className="text-blue-600 underline disabled:opacity-60">
                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend"}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Step: Reset password */}
          {step === "reset" && (
            <>
              <p className="text-sm text-gray-600 mb-3">Create a new password for <strong>{sessionStorage.getItem("forgotEmail")}</strong></p>
              {modalMsg && <div className="mb-2 text-sm text-red-600">{modalMsg}</div>}
              <form onSubmit={handleResetPassword}>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" className="w-full border rounded px-3 py-2 mb-2" />
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password" className="w-full border rounded px-3 py-2 mb-4" />

                <div className="flex gap-2">
                  <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-orange-500 text-white rounded disabled:opacity-60">
                    {loading ? "Saving..." : "Save new password"}
                  </button>
                  <button type="button" onClick={() => { setStep("enter"); }} className="px-4 py-2 border rounded">Cancel</button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}

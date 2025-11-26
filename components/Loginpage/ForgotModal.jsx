"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { userService } from "@/services/userService";
const OTP_LEN = 6;
const RESEND_COOLDOWN = 60;

export default function ForgotModal({ email, onClose,setEmail }) {
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
  async function handleSendOtp(e) {
    e?.preventDefault();
    setPageMsg("");
 setModalMsg("");

    if (!validateEmailOrShow()) return;
    setSending(true);
    try {
      const res = await userService.sendForgotOtp(email)
   
      const msg = res?.data?.responseMessage || res?.data?.message || "OTP sent";
      setPageMsg(msg);
      setStep("verify");
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
      startCooldown();
    } catch (err) {
      console.error("sendOtp error:", err);
      const server = err?.response?.data;
      setPageMsg(server?.responseMessage || server?.message || "Failed to send OTP.");
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
      const res = await  userService.verifyOtp(email, code);
      const data = res.data ?? {};
       const msg = data.responseMessage || data.message;

      if(!data.responseCode)
        {
  console.log(msg)
      setModalMsg(msg);
   setOtp(new Array(OTP_LEN).fill(""));
     setStep("reset") 
      }
       setModalMsg(msg);
      return
   
    } catch (err) {
      console.error("verifyOtp error:", err);
      const server = err?.response?.data;
      setModalMsg(server?.responseMessage || server?.message || "OTP verify failed.");
    } finally {
      setLoading(false);
    }
  }
  async function handleResendOtp() {
    if (cooldown > 0) return;
    setPageMsg("");
    try {
      const res = await userService.resendOtp(email);
      const msg = res?.data?.responseMessage || res?.data?.message || "OTP resent";
      setPageMsg(msg);
      startCooldown();
      setOtp(new Array(OTP_LEN).fill(""));
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch (err) {
      console.error("resendOtp error:", err);
      const server = err?.response?.data;
      setPageMsg(server?.responseMessage || server?.message || "Resend failed.");
    }
  }
  async function handleResetPassword(e) {
    e?.preventDefault();
    setModalMsg("");
    if (!password || password.length < 6) { setModalMsg("Password must be at least 6 chars."); return; }
    if (password !== confirm) { setModalMsg("Passwords do not match."); return; }

    setLoading(true);
    try {
      const res = await userService.resetPassword(email,confirm,password) 

      const msg = res?.data?.responseMessage || res?.data?.message || "Password reset successful";

      if (onClose) onClose();
      router.push("/login?reset=success");
    } catch (err) {
      console.error("resetPassword error:", err);
      const server = err?.response?.data;
      setModalMsg(server?.responseMessage || server?.message || "Reset failed.");
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

  function closeAll() {
    if (onClose) onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-xl bg-white rounded-lg shadow p-6">
        
          <div className="flex items-center  mb-3">
            <h3 className="text-lg items-center font-semibold">Forgot password</h3>
            <button onClick={closeAll} className="text-sm text-gray-600">Close</button>
          </div>
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

          {step === "verify" && (
            <>
              <p className="text-sm text-gray-600 mb-3">We sent a code to <strong>{sessionStorage.getItem("forgotEmail") || email}</strong></p>
              {modalMsg && <div className="mb-2 text-sm text-red-600">{modalMsg}</div>}
              <form onSubmit={handleVerifyOtp} onPaste={handleOtpPaste}>
                <div className="flex gap-2 mb-3 justify-center">
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
                  <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-orange-500 text-white rounded">
                    {loading ? "Verifying..." : "Verify"}
                  </button>
                  <button type="button" 
                  onClick={() => {setStep("enter")
                  setOtp(new Array(OTP_LEN).fill(""));
                  setModalMsg(""); 
                   setPageMsg("");                     
                }} className="px-4 py-2 border rounded">Change email</button>
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

          {step === "reset" && (
            <>
              <p className="text-sm text-gray-600 mb-3">Create a new password for <strong>{sessionStorage.getItem("forgotEmail")}</strong></p>
              {modalMsg && <div className="mb-2 text-sm text-red-600">{modalMsg}</div>}
              <form onSubmit={handleResetPassword}>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" className="w-full border rounded px-3 py-2 mb-2" />
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password" className="w-full border rounded px-3 py-2 mb-4" />
                <div className="flex gap-2">
                  <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-orange-500 text-white rounded">
                    {loading ? "Saving..." : "Save new password"}
                  </button>
                  <button type="button" onClick={() => setStep("enter")} className="px-4 py-2 border rounded">Cancel</button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}

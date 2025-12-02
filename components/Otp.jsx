"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import logo from "../public/signup/logo.png";
import {
  OTP_HEADING,
  OTP_DESCRIPTION,
  OTP_FOOTER,
  OTP_EMAIL_PREFIX,
} from "../text";
import axios from "axios";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;
export default function OtpPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const inputsRef = useRef([]);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const timerRef = useRef(null);
  useEffect(() => {
    setTimeout(() => inputsRef.current[0]?.focus(), 0);
    startCountdown();
    return () => clearCountdown();
  }, []);
  const startCountdown = () => {
    clearCountdown();
    setSecondsLeft(RESEND_SECONDS);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearCountdown();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const clearCountdown = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };
  const handleOtpKeyDown = (index, e) => {
    const key = e.key;
    if (key === "Backspace") {
      if (otp[index]) {
        e.preventDefault();
        setOtp((prev) => {
          const next = [...prev];
          next[index] = "";
          return next;
        });
        return;
      }
      if (index > 0) {
        e.preventDefault();
        setOtp((prev) => {
          const next = [...prev];
          next[index - 1] = "";
          return next;
        });
        inputsRef.current[index - 1]?.focus();
      }
    } else if (key === "ArrowLeft") {
      e.preventDefault();
      if (index > 0) inputsRef.current[index - 1]?.focus();
    } else if (key === "ArrowRight") {
      e.preventDefault();
      if (index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
    }
  };
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData("text");
    const digits = paste.replace(/\D/g, "").slice(0, OTP_LENGTH).split("");
    if (digits.length === 0) return;
    setOtp((prev) => {
      const next = [...prev];
      let i = 0;
      for (let idx = 0; idx < next.length && i < digits.length; idx++) {
        next[idx] = digits[i++];
      }
      setTimeout(() => {
        const firstEmpty = next.findIndex((d) => d === "");
        if (firstEmpty === -1) {
          inputsRef.current[next.length - 1]?.focus();
        } else {
          inputsRef.current[firstEmpty]?.focus();
        }
      }, 0);
      return next;
    });
  };
  const handleVerify = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) {
      setErrorMsg("Please enter full OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        "/user/verifyotp",
        {
          email,
          otp: code,
        }
      );
      if (res?.data.responseCode == 200) {
        setSuccessMsg(res?.data?.responseMessage || "OTP verified");
        router.push("/dashboard");
      }
      if (!res.ok) {
        setErrorMsg(res?.data?.responseMessage);
        return;
      }
    } catch (err) {
      console.error("Verify error:", err);
      setErrorMsg("Network error or backend not running.");
    } finally {
      setLoading(false);
    }
  };
  const handleResend = async () => {
    if (secondsLeft > 0) return;
    setErrorMsg("");
    setSuccessMsg("");
    setResendLoading(true);

    try {
      const res = await axios.post("/user/resendotp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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
          data?.message || data?._raw || `Resend failed (${res.status})`
        );
        return;
      }
      setSuccessMsg(data?.message || "OTP resent successfully");
      setOtp(new Array(OTP_LENGTH).fill(""));
      startCountdown();
      setTimeout(() => inputsRef.current[0]?.focus(), 100);
    } catch (err) {
      console.error("Resend error:", err);
      setErrorMsg("Network error or backend not running.");
    } finally {
      setResendLoading(false);
    }
  };
  const resendLabel = secondsLeft > 0 ? `Resend  ${secondsLeft}s` : "Resend";
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
          <div className="w-full max-w-md lg:max-w-lg">
            <h3 className="text-2xl md:text-3xl font-semibold leading-snug text-gray-900">
              {OTP_HEADING}
            </h3>
            <p className="mt-3 text-sm text-gray-500">{OTP_DESCRIPTION}</p>
            <p className="mt-3 text-sm text-gray-600">
              {OTP_EMAIL_PREFIX}{" "}
              <span className="font-semibold">{email}</span>
            </p>
            <form onSubmit={handleVerify} className="mt-6 space-y-6">
              <div className="flex gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    placeholder="0"
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    ref={(el) => (inputsRef.current[index] = el)}
                    className="
                      w-10 h-10
                      md:w-12 md:h-12
                      lg:w-14 lg:h-14
                      rounded-full border border-gray-300
                      text-center text-sm
                      outline-none
                      focus:border-orange-400
                    "
                  />
                ))}
              </div>
              <div className="mt-3 font-bold">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={secondsLeft > 0 || resendLoading}
                  className="text-sm px-3 py-1 disabled:opacity-50 cursor-pointer"
                >
                  {resendLoading ? "Sending..." : resendLabel}
                </button>
              </div>
              {errorMsg && (
                <div className="text-sm text-red-600">{errorMsg}</div>
              )}
              {successMsg && (
                <div className="text-sm text-green-600">{successMsg}</div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full md:w-[360px] lg:w-[400px]
                  cursor-pointer rounded-full
                  bg-primary hover:bg-[#e96f2c]
                  text-white text-sm font-medium
                  py-3
                  transition disabled:opacity-60
                "
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
            </form>
          </div>
        </main>
        <footer className="pb-6 text-[10px] md:text-xs text-gray-400 text-left cursor-pointer">
          {OTP_FOOTER}
        </footer>
      </div>
    </div>
    <div className="hidden md:block md:w-[40%] relative">
      <Image
        src="/signup/Sign.svg"
        alt="bg"
        fill
        priority
        className="object-cover"
      />
    </div>
  </div>
);

}

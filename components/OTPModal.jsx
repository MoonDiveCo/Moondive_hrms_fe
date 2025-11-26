"use client";
import React, { useState, useRef, useEffect } from "react";

export default function OTPModal({
  isOpen,
  onClose,
  email,
  onVerify,
  onResend,
  isVerifying,
}) {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputsRef = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setOtp(new Array(6).fill(""));
      setTimeout(() => {
        if (inputsRef.current[0]) {
          inputsRef.current[0].focus();
        }
      }, 100);
    }
  }, [isOpen]);

  const handleOTPChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      if (inputsRef.current[index + 1]) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  const handleOTPKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      if (inputsRef.current[index - 1]) {
        inputsRef.current[index - 1].focus();
      }
    }
  };

  const handleOTPPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const pastedArray = pastedData.split("");
    const newOtp = [...otp];

    pastedArray.forEach((value, index) => {
      if (index < 6) {
        newOtp[index] = value;
      }
    });

    setOtp(newOtp);

    const nextIndex = Math.min(pastedArray.length, 5);
    if (inputsRef.current[nextIndex]) {
      inputsRef.current[nextIndex].focus();
    }
  };

  const handleVerify = () => {
    const otpString = otp.join("");
    onVerify(email, otpString);
  };

  const isOtpComplete = otp.join("").length === 6;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50 p-4 overflow-hidden">
      <div className="bg-white rounded-lg w-full max-w-md border border-gray-200 shadow-lg">
        {/* Header */}
        <div className="text-center mb-6 p-6 pb-4">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
            Verify Your Email
          </h2>
          <p className="text-sm text-gray-600">We sent a 6-digit code to</p>
          <p className="text-sm font-semibold text-gray-900 mt-1">{email}</p>
        </div>

        {/* OTP Input */}
        <div className="mb-6 px-6">
          <label className="text-sm text-gray-700 font-medium mb-4 block text-center">
            Enter 6-digit code
          </label>

          <div className="flex justify-between gap-2 mb-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="\d"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOTPChange(e.target.value, index)}
                onKeyDown={(e) => handleOTPKeyDown(e, index)}
                onPaste={index === 0 ? handleOTPPaste : undefined}
                className="w-12 h-12 text-center text-lg font-semibold rounded-lg border-2 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
              />
            ))}
          </div>

          {/* Resend Code */}
          <div className="text-center">
            <button
              onClick={onResend}
              className="text-sm text-amber-700 font-semibold hover:text-amber-800 transition-colors"
            >
              Resend code
            </button>
          </div>
        </div>

        {/* Verify Button */}
        <div className="px-6 mb-6">
          <button
            onClick={handleVerify}
            disabled={!isOtpComplete || isVerifying}
            className="w-full bg-amber-700 text-white rounded-full px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-60 hover:bg-amber-800 transition-colors"
          >
            {isVerifying ? "Verifying..." : "Verify"}
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const OTP_LEN = 6;
const RESEND_COOLDOWN = 60;

export default function ForgotModal({ email, onClose, setEmail }) {
  const router = useRouter();

  // state
  const [pageMsg, setPageMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [step, setStep] = useState('enter'); // enter | verify | reset
  const [otp, setOtp] = useState(new Array(OTP_LEN).fill(''));
  const otpRefs = useRef([]);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const firstInputRef = useRef(null);

  useEffect(() => {
    // cleanup on unmount
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  useEffect(() => {
    // autofocus first input when step changes
    setTimeout(() => {
      if (step === 'enter') firstInputRef.current?.focus();
      if (step === 'verify') otpRefs.current[0]?.focus();
      if (step === 'reset') firstInputRef.current?.focus();
    }, 50);
  }, [step]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') closeAll();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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

  // ---------- API actions ----------
  async function handleSendOtp(e) {
    e?.preventDefault();
    setPageMsg('');
    setModalMsg('');
    if (!validateEmailOrShow()) return;
    setSending(true);
    try {
      const res = await axios.put('/user/sendForgot-PasswordOtp', { email });
      const msg =
        res?.data?.responseMessage || res?.data?.message || 'OTP sent';
      setPageMsg(msg);
      setStep('verify');
      startCooldown();
    } catch (err) {
      const server = err?.response?.data;
      setPageMsg(
        server?.responseMessage || server?.message || 'Failed to send OTP.'
      );
    } finally {
      setSending(false);
    }
  }

  async function handleVerifyOtp(e) {
    e?.preventDefault();
    setModalMsg('');
    const code = otp.join('');
    if (code.length !== OTP_LEN) {
      setModalMsg('Enter full OTP.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/user/verifyotp', { email, otp: code });
      const data = res.data ?? {};
      const success = data.responseCode === 200 || data.responseCode === '200';
      const msg = data.responseMessage || data.message || '';
      if (success) {
        setOtp(new Array(OTP_LEN).fill(''));
        setModalMsg('');
        setPageMsg('');
        setStep('reset');
      } else {
        setModalMsg(msg || 'OTP verification failed.');
      }
    } catch (err) {
      const server = err?.response?.data;
      setModalMsg(
        server?.responseMessage || server?.message || 'OTP verify failed.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    if (cooldown > 0) return;
    setPageMsg('');
    try {
      const res = await axios.post('/user/resendotp', { email });
      const msg =
        res?.data?.responseMessage || res?.data?.message || 'OTP resent';
      setPageMsg(msg);
      setOtp(new Array(OTP_LEN).fill(''));
      startCooldown();
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch (err) {
      const server = err?.response?.data;
      setPageMsg(
        server?.responseMessage || server?.message || 'Resend failed.'
      );
    }
  }

  async function handleResetPassword(e) {
    e?.preventDefault();
    setModalMsg('');
    if (!password || password.length < 6) {
      setModalMsg('Password must be at least 6 chars.');
      return;
    }
    if (password !== confirm) {
      setModalMsg('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.put('/user/forgot-password', {
        email,
        confirmNewPassword: confirm,
        newPassword: password,
      });
      const msg = res?.data?.responseMessage || 'Password reset successful';
      setModalMsg(msg);
      if (onClose) onClose();
      router.push('/hrms/login');
    } catch (err) {
      const server = err?.response?.data;
      setModalMsg(
        server?.responseMessage || server?.message || 'Reset failed.'
      );
    } finally {
      setLoading(false);
    }
  }

  // ---------- helpers ----------
  function isValidEmail(value) {
    return /^\S+@\S+\.\S+$/.test(String(value || '').trim());
  }
  function validateEmailOrShow() {
    if (!email || !String(email).trim()) {
      setPageMsg('Please enter your email.');
      return false;
    }
    if (!isValidEmail(email)) {
      setPageMsg('Please enter a valid email address.');
      return false;
    }
    setPageMsg('');
    return true;
  }

  function setOtpDigit(idx, val) {
    const d = val.replace(/\D/g, '').slice(-1);
    setOtp((p) => {
      const n = [...p];
      n[idx] = d;
      return n;
    });
    if (d && idx < OTP_LEN - 1) otpRefs.current[idx + 1]?.focus();
  }

  function handleOtpKeyDown(idx, e) {
    const k = e.key;
    if (k === 'Backspace') {
      if (otp[idx]) {
        e.preventDefault();
        setOtp((p) => {
          const n = [...p];
          n[idx] = '';
          return n;
        });
        return;
      }
      if (idx > 0) {
        e.preventDefault();
        otpRefs.current[idx - 1]?.focus();
      }
    } else if (k === 'ArrowLeft' && idx > 0) {
      e.preventDefault();
      otpRefs.current[idx - 1]?.focus();
    } else if (k === 'ArrowRight' && idx < OTP_LEN - 1) {
      e.preventDefault();
      otpRefs.current[idx + 1]?.focus();
    }
  }

  function handleOtpPaste(e) {
    e.preventDefault();
    const paste =
      (e.clipboardData || window.clipboardData).getData('text') || '';
    const digits = paste.replace(/\D/g, '').slice(0, OTP_LEN).split('');
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

  // ---------- small UI helpers ----------
  const headerStepLabel =
    step === 'enter'
      ? 'Enter email'
      : step === 'verify'
      ? 'Verify code'
      : 'Reset password';

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4'
      aria-modal='true'
      role='dialog'
    >
      {/* backdrop */}
      <div
        className='fixed inset-0 bg-black/40 backdrop-blur-sm'
        // onClick={closeAll}
        aria-hidden='true'
      />

      {/* modal */}
      <div className='relative z-10 w-full max-w-md mx-auto'>
        <div className='bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden'>
          {/* header */}
          <div className='flex items-center justify-between px-5 py-4 border-b'>
            <div>
              <h3 className='text-lg font-semibold text-gray-900'>
                Forgot password
              </h3>
              <div className='text-xs text-gray-500 mt-0.5'>
                {headerStepLabel}
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <button
                onClick={closeAll}
                aria-label='Close'
                className='rounded-md p-2  hover:bg-gray-100 transition-colors text-gray-600'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='w-4 h-4'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
            
                >
                  <path
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>
          </div>

          {(modalMsg || pageMsg) && (
            <div className='px-5 py-3'>
              <div
                className={`text-sm ${
                  modalMsg ? 'text-red-600' : 'text-amber-700'
                }`}
              >
                {modalMsg || pageMsg}
              </div>
            </div>
          )}

          <div className='px-5 py-6'>
            {step === 'enter' && (
              <>
                <p className='text-sm text-gray-600 mb-4'>
                  Enter your email and we'll send a verification code.
                </p>
                <form onSubmit={handleSendOtp} className='space-y-4'>
                  <div className='relative'>
                    <input
                      ref={firstInputRef}
                      className='w-full border border-gray-200 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder='you@example.com'
                      type='email'
                      aria-label='Email address'
                    />
                    <div className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='w-4 h-4'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                      >
                        <path
                          strokeWidth='2'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                        />
                      </svg>
                    </div>
                  </div>

                  <button
                    className='w-full px-4 py-3 bg-primary text-white rounded-full text-sm font-semibold disabled:opacity-60 hover:bg-primary transition-colors'
                    disabled={sending}
                    type='submit'
                  >
                    {sending ? 'Sending...' : 'Send code'}
                  </button>
                </form>
              </>
            )}

            {step === 'verify' && (
              <>
                <div className='text-center mb-4'>
                  <p className='text-sm text-gray-600'>We sent a code to</p>
                  <p className='text-sm font-semibold text-gray-900 mt-1'>
                    {sessionStorage.getItem('forgotEmail') || email}
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} onPaste={handleOtpPaste}>
                  <label className='text-sm text-gray-700 font-medium mb-3 block text-center'>
                    Enter 6-digit code
                  </label>

                  <div className='flex justify-center gap-3 mb-4'>
                    {otp.map((d, i) => {
                      const isFilled = d !== '';
                      return (
                        <input
                          key={i}
                          ref={(el) => (otpRefs.current[i] = el)}
                          value={d}
                          onChange={(e) => setOtpDigit(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          inputMode='numeric'
                          maxLength={1}
                          aria-label={`OTP ${i + 1}`}
                          className={`w-12 h-12 text-center rounded-full text-lg font-semibold border-2 outline-none transition-all ${
                            isFilled ? 'border-primary' : 'border-gray-200'
                          } focus:border-primary focus:shadow`}
                        />
                      );
                    })}
                  </div>

                  <div className='flex gap-3'>
                    <button
                      type='submit'
                      disabled={loading}
                      className='flex-1 px-4 py-3 bg-primary text-white rounded-full text-sm font-semibold disabled:opacity-60 hover:bg-primary transition-colors'
                    >
                      {loading ? 'Verifying...' : 'Verify'}
                    </button>

                    <button
                      type='button'
                      onClick={handleResendOtp}
                      disabled={cooldown > 0}
                      className='px-4 py-3 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60'
                    >
                      {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend'}
                    </button>
                  </div>

                  <div className='mt-3 text-center text-xs text-gray-500'>
                    Didn't receive it? Check spam or try again.
                  </div>
                </form>
              </>
            )}

            {step === 'reset' && (
              <>
                <div className='text-center mb-4'>
                  <p className='text-sm text-gray-600'>
                    Create a new password for
                  </p>
                  <p className='text-sm font-semibold text-gray-900 mt-1'>
                    {sessionStorage.getItem('forgotEmail') || email}
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className='space-y-3'>
                  <div className='relative'>
                    <input
                      ref={firstInputRef}
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder='New password'
                      className='w-full border border-gray-200 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400'
                      aria-label='New password'
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword((s) => !s)}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 p-1 rounded-md hover:bg-gray-100'
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                    >
                      {showPassword ? (
                        // eye-off
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='w-5 h-5'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                        >
                          <path
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M3 3l18 18M10.58 10.59a3 3 0 004.24 4.24'
                          />
                          <path
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M2.16 12.12A14.89 14.89 0 0112 6.5c4 0 7.36 1.86 9.84 5.62'
                          />
                        </svg>
                      ) : (
                        // eye
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='w-5 h-5'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                        >
                          <path
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M2.5 12s3.75-7.5 9.5-7.5S21.5 12 21.5 12s-3.75 7.5-9.5 7.5S2.5 12 2.5 12z'
                          />
                          <path
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                          />
                        </svg>
                      )}
                    </button>
                  </div>

                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder='Confirm password'
                    className='w-full border border-gray-200 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400'
                    aria-label='Confirm password'
                  />

                  <div className='flex gap-3'>
                    <button
                      type='submit'
                      disabled={loading}
                      className='flex-1 px-4 py-3 bg-primary text-white rounded-full text-sm font-semibold disabled:opacity-60 hover:bg-[#e96f2c] transition-colors'
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>

                    <button
                      type='button'
                      onClick={() => {
                        setStep('verify');
                      }}
                      className='px-4 py-3 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50'
                    >
                      Back
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
        {/* small footer spacing for mobile */}
      </div>
    </div>
  );
}

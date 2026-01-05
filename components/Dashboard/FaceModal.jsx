'use client';

import axios from 'axios';
import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

// ... permission functions unchanged ...

export default function FaceModal({
  onClose,
  onSuccess,
  actionType = 'checkIn', // ← Fixed typo: was "ctionType"
}) {
  const webcamRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cameraAllowed, setCameraAllowed] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(5);

  // ... all useEffects unchanged ...

  const captureAndSend = async () => {
    setLoading(true);

    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      toast.error('Failed to capture image');
      setLoading(false);
      return;
    }

    try {
      const blob = await fetch(imageSrc).then((res) => res.blob());
      const formData = new FormData();
      formData.append('image', blob, 'face.jpg'); // recommended: give filename

      await axios.post('/hrms/attendance/verify-face', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Only call onSuccess after successful verification
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Face verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 bg-black/40 flex items-center justify-center backdrop-blur-sm'>
      <div className='w-[420px] bg-white rounded-2xl shadow-xl px-8 py-8 text-center'>
        {/* Heading */}
        <h4 className='text-xl font-semibold text-gray-900'>
          Face Verification
        </h4>
        <p className='text-sm text-gray-500 mt-1'>
          Align your face within the frame
        </p>

        {/* Face Frame */}
        <div className='relative mt-10 flex items-center justify-center'>
          <div className='relative w-60 h-60 flex items-center justify-center'>
            {/* Gradient Background */}
            <div className='absolute inset-0 rounded-full bg-gradient from-orange-200 to-orange-100' />

            {/* SVG DOTTED RING */}
            <svg
              className='absolute inset-0'
              viewBox='0 0 200 200'
              width='100%'
              height='100%'
            >
              <circle
                cx='100'
                cy='100'
                r='90'
                fill='none'
                stroke='#F2994A'
                strokeWidth='2'
                strokeDasharray='10 14'
                strokeLinecap='round'
              />
            </svg>

            {/* Webcam / Face */}
            <div className='relative w-48 h-48 rounded-full overflow-hidden bg-black z-10'>
              <Webcam
                ref={webcamRef}
                audio={false}
                mirrored
                screenshotFormat='image/jpeg'
                videoConstraints={{ facingMode: 'user' }}
                className='w-full h-full object-cover'
              />
            </div>
          </div>
        </div>

        {/* Processing */}
        {loading && (
          <div className='flex items-center justify-center gap-2 text-sm text-gray-500 mt-5'>
            <span className='w-3 h-3 rounded-full bg-orange-400 animate-pulse' />
            Processing...
          </div>
        )}

        {/* CTA BUTTONS */}
        <div className='mt-10 flex gap-4'>
          {/* Cancel */}
          <button
            onClick={onClose}
            className='flex-1 py-3 rounded-xl border border-gray-300 text-gray-500 text-sm font-medium
               hover:bg-gray-50 transition'
          >
            Cancel
          </button>

          {/* Verify */}
          <button
            onClick={captureAndVerify}
            disabled={loading}
            className='flex-1 py-3 rounded-xl bg-orange-500 text-white text-sm font-medium
             transition shadow-md disabled:opacity-50'
          >
            {loading ? 'Verifying…' : 'Verify'}
          </button>
        </div>
      </div>
    </div>
  );
}

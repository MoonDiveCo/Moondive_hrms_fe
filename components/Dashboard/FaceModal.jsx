'use client';

import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { toast } from 'sonner';

// ... permission functions unchanged ...

export default function FaceModal({ 
  onClose, 
  onSuccess, 
  actionType = 'checkIn'   // ← Fixed typo: was "ctionType"
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
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-[90vw] max-w-md shadow-2xl">
        <h3 className="text-lg font-semibold text-center mb-6">
          Face Verification – {actionType === 'checkIn' ? 'Check In' : 'Check Out'}
        </h3>

        {!cameraAllowed ? (
<>

    {/* Title */}
    <h3 className="text-xl font-semibold text-center mb-6 text-gray-800">
      Face Verification – {actionType === 'checkIn' ? 'Check In' : 'Check Out'}
    </h3>

    {/* Webcam Container */}
    <div className="relative w-full h-96 rounded-2xl overflow-hidden bg-black mb-6 shadow-lg">
      <Webcam
        ref={webcamRef}
        audio={false}
        mirrored
        screenshotFormat="image/jpeg"
        screenshotQuality={0.95}
        videoConstraints={{
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        }}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Face Alignment Guide */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 rounded-full border-4 border-orange-500 opacity-90">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-orange-300 animate-pulse" />
        </div>
        <p className="absolute bottom-8 text-white text-sm font-medium bg-black/50 px-3 py-1 rounded">
          Align your face in the circle
        </p>
      </div>
    </div>

    {/* Bottom Controls */}
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-between w-full items-center">
        <button
          onClick={onClose}
          className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
        >
          Cancel
        </button>

        <span className="text-sm font-medium text-red-600">
          Auto-closing in {secondsLeft}s
        </span>

        <button
          disabled={loading}
          onClick={captureAndSend}
          className="px-6 py-2.5 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed transition shadow-md"
        >
          {loading ? 'Verifying...' : 'Capture & Verify'}
        </button>
      </div>

      {loading && (
        <p className="text-sm text-gray-500 mt-2">Comparing your face...</p>
      )}
    </div>)
</>   )      : (
          <>
            <div className="relative w-full h-96 rounded-xl overflow-hidden bg-black mb-6">
              <Webcam
                ref={webcamRef}
                audio={false}
                mirrored
                screenshotFormat="image/jpeg"
                screenshotQuality={0.92}
                videoConstraints={{
                  facingMode: 'user',
                  width: 1280,
                  height: 720,
                }}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Face guide circle */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 rounded-full border-4 border-orange-500 opacity-80">
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-orange-300" />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg">
                Cancel
              </button>

              <span className="text-sm text-red-500 font-medium">
                Auto-closing in {secondsLeft}s
              </span>

              <button
                disabled={loading}
                onClick={captureAndSend}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg disabled:opacity-70"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
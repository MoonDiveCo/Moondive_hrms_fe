'use client';

import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { toast } from 'sonner';

async function requestCameraPermission() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: false,
        });
        stream.getTracks().forEach((track) => track.stop());
        return true;
    } catch (err) {
        console.error('[Camera] Permission error:', err);
        return false;
    }
}

async function checkCameraPermission() {
    if (navigator.permissions?.query) {
        try {
            const status = await navigator.permissions.query({ name: 'camera' });
            return status.state;
        } catch { }
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
        });
        stream.getTracks().forEach((t) => t.stop());
        return 'granted';
    } catch {
        return 'prompt';
    }
}

export default function FaceModal({ onClose, onSuccess }) {
    const webcamRef = useRef(null);
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cameraAllowed, setCameraAllowed] = useState(false);
    const [checkingPermission, setCheckingPermission] = useState(true);
    const [secondsLeft, setSecondsLeft] = useState(5);

    useEffect(() => {
        if (!mounted) return;

        const interval = setInterval(() => {
            setSecondsLeft((s) => s - 1);
        }, 1000);

        const timeout = setTimeout(() => {
            toast.info('Face verification timed out');
            onClose();
        }, 5000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [mounted, onClose]);


    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        (async () => {
            const status = await checkCameraPermission();
            if (status === 'granted') {
                setCameraAllowed(true);
            }
            setCheckingPermission(false);
        })();
    }, [mounted]);

    if (!mounted || checkingPermission) return null;

    const enableCamera = async () => {
        const allowed = await requestCameraPermission();
        setCameraAllowed(allowed);
    };

    const captureAndSend = async () => {
        setLoading(true);

        const imageSrc = webcamRef.current?.getScreenshot();
        if (!imageSrc) {
            toast.error('Failed to capture image');
            setLoading(false);
            return;
        }

        const blob = await fetch(imageSrc).then((res) => res.blob());

        const formData = new FormData();
        formData.append('image', blob);

        await axios.post('/hrms/attendance/verify-face', formData);

        setLoading(false);
        onSuccess();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
            <div className="bg-white rounded-xl p-2 w-[60vw] h-[80vh]">

                {/* <h3 className="text-lg font-semibold mb-4 text-center">
          Face Check-In
        </h3> */}

                {!cameraAllowed ? (
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-sm text-gray-600 text-center">
                            Camera access is required to check in
                        </p>

                        <button
                            onClick={enableCamera}
                            className="px-4 py-2 rounded bg-orange-500 text-white"
                        >
                            Enable Camera
                        </button>

                        <button
                            onClick={onClose}
                            className="text-sm text-gray-500"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <>
                        {/* CAMERA */}
                        <div className="relative w-full h-[86%] aspect-video rounded-xl overflow-hidden bg-black">
                            <Webcam
                                ref={webcamRef}
                                audio={false}
                                mirrored
                                screenshotFormat="image/jpeg"
                                videoConstraints={{ facingMode: 'user' }}
                                className="absolute inset-0 w-full h-full object-cover"
                            />

                            {/* FACE GUIDE */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-[45%] h-[80%] rounded-full border-4 border-orange-500">
                                    <div className="absolute inset-0 border border-dashed border-orange-300 rounded-full" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between gap-3 mt-6">
                            <button
                                onClick={onClose}
                                className="text-sm px-3 py-1 border border-primary text-primary rounded-full"
                            >
                                Cancel
                            </button>
                            <span className="text-xs text-red-400 text-center mt-2">
                                Auto-closing in {secondsLeft}s
                            </span>

                            <button
                                disabled={loading}
                                onClick={captureAndSend}
                                className="px-3 py-1 text-sm rounded-full bg-primary text-white"
                            >
                                {loading ? 'Capturing…' : 'Capture'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

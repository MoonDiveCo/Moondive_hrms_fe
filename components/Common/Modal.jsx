'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isVisible,
  title,
  subtitle,
  children,
  onClose,
  rightHeaderContent,
  maxWidth = '900px',
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isVisible) return;

    function onKey(e) {
      if (e.key === 'Escape') onClose && onClose();
    }
    function onDocClick(e) {
      if (!modalRef.current) return;
      if (!modalRef.current.contains(e.target)) onClose && onClose();
    }

    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDocClick);

    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDocClick);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-1100 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-xl w-full mx-4 overflow-hidden"
        style={{ maxWidth }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h4 className="text-lg font-semibold text-primaryText">
              {title}
            </h4>
            {subtitle && (
              <div className="text-sm text-primaryText">
                {subtitle}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {rightHeaderContent}
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-500 hover:text-primaryText"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

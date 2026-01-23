'use client';

import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import HRHelpdeskForm from './HrHelpdeskForm';

export default function HRHelpdeskSlideOver({
  isOpen,
  onClose,
  request,
  onSaved,
}) {
  const panelRef = useRef(null);
  const [portalEl] = useState(() => {
    if (typeof document === 'undefined') return null;
    const el = document.createElement('div');
    return el;
  });

  useEffect(() => {
    if (!portalEl) return;
    document.body.appendChild(portalEl);
    return () => portalEl.remove();
  }, [portalEl]);

  if (!portalEl) return null;

  return ReactDOM.createPortal(
    <div className={`fixed inset-0 z-[9999] ${isOpen ? '' : 'pointer-events-none'}`}>
      <div
        className={`absolute inset-0 bg-black/30 ${isOpen ? '' : 'opacity-0'}`}
        onClick={onClose}
      />

      <aside
        ref={panelRef}
        className={`absolute right-0 top-0 h-full w-full md:w-[560px] bg-white transition-transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between px-6 py-4 border-b">
          <h4 className="text-primaryText">
            {request ? 'Request Details' : 'New Request'}
          </h4>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="p-6 overflow-y-auto h-full">
          <HRHelpdeskForm request={request} onSaved={onSaved} />
        </div>
      </aside>
    </div>,
    portalEl
  );
}

"use client";
import { useState } from "react";

const ConfirmationModal = ({ open, onConfirm, onCancel , title , button1 , button2 }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <div className="bg-white rounded-2xl p-6 shadow-2xl w-96 transform transition-all scale-100 hover:scale-[1.02]">
        <h4 className="text-primaryText mb-4 text-center">
          {title}
        </h4>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg shadow-md transition"
          >
            {button1}
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg shadow-md transition"
          >
            {button2}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

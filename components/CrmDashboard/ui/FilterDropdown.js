import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FilterDropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel =
    options.find((opt) => opt.value === value)?.label || label;

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
     className="
  px-6 py-2
  rounded-full border w-full
  bg-whiteBg
  text-blackText
  border-gray-300

  hover:border-primary
  focus:border-primary
  focus:outline-none
  focus:ring-0

  flex items-center justify-between gap-2
"

      >
        <span className="text-xs md:text-sm">
  {selectedLabel}
</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="
              absolute left-0 mt-2
              w-fit min-w-full max-h-[200px] overflow-y-auto hide-scrollbar
              bg-white/95 backdrop-blur-md
              border border-gray-200
              rounded-2xl
              shadow-xl
              z-50
              text-gray-800
            "
          >
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className="
                  w-full whitespace-nowrap text-left block
                  px-5 py-2.5
                  text-sm font-medium
                  hover:bg-gray-100
                  transition
                "
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

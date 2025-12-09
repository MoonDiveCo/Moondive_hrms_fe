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

  // Display selected label or fallback
  const selectedLabel =
    options.find((opt) => opt.value === value)?.label || label;

  return (
    <div  ref={dropdownRef} className="relative inline-block text-left">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="px-4 py-2 bg-primary-100/80 text-primary-50/80 rounded-lg border border-gray-300 hover:border-primary-500 hover:text-primary-400 transition-all w-full text-center"
      >
        {selectedLabel}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute left-0 mt-2 w-fit min-w-full max-h-[200px] overflow-y-auto hide-scrollbar bg-primary-100/80 backdrop-blur-md border border-primary-600/30 rounded-lg shadow-xl shadow-primary-500/20 z-50 text-primary-50/80"
          >
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className="w-full whitespace-nowrap text-left block px-5 py-3 text-primary-50/80 text-sm font-medium hover:bg-primary-600/20 hover:text-primary-400 transition rounded-md"
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

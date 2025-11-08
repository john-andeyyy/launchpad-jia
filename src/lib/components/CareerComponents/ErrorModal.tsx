"use client";

import { useEffect } from "react";

export default function ErrorModal({ 
  errors, 
  onClose 
}: { 
  errors: string[]; 
  onClose: () => void;
}) {
  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (str: string) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Allow modal to close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45"
      onClick={(e) => {
        // Only close if clicking directly on the backdrop (not on child elements)
        if (e.target === e.currentTarget) {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <div
        className="flex h-screen w-screen items-center justify-center"
        onClick={(e) => {
          // Prevent click from bubbling to backdrop
          e.stopPropagation();
        }}
      >
        <div
          className="h-fit max-h-[80vh] min-w-[400px] max-w-[600px] overflow-y-auto rounded-2xl border border-[#E9EAEB] bg-white p-10
          shadow-[0_8px_32px_rgba(30,32,60,0.18)]"
          onClick={(e) => {
            // Prevent click from bubbling
            e.stopPropagation();
          }}
        >
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-row items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#E9EAEB] bg-[#FEF3F2]">
                  <i
                    className="la la-exclamation-triangle text-2xl text-[#DC2626]"
                  ></i>
                </div>
                <h3 className="m-0 text-lg font-semibold text-[#181D27]">
                  Validation Error{errors.length > 1 ? "s" : ""}
                </h3>
              </div>
            </div>

            {/* Error Messages */}
            <div className="flex max-h-[400px] flex-col gap-2 overflow-y-auto py-2">
              {errors.map((error, index) => (
                <div
                  key={index}
                  className="flex flex-row items-start gap-3 rounded-lg border border-[#FEE4E2] bg-[#FEF3F2] p-3"
                >
                  <div className="mt-0.5 text-base text-[#DC2626]">
                    •
                  </div>
                  <p className="m-0 flex-1 text-sm leading-6 text-[#181D27]">
                    {capitalizeFirstLetter(error)}
                  </p>
                </div>
              ))}
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onClose();
                }}
                className="flex flex-row items-center justify-center gap-2 rounded-full border border-[#181D27] bg-[#181D27] px-6 py-2.5 text-center text-sm font-semibold text-white cursor-pointer hover:bg-[#2a2d3a] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


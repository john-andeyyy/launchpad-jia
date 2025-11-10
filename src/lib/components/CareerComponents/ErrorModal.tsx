"use client";

import { useEffect } from "react";
import styles from "@/lib/styles/components/errorModal.module.scss";

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
      className={styles.modalBackdrop}
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
        className={styles.modalWrapper}
        onClick={(e) => {
          // Prevent click from bubbling to backdrop
          e.stopPropagation();
        }}
      >
        <div
          className={styles.modalContent}
          onClick={(e) => {
            // Prevent click from bubbling
            e.stopPropagation();
          }}
        >
          <div className={styles.contentContainer}>
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <div className={styles.iconContainer}>
                  <i
                    className={`la la-exclamation-triangle ${styles.icon}`}
                  ></i>
                </div>
                <h3 className={styles.title}>
                  Validation Error{errors.length > 1 ? "s" : ""}
                </h3>
              </div>
            </div>

            {/* Error Messages */}
            <div className={styles.errorsContainer}>
              {errors.map((error, index) => (
                <div
                  key={index}
                  className={styles.errorItem}
                >
                  <div className={styles.errorBullet}>
                    •
                  </div>
                  <p className={styles.errorText}>
                    {capitalizeFirstLetter(error)}
                  </p>
                </div>
              ))}
            </div>

            {/* Close Button */}
            <div className={styles.buttonContainer}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onClose();
                }}
                className={styles.closeButton}
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


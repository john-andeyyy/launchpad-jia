"use client";

import { ReactNode } from "react";
import FullScreenLoadingAnimation from "../FullScreenLoadingAnimation";

interface CareerModalProps {
    title: string;
    children: ReactNode;
    onSave: () => void;
    onClose: () => void;
    isSaving: boolean;
    maxWidth?: string;
}

export default function CareerModal({
    title,
    children,
    onSave,
    onClose,
    isSaving,
    maxWidth = "1200px",
}: CareerModalProps) {
    return (
        <div
            className="modal show fade-in-bottom"
            style={{
                display: "block",
                background: "rgba(0,0,0,0.45)",
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                zIndex: 1050,
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    width: "100vw",
                }}
            >
                <div
                    className="modal-content"
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        maxHeight: "90vh",
                        width: "90vw",
                        maxWidth: maxWidth,
                        background: "#fff",
                        border: `1.5px solid #E9EAEB`,
                        borderRadius: 14,
                        boxShadow: "0 8px 32px rgba(30,32,60,0.18)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            backgroundColor: "#FFFFFF",
                            paddingLeft: "16px",
                            paddingRight: "16px",
                            paddingTop: "16px",
                            paddingBottom: "12px",
                            zIndex: 50,
                            borderTopLeftRadius: "9999px",
                            borderTopRightRadius: "9999px",
                            position: "sticky",
                            top: 0,
                            borderBottom: "1px solid #E9EAEB",
                        }}
                    >
                        <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#181D27" }}>{title}</h2>

                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: "12px" }}>
                            <button
                                onClick={onClose}
                                style={{
                                    padding: "8px 16px",
                                    color: "#414651",
                                    backgroundColor: "#FFFFFF",
                                    border: "1px solid #D5D7DA",
                                    borderRadius: "9999px",
                                    whiteSpace: "nowrap",
                                    cursor: "pointer",
                                    transition: "background-color 0.2s"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = "#F9FAFB";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "#FFFFFF";
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onSave}
                                disabled={isSaving}
                                style={{
                                    padding: "8px 16px",
                                    borderRadius: "9999px",
                                    whiteSpace: "nowrap",
                                    border: "1px solid #E9EAEB",
                                    cursor: isSaving ? "not-allowed" : "pointer",
                                    opacity: isSaving ? 0.5 : 1,
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: "8px",
                                    backgroundColor: isSaving ? "#D5D7DA" : "#000000",
                                    color: "#FFFFFF"
                                }}
                            >
                                {isSaving ? (
                                    <>
                                        <i className="la la-spinner la-spin" style={{ color: "#FFFFFF", fontSize: "20px" }}></i>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <i className="la la-check-circle" style={{ color: "#FFFFFF", fontSize: "20px" }}></i>
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div
                        style={{
                            overflowY: "auto",
                            flex: 1,
                            padding: "16px",
                        }}
                    >
                        {children}
                    </div>
                </div>
            </div>
            
            {isSaving && (
                <FullScreenLoadingAnimation
                    title={"Saving Data..."}
                    subtext={`Please wait while we are saving the data`}
                />
            )}
        </div>
    );
}


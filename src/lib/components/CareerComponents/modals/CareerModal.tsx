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
                        className="flex flex-row items-center justify-between bg-white px-4 pt-4 pb-3 z-50 rounded-t-full"
                        style={{
                            position: "sticky",
                            top: 0,
                            borderBottom: "1px solid #E9EAEB",
                        }}
                    >
                        <h2 className="text-2xl font-bold text-[#181D27] ">{title}</h2>

                        <div className="flex flex-row items-center justify-end gap-3 ">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-[#414651] bg-white border border-[#D5D7DA] !rounded-full 
                                whitespace-nowrap cursor-pointer hover:bg-[#F9FAFB] transition-colors "
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onSave}
                                disabled={isSaving}
                                className={`px-4 py-2 !rounded-full whitespace-nowrap border border-[#E9EAEB] disabled:cursor-not-allowed 
                                    disabled:opacity-50 cursor-pointer flex flex-row items-center gap-2 ${isSaving ? "bg-[#D5D7DA] text-white" : "bg-black text-white"
                                    }`}
                            >
                                {isSaving ? (
                                    <>
                                        <i className="la la-spinner la-spin text-white text-xl"></i>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <i className="la la-check-circle text-white text-xl"></i>
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


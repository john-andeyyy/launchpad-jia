"use client";

import { assetConstants } from "@/lib/utils/constantsV2";
import { ReactNode } from "react";

interface ReviewSectionProps {
    icon: string;
    title: string;
    isExpanded: boolean;
    onToggle: () => void;
    onEdit?: () => void;
    children: ReactNode;
    className?: string;
}

export default function ReviewSection({
    icon,
    title,
    isExpanded,
    onToggle,
    onEdit,
    children,
    className,
}: ReviewSectionProps) {
    return (
        <div className={`layered-card-outer-career ${className}`}>
            <div className="layered-card-middle">
                <div className="flex flex-row items-center justify-between">
                    <div className="flex flex-row items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center">
                            {/* <i className={`${icon} text-white text-xl`}></i> */}
                            <button
                                onClick={onToggle}
                                className="w-8 h-8 flex items-center justify-center hover:bg-[#F3F4F6] rounded-full transition-colors"
                            >
                                <i className={`la la-chevron-${isExpanded ? "up" : "down"} text-[#6B7280] text-base`}></i>
                            </button>
                        </div>
                        <span className="text-base text-black font-bold">{title}</span>
                    </div>
                    <div className="flex flex-row items-center  gap-2">
                        {onEdit && (
                            <button
                                onClick={onEdit}
                                className="w-8 h-8 flex items-center justify-center hover:bg-[#F3F4F6] bg-white rounded-full transition-colors
                                border !border-gray-300 !rounded-full"
                                title="Edit"
                            >
                                {/* <i className="la la-pen text-[#6B7280]  text-base !text-2xl"></i> */}

                                <img
                                    alt=""
                                    src={assetConstants.edit}
                                    
                                />
                            </button>
                        )}

                    </div>
                </div>
                {isExpanded && (
                    <div className="layered-card-content">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
}


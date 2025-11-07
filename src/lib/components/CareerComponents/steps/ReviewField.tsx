"use client";

import { ReactNode } from "react";

interface ReviewFieldProps {
    label: string;
    value: ReactNode;
    className?: string;
}

export default function ReviewField({ label, value, className = "" }: ReviewFieldProps) {
    return (
        <div className={className}>
            <span className="text-md font-semibold text-black">{label}</span>
            <div className="text-base text-[#6B7280] mt-1">{value}</div>
        </div>
    );
}


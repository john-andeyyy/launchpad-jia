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
            <span style={{ fontSize: '16px', fontWeight: 600, color: "black" }}>{label}</span>
            <div style={{ fontSize: '16px', color: '#1F2937', marginTop: '4px' }}>{value}</div>
        </div>
    );
}


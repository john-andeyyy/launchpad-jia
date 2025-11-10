"use client";

import { assetConstants } from "@/lib/utils/constantsV2";
import { ReactNode, useState } from "react";

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
    const [isToggleHovered, setIsToggleHovered] = useState(false);
    const [isEditHovered, setIsEditHovered] = useState(false);

    return (
        <div className={`layered-card-outer-career ${className}`}>
            <div className="layered-card-middle">
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <button
                                onClick={onToggle}
                                onMouseEnter={() => setIsToggleHovered(true)}
                                onMouseLeave={() => setIsToggleHovered(false)}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: isToggleHovered ? '#F3F4F6' : 'transparent',
                                    borderRadius: '50%',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s',
                                    padding: 0
                                }}
                            >
                                <i className={`la la-chevron-${isExpanded ? "up" : "down"}`} style={{ color: '#6B7280', fontSize: '16px' }}></i>
                            </button>
                        </div>
                        <span style={{ fontSize: '20px', color: '#000000', fontWeight: 700 }}>{title}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                        {onEdit && (
                            <button
                                onClick={onEdit}
                                onMouseEnter={() => setIsEditHovered(true)}
                                onMouseLeave={() => setIsEditHovered(false)}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: isEditHovered ? '#F3F4F6' : '#ffffff',
                                    borderRadius: '50%',
                                    border: '1px solid #d1d5db',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s',
                                    padding: 0
                                }}
                                title="Edit"
                            >
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


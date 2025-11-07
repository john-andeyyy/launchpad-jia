"use client";

import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";

const screeningSettingList = [
    { name: "Good Fit and above", icon: "la la-check" },
    { name: "Only Strong Fit", icon: "la la-check-double" },
    { name: "No Automatic Promotion", icon: "la la-times" },
];

interface CVReviewStepProps {
    screeningSetting: string;
    setScreeningSetting: (value: string) => void;
    requireVideo: boolean;
    setRequireVideo: (value: boolean) => void;
}

export default function CVReviewStep({
    screeningSetting,
    setScreeningSetting,
    requireVideo,
    setRequireVideo,
}: CVReviewStepProps) {
    return (
        <div className="layered-card-outer">
            <div className="layered-card-middle">
                <div className="flex flex-row items-center gap-2">
                    <div className="w-8 h-8 bg-[#181D27] rounded-full flex items-center justify-center">
                        <i className="la la-cog text-white text-xl"></i>
                    </div>
                    <span className="text-base text-[#181D27] font-bold">CV Review & Pre-screening Settings</span>
                </div>
                <div className="layered-card-content">
                    <div className="flex flex-row gap-2">
                        <i className="la la-id-badge text-[#414651] text-xl"></i>
                        <span>Screening Setting</span>
                    </div>
                    <CustomDropdown
                        onSelectSetting={setScreeningSetting}
                        screeningSetting={screeningSetting}
                        settingList={screeningSettingList}
                    />
                    <span>This settings allows Jia to automatically endorse candidates who meet the chosen criteria.</span>
                    <div className="flex flex-row justify-between gap-2">
                        <div className="flex flex-row gap-2">
                            <i className="la la-video text-[#414651] text-xl"></i>
                            <span>Require Video Interview</span>
                        </div>
                        <div className="flex flex-row items-start gap-2">
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    checked={requireVideo} 
                                    onChange={() => setRequireVideo(!requireVideo)} 
                                />
                                <span className="slider round"></span>
                            </label>
                            <span>{requireVideo ? "Yes" : "No"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


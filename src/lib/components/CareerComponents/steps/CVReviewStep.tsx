"use client";

import { useState, useRef, useEffect } from "react";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
import PreScreeningQuestions, { PreScreeningQuestion } from "../PreScreeningQuestions";

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
    secretPrompt?: string;
    setSecretPrompt?: (value: string) => void;
    preScreeningQuestions?: PreScreeningQuestion[];
    setPreScreeningQuestions?: (questions: PreScreeningQuestion[]) => void;
}

export default function CVReviewStep({
    screeningSetting,
    setScreeningSetting,
    requireVideo,
    setRequireVideo,
    secretPrompt = "",
    setSecretPrompt,
    preScreeningQuestions = [],
    setPreScreeningQuestions,
}: CVReviewStepProps) {
    const [showTooltip, setShowTooltip] = useState(false);
    const [showHelpTooltip, setShowHelpTooltip] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const prevValueRef = useRef<string>(secretPrompt);

    // Sync prevValueRef when secretPrompt changes from outside
    useEffect(() => {
        prevValueRef.current = secretPrompt;
    }, [secretPrompt]);

    return (
        <div className="flex flex-col lg:flex-row justify-between w-full gap-4 items-start">
            <div className="flex flex-col gap-4 w-full lg:w-auto">
            <div className="layered-card-outer-career">
                <div className="layered-card-middle">
                    <div className="flex flex-row items-center gap-2">
                        <span className="text-base text-[#181D27] font-bold text-lg pl-2 md:pl-4 pt-3">1. CV Review Settings</span>
                    </div>
                    <div className="layered-card-content">
                        {/* CV Screening Section */}
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row gap-2">
                                <i className="la la-id-badge text-[#414651] text-xl"></i>
                                <span className="font-medium">CV Screening</span>
                            </div>
                            <span className="text-[#6B7280] text-sm">
                                Jia automatically endorses candidates who meet the chosen criteria.
                            </span>
                            <div
                                className="relative"
                                onMouseEnter={() => setShowTooltip(true)}
                                onMouseLeave={() => setShowTooltip(false)}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <CustomDropdown
                                        onSelectSetting={setScreeningSetting}
                                        screeningSetting={screeningSetting}
                                        settingList={screeningSettingList}
                                    />
                                </div>
                                
                            </div>
                        </div>

                        {/* //! CV Secret Prompt (optional) Section */}
                        <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-[#E9EAEB]">
                            <div className="flex flex-row items-center gap-2 relative">
                                <i className="la la-magic text-[#7C3AED] text-xl"></i>
                                <span className="font-medium text-black">CV Secret Prompt <span className="text-[#6B7280]"> (optional)</span></span>
                                <div
                                    className="relative"
                                    onMouseEnter={() => setShowHelpTooltip(true)}
                                    onMouseLeave={() => setShowHelpTooltip(false)}
                                >
                                    <i className="la la-question-circle text-[#6B7280] text-base ml-1  !text-2xl cursor-help"></i>
                                    {showHelpTooltip && (
                                        <div
                                            className="absolute z-50 bg-[#181D27] text-white text-sm p-3 rounded-lg shadow-lg mt-2 left-0"
                                            style={{
                                                width: "300px",
                                                maxWidth: "90vw",
                                                transform: "translateX(-50%)"
                                            }}
                                        >
                                            These prompts remain hidden from candidates and the public job portal. Additionally, only Admins and the Job Owner can view the secret prompt.
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p className="text-[#6B7280] text-md !font-medium pr-5">
                                Secret Prompts give you extra control over Jia's evaluation style, complementing her accurate assessment of requirements from the job description.
                            </p>

                            <textarea
                                ref={textareaRef}
                                className="!h-30 !text-base !p-2 !mt-2  w-full border border-[#E9EAEB] rounded-lg !px-10 mt-2
                                focus:outline-none focus:ring-0 focus:border-[#7C3AED] 
                                text-base font-medium text-[#181D27] placeholder:text-[#6B7280] placeholder:font-medium "
                                rows={4}
                                placeholder="Enter a secret prompt (e.g. Give higher fit scores to candidates who participate in hackathons or competitions.)"
                                value={secretPrompt}
                                onChange={(e) => {
                                    const newValue = e.target.value;
                                    const prevValue = prevValueRef.current;
                                    const cursorPos = e.target.selectionStart;

                                    // Detect if user is deleting (value decreased in length)
                                    const isDeleting = newValue.length < prevValue.length;

                                    if (isDeleting) {
                                        // Allow deletion - just update the value as is, no bullet processing
                                        if (setSecretPrompt) {
                                            setSecretPrompt(newValue);
                                        }
                                        prevValueRef.current = newValue;
                                        return;
                                    }

                                    // Only add bullets when typing (not deleting)
                                    const lines = newValue.split("\n");
                                    const withBullets = lines.map((line) => {
                                        // Skip empty lines - allow them to stay empty
                                        if (line.trim() === "") return line;
                                        // If line already has bullet, keep it
                                        if (line.startsWith("• ")) return line;
                                        // Add bullet to non-empty lines that don't have one
                                        return `• ${line}`;
                                    });

                                    const processedValue = withBullets.join("\n");

                                    // Calculate cursor adjustment
                                    const linesBeforeCursor = newValue.substring(0, cursorPos).split("\n");
                                    const currentLineIndex = linesBeforeCursor.length - 1;
                                    const currentLine = linesBeforeCursor[currentLineIndex] || "";

                                    const linesBeforeCursorProcessed = processedValue.substring(0, cursorPos).split("\n");
                                    const processedCurrentLine = linesBeforeCursorProcessed[currentLineIndex] || "";
                                    const lineLengthDiff = processedCurrentLine.length - currentLine.length;

                                    if (setSecretPrompt) {
                                        setSecretPrompt(processedValue);
                                        // Adjust cursor position if bullet was added
                                        if (lineLengthDiff > 0) {
                                            setTimeout(() => {
                                                if (textareaRef.current) {
                                                    const newCursorPos = Math.min(
                                                        cursorPos + lineLengthDiff,
                                                        processedValue.length
                                                    );
                                                    textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
                                                }
                                            }, 0);
                                        }
                                    }

                                    prevValueRef.current = processedValue;
                                }}
                                onKeyDown={(e) => {
                                    // Handle backspace to delete bullet if cursor is right after "• "
                                    if (e.key === "Backspace" && textareaRef.current) {
                                        const cursorPos = textareaRef.current.selectionStart;
                                        const value = textareaRef.current.value;

                                        // Check if cursor is right after "• " (position 2, 3, etc. after newline)
                                        if (cursorPos >= 2 && value.substring(cursorPos - 2, cursorPos) === "• ") {
                                            e.preventDefault();
                                            const before = value.substring(0, cursorPos - 2);
                                            const after = value.substring(cursorPos);
                                            const newValue = before + after;
                                            if (setSecretPrompt) {
                                                setSecretPrompt(newValue);
                                            }
                                            prevValueRef.current = newValue;
                                            setTimeout(() => {
                                                if (textareaRef.current) {
                                                    textareaRef.current.setSelectionRange(cursorPos - 2, cursorPos - 2);
                                                }
                                            }, 0);
                                        }
                                    }
                                }}
                                onFocus={() => setShowTooltip(false)}
                            />
                        </div>

                    </div>
                </div>
            </div>

            {/* Pre-Screening Questions Section */}
            {preScreeningQuestions !== undefined && setPreScreeningQuestions && (
                <div className="layered-card-outer-career">
                    <PreScreeningQuestions
                        questions={preScreeningQuestions}
                        setQuestions={setPreScreeningQuestions}
                    />
                </div>
            )}
            </div>
            <div className="w-full lg:w-[40%] lg:sticky top-0">
                <div className="layered-card-outer-career">
                    <div className="layered-card-middle">
                    <div className="flex flex-row items-center gap-2 pl-2 md:pl-5 pt-2">
                            <img 
                                src="/icons/lightbulb.svg" 
                                alt="lightbulb" 
                                style={{ width: "20px", height: "20px" }}
                            />
                            <span className="text-base text-[#181D27] font-bold text-lg">
                                Tips
                            </span>
                        </div>
                        <div className="layered-card-content flex flex-col gap-4">
                            <span>
                                <span className="font-bold text-black"> Use clear, standard job titles</span> for better
                                searchability (e.g., "Software Engineer" instead of "Code Ninja" or "Tech Rockstar").
                            </span>
                            <span>
                                <span className="font-bold text-black"> Avoid abbreviations</span> or internal role codes that applicants may not understand
                                (e.g., use "QA Engineer" instead of "QE II" or "QA-TL").
                            </span>
                            <span>
                                <span className="font-bold text-black"> Keep it concise</span> — job titles should be no more than a few words
                                (2–4 max), avoiding fluff or marketing terms.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


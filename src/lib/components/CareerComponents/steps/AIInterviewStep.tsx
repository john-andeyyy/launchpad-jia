"use client";

import { useState } from "react";
import InterviewQuestionGeneratorV2 from "../InterviewQuestionGeneratorV2";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";

const screeningSettingList = [
    { name: "Good Fit and above", icon: "la la-check" },
    { name: "Only Strong Fit", icon: "la la-check-double" },
    { name: "No Automatic Promotion", icon: "la la-times" },
];

interface AIInterviewStepProps {
    questions: any[];
    setQuestions: (questions: any[]) => void;
    jobTitle: string;
    description: string;
    requireVideo: boolean;
    setRequireVideo: (value: boolean) => void;
    screeningSetting: string;
    setScreeningSetting: (value: string) => void;
    secretPrompt: string;
    setSecretPrompt: (value: string) => void;
}

export default function AIInterviewStep({
    questions,
    setQuestions,
    jobTitle,
    description,
    requireVideo,
    setRequireVideo,
    screeningSetting,
    setScreeningSetting,
    secretPrompt,
    setSecretPrompt,
}: AIInterviewStepProps) {
    const [showTooltip, setShowTooltip] = useState(false);
    return (
        <div className="flex flex-col lg:flex-row justify-between w-full gap-4 items-start">
            <div>
                <div className="layered-card-outer-career mb-4">
                    <div className="layered-card-middle">
                        <div className="layered-card-content">
                            {/* //! AI Interview Screening */}
                            <div className="flex flex-row items-center gap-2 ">
                                <span className="text-base text-[#181D27] font-bold text-lg pl-2 md:pl-4 pt-3">AI Interview Screening</span>
                            </div>

                            <div className="flex flex-col gap-2 pb-4">

                                <span className="text-[#6B7280] text-md">
                                    Jia automatically endorses candidates who meet the chosen criteria.
                                </span>
                                <div
                                    className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <CustomDropdown
                                        onSelectSetting={setScreeningSetting}
                                        screeningSetting={screeningSetting}
                                        settingList={screeningSettingList}
                                    />
                                </div>
                            </div>
                            {/* //! Require Video Interview */}
                            <div className="border-t border-[#E9EAEB] pt-4">
                                <h1 className="text-lg font-bold text-[#181D27]">Require Video on Interview</h1>
                                <p className="text-[#6B7280] text-md !font-medium">Require candidates to keep their camera on. Recordings will appear on their analysis page</p>
                                <div className="flex items-center justify-between gap-3 mt-2  pb-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <span className="text-md text-gray-900 flex items-center gap-1.5">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.5"
                                                stroke="currentColor"
                                                className="w-6 h-6 text-gray-400"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                                                />
                                            </svg>
                                            Require Video Interview
                                        </span>
                                    </label>
                                    <div>
                                        <label className="switch ">
                                            <input
                                                type="checkbox"
                                                checked={requireVideo}
                                                onChange={() => setRequireVideo(!requireVideo)}
                                            />
                                            <span className="slider round "></span>
                                        </label>
                                        <span className="text-[#181D27] font-medium text-md pl-2">
                                            {requireVideo ? "Yes" : "No"}
                                        </span>
                                    </div>
                                </div>

                            </div>

                            <div className="border-t border-[#E9EAEB] pt-4">
                                {/* AI Interview Secret Prompt */}
                                <div className="space-y-2 border-t border-gray-200 pt-2 mt-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-gray-900 text-lg sm:text-base flex items-center gap-1">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.5"
                                                stroke="currentColor"
                                                className="w-7 h-7 text-gray-400 text-[#7C3AED]"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                                                />
                                            </svg>
                                            <span>AI Interview Secret Prompt</span>

                                        </h3>
                                        <span className="text-lg sm:text-sm text-gray-500">(optional)</span>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onMouseEnter={() => setShowTooltip(true)}
                                                onMouseLeave={() => setShowTooltip(false)}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth="1.5"
                                                    stroke="currentColor"
                                                    className="w-4 h-4"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                                                    />
                                                </svg>
                                            </button>
                                            {showTooltip && (
                                                <div className="absolute left-0 top-full mt-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 z-50 shadow-lg">
                                                    Secret Prompts give you extra control over Jia's evaluation style, complementing her accurate assessment of requirements from the job description.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-md !font-medium sm:text-sm text-gray-500">
                                        Secret Prompts give you extra control over Jia's evaluation style, complementing her accurate assessment of requirements from the job description.
                                    </p>
                                    <textarea
                                        value={secretPrompt}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // If textarea is empty and user starts typing, add bullet at start
                                            if (secretPrompt === "" && value.length > 0 && !value.startsWith("• ")) {
                                                setSecretPrompt("• " + value);
                                                setTimeout(() => {
                                                    e.target.setSelectionRange(value.length + 2, value.length + 2);
                                                }, 0);
                                            } else {
                                                setSecretPrompt(value);
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            // Stop propagation to prevent any parent handlers from firing
                                            e.stopPropagation();

                                            // Prevent form submission or navigation on Enter
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                const textarea = e.currentTarget;
                                                const start = textarea.selectionStart;
                                                const end = textarea.selectionEnd;
                                                const text = secretPrompt;
                                                const beforeCursor = text.substring(0, start);
                                                const afterCursor = text.substring(end);

                                                // Always add bullet on new line
                                                const newText = beforeCursor + "\n• " + afterCursor;
                                                setSecretPrompt(newText);

                                                // Set cursor position after bullet
                                                setTimeout(() => {
                                                    const newPosition = start + 3;
                                                    textarea.setSelectionRange(newPosition, newPosition);
                                                }, 0);
                                            }
                                        }}
                                        placeholder="Enter a secret prompt (e.g. Treat candidates who speak in Taglish, English, or Tagalog equally. Focus on clarity, coherence, and confidence rather than language preference or accent.)"
                                        className="mt-1 w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-lg !h-[200px] 
                                        resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent px-7"
                                        style={{
                                            paddingLeft: '2rem',
                                            lineHeight: '1.5',
                                        }}
                                        rows={1}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div >
                    <InterviewQuestionGeneratorV2
                        questions={questions}
                        setQuestions={setQuestions}
                        jobTitle={jobTitle}
                        description={description}
                    />
                </div>

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
                                <span className="font-bold text-black">Add a Secret Prompt</span> to fine-tune how Jia scores and evaluates the interview responses.
                            </span>
                            <span>
                                <span className="font-bold text-black">Use "Generate Questions"</span> to quickly create tailored interview questions, then refine or mix them with your own for balanced results.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}


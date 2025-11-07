"use client";

import { useState } from "react";
import { PreScreeningQuestion } from "../PreScreeningQuestions";
import ReviewSection from "./ReviewSection";
import ReviewField from "./ReviewField";
import { TeamMember } from "../TeamAccess";
import { useAppContext } from "@/lib/context/AppContext";

interface ReviewCareerStepProps {
    jobTitle: string;
    employmentType: string;
    workSetup: string;
    city: string;
    province: string;
    country: string;
    minimumSalary: string;
    maximumSalary: string;
    salaryNegotiable: boolean;
    teamMembers: TeamMember[];
    description?: string;
    // CV Review data
    cvScreeningSetting?: string;
    cvSecretPrompt?: string;
    preScreeningQuestions?: PreScreeningQuestion[];
    // AI Interview data
    aiInterviewScreeningSetting?: string;
    requireVideo?: boolean;
    aiInterviewSecretPrompt?: string;
    questions?: any[];
    // Navigation callback
    onEditStep?: (step: number) => void;
}

export default function ReviewCareerStep({
    jobTitle,
    employmentType,
    workSetup,
    city,
    province,
    country,
    minimumSalary,
    maximumSalary,
    salaryNegotiable,
    teamMembers = [],
    description,
    cvScreeningSetting,
    cvSecretPrompt,
    preScreeningQuestions = [],
    aiInterviewScreeningSetting,
    requireVideo,
    aiInterviewSecretPrompt,
    questions = [],
    onEditStep,
}: ReviewCareerStepProps) {
    const { user } = useAppContext();
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        careerDetails: false,
        cvReview: true,
        aiInterview: false,
    });

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const getScreeningSettingDisplay = (setting?: string) => {
        if (!setting) return "Not set";
        // Extract "Good Fit" from "Good Fit and above"
        if (setting.includes("Good Fit")) {
            return (
                <span>
                    Automatically endorse candidates who are{" "}
                    <span className="inline-block bg-[#E0E7FF] text-[#4F46E5] px-2 py-0.5 rounded-full text-sm font-medium">
                        Good Fit
                    </span>
                    {" "}and above
                </span>
            );
        }
        return setting;
    };

    const formatSalaryValue = (value: string, negotiable: boolean) => {
        if (negotiable) return "Negotiable";
        if (!value) return "Not set";
        return `PHP ${value}`;
    };

    const getTotalQuestionsCount = () => {
        return questions.reduce((acc, group) => acc + (group.questions?.length || 0), 0);
    };

    return (
        <div className="flex flex-col gap-4 max-w-[80%] w-full h-full justify-center items-center mx-auto">
            {/* Career Details & Team Access Section */}
            <ReviewSection
                icon="la la-suitcase"
                title="Career Details & Team Access"
                isExpanded={expandedSections.careerDetails}
                onToggle={() => toggleSection("careerDetails")}
                onEdit={() => onEditStep?.(1)}
            >
                <div className="flex flex-col gap-3">
                    <ReviewField label="Job Title" value={jobTitle || "Not set"} className="border-b border-[#E9EAEB] pb-3" />

                    <div className="grid grid-cols-3 gap-3 border-b border-[#E9EAEB] pb-3">
                        <ReviewField label="Employment Type" value={employmentType || "Not set"} />
                        <ReviewField label="Work Arrangement" value={workSetup || "Not set"} />
                    </div>
                    <div className="grid grid-cols-3 gap-3 border-b border-[#E9EAEB] pb-3">
                        <ReviewField label="Country" value={country || country || "Not set"} />
                        <ReviewField label="State / Province" value={province || "Not set"} />
                        <ReviewField label="City" value={city || "Not set"} />
                    </div>

                    <div className="grid grid-cols-3 gap-3 border-b border-[#E9EAEB] pb-3">
                        <div>
                            <span className="text-sm font-semibold text-black">Minimum Salary</span>
                            <div className={`text-base mt-1`}>
                                {formatSalaryValue(minimumSalary, salaryNegotiable)}
                            </div>
                        </div>
                        <div>
                            <span className="text-sm font-semibold text-black">Maximum Salary</span>
                            <div className={`text-base mt-1 ${salaryNegotiable ? "text-[#6B7280]" : "text-[#181D27]"}`}>
                                {formatSalaryValue(maximumSalary, salaryNegotiable)}
                            </div>
                        </div>
                    </div>
                    {description && (
                        <div className="border-b border-[#E9EAEB] pb-3">
                            <span className="text-md font-semibold text-black">Job Description</span>
                            <div
                                className="text-base text-[#181D27] mt-1 rich-text-content"
                                dangerouslySetInnerHTML={{
                                    __html: description
                                }}
                            />
                            <style dangerouslySetInnerHTML={{
                                __html: `
                                    .rich-text-content b,
                                    .rich-text-content strong {
                                        font-weight: 700;
                                    }
                                    .rich-text-content i,
                                    .rich-text-content em {
                                        font-style: italic;
                                    }
                                    .rich-text-content u {
                                        text-decoration: underline;
                                    }
                                    .rich-text-content strike,
                                    .rich-text-content s {
                                        text-decoration: line-through;
                                    }
                                    .rich-text-content ul {
                                        list-style-type: disc;
                                        margin-left: 24px;
                                        margin-top: 8px;
                                        margin-bottom: 8px;
                                        padding-left: 24px;
                                    }
                                    .rich-text-content ol {
                                        list-style-type: decimal;
                                        margin-left: 24px;
                                        margin-top: 8px;
                                        margin-bottom: 8px;
                                        padding-left: 24px;
                                    }
                                    .rich-text-content li {
                                        margin-bottom: 4px;
                                        display: list-item;
                                    }
                                    .rich-text-content div {
                                        margin-bottom: 4px;
                                    }
                                `
                            }} />
                        </div>
                    )}

                    <div>
                        <span className="text-sm font-semibold text-black">Team Access</span>
                        <div className="flex flex-col gap-3 mt-2">
                            {teamMembers.map((member) => {
                                const isCurrentUser = user?.email === member.email;
                                return (
                                    <div key={member.email} className="flex flex-row items-center gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                            {member.image ? (
                                                <img
                                                    src={member.image}
                                                    alt={member.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-[#E9EAEB] flex items-center justify-center">
                                                    <span className="text-[#6B7280] text-sm font-semibold">
                                                        {member.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 ">
                                            <div className="flex flex-row items-center gap-2">
                                                <p className="text-base text-[#181D27] font-semibold !mb-0">
                                                    {member.name}
                                                </p>
                                                {isCurrentUser && (
                                                    <span className="text-sm text-[#6B7280]">(You)</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-[#6B7280] truncate !mb-0">
                                                {member.email}
                                            </p>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <span className="text-md text-[#6B7280] font-medium">
                                                {member.role}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </ReviewSection>

            {/* //!CV Review & Pre-Screening Questions Section */}
            <ReviewSection
                icon="la la-file-text"
                title="CV Review & Pre-Screening Questions"
                isExpanded={expandedSections.cvReview}
                onToggle={() => toggleSection("cvReview")}
                onEdit={() => onEditStep?.(2)}
            >
                <div className="flex flex-col gap-4">
                    <ReviewField
                        label="CV Screening"
                        value={getScreeningSettingDisplay(cvScreeningSetting)}
                    />

                    {cvSecretPrompt && (
                        <div>
                            <span className="text-sm font-semibold text-black">CV Secret Prompt</span>
                            <div className="text-base text-[#181D27] mt-1 whitespace-pre-line">
                                {cvSecretPrompt.split('\n').map((line, idx) => (
                                    <div key={idx}>{line}</div>
                                ))}
                            </div>
                        </div>
                    )}

                    {preScreeningQuestions.length > 0 && (
                        <div>
                            <span className="text-sm font-semibold text-[#6B7280]">
                                Pre-Screening Questions <span className="border border-[#E9EAEB] rounded-full px-2 py-1">
                                    {preScreeningQuestions.length}</span>
                            </span>
                            <div className="flex flex-col gap-3 mt-2">
                                {preScreeningQuestions.map((question, index) => (
                                    <div key={question.id} className=" px-3">
                                        <div className="flex flex-row items-start gap-2">
                                            <span className="text-md font-semibold text-gray-800 min-w-[24px]">
                                                {index + 1}.
                                            </span>
                                            <div className="flex-1">
                                                <p className=" !text-md text-base !text-gray-800 !font-medium mb-2">
                                                    {question.question}
                                                </p>
                                                {question.type === "dropdown" || question.type === "checkboxes" ? (
                                                    question.options && question.options.length > 0 ? (
                                                        <div className="flex flex-col gap-1 mt-2">
                                                            {question.options.map((option) => (
                                                                <div key={option.id} className="text-md text-gray-800  pl-4">
                                                                    <span className=" pr-2"> •</span> {option.value}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : null
                                                ) : question.type === "range" ? (
                                                    <div className="text-md text-gray-800 pl-4">
                                                        {question.rangeType === "currency" && question.currency && (
                                                            <span>
                                                                <span className=" pr-1">• Preferred: </span>
                                                                {question.currency === "PHP" ? "PHP" : "$"}
                                                                {question.minValue || "0"} - {question.currency === "PHP" ? "" : "$"}
                                                                {question.maxValue || "0"} {question.currency}
                                                            </span>
                                                        )}
                                                        {question.rangeType === "number" && (
                                                            <span>
                                                                {question.minValue || "0"} - {question.maxValue || "0"}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="text-md text-[#6B7280] pl-4 italic">
                                                        {question.type === "short-answer" && "Short answer"}
                                                        {question.type === "long-answer" && "Long answer"}
                                                        {question.type === "text" && "Text input"}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </ReviewSection>

            {/* //! AI Interview Setup Section */}
            <ReviewSection
                icon="la la-comments"
                title="AI Interview Setup"
                isExpanded={expandedSections.aiInterview}
                onToggle={() => toggleSection("aiInterview")}
                onEdit={() => onEditStep?.(3)}
            >
                <div className="flex flex-col gap-4">
                    <ReviewField
                        label="AI Interview Screening"
                        value={getScreeningSettingDisplay(aiInterviewScreeningSetting)}
                    />
                    <div className="flex flex-row items-center justify-between gap-2 ">
                        <p className="!font-semibold text-gray-800 !mb-0">Require Video Interview</p>
                        <span className="text-md font-bold text-gray-800">
                            {requireVideo ? "Yes" : "No"}
                        </span>
                    </div>

                    {aiInterviewSecretPrompt && (
                        <div>
                            <div className="flex flex-row items-center gap-2 mb-2 pl-2">
                                <i className="la la-magic text-[#7C3AED] text-lg"></i>
                                <span className="text-sm font-semibold text-gray-800">AI Interview Secret Prompt</span>
                            </div>
                            <div className="text-base text-[#181D27] mt-1 pl-2">
                                {aiInterviewSecretPrompt.split('\n').map((line, idx) => {
                                    const cleanLine = line.replace(/^•\s*/, '').trim();
                                    if (!cleanLine) return null;
                                    return (
                                        <div key={idx} className="flex flex-row items-start gap-2 mb-1 text-gray-500">
                                            <span className="text-[#181D27] ">•</span>
                                            <span className="flex-1">{cleanLine}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {questions.length > 0 && (
                        <div>
                            <div className="flex flex-row items-center gap-2 mb-3">
                                <span className="text-sm font-semibold text-black">Interview Questions</span>
                                <span className="bg-[#F3F4F6] text-[#6B7280] text-xs font-medium px-2 py-1 rounded-full border border-[#E9EAEB]">
                                    {getTotalQuestionsCount()}
                                </span>
                            </div>
                            <div className="flex flex-col gap-4 mt-2">
                                {questions.map((group, groupIdx) => {
                                    if (!group.questions || group.questions.length === 0) return null;

                                    // Calculate starting question number for this category
                                    let questionNumber = 1;
                                    for (let i = 0; i < groupIdx; i++) {
                                        if (questions[i].questions) {
                                            questionNumber += questions[i].questions.length;
                                        }
                                    }

                                    return (
                                        <div key={groupIdx} className="flex flex-col gap-2">
                                            <div className="text-sm font-semibold !text-gray-500 mb-1">
                                                {group.category}
                                            </div>
                                            <div className="flex flex-col gap-2 pl-2">
                                                {group.questions.map((question: any, qIdx: number) => {
                                                    const currentQuestionNumber = questionNumber + qIdx;
                                                    const questionText = typeof question === 'string'
                                                        ? question
                                                        : (question.question || question.text || '');
                                                    return (
                                                        <div key={question.id || qIdx} className="flex flex-row items-center gap-2">
                                                            <span className="text-sm pl-3 font-semibold text-gray-500 min-w-[20px]">
                                                                {currentQuestionNumber}.
                                                            </span>
                                                            <p className="!mb-0 text-base !text-gray-500 !font-medium flex-1">
                                                                {questionText}
                                                            </p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </ReviewSection>
        </div>
    );
}


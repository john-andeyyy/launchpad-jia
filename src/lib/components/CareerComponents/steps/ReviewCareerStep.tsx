"use client";

import { useState } from "react";
import { PreScreeningQuestion } from "../PreScreeningQuestions";
import ReviewSection from "./ReviewSection";
import ReviewField from "./ReviewField";
import { TeamMember } from "../TeamAccess";
import { useAppContext } from "@/lib/context/AppContext";
import { assetConstants } from "@/lib/utils/constantsV2";
import styles from "@/lib/styles/screens/reviewCareerStep.module.scss";

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
        careerDetails: true,
        cvReview: true,
        aiInterview: true,
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
                    <span className={styles.goodFitBadge}>
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
        <div className={styles.container}>
            {/* Career Details & Team Access Section */}
            <ReviewSection
                icon="la la-suitcase"
                title="Career Details & Team Access"
                isExpanded={expandedSections.careerDetails}
                onToggle={() => toggleSection("careerDetails")}
                onEdit={() => onEditStep?.(1)}
            >
                <div className={styles.contentSection}>
                    <ReviewField label="Job Title" value={jobTitle || "Not set"} className={styles.borderBottom} />

                    <div className={styles.grid3Cols}>
                        <ReviewField label="Employment Type" value={employmentType || "Not set"} />
                        <ReviewField label="Work Arrangement" value={workSetup || "Not set"} />
                    </div>
                    <div className={styles.grid3Cols}>
                        <ReviewField label="Country" value={country || country || "Not set"} />
                        <ReviewField label="State / Province" value={province || "Not set"} />
                        <ReviewField label="City" value={city || "Not set"} />
                    </div>

                    <div className={styles.grid3Cols}>
                        <div>
                            <span className={styles.salaryLabel}>Minimum Salary</span>
                            <div className={styles.salaryValue}>
                                {formatSalaryValue(minimumSalary, salaryNegotiable)}
                            </div>
                        </div>
                        <div>
                            <span className={styles.salaryLabel}>Maximum Salary</span>
                            <div className={`${styles.salaryValue} ${salaryNegotiable ? styles.salaryValueNegotiable : styles.salaryValueNormal}`}>
                                {formatSalaryValue(maximumSalary, salaryNegotiable)}
                            </div>
                        </div>
                    </div>
                    {description && (
                        <div className={styles.borderBottom}>
                            <span className={styles.jobDescriptionLabel}>Job Description</span>
                            <div
                                className={`${styles.richTextContent} rich-text-content`}
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
                        <span className={styles.teamAccessLabel}>Team Access</span>
                        <div className={styles.teamMembersList}>
                            {teamMembers.map((member) => {
                                const isCurrentUser = user?.email === member.email;
                                return (
                                    <div key={member.email} className={styles.teamMemberRow}>
                                        <div className={styles.avatarContainer}>
                                            {member.image ? (
                                                <img
                                                    src={member.image}
                                                    alt={member.name}
                                                    className={styles.avatarImage}
                                                />
                                            ) : (
                                                <div className={styles.avatarPlaceholder}>
                                                    <span className={styles.avatarInitial}>
                                                        {member.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className={styles.memberInfo}>
                                            <div className={styles.memberNameRow}>
                                                <p className={styles.memberName}>
                                                    {member.name}
                                                </p>
                                                {isCurrentUser && (
                                                    <span className={styles.memberYou}>(You)</span>
                                                )}
                                            </div>
                                            <p className={styles.memberEmail}>
                                                {member.email}
                                            </p>
                                        </div>
                                        <div className={styles.memberRole}>
                                            <span>
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
                <div className={styles.contentSection}>
                    <div style={{ borderBottom: "1px solid #E5E7EB", paddingBottom: "16px" }}>
                        <ReviewField
                            label="CV Screening"
                            value={getScreeningSettingDisplay(cvScreeningSetting)}
                        />
                    </div>
                    {cvSecretPrompt && (
                        <div style={{ borderBottom: "1px solid #E5E7EB", paddingBottom: "16px" }}>
                            <span className={styles.secretPromptLabel}>CV Secret Prompt</span>
                            <div className={styles.secretPromptContent}>
                                {cvSecretPrompt.split('\n').map((line, idx) => (
                                    <div key={idx}>{line}</div>
                                ))}
                            </div>
                        </div>
                    )}

                    {preScreeningQuestions.length > 0 && (
                        <div>
                            <span className={styles.preScreeningLabel}>
                                Pre-Screening Questions <span className={styles.preScreeningBadge}>
                                    {preScreeningQuestions.length}</span>
                            </span>
                            <div className={styles.preScreeningList}>
                                {preScreeningQuestions.map((question, index) => (
                                    <div key={question.id} className={styles.questionItem}>
                                        <div className={styles.questionRow}>
                                            <span className={styles.questionNumber}>
                                                {index + 1}.
                                            </span>
                                            <div className={styles.questionContent}>
                                                <p className={styles.questionText}>
                                                    {question.question}
                                                </p>
                                                {question.type === "dropdown" || question.type === "checkboxes" ? (
                                                    question.options && question.options.length > 0 ? (
                                                        <div className={styles.questionOptions}>
                                                            {question.options.map((option) => (
                                                                <div key={option.id} className={styles.questionOption}>
                                                                    <span className={styles.optionBullet}> •</span> {option.value}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : null
                                                ) : question.type === "range" ? (
                                                    <div className={styles.questionRange}>
                                                        {question.rangeType === "currency" && question.currency && (
                                                            <span>
                                                                <span className={styles.questionRangeLabel}>• Preferred: </span>
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
                                                    <div className={styles.questionTypePlaceholder}>
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
                <div className={styles.contentSection}>
                    <ReviewField
                        label="AI Interview Screening"
                        value={getScreeningSettingDisplay(aiInterviewScreeningSetting)}
                    />

                    <div className={styles.videoRequirementRow}>
                        <p className={styles.videoRequirementLabel}>Require Video Interview</p>
                        <div className={styles.videoRequirementValue}>
                            {requireVideo ? "Yes" : "No"}
                            {requireVideo ? <img
                                alt=""
                                src={assetConstants.checkV2}
                            /> : <img
                                alt=""
                                src={assetConstants.xV2}
                            />}
                        </div>
                    </div>

                    <div className={styles.borderBottom}>
                        <div className={styles.secretPromptHeader}>
                            <i className={`la la-magic ${styles.secretPromptIcon}`}></i>
                            <span className={styles.secretPromptHeaderLabel}>AI Interview Secret Prompt</span>
                        </div>
                        <div className={styles.secretPromptLines}>
                            {aiInterviewSecretPrompt.split('\n').map((line, idx) => {
                                const cleanLine = line.replace(/^•\s*/, '').trim();
                                if (!cleanLine) return null;
                                return (
                                    <div key={idx} className={styles.secretPromptLine}>
                                        <span className={styles.secretPromptBullet}>•</span>
                                        <span className={styles.secretPromptLineText}>{cleanLine}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>


                    {questions.length > 0 && (
                        <div>
                            <div className={styles.questionsHeader}>
                                <span className={styles.questionsLabel}>Interview Questions</span>
                                <span className={styles.questionsBadge}>
                                    {getTotalQuestionsCount()}
                                </span>
                            </div>
                            <div className={styles.questionsList}>
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
                                        <div key={groupIdx} className={styles.questionGroup}>
                                            <div className={styles.questionGroupCategory}>
                                                {group.category}
                                            </div>
                                            <div className={styles.questionGroupList}>
                                                {group.questions.map((question: any, qIdx: number) => {
                                                    const currentQuestionNumber = questionNumber + qIdx;
                                                    const questionText = typeof question === 'string'
                                                        ? question
                                                        : (question.question || question.text || '');
                                                    return (
                                                        <div key={question.id || qIdx} className={styles.questionItemRow}>
                                                            <span className={styles.questionItemNumber}>
                                                                {currentQuestionNumber}.
                                                            </span>
                                                            <p className={styles.questionItemText}>
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


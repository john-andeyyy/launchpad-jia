"use client";

import { useState } from "react";
import InterviewQuestionGeneratorV2 from "../InterviewQuestionGeneratorV2";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
import styles from "@/lib/styles/screens/aiInterviewStep.module.scss";

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
    showValidation?: boolean;
    hideSectionNumbers?: boolean;
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
    showValidation = false,
    hideSectionNumbers = false,
}: AIInterviewStepProps) {
    const [showTooltip, setShowTooltip] = useState(false);
    return (
        <div className={styles.container}>
            <div className={styles.mainContent}>
                <div className={`layered-card-outer-career ${styles.cardWrapper}`}>
                    <div className="layered-card-middle">
                    <div className={styles.headerRow}>
                            <span className={styles.sectionTitle}>
                                {hideSectionNumbers ? "AI Interview Settings" : "1. AI Interview Settings"}
                            </span>
                        </div>
                        <div className="layered-card-content">
                            {/* //! AI Interview Screening */}
                            <div className={styles.screeningHeader}>
                                <span className={styles.screeningHeaderTitle}>AI Interview Screening</span>
                            </div>

                            <div className={styles.screeningContent}>
                                <span className={styles.screeningDescription}>
                                    Jia automatically endorses candidates who meet the chosen criteria.
                                </span>
                                <div className={styles.dropdownGrid}>
                                    <CustomDropdown
                                        onSelectSetting={setScreeningSetting}
                                        screeningSetting={screeningSetting}
                                        settingList={screeningSettingList}
                                    />
                                </div>
                            </div>
                            {/* //! Require Video Interview */}
                            <div className={styles.videoSection}>
                                <h1 className={styles.videoTitle}>Require Video on Interview</h1>
                                <p className={styles.videoDescription}>Require candidates to keep their camera on. Recordings will appear on their analysis page</p>
                                <div className={styles.videoToggle}>
                                    <label className={styles.videoToggleLabel}>
                                        <span className={styles.videoToggleLabelText}>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.5"
                                                stroke="currentColor"
                                                className={styles.videoIcon}
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
                                    <div className={styles.toggleContainer}>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={requireVideo}
                                                onChange={() => setRequireVideo(!requireVideo)}
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                        <span className={styles.toggleText}>
                                            {requireVideo ? "Yes" : "No"}
                                        </span>
                                    </div>
                                </div>

                            </div>
                            <div>
                                {/* AI Interview Secret Prompt */}
                                <div className={styles.promptContainer}>
                                    <div className={styles.promptHeader}>
                                        <h3 className={styles.promptTitle}>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.5"
                                                stroke="currentColor"
                                                className={styles.promptIcon}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                                                />
                                            </svg>
                                            <span>AI Interview Secret Prompt</span>
                                        </h3>
                                        <span className={styles.promptOptional}>(optional)</span>
                                        <div className={styles.tooltipContainer}>
                                            <button
                                                type="button"
                                                onMouseEnter={() => setShowTooltip(true)}
                                                onMouseLeave={() => setShowTooltip(false)}
                                                className={styles.tooltipButton}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth="1.5"
                                                    stroke="currentColor"
                                                    className={styles.tooltipIcon}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                                                    />
                                                </svg>
                                            </button>
                                            {showTooltip && (
                                                <div className={styles.tooltip}>
                                                    Secret Prompts give you extra control over Jia's evaluation style, complementing her accurate assessment of requirements from the job description.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className={styles.promptDescription}>
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
                                        className={styles.textarea}
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
                        showValidation={showValidation}
                        hideSectionNumbers={hideSectionNumbers}
                    />
                </div>

            </div>
            <div className={styles.tipsSidebar}>
                <div className="layered-card-outer-career">
                    <div className="layered-card-middle">
                        <div className={styles.tipsHeader}>
                            <img
                                src="/icons/lightbulb.svg"
                                alt="lightbulb"
                                className={styles.tipsHeaderIcon}
                            />
                            <span className={styles.tipsHeaderTitle}>
                                Tips
                            </span>
                        </div>
                        <div className={`layered-card-content ${styles.tipsContent}`}>
                            <span className={styles.tipText}>
                                <span className={styles.tipTextBold}>Add a Secret Prompt</span> to fine-tune how Jia scores and evaluates the interview responses.
                            </span>
                            <span className={styles.tipText}>
                                <span className={styles.tipTextBold}>Use "Generate Questions"</span> to quickly create tailored interview questions, then refine or mix them with your own for balanced results.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}


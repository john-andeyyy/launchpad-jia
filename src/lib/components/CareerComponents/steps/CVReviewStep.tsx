"use client";

import { useState, useRef, useEffect } from "react";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
import PreScreeningQuestions, { PreScreeningQuestion } from "../PreScreeningQuestions";
import styles from "@/lib/styles/screens/cvReviewStep.module.scss";

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
    hideSectionNumbers?: boolean;
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
    hideSectionNumbers = false,
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
        <div className={styles.container}>
            <div className={styles.mainContent}>
            <div className="layered-card-outer-career">
                <div className="layered-card-middle">
                    <div className={styles.headerRow}>
                        <span className={styles.sectionTitle}>
                            {hideSectionNumbers ? "CV Review Settings" : "1. CV Review Settings"}
                        </span>
                    </div>
                    <div className="layered-card-content">
                        {/* CV Screening Section */}
                        <div className={styles.cvScreeningSection}>
                            <div className={styles.cvScreeningHeader}>
                                <i className={`la la-id-badge ${styles.cvScreeningIcon}`}></i>
                                <span className={styles.cvScreeningLabel}>CV Screening</span>
                            </div>
                            <span className={styles.cvScreeningDescription}>
                                Jia automatically endorses candidates who meet the chosen criteria.
                            </span>
                            <div
                                className={styles.dropdownWrapper}
                                onMouseEnter={() => setShowTooltip(true)}
                                onMouseLeave={() => setShowTooltip(false)}
                            >
                                <div className={styles.dropdownGrid}>
                                    <CustomDropdown
                                        onSelectSetting={setScreeningSetting}
                                        screeningSetting={screeningSetting}
                                        settingList={screeningSettingList}
                                    />
                                </div>
                                
                            </div>
                        </div>

                        {/* //! CV Secret Prompt (optional) Section */}
                        <div className={styles.secretPromptSection}>
                            <div className={styles.secretPromptHeader}>
                                <i className={`la la-magic ${styles.magicIcon}`}></i>
                                <span className={styles.secretPromptLabel}>CV Secret Prompt <span className={styles.optionalText}> (optional)</span></span>
                                <div
                                    className={styles.helpTooltipContainer}
                                    onMouseEnter={() => setShowHelpTooltip(true)}
                                    onMouseLeave={() => setShowHelpTooltip(false)}
                                >
                                    <i className={`la la-question-circle ${styles.helpIcon}`}></i>
                                    {showHelpTooltip && (
                                        <div className={styles.tooltip}>
                                            These prompts remain hidden from candidates and the public job portal. Additionally, only Admins and the Job Owner can view the secret prompt.
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p className={styles.secretPromptDescription}>
                                Secret Prompts give you extra control over Jia's evaluation style, complementing her accurate assessment of requirements from the job description.
                            </p>

                            <textarea
                                ref={textareaRef}
                                className={styles.textarea}
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
                        hideSectionNumbers={hideSectionNumbers}
                    />
                </div>
            )}
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
                            <span>
                                <span className={styles.tipTextBold}> Use clear, standard job titles</span> for better
                                searchability (e.g., "Software Engineer" instead of "Code Ninja" or "Tech Rockstar").
                            </span>
                            <span>
                                <span className={styles.tipTextBold}> Avoid abbreviations</span> or internal role codes that applicants may not understand
                                (e.g., use "QA Engineer" instead of "QE II" or "QA-TL").
                            </span>
                            <span>
                                <span className={styles.tipTextBold}> Keep it concise</span> — job titles should be no more than a few words
                                (2–4 max), avoiding fluff or marketing terms.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


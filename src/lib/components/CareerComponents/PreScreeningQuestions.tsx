"use client";

import React, { useState, useEffect, useRef } from "react";
import { guid } from "@/lib/Utils";
import styles from "@/lib/styles/screens/preScreeningQuestions.module.scss";

export type QuestionType = "short-answer" | "long-answer" | "dropdown" | "checkboxes" | "range" | "text";
export type RangeType = "currency" | "number";

export type QuestionOption = {
    id: string;
    value: string;
};

export type PreScreeningQuestion = {
    id: string;
    question: string;
    type: QuestionType;
    options?: QuestionOption[]; // For dropdown type
    minValue?: string; // For range type
    maxValue?: string; // For range type
    rangeType?: RangeType; // For range type: "currency" or "number"
    currency?: string; // For range type when rangeType is "currency"
    source: "custom" | "suggested";
};

interface PreScreeningQuestionsProps {
    questions: PreScreeningQuestion[];
    setQuestions: (questions: PreScreeningQuestion[]) => void;
    hideSectionNumbers?: boolean;
}

const SUGGESTED_QUESTIONS = [
    {
        id: "notice-period",
        question: "How long is your notice period?",
        type: "dropdown" as QuestionType,
        defaultOptions: [
            { id: "1", value: "Immediately" },
            { id: "2", value: "< 30 days" },
            { id: "3", value: "> 30 days" },
        ],
    },
    {
        id: "work-setup",
        question: "How often are you willing to report to the office each week?",
        type: "dropdown" as QuestionType,
        defaultOptions: [
            { id: "1", value: "At most 1-2x a week" },
            { id: "2", value: "At most 3-4x a week" },
            { id: "3", value: "Open to fully onsite work" },
            { id: "4", value: "Only open to fully remote work" },
        ],
    },
    {
        id: "expected-salary",
        question: "How much is your expected monthly salary?",
        minValue: "40,000",
        maxValue: "60,000",
        type: "range" as QuestionType,
    },
] as const;

const QUESTION_TYPES: { value: QuestionType; label: string; icon?: string }[] = [
    { value: "short-answer", label: "Short Answer", icon: "las la-user" },
    { value: "long-answer", label: "Long Answer", icon: "las la-grip-lines" },
    { value: "dropdown", label: "Dropdown", icon: "las la-list" },
    { value: "checkboxes", label: "Checkboxes", icon: "las la-check-square" },
    { value: "range", label: "Range", icon: "las la-sort-numeric-up" },
];

// Validation function to check for blank question titles
export function validatePreScreeningQuestions(questions: PreScreeningQuestion[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    questions.forEach((question, index) => {
        if (!question.question || question.question.trim() === "") {
            errors.push(`Question ${index + 1} has a blank title. Please enter a question.`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
    };
}

export default function PreScreeningQuestions({
    questions,
    setQuestions,
    hideSectionNumbers = false,
}: PreScreeningQuestionsProps) {
    const addedQuestionIds = questions.map((q) => q.id);
    const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set());
    const [validatedQuestionIds, setValidatedQuestionIds] = useState<Set<string>>(new Set());

    const handleAddCustom = () => {
        const newQuestion: PreScreeningQuestion = {
            id: guid(),
            question: "",
            type: "dropdown",
            options: [{ id: guid(), value: "" }],
            source: "custom",
        };
        setQuestions([...questions, newQuestion]);
    };

    const handleAddSuggested = (questionId: string) => {
        const suggested = SUGGESTED_QUESTIONS.find((q) => q.id === questionId);
        if (!suggested) return;

        const newQuestion: PreScreeningQuestion = {
            id: questionId, // Use the suggested ID so we can track it
            question: suggested.question,
            type: suggested.type,
            source: "suggested",
            ...(suggested.type === "dropdown" && "defaultOptions" in suggested && suggested.defaultOptions
                ? { options: suggested.defaultOptions.map((opt) => ({ id: opt.id, value: opt.value })) }
                : {}),
            ...(suggested.type === "range"
                ? {
                    rangeType: "currency" as RangeType,
                    currency: "PHP",
                    minValue: ("minValue" in suggested && suggested.minValue) ? suggested.minValue : "",
                    maxValue: ("maxValue" in suggested && suggested.maxValue) ? suggested.maxValue : "",
                }
                : {}),
        };

        setQuestions([...questions, newQuestion]);
    };

    const handleRemoveQuestion = (id: string) => {
        setQuestions(questions.filter((q) => q.id !== id));
    };

    const handleUpdateQuestion = (id: string, updates: Partial<PreScreeningQuestion>) => {
        setQuestions(
            questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
        );
    };

    const handleAddOption = (questionId: string) => {
        setQuestions(
            questions.map((q) =>
                q.id === questionId
                    ? {
                        ...q,
                        options: [
                            ...(q.options || []),
                            { id: guid(), value: "" },
                        ],
                    }
                    : q
            )
        );
    };

    const handleRemoveOption = (questionId: string, optionId: string) => {
        setQuestions(
            questions.map((q) =>
                q.id === questionId
                    ? {
                        ...q,
                        options: (q.options || []).filter((opt) => opt.id !== optionId),
                    }
                    : q
            )
        );
    };

    const handleUpdateOption = (questionId: string, optionId: string, value: string) => {
        setQuestions(
            questions.map((q) =>
                q.id === questionId
                    ? {
                        ...q,
                        options: (q.options || []).map((opt) =>
                            opt.id === optionId ? { ...opt, value } : opt
                        ),
                    }
                    : q
            )
        );
    };

    const handleReorderQuestion = (draggedQuestionId: string, targetIndex: number) => {
        const draggedIndex = questions.findIndex((q) => q.id === draggedQuestionId);
        if (draggedIndex === -1 || draggedIndex === targetIndex) return;

        const newQuestions = [...questions];
        const [removed] = newQuestions.splice(draggedIndex, 1);
        newQuestions.splice(targetIndex, 0, removed);
        setQuestions(newQuestions);
    };

    const handleReorderOption = (questionId: string, draggedOptionId: string, targetIndex: number) => {
        setQuestions(
            questions.map((q) => {
                if (q.id !== questionId || !q.options) return q;

                const options = [...q.options];
                const draggedIndex = options.findIndex((opt) => opt.id === draggedOptionId);
                if (draggedIndex === -1 || draggedIndex === targetIndex) return q;

                const [removed] = options.splice(draggedIndex, 1);
                options.splice(targetIndex, 0, removed);
                return { ...q, options };
            })
        );
    };

    // Clear errors when question is updated (only for questions that were already validated)
    useEffect(() => {
        setValidationErrors((prev) => {
            const newErrors = new Set(prev);
            questions.forEach((question) => {
                // Only update errors for questions that were already validated
                if (validatedQuestionIds.has(question.id)) {
                    if (question.question && question.question.trim() !== "") {
                        newErrors.delete(question.id);
                    } else if (!question.question || question.question.trim() === "") {
                        // Re-add error if question becomes empty again
                        newErrors.add(question.id);
                    }
                }
            });
            return newErrors;
        });
    }, [questions, validatedQuestionIds]);

    return (
        <div className="layered-card-middle">

            <div className={styles.header}>

                <div className={styles.headerLeft}>
                    <span className={styles.title}>
                        {hideSectionNumbers ? "Pre-Screening Questions" : "2. Pre-Screening Questions"}{" "}
                        <span className={styles.optional}>(optional)</span>

                    </span>
                    <div className={styles.countBadge}>
                        <span className={styles.countText}>
                            {questions.length}
                        </span>
                    </div>
                </div>
                <div className={styles.headerRight}>
                    <button
                        onClick={handleAddCustom}
                        className={styles.addButton}
                    >
                        <i className={`la la-plus ${styles.addButtonIcon}`}></i> Add custom
                    </button>
                </div>
            </div>
            <div className={`layered-card-content ${styles.content}`}>


                {/* Questions List */}
                <div className={styles.questionsList}>
                    {questions.length === 0 ? (
                        <p className={styles.emptyMessage}>
                            No pre-screening questions added yet.
                        </p>
                    ) : (
                        <div className={styles.questionsList}>
                            {questions.map((question, index) => (
                                <QuestionCard
                                    key={question.id}
                                    question={question}
                                    index={index}
                                    onRemove={handleRemoveQuestion}
                                    onUpdate={handleUpdateQuestion}
                                    onAddOption={handleAddOption}
                                    onRemoveOption={handleRemoveOption}
                                    onUpdateOption={handleUpdateOption}
                                    onReorderQuestion={handleReorderQuestion}
                                    hasError={validationErrors.has(question.id)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Suggested Questions */}
                    <div className={styles.suggestedSection}>
                        <h4 className={styles.suggestedTitle}>
                            Suggested Pre-screening Questions:
                        </h4>
                        <div className={styles.suggestedList}>
                            {SUGGESTED_QUESTIONS.map((suggested) => {
                                const isAdded = addedQuestionIds.includes(suggested.id);
                                return (
                                    <div
                                        key={suggested.id}
                                        className={styles.suggestedItem}
                                    >
                                        <div className={`${styles.suggestedItemContent} ${isAdded ? styles.suggestedItemContentDisabled : ''}`}>
                                            <p className={styles.suggestedItemTitle}>
                                                {suggested.id
                                                    .split("-")
                                                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                                    .join(" ")}
                                            </p>
                                            <p className={styles.suggestedItemQuestion}>{suggested.question}</p>
                                        </div>
                                        <button
                                            onClick={() => handleAddSuggested(suggested.id)}
                                            disabled={isAdded}
                                            className={`${styles.suggestedAddButton} ${isAdded ? styles.suggestedAddButtonDisabled : styles.suggestedAddButtonEnabled}`}
                                        >
                                            {isAdded ? "Added" : "Add"}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

type QuestionCardProps = {
    question: PreScreeningQuestion;
    index: number;
    onRemove?: (id: string) => void;
    onUpdate?: (id: string, updates: Partial<PreScreeningQuestion>) => void;
    onAddOption?: (questionId: string) => void;
    onRemoveOption?: (questionId: string, optionId: string) => void;
    onUpdateOption?: (questionId: string, optionId: string, value: string) => void;
    onReorderQuestion?: (questionId: string, targetIndex: number) => void;
    hasError?: boolean;
};

function QuestionCard({
    question,
    index,
    onRemove,
    onUpdate,
    onAddOption,
    onRemoveOption,
    onUpdateOption,
    onReorderQuestion,
    hasError,
}: QuestionCardProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [questionText, setQuestionText] = useState(question.question);
    const [questionType, setQuestionType] = useState<QuestionType>(question.type);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setQuestionText(question.question);
        setQuestionType(question.type);
    }, [question.question, question.type]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        if (dropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownOpen]);

    const handleQuestionChange = (value: string) => {
        setQuestionText(value);
        onUpdate?.(question.id, { question: value });
    };

    const handleTypeChange = (type: QuestionType) => {
        setQuestionType(type);
        const updates: Partial<PreScreeningQuestion> = { type };

        // Reset options/values when changing type
        if (type === "dropdown" || type === "checkboxes") {
            updates.options = question.options && question.options.length > 0
                ? question.options
                : [{ id: guid(), value: "" }];
            updates.minValue = undefined;
            updates.maxValue = undefined;
            updates.rangeType = undefined;
            updates.currency = undefined;
        } else if (type === "range") {
            updates.options = undefined;
            updates.minValue = question.minValue || "";
            updates.maxValue = question.maxValue || "";
            updates.rangeType = question.rangeType || "number";
            if (updates.rangeType === "currency") {
                updates.currency = question.currency || "PHP";
            } else {
                updates.currency = undefined;
            }
        } else {
            // short-answer, long-answer, text
            updates.options = undefined;
            updates.minValue = undefined;
            updates.maxValue = undefined;
            updates.rangeType = undefined;
            updates.currency = undefined;
        }

        onUpdate?.(question.id, updates);
    };

    const handleDragStart = (e: React.DragEvent) => {
        setIsDragging(true);
        e.dataTransfer.setData("questionId", question.id);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", ""); // Required for Firefox
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        setDragOverIndex(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const draggedQuestionId = e.dataTransfer.getData("questionId");
        if (draggedQuestionId && draggedQuestionId !== question.id && onReorderQuestion) {
            onReorderQuestion(draggedQuestionId, index);
        }
        setDragOverIndex(null);
    };

    const handleDragEnter = () => {
        setDragOverIndex(index);
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleReorderOption = (draggedOptionId: string, targetIndex: number) => {
        // Reorder options within this question
        if (question.options) {
            const options = [...question.options];
            const draggedIndex = options.findIndex((opt) => opt.id === draggedOptionId);
            if (draggedIndex !== -1 && draggedIndex !== targetIndex) {
                const [removed] = options.splice(draggedIndex, 1);
                options.splice(targetIndex, 0, removed);
                onUpdate?.(question.id, { options });
            }
        }
    };

    return (
        <div
            className={styles.questionCardContainer}
            draggable={!!onReorderQuestion}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
        >
            {/* Drag Handle for Question - On the side */}
            {onReorderQuestion && (
                <div className={styles.dragHandle}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className={styles.dragHandleIcon}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                        />
                    </svg>
                </div>
            )}
            <div
                className={`${styles.questionCard} ${
                    dragOverIndex === index 
                        ? styles.questionCardDragOver 
                        : hasError 
                        ? styles.questionCardError 
                        : styles.questionCardBorder
                } ${isDragging ? styles.questionCardDragging : ''}`}
            >
                {/* Question Input and Type Selector - Gray Bar */}
                <div className={styles.questionHeader}>
                    {question.source === "suggested" ? (
                        <h3 className={styles.questionTitleReadonly}>
                            {question.question}
                        </h3>
                    ) : (
                        <>
                            <input
                                type="text"
                                value={questionText}
                                onChange={(e) => handleQuestionChange(e.target.value)}
                                placeholder="Enter your question"
                                className={`${styles.questionInput} ${hasError ? styles.questionInputError : styles.questionInputDefault}`}
                                onFocus={(e) => {
                                    e.currentTarget.classList.add(hasError ? styles.questionInputFocusError : styles.questionInputFocus);
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.classList.remove(styles.questionInputFocus, styles.questionInputFocusError);
                                }}
                            />

                        </>
                    )}
                    <div className={styles.typeSelector} ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className={styles.typeButton}
                            onFocus={(e) => {
                                e.currentTarget.classList.add(styles.typeButtonFocus);
                            }}
                            onBlur={(e) => {
                                e.currentTarget.classList.remove(styles.typeButtonFocus);
                            }}
                        >
                            <div className={styles.typeButtonContent}>
                                {QUESTION_TYPES.find(t => t.value === questionType)?.icon && (
                                    <i className={`${QUESTION_TYPES.find(t => t.value === questionType)?.icon} ${styles.typeButtonIcon}`}></i>
                                )}
                                <span>{QUESTION_TYPES.find(t => t.value === questionType)?.label || questionType}</span>
                            </div>
                            <i className="la la-angle-down"></i>
                        </button>
                        {dropdownOpen && (
                            <div className={styles.typeDropdown}>
                                {QUESTION_TYPES.map((type) => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => {
                                            handleTypeChange(type.value);
                                            setDropdownOpen(false);
                                        }}
                                        className={`${styles.typeOption} ${questionType === type.value ? styles.typeOptionSelected : ''}`}
                                    >
                                        {type.icon && (
                                            <i className={`${type.icon} ${styles.typeOptionIcon}`}></i>
                                        )}
                                        <span>{type.label}</span>
                                        {questionType === type.value && (
                                            <i className={`la la-check ${styles.typeOptionCheck}`}></i>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {hasError && (
                    <div className={styles.errorMessage}>
                        <p className={styles.errorText}>
                            Please enter a question title.
                        </p>
                    </div>
                )}

                {/* Question Content */}
                <div className={styles.questionContent}>
                    {/* Question Type Content */}
                    {questionType === "dropdown" && (
                        <DropdownOptions
                            questionId={question.id}
                            options={question.options || []}
                            onAddOption={onAddOption}
                            onRemoveOption={onRemoveOption}
                            onUpdateOption={onUpdateOption}
                            onReorderOption={onReorderQuestion ? handleReorderOption : undefined}
                        />
                    )}

                    {questionType === "range" && (
                        <RangeInputs
                            questionId={question.id}
                            minValue={question.minValue || ""}
                            maxValue={question.maxValue || ""}
                            rangeType={question.rangeType || "number"}
                            currency={question.currency || "PHP"}
                            onUpdate={onUpdate}
                        />
                    )}

                    {questionType === "short-answer" && (
                        <div className={styles.hintText}>
                            Short text input field will be shown to candidates
                        </div>
                    )}

                    {questionType === "long-answer" && (
                        <div className={styles.hintText}>
                            Long text input field (textarea) will be shown to candidates
                        </div>
                    )}

                    {questionType === "checkboxes" && (
                        <DropdownOptions
                            questionId={question.id}
                            options={question.options || []}
                            onAddOption={onAddOption}
                            onRemoveOption={onRemoveOption}
                            onUpdateOption={onUpdateOption}
                            onReorderOption={onReorderQuestion ? handleReorderOption : undefined}
                        />
                    )}

                    {questionType === "text" && (
                        <div className={styles.hintText}>
                            Text input field will be shown to candidates
                        </div>
                    )}

                    {/* Delete Question Button */}
                    {onRemove && (
                        <div className={styles.deleteButtonContainer}>
                            <button
                                onClick={() => onRemove(question.id)}
                                className={styles.deleteButton}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className={styles.deleteButtonIcon}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                    />
                                </svg>
                                <span className={styles.deleteButtonText}>Delete Question</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

type DropdownOptionsProps = {
    questionId: string;
    options: QuestionOption[];
    onAddOption?: (questionId: string) => void;
    onRemoveOption?: (questionId: string, optionId: string) => void;
    onUpdateOption?: (questionId: string, optionId: string, value: string) => void;
    onReorderOption?: (draggedOptionId: string, targetIndex: number) => void;
};

function DropdownOptions({
    questionId,
    options,
    onAddOption,
    onRemoveOption,
    onUpdateOption,
    onReorderOption,
}: DropdownOptionsProps) {
    const [draggingOptionId, setDraggingOptionId] = useState<string | null>(null);
    const [dragOverOptionIndex, setDragOverOptionIndex] = useState<number | null>(null);

    const handleOptionDragStart = (e: React.DragEvent, optionId: string) => {
        setDraggingOptionId(optionId);
        e.dataTransfer.setData("optionId", optionId);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", ""); // Required for Firefox
    };

    const handleOptionDragEnd = () => {
        setDraggingOptionId(null);
        setDragOverOptionIndex(null);
    };

    const handleOptionDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleOptionDrop = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        e.stopPropagation();
        const draggedOptionId = e.dataTransfer.getData("optionId");
        if (draggedOptionId && onReorderOption) {
            onReorderOption(draggedOptionId, targetIndex);
        }
        setDragOverOptionIndex(null);
    };

    const handleOptionDragEnter = (index: number) => {
        setDragOverOptionIndex(index);
    };

    const handleOptionDragLeave = () => {
        setDragOverOptionIndex(null);
    };

    return (
        <div className={styles.optionsContainer}>
            {options.map((option, index) => (
                <div
                    key={option.id}
                    draggable={!!onReorderOption}
                    onDragStart={(e) => handleOptionDragStart(e, option.id)}
                    onDragEnd={handleOptionDragEnd}
                    onDragOver={handleOptionDragOver}
                    onDrop={(e) => handleOptionDrop(e, index)}
                    onDragEnter={() => handleOptionDragEnter(index)}
                    onDragLeave={handleOptionDragLeave}
                    className={`${styles.optionItem} ${draggingOptionId === option.id ? styles.optionItemDragging : ''} ${dragOverOptionIndex === index ? styles.optionItemDragOver : ''}`}
                >
                    {/* Drag Handle */}
                    <div className={styles.optionDragHandle}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                            className={styles.optionDragHandleIcon}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                            />
                        </svg>
                    </div>
                    {/* Option Input with Number Inside */}
                    <div className={styles.optionInputWrapper}>
                        <span className={styles.optionNumber}>
                            {index + 1}
                        </span>
                        <input
                            type="text"
                            value={option.value}
                            onChange={(e) => onUpdateOption?.(questionId, option.id, e.target.value)}
                            placeholder="Enter option"
                            className={styles.optionInput}
                        />
                    </div>
                    {/* Remove Option Button */}
                    {onRemoveOption && (
                        <button
                            onClick={() => onRemoveOption(questionId, option.id)}
                            className={styles.optionRemoveButton}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                stroke="currentColor"
                                className={styles.optionRemoveButtonIcon}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    )}
                </div>
            ))}
            {/* Add Option Button */}
            {onAddOption && (
                <button
                    onClick={() => onAddOption(questionId)}
                    className={styles.addOptionButton}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className={styles.addOptionButtonIcon}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4.5v15m7.5-7.5h-15"
                        />
                    </svg>
                    Add Option
                </button>
            )}
        </div>
    );
}

type RangeInputsProps = {
    questionId: string;
    minValue: string;
    maxValue: string;
    rangeType: RangeType;
    currency: string;
    onUpdate?: (id: string, updates: Partial<PreScreeningQuestion>) => void;
};

function RangeInputs({ questionId, minValue, maxValue, rangeType, currency, onUpdate }: RangeInputsProps) {



    const handleRangeTypeChange = (newRangeType: RangeType) => {
        const updates: Partial<PreScreeningQuestion> = {
            rangeType: newRangeType,
        };
        if (newRangeType === "currency") {
            updates.currency = currency || "PHP";
        } else {
            updates.currency = undefined;
        }
        onUpdate?.(questionId, updates);
    };

    const formatNumberWithCommas = (value: string): string => {
        // Remove all non-numeric characters
        const numbers = value.replace(/[^\d]/g, '');
        if (!numbers) return '';
        // Format with commas
        return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const handleNumberInput = (value: string, isCurrency: boolean) => {
        if (isCurrency) {
            // Format with commas for currency
            return formatNumberWithCommas(value);
        } else {
            // For number type, only allow digits (no formatting)
            return value.replace(/[^\d]/g, '');
        }
    };

    return (
        <div className={styles.rangeContainer}>
            {/* Range Type Selector */}
            <div className={styles.rangeTypeSelector}>
                <label className={styles.rangeLabel}>Range Type</label>
                <select
                    value={rangeType}
                    onChange={(e) => handleRangeTypeChange(e.target.value as RangeType)}
                    className={styles.rangeTypeSelect}
                >
                    <option value="number">Number</option>
                    <option value="currency">Currency</option>
                </select>
            </div>

            {/* Range Inputs */}
            <div className={styles.rangeInputsGrid}>
                <div>
                    <label className={styles.rangeLabel}>Minimum</label>
                    <div className={styles.rangeInputWrapper}>
                        {rangeType === "currency" && (
                            <span className={styles.rangeCurrencySymbol}>
                                {currency === "PHP" ? "₱" : "$"}
                            </span>
                        )}
                        <input
                            type="text"
                            value={minValue || "40,000"}
                            onChange={(e) => {
                                const filteredValue = handleNumberInput(e.target.value, rangeType === "currency");
                                onUpdate?.(questionId, {
                                    minValue: filteredValue,
                                });
                            }}
                            placeholder={rangeType === "currency" ? "0" : "0"}
                            className={`${styles.rangeInput} ${rangeType === "currency" ? styles.rangeInputCurrency : styles.rangeInputNumber}`}
                        />
                        {rangeType === "currency" && (
                            <select
                                value={currency}
                                onChange={(e) =>
                                    onUpdate?.(questionId, {
                                        currency: e.target.value,
                                    })
                                }
                                className={styles.rangeCurrencySelect}
                            >
                                <option value="PHP">PHP</option>
                                <option value="USD">USD</option>
                            </select>
                        )}
                    </div>
                </div>
                <div>
                    <label className={styles.rangeLabel}>Maximum</label>
                    <div className={styles.rangeInputWrapper}>
                        {rangeType === "currency" && (
                            <span className={styles.rangeCurrencySymbol}>
                                {currency === "PHP" ? "₱" : "$"}
                            </span>
                        )}
                        <input
                            type="text"
                            value={maxValue || "60,000"}
                            onChange={(e) => {
                                const filteredValue = handleNumberInput(e.target.value, rangeType === "currency");
                                onUpdate?.(questionId, {
                                    maxValue: filteredValue,
                                });
                            }}
                            placeholder={rangeType === "currency" ? "0" : "0"}
                            className={`${styles.rangeInput} ${rangeType === "currency" ? styles.rangeInputCurrency : styles.rangeInputNumber}`}
                        />
                        {rangeType === "currency" && (
                            <select
                                value={currency}
                                onChange={(e) =>
                                    onUpdate?.(questionId, {
                                        currency: e.target.value,
                                    })
                                }
                                className={styles.rangeCurrencySelect}
                            >
                                <option value="PHP">PHP</option>
                                <option value="USD">USD</option>
                            </select>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

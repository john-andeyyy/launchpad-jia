"use client";

import React, { useState, useEffect, useRef } from "react";
import { guid } from "@/lib/Utils";

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
                    minValue: "",
                    maxValue: "",
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

            <div className="flex flex-row items-center justify-between gap-2 pl-3">

                <div className="flex flex-row items-center gap-2 pt-3">
                    <span className="text-base text-[#181D27] font-bold text-lg">
                        {hideSectionNumbers ? "Pre-Screening Questions" : "2. Pre-Screening Questions"}{" "}
                        <span className="text-[#6B7280] font-normal">(optional)</span>
                        
                    </span>
                    <div className="w-6 h-6 bg-[#F8F9FC] border border-[#D5D9EB] rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-[#181D27]">
                                {questions.length}
                            </span>
                        </div>
                </div>
                <div className="flex flex-row items-center justify-between">
                    <button
                        onClick={handleAddCustom}
                        className={`w-fit p-2 px-4 !text-sm !font-semibold !rounded-full whitespace-nowrap border border-[#E9EAEB] 
                        disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer bg-black text-white`}
                    >
                        <i className="la la-plus mr-2 !text-1xl"></i> Add custom
                    </button>
                </div>
            </div>
            <div className="flex flex-col gap-4 layered-card-content">


                {/* Questions List */}
                <div className="space-y-4">
                    {questions.length === 0 ? (
                        <p className="text-md sm:text-sm !font-medium border-b border-[#E9EAEB] pb-3 ">
                            No pre-screening questions added yet.
                        </p>
                    ) : (
                        <div className="space-y-4">
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
                    <div className="space-y-3 pt-2">
                        <h4 className="font-medium !text-gray-500 text-lg sm:text-md">
                            Suggested Pre-screening Questions:
                        </h4>
                        <div className="space-y-2">
                            {SUGGESTED_QUESTIONS.map((suggested) => {
                                const isAdded = addedQuestionIds.includes(suggested.id);
                                return (
                                    <div
                                        key={suggested.id}
                                        className="flex items-center justify-between p-3 !py-0 bg-white rounded-lg  !mb-0"
                                    >
                                        <div className={`flex-1  ${isAdded ? "opacity-50" : ""}`}>
                                            <p className="text-md  text-black !font-semibold mb-1">
                                                {suggested.id
                                                    .split("-")
                                                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                                    .join(" ")}
                                            </p>
                                            <p className="text-sm !font-medium text-gray-500">{suggested.question}</p>
                                        </div>
                                        <button
                                            onClick={() => handleAddSuggested(suggested.id)}
                                            disabled={isAdded}
                                            className={`ml-3 px-3 py-1.5 !rounded-full text-md font-semibold sm:text-sm transition 
                                                !border cursor-pointer ${isAdded
                                                ? "!bg-gray-300 text-white cursor-not-allowed border-[#D5D9EB]"
                                                : "!bg-transparent !text-[#181D27] !border !border-gray-300 hover:bg-[#F8F9FC]"
                                                }`}
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
            className="flex items-center gap-2 "
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
                <div
                    className="cursor-move text-gray-400 hover:text-gray-600 pt-2 flex-shrink-0"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className="w-5 h-5"
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
                className={`flex-1 bg-white rounded-lg border overflow-hidden transition-all ${hasError ? "border-red-500" : "border-[#E9EAEB]"
                    } ${isDragging ? "opacity-50" : ""} ${dragOverIndex === index ? "border-indigo-500 border-2" : ""
                    }`}
            >
                {/* Question Input and Type Selector - Gray Bar */}
                <div className="flex items-center gap-2 p-2 bg-gray-50 -mt-[1px] -mx-[1px] w-[calc(100%+2px)]">
                    {question.source === "suggested" ? (
                        <h3 className="flex-1 text-base font-semibold text-[#181D27] px-3 py-2 !pl-20 sm:!pl-5 md:!pl-10 lg:!pl-10">
                            {question.question}
                        </h3>
                    ) : (
                        <>
                            <input
                                type="text"
                                value={questionText}
                                onChange={(e) => handleQuestionChange(e.target.value)}
                                placeholder="Enter your question"
                                className={`flex-1 border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 ${hasError
                                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                    : "border-gray-300 focus:ring-indigo-500 focus:border-transparent"
                                    }`}
                            />
                            
                        </>
                    )}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent flex items-center gap-2 min-w-[140px] justify-between"
                        >
                            <div className="flex items-center gap-2">
                                {QUESTION_TYPES.find(t => t.value === questionType)?.icon && (
                                    <i className={`${QUESTION_TYPES.find(t => t.value === questionType)?.icon} text-base`}></i>
                                )}
                                <span>{QUESTION_TYPES.find(t => t.value === questionType)?.label || questionType}</span>
                            </div>
                            <i className="la la-angle-down text-xs"></i>
                        </button>
                        {dropdownOpen && (
                            <div className=" absolute right-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
                                {QUESTION_TYPES.map((type) => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => {
                                            handleTypeChange(type.value);
                                            setDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 ${
                                            questionType === type.value ? 'bg-[#F8F9FC] font-semibold' : ''
                                        }`}
                                    >
                                        {type.icon && (
                                            <i className={`${type.icon} text-base`}></i>
                                        )}
                                        <span>{type.label}</span>
                                        {questionType === type.value && (
                                            <i className="la la-check ml-auto text-indigo-600"></i>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {hasError && (
                    <div className="px-4 pt-2">
                        <p className="text-xs text-red-600">
                            Please enter a question title.
                        </p>
                    </div>
                )}

                {/* Question Content */}
                <div className="p-4 space-y-3">
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
                        <div className="text-xs text-[#6B7280]">
                            Short text input field will be shown to candidates
                        </div>
                    )}

                    {questionType === "long-answer" && (
                        <div className="text-xs text-[#6B7280]">
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
                        <div className="text-xs text-[#6B7280]">
                            Text input field will be shown to candidates
                        </div>
                    )}

                    {/* Delete Question Button */}
                    {onRemove && (
                        <div className="flex justify-end pt-2 border-t border-[#E9EAEB]">
                            <button
                                onClick={() => onRemove(question.id)}
                                className="flex items-center gap-2 px-4 py-2 !bg-transparent !text-red-600 !border !border-red-600 !rounded-full
                            hover:!bg-red-50  text-sm cursor-pointer"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="w-5 h-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                    />
                                </svg>
                                <span className="text-sm font-medium">Delete Question</span>
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
        <div className="space-y-2">
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
                    className={`flex items-center gap-2 transition-all ${draggingOptionId === option.id ? "opacity-50" : ""
                        } ${dragOverOptionIndex === index ? "bg-indigo-50 rounded-lg p-1 -m-1" : ""
                        }`}
                >
                    {/* Drag Handle */}
                    <div className="cursor-move text-[#6B7280] hover:text-[#181D27]">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                            className="w-5 h-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                            />
                        </svg>
                    </div>
                    {/* Option Input with Number Inside */}
                    <div className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6B7280] pointer-events-none z-10 px-2 py-1">
                            {index + 1}

                        </span>
                        <input
                            type="text"
                            value={option.value}
                            onChange={(e) => onUpdateOption?.(questionId, option.id, e.target.value)}
                            placeholder="Enter option"
                            className="w-full border border-[#E9EAEB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2
                            focus:ring-indigo-500 focus:border-transparent pl-5
                            border-r-2"
                        />
                    </div>
                    {/* Remove Option Button */}
                    {onRemoveOption && (
                        <button
                            onClick={() => onRemoveOption(questionId, option.id)}
                            className="w-8 h-8 flex items-center justify-center !rounded-full hover:bg-[#F8F9FC] 
                            !text-[#181D27] hover:text-red-500 transition !bg-transparent border !border-[#E9EAEB]"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                stroke="currentColor"
                                className="w-5 h-5"
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
                    className="flex items-center gap-2 !bg-transparent !border-none text-sm !text-[#6B7280] hover:text-[#181D27] transition"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className="w-4 h-4"
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

    const handleNumberInput = (value: string, isCurrency: boolean) => {
        // Allow only numbers and commas (for currency formatting)
        if (isCurrency) {
            // Remove all non-numeric characters except commas
            const filtered = value.replace(/[^\d,]/g, '');
            // Ensure commas are used correctly (no consecutive commas, no comma at start)
            return filtered.replace(/^,|,,+/g, '');
        } else {
            // For number type, only allow digits
            return value.replace(/[^\d]/g, '');
        }
    };

    return (
        <div className="space-y-3">
            {/* Range Type Selector */}
            <div>
                <label className="block text-xs text-[#6B7280] mb-1">Range Type</label>
                <select
                    value={rangeType}
                    onChange={(e) => handleRangeTypeChange(e.target.value as RangeType)}
                    className="border border-[#E9EAEB] rounded-lg px-3 py-2 text-sm text-[#181D27] bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                    <option value="number">Number</option>
                    <option value="currency">Currency</option>
                </select>
            </div>

            {/* Range Inputs */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs text-[#6B7280] mb-1">Minimum</label>
                    <div className="relative flex items-center border border-[#E9EAEB] rounded-lg bg-white">
                        {rangeType === "currency" && (
                            <span className="absolute left-3 text-[#6B7280] text-sm pointer-events-none z-10">
                                {currency === "PHP" ? "₱" : "$"}
                            </span>
                        )}
                        <input
                            type="text"
                            value={minValue}
                            onChange={(e) => {
                                const filteredValue = handleNumberInput(e.target.value, rangeType === "currency");
                                onUpdate?.(questionId, {
                                    minValue: filteredValue,
                                });
                            }}
                            placeholder={rangeType === "currency" ? "40,000" : "1"}
                            className={`flex-1 border-0 rounded-lg py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${rangeType === "currency" ? "pl-8 pr-2" : "px-3"
                                } ${rangeType === "currency" && "rounded-r-none"}`}
                        />
                        {rangeType === "currency" && (
                            <select
                                value={currency}
                                onChange={(e) =>
                                    onUpdate?.(questionId, {
                                        currency: e.target.value,
                                    })
                                }
                                className="border-0 border-l border-[#E9EAEB] rounded-r-lg px-2 py-2 text-sm text-[#181D27] bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="PHP">PHP</option>
                                <option value="USD">USD</option>
                            </select>
                        )}
                    </div>
                </div>
                <div>
                    <label className="block text-xs text-[#6B7280] mb-1">Maximum</label>
                    <div className="relative flex items-center border border-[#E9EAEB] rounded-lg bg-white">
                        {rangeType === "currency" && (
                            <span className="absolute left-3 text-[#6B7280] text-sm pointer-events-none z-10">
                                {currency === "PHP" ? "₱" : "$"}
                            </span>
                        )}
                        <input
                            type="text"
                            value={maxValue}
                            onChange={(e) => {
                                const filteredValue = handleNumberInput(e.target.value, rangeType === "currency");
                                onUpdate?.(questionId, {
                                    maxValue: filteredValue,
                                });
                            }}
                            placeholder={rangeType === "currency" ? "60,000" : "10"}
                            className={`flex-1 border-0 rounded-lg py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${rangeType === "currency" ? "pl-8 pr-2" : "px-3"
                                } ${rangeType === "currency" && "rounded-r-none"}`}
                        />
                        {rangeType === "currency" && (
                            <select
                                value={currency}
                                onChange={(e) =>
                                    onUpdate?.(questionId, {
                                        currency: e.target.value,
                                    })
                                }
                                className="border-0 border-l border-[#E9EAEB] rounded-r-lg px-2 py-2 text-sm text-[#181D27] bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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

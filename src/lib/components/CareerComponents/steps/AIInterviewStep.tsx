"use client";

import InterviewQuestionGeneratorV2 from "../InterviewQuestionGeneratorV2";

interface AIInterviewStepProps {
    questions: any[];
    setQuestions: (questions: any[]) => void;
    jobTitle: string;
    description: string;
}

export default function AIInterviewStep({
    questions,
    setQuestions,
    jobTitle,
    description,
}: AIInterviewStepProps) {
    return (
        <InterviewQuestionGeneratorV2 
            questions={questions} 
            setQuestions={setQuestions} 
            jobTitle={jobTitle} 
            description={description} 
        />
    );
}


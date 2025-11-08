"use client";

import { useState } from "react";
import axios from "axios";
import { useAppContext } from "@/lib/context/AppContext";
import AIInterviewStep from "../steps/AIInterviewStep";
import { candidateActionToast, errorToast } from "@/lib/Utils";
import CareerModal from "./CareerModal";

interface AIInterviewModalProps {
    formData: any;
    setFormData: (formData: any) => void;
    onClose: () => void;
}

export default function AIInterviewModal({ formData, setFormData, onClose }: AIInterviewModalProps) {
    const { user } = useAppContext();
    const [isSaving, setIsSaving] = useState(false);
    
    // Local state for editing
    const [questions, setQuestions] = useState(formData.questions || []);
    const [requireVideo, setRequireVideo] = useState(
        formData.requireVideo === null || formData.requireVideo === undefined ? true : formData.requireVideo
    );
    const [screeningSetting, setScreeningSetting] = useState(
        formData.aiInterviewScreeningSetting || formData.screeningSetting || "Good Fit and above"
    );
    const [aiInterviewSecretPrompt, setAiInterviewSecretPrompt] = useState(
        formData.aiInterviewSecretPrompt || formData.secretPrompt || ""
    );

    const handleSave = async () => {
        // Validate - check if at least 5 questions are added
        const totalQuestions = questions.reduce((acc: number, group: any) => acc + (group.questions?.length || 0), 0);
        if (totalQuestions < 5) {
            errorToast("Please add at least 5 interview questions", 2000);
            return;
        }

        setIsSaving(true);
        try {
            const userInfoSlice = {
                image: user?.image,
                name: user?.name,
                email: user?.email,
            };

            const updatedCareer = {
                _id: formData._id,
                questions: questions,
                requireVideo: requireVideo,
                aiInterviewScreeningSetting: screeningSetting,
                aiInterviewSecretPrompt: aiInterviewSecretPrompt,
                lastEditedBy: userInfoSlice,
                updatedAt: Date.now(),
            };

            const response = await axios.post("/api/update-career", updatedCareer);
            if (response.status === 200) {
                candidateActionToast(
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginLeft: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#181D27" }}>AI Interview settings updated</span>
                    </div>,
                    1300,
                    <i className="la la-check-circle" style={{ color: "#039855", fontSize: 32 }}></i>
                );
                setFormData({
                    ...formData,
                    ...updatedCareer,
                });
                onClose();
            }
        } catch (error) {
            console.error(error);
            errorToast("Failed to update AI Interview settings", 1300);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <CareerModal
            title="Edit AI Interview Setup"
            onSave={handleSave}
            onClose={onClose}
            isSaving={isSaving}
        >
            <AIInterviewStep
                questions={questions}
                setQuestions={setQuestions}
                jobTitle={formData.jobTitle || ""}
                description={formData.description || ""}
                requireVideo={requireVideo}
                setRequireVideo={setRequireVideo}
                screeningSetting={screeningSetting}
                setScreeningSetting={setScreeningSetting}
                secretPrompt={aiInterviewSecretPrompt}
                setSecretPrompt={setAiInterviewSecretPrompt}
            />
        </CareerModal>
    );
}


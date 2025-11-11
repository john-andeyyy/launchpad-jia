"use client";

import { useState } from "react";
import axios from "axios";
import { useAppContext } from "@/lib/context/AppContext";
import CVReviewStep from "../steps/CVReviewStep";
import { candidateActionToast, errorToast } from "@/lib/Utils";
import { PreScreeningQuestion } from "../PreScreeningQuestions";
import CareerModal from "./CareerModal";

interface CVReviewModalProps {
    formData: any;
    setFormData: (formData: any) => void;
    onClose: () => void;
}

export default function CVReviewModal({ formData, setFormData, onClose }: CVReviewModalProps) {
    const { user } = useAppContext();
    const [isSaving, setIsSaving] = useState(false);
    
    // Local state for editing
    const [screeningSetting, setScreeningSetting] = useState(
        formData.cvScreeningSetting || formData.screeningSetting || "Good Fit and above"
    );
    const [cvSecretPrompt, setCvSecretPrompt] = useState(
        formData.cvSecretPrompt || formData.secretPrompt || ""
    );
    const [preScreeningQuestions, setPreScreeningQuestions] = useState<PreScreeningQuestion[]>(
        formData.preScreeningQuestions || []
    );

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const userInfoSlice = {
                image: user?.image,
                name: user?.name,
                email: user?.email,
            };

            const updatedCareer = {
                _id: formData._id,
                cvScreeningSetting: screeningSetting,
                cvSecretPrompt: cvSecretPrompt,
                preScreeningQuestions: preScreeningQuestions,
                lastEditedBy: userInfoSlice,
                updatedAt: Date.now(),
            };

            const response = await axios.post("/api/update-career", updatedCareer);
            if (response.status === 200) {
                candidateActionToast(
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginLeft: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#181D27" }}>CV Review settings updated</span>
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
            errorToast("Failed to update CV Review settings", 1300);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <CareerModal
            title="Edit CV Review &  Pre-Screening Questions"
            onSave={handleSave}
            onClose={onClose}
            isSaving={isSaving}
        >
            <CVReviewStep
                screeningSetting={screeningSetting}
                setScreeningSetting={setScreeningSetting}
                requireVideo={formData.requireVideo || true}
                setRequireVideo={() => {}}
                secretPrompt={cvSecretPrompt}
                setSecretPrompt={setCvSecretPrompt}
                preScreeningQuestions={preScreeningQuestions}
                setPreScreeningQuestions={setPreScreeningQuestions}
                hideSectionNumbers={true}
            />
        </CareerModal>
    );
}


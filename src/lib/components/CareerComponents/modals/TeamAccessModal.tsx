"use client";

import { useState } from "react";
import axios from "axios";
import { useAppContext } from "@/lib/context/AppContext";
import TeamAccess, { TeamMember } from "../TeamAccess";
import { candidateActionToast, errorToast } from "@/lib/Utils";
import CareerModal from "./CareerModal";

interface TeamAccessModalProps {
    formData: any;
    setFormData: (formData: any) => void;
    onClose: () => void;
}

export default function TeamAccessModal({ formData, setFormData, onClose }: TeamAccessModalProps) {
    const { user } = useAppContext();
    const [isSaving, setIsSaving] = useState(false);
    
    // Local state for editing
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>(formData.teamMembers || []);
    const [teamAccessErrors, setTeamAccessErrors] = useState<string[]>([]);

    const handleSave = async () => {
        // Validate - ensure at least one Job Owner
        const hasJobOwner = teamMembers.some((m) => m.role === "Job Owner");
        if (!hasJobOwner) {
            setTeamAccessErrors(["A Career must have a job owner. Please assign a job owner."]);
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
                teamMembers: teamMembers,
                lastEditedBy: userInfoSlice,
                updatedAt: Date.now(),
            };

            const response = await axios.post("/api/update-career", updatedCareer);
            if (response.status === 200) {
                candidateActionToast(
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginLeft: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#181D27" }}>Team access updated</span>
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
            errorToast("Failed to update team access", 1300);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <CareerModal
            title="Edit Team Access"
            onSave={handleSave}
            onClose={onClose}
            isSaving={isSaving}
            maxWidth="900px"
        >
           <div >
                <TeamAccess
                    teamMembers={teamMembers}
                    setTeamMembers={setTeamMembers}
                    errors={teamAccessErrors}
                    hideSectionNumbers={true}
                />
           </div>
        </CareerModal>
    );
}


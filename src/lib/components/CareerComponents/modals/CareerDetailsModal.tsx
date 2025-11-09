"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAppContext } from "@/lib/context/AppContext";
import CareerDetailsStep from "../steps/CareerDetailsStep";
import philippineCitiesAndProvinces from "../../../../../public/philippines-locations.json";
import { candidateActionToast, errorToast } from "@/lib/Utils";
import { TeamMember } from "../TeamAccess";
import CareerModal from "./CareerModal";

const employmentTypeOptions = [{ name: "Full-Time" }, { name: "Part-Time" }];
const workSetupOptions = [{ name: "Fully Remote" }, { name: "Onsite" }, { name: "Hybrid" }];
const countryOptions = [{ name: "Philippines" }];

interface CareerDetailsModalProps {
    formData: any;
    setFormData: (formData: any) => void;
    onClose: () => void;
}

export default function CareerDetailsModal({ formData, setFormData, onClose }: CareerDetailsModalProps) {
    const { user, orgID } = useAppContext();
    const [isSaving, setIsSaving] = useState(false);
    
    // Local state for editing
    const [jobTitle, setJobTitle] = useState(formData.jobTitle || "");
    const [description, setDescription] = useState(formData.description || "");
    const [employmentType, setEmploymentType] = useState(formData.employmentType || "");
    const [workSetup, setWorkSetup] = useState(formData.workSetup || "");
    const [workSetupRemarks, setWorkSetupRemarks] = useState(formData.workSetupRemarks || "");
    const [salaryNegotiable, setSalaryNegotiable] = useState(formData.salaryNegotiable || false);
    const [minimumSalary, setMinimumSalary] = useState(formData.minimumSalary || "");
    const [maximumSalary, setMaximumSalary] = useState(formData.maximumSalary || "");
    const [country, setCountry] = useState(formData.country || "Philippines");
    const [province, setProvince] = useState(formData.province || "");
    const [city, setCity] = useState(formData.location || formData.city || "");
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>(formData.teamMembers || []);
    
    const [provinceList, setProvinceList] = useState<any[]>([]);
    const [cityList, setCityList] = useState<any[]>([]);
    const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
    const [teamAccessErrors, setTeamAccessErrors] = useState<string[]>([]);

    // Initialize province list
    useEffect(() => {
        const sortedProvinces = [...philippineCitiesAndProvinces.provinces].sort(
            (a, b) => a.name.localeCompare(b.name)
        );
        setProvinceList(sortedProvinces);

        if (province) {
            const selectedProvinceObj = sortedProvinces.find((p) => p.name === province);
            if (selectedProvinceObj) {
                const cities = philippineCitiesAndProvinces.cities
                    .filter((c) => c.province === selectedProvinceObj.key)
                    .sort((a, b) => a.name.localeCompare(b.name));
                setCityList(cities);
            }
        }
    }, [province]);

    const handleSave = async () => {
        // Validate
        const errors: Record<string, boolean> = {};
        if (!jobTitle?.trim()) errors.jobTitle = true;
        if (!description?.trim()) errors.description = true;
        if (!employmentType) errors.employmentType = true;
        if (!workSetup) errors.workSetup = true;
        if (!province) errors.province = true;
        if (!city) errors.city = true;
        if (!salaryNegotiable) {
            if (!minimumSalary || minimumSalary === "0") errors.minimumSalary = true;
            if (!maximumSalary || maximumSalary === "0") errors.maximumSalary = true;
        }

        const hasJobOwner = teamMembers.some((m) => m.role === "Job Owner");
        if (!hasJobOwner) {
            setTeamAccessErrors(["A Career must have a job owner. Please assign a job owner."]);
            return;
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        if (Number(minimumSalary) && Number(maximumSalary) && Number(minimumSalary) > Number(maximumSalary)) {
            errorToast("Minimum salary cannot be greater than maximum salary", 1300);
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
                jobTitle,
                description,
                workSetup,
                workSetupRemarks,
                lastEditedBy: userInfoSlice,
                updatedAt: Date.now(),
                minimumSalary: isNaN(Number(minimumSalary)) ? null : Number(minimumSalary),
                maximumSalary: isNaN(Number(maximumSalary)) ? null : Number(maximumSalary),
                country,
                province,
                location: city +", "+province+", "+country,
                city,
                employmentType,
                salaryNegotiable,
                teamMembers,
            };

            const response = await axios.post("/api/update-career", updatedCareer);
            if (response.status === 200) {
                candidateActionToast(
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginLeft: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#181D27" }}>Career details updated</span>
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
            errorToast("Failed to update career details", 1300);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <CareerModal
            title="Edit Career Details & Team Access"
            onSave={handleSave}
            onClose={onClose}
            isSaving={isSaving}
        >
            <CareerDetailsStep
                jobTitle={jobTitle}
                setJobTitle={setJobTitle}
                description={description}
                setDescription={setDescription}
                employmentType={employmentType}
                setEmploymentType={setEmploymentType}
                workSetup={workSetup}
                setWorkSetup={setWorkSetup}
                workSetupRemarks={workSetupRemarks}
                setWorkSetupRemarks={setWorkSetupRemarks}
                salaryNegotiable={salaryNegotiable}
                setSalaryNegotiable={setSalaryNegotiable}
                minimumSalary={minimumSalary}
                setMinimumSalary={setMinimumSalary}
                maximumSalary={maximumSalary}
                setMaximumSalary={setMaximumSalary}
                country={country}
                setCountry={setCountry}
                province={province}
                setProvince={setProvince}
                city={city}
                setCity={setCity}
                countryList={countryOptions}
                provinceList={provinceList}
                cityList={cityList}
                setCityList={setCityList}
                teamMembers={teamMembers}
                setTeamMembers={setTeamMembers}
                teamAccessErrors={teamAccessErrors}
                fieldErrors={fieldErrors}
                setFieldErrors={setFieldErrors}
                hideSectionNumbers={true}
            />
        </CareerModal>
    );
}


"use client";

import React, { useEffect, useRef, useState } from "react";
import InterviewQuestionGeneratorV2 from "./InterviewQuestionGeneratorV2";
import RichTextEditor from "@/lib/components/CareerComponents/RichTextEditor";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
import philippineCitiesAndProvinces from "../../../../public/philippines-locations.json";
import { candidateActionToast, errorToast } from "@/lib/Utils";
import { useAppContext } from "@/lib/context/AppContext";
import axios from "axios";
import CareerActionModal from "./CareerActionModal";
import ErrorModal from "./ErrorModal";
import FullScreenLoadingAnimation from "./FullScreenLoadingAnimation";
import { TeamMember, TeamMemberRole } from "./TeamAccess";
import CareerDetailsStep from "./steps/CareerDetailsStep";
import CVReviewStep from "./steps/CVReviewStep";
import AIInterviewStep from "./steps/AIInterviewStep";
import ReviewCareerStep from "./steps/ReviewCareerStep";

// Setting List icons
const screeningSettingList = [
    {
        name: "Good Fit and above",
        icon: "la la-check",
    },
    {
        name: "Only Strong Fit",
        icon: "la la-check-double",
    },
    {
        name: "No Automatic Promotion",
        icon: "la la-times",
    },
];

const workSetupOptions = [
    {
        name: "Fully Remote",
    },
    {
        name: "Onsite",
    },
    {
        name: "Hybrid",
    },
];

const employmentTypeOptions = [
    {
        name: "Full-Time",
    },
    {
        name: "Part-Time",
    },
];

const countryOptions = [
    {
        name: "Philippines",
    },
];

const STEPS = [
    { id: 1, name: "Career Details & Team Access", key: "careerDetails" },
    { id: 2, name: "CV Review & Pre-screening", key: "cvReview" },
    { id: 3, name: "AI Interview Setup", key: "aiInterview" },
    { id: 4, name: "Review Career", key: "review" },
];

export default function CareerForm({
    career,
    formType,
    setShowEditModal,
}: {
    career?: any;
    formType: string;
    setShowEditModal?: (show: boolean) => void;
}) {
    const { user, orgID } = useAppContext();
    const [currentStep, setCurrentStep] = useState(career?.currentStep || 1);
    const [jobTitle, setJobTitle] = useState(career?.jobTitle || "");
    const [description, setDescription] = useState(career?.description || "");
    const [workSetup, setWorkSetup] = useState(career?.workSetup || "");
    const [workSetupRemarks, setWorkSetupRemarks] = useState(
        career?.workSetupRemarks || ""
    );
    const [screeningSetting, setScreeningSetting] = useState(
        career?.screeningSetting || "Good Fit and above"
    );
    const [employmentType, setEmploymentType] = useState(
        career?.employmentType || ""
    );
    const [requireVideo, setRequireVideo] = useState(
        career?.requireVideo || true
    );
    // Separate secret prompts for CV Review and AI Interview
    const [cvSecretPrompt, setCvSecretPrompt] = useState(
        career?.cvSecretPrompt || career?.secretPrompt || ""
    );
    const [aiInterviewSecretPrompt, setAiInterviewSecretPrompt] = useState(
        career?.aiInterviewSecretPrompt || career?.secretPrompt || ""
    );
    const [preScreeningQuestions, setPreScreeningQuestions] = useState(
        career?.preScreeningQuestions || []
    );
    const [salaryNegotiable, setSalaryNegotiable] = useState(
        career?.salaryNegotiable || false
    );
    const [minimumSalary, setMinimumSalary] = useState(
        career?.minimumSalary || ""
    );
    const [maximumSalary, setMaximumSalary] = useState(
        career?.maximumSalary || ""
    );
    const [questions, setQuestions] = useState(
        career?.questions || [
            {
                id: 1,
                category: "CV Validation / Experience",
                questionCountToAsk: null,
                questions: [],
            },
            {
                id: 2,
                category: "Technical",
                questionCountToAsk: null,
                questions: [],
            },
            {
                id: 3,
                category: "Behavioral",
                questionCountToAsk: null,
                questions: [],
            },
            {
                id: 4,
                category: "Analytical",
                questionCountToAsk: null,
                questions: [],
            },
            {
                id: 5,
                category: "Others",
                questionCountToAsk: null,
                questions: [],
            },
        ]
    );
    const [country, setCountry] = useState(career?.country || "Philippines");
    const [province, setProvince] = useState(career?.province || "");
    const [city, setCity] = useState(career?.location || "");
    const [provinceList, setProvinceList] = useState([]);
    const [cityList, setCityList] = useState([]);
    const [showSaveModal, setShowSaveModal] = useState("");
    const [isSavingCareer, setIsSavingCareer] = useState(false);
    const savingCareerRef = useRef(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [showErrorModal, setShowErrorModal] = useState(false);
    
    // Debug: Log when error modal state changes
    useEffect(() => {
        console.log("Error modal state changed:", showErrorModal, "Errors count:", validationErrors.length);
        if (showErrorModal) {
            console.log("Error modal is now visible. Errors:", validationErrors);
        }
    }, [showErrorModal, validationErrors]);
    
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
        if (career?.teamMembers) {
            return career.teamMembers;
        }
        // Initialize empty, will be set in useEffect when user is available
        return [];
    });
    const [teamAccessErrors, setTeamAccessErrors] = useState<string[]>([]);
    const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
    const [showValidation, setShowValidation] = useState(false);

    // Initialize teamMembers with current user when user is available
    useEffect(() => {
        if (user && teamMembers.length === 0 && !career?.teamMembers) {
            // Check if we're loading from draft - if so, don't override
            // Draft will be loaded in the next useEffect, skip initialization here
            if (formType === "add") {
                return;
            }
            setTeamMembers([
                {
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    role: "Job Owner" as TeamMemberRole,
                },
            ]);
        }
    }, [user, career, formType, orgID]);

    // Track if draft exists to determine whether to use POST or PUT
    const [hasExistingDraft, setHasExistingDraft] = useState(false);

    // Load draft from API on mount (only for new careers)
    useEffect(() => {
        const loadDraft = async () => {
            if (formType === "add" && user && orgID) {
                try {
                    const response = await axios.post("/api/get-career-draft", {
                        orgID,
                        userEmail: user.email,
                    });
                    if (response.data && response.data.draft) {
                        const draft = response.data.draft;
                        setHasExistingDraft(true); // Mark that draft exists
                        // Load currentStep from draft - this preserves the step on refresh
                        if (draft.currentStep) {
                            setCurrentStep(draft.currentStep);
                        }
                        if (draft.jobTitle) setJobTitle(draft.jobTitle);
                        if (draft.description) setDescription(draft.description);
                        if (draft.workSetup) setWorkSetup(draft.workSetup);
                        if (draft.workSetupRemarks)
                            setWorkSetupRemarks(draft.workSetupRemarks);
                        if (draft.screeningSetting)
                            setScreeningSetting(draft.screeningSetting);
                        if (draft.employmentType) setEmploymentType(draft.employmentType);
                        if (draft.requireVideo !== undefined)
                            setRequireVideo(draft.requireVideo);
                        // Load separate secret prompts, with fallback to old secretPrompt for backwards compatibility
                        if (draft.cvSecretPrompt !== undefined) {
                            setCvSecretPrompt(draft.cvSecretPrompt || "");
                        } else if (draft.secretPrompt !== undefined) {
                            // Backwards compatibility: if only old secretPrompt exists, use it for both
                            setCvSecretPrompt(draft.secretPrompt || "");
                        }
                        if (draft.aiInterviewSecretPrompt !== undefined) {
                            setAiInterviewSecretPrompt(draft.aiInterviewSecretPrompt || "");
                        } else if (draft.secretPrompt !== undefined) {
                            // Backwards compatibility: if only old secretPrompt exists, use it for both
                            setAiInterviewSecretPrompt(draft.secretPrompt || "");
                        }
                        if (draft.preScreeningQuestions !== undefined)
                            setPreScreeningQuestions(draft.preScreeningQuestions || []);
                        if (draft.salaryNegotiable !== undefined)
                            setSalaryNegotiable(draft.salaryNegotiable);
                        if (draft.minimumSalary) setMinimumSalary(draft.minimumSalary);
                        if (draft.maximumSalary) setMaximumSalary(draft.maximumSalary);
                        if (draft.questions) setQuestions(draft.questions);
                        if (draft.country) setCountry(draft.country);
                        if (draft.province) setProvince(draft.province);
                        if (draft.city) setCity(draft.city);
                        if (draft.teamMembers && draft.teamMembers.length > 0) {
                            setTeamMembers(draft.teamMembers);
                        } else if (user) {
                            // Initialize with current user if no team members in draft
                            setTeamMembers([
                                {
                                    email: user.email,
                                    name: user.name,
                                    image: user.image,
                                    role: "Job Owner" as TeamMemberRole,
                                },
                            ]);
                        }
                    } else {
                        setHasExistingDraft(false);
                        if (user) {
                            // No draft found, initialize with current user
                            setTeamMembers([
                                {
                                    email: user.email,
                                    name: user.name,
                                    image: user.image,
                                    role: "Job Owner" as TeamMemberRole,
                                },
                            ]);
                        }
                    }
                } catch (error) {
                    console.error("Error loading draft:", error);
                    setHasExistingDraft(false);
                    // Initialize with current user on error
                    if (user) {
                        setTeamMembers([
                            {
                                email: user.email,
                                name: user.name,
                                image: user.image,
                                role: "Job Owner" as TeamMemberRole,
                            },
                        ]);
                    }
                }
            }
        };
        loadDraft();
    }, [formType, orgID, user]);

    // Save draft to API - uses PUT for update, POST for create
    const saveDraft = async (stepOverride?: number) => {
        if (formType === "add" && user && orgID) {
            try {
                const draftData = {
                    orgID,
                    userEmail: user.email,
                    currentStep: stepOverride !== undefined ? stepOverride : currentStep,
                    jobTitle,
                    description,
                    workSetup,
                    workSetupRemarks,
                    screeningSetting,
                    employmentType,
                    requireVideo,
                    cvSecretPrompt,
                    aiInterviewSecretPrompt,
                    preScreeningQuestions,
                    salaryNegotiable,
                    minimumSalary,
                    maximumSalary,
                    questions,
                    country,
                    province,
                    city,
                    teamMembers,
                };

                // If draft exists, use PUT to update; otherwise use POST to create
                if (hasExistingDraft) {
                    await axios.put("/api/save-career-draft", draftData);
                } else {
                    try {
                        await axios.post("/api/save-career-draft", draftData);
                        setHasExistingDraft(true); // Mark that draft now exists
                    } catch (error: any) {
                        // If POST fails with 409 (conflict), try PUT instead
                        if (error.response?.status === 409) {
                            await axios.put("/api/save-career-draft", draftData);
                            setHasExistingDraft(true);
                        } else {
                            throw error;
                        }
                    }
                }
            } catch (error) {
                console.error("Error saving draft:", error);
            }
        }
    };

    // Auto-save draft when form data changes
    useEffect(() => {
        if (formType === "add" && user && orgID) {
            const timeoutId = setTimeout(() => {
                saveDraft();
            }, 1000); // Debounce auto-save
            return () => clearTimeout(timeoutId);
        }
    }, [
        formType,
        user,
        orgID,
        jobTitle,
        description,
        workSetup,
        screeningSetting,
        employmentType,
        requireVideo,
        cvSecretPrompt,
        aiInterviewSecretPrompt,
        preScreeningQuestions,
        salaryNegotiable,
        minimumSalary,
        maximumSalary,
        questions,
        country,
        province,
        city,
        teamMembers,
        currentStep,
    ]);

    const validateStep = (
        step: number
    ): { isValid: boolean; errors: string[]; fieldErrors: Record<string, boolean> } => {
        const errors: string[] = [];
        const fieldErrors: Record<string, boolean> = {};

        if (step === 1) {
            // Career Details & Team Access
            if (!jobTitle?.trim()) {
                // errors.push("Job title is required");
                fieldErrors.jobTitle = true;
            }
            if (!description?.trim()) {
                // errors.push("Job description is required");
                fieldErrors.description = true;
            }
            if (!employmentType) {
                // errors.push("Employment type is required");
                fieldErrors.employmentType = true;
            }
            if (!workSetup) {
                // errors.push("Work arrangement is required");
                fieldErrors.workSetup = true;
            }
            if (!province) {
                // errors.push("State/Province is required");
                fieldErrors.province = true;
            }
            if (!city) {
                // errors.push("City is required");
                fieldErrors.city = true;
            }
            if (salaryNegotiable) {
                // When negotiable, minimum salary must be "0" and maximum is not required
                // if (!minimumSalary || minimumSalary) {
                //     errors.push("Minimum salary is required");
                //     fieldErrors.minimumSalary = true;
                // }
                // Maximum salary is not required when negotiable
            } else {
                // When not negotiable, both are required
                if (!minimumSalary || minimumSalary === "0") {
                    // errors.push("Minimum salary is required");
                    fieldErrors.minimumSalary = true;
                }
                if (!maximumSalary || maximumSalary === "0") {
                    // errors.push("Maximum salary is required");
                    fieldErrors.maximumSalary = true;
                }
            }

            // Validate team access
            const hasJobOwner = teamMembers.some((m) => m.role === "Job Owner");
            if (!hasJobOwner) {
                errors.push(
                    "A Career must have a job owner. Please assign a job owner."
                );
            }
        } else if (step === 2) {
            // CV Review & Pre-screening - no required fields, just settings
        } else if (step === 3) {
            // AI Interview Setup
            const totalQuestions = questions.reduce((acc, group) => acc + group.questions.length, 0);
            if (totalQuestions < 5) {
                errors.push("Please add at least 5 interview questions");
            }
        }

        // Check if there are any errors (either in errors array or fieldErrors object)
        const hasErrors = errors.length > 0 || Object.keys(fieldErrors).length > 0;
        return { isValid: !hasErrors, errors, fieldErrors };
    };

    const goToStep = (step: number) => {
        if (step < 1 || step > STEPS.length) return;

        // Validate current step before moving forward
        if (step > currentStep) {
            const validation = validateStep(currentStep);
            if (!validation.isValid) {
                // Set showValidation to true BEFORE setting errors to ensure state updates correctly
                setShowValidation(true);
                setFieldErrors(validation.fieldErrors);
                if (currentStep === 1) {
                    setTeamAccessErrors(
                        validation.errors.filter((e) => e.includes("job owner"))
                    );
                }
                errorToast(
                    validation.errors[0] ||
                    "Please complete the current step before proceeding",
                    2000
                );
                return;
            }
        }

        // Save current step before navigating
        const previousStep = currentStep;
        setCurrentStep(step);
        setTeamAccessErrors([]);
        setFieldErrors({});
        setShowValidation(false);

        // Immediately save draft when step changes (especially important when going backwards)
        if (formType === "add" && user && orgID && step !== previousStep) {
            // Save draft with the new step value immediately
            saveDraft(step);
        }
    };

    const goToNextStep = () => {
        if (currentStep < STEPS.length) {
            goToStep(currentStep + 1);
        }
    };

    const goToPreviousStep = () => {
        if (currentStep > 1) {
            goToStep(currentStep - 1);
        }
    };

    const isFormValid = () => {
        return (
            jobTitle?.trim().length > 0 &&
            description?.trim().length > 0 &&
            questions.some((q) => q.questions.length > 0) &&
            workSetup?.trim().length > 0
        );
    };

    const updateCareer = async (status: string) => {
        if (
            Number(minimumSalary) &&
            Number(maximumSalary) &&
            Number(minimumSalary) > Number(maximumSalary)
        ) {
            errorToast("Minimum salary cannot be greater than maximum salary", 1300);
            return;
        }
        let userInfoSlice = {
            image: user.image,
            name: user.name,
            email: user.email,
        };
        const updatedCareer = {
            _id: career._id,
            jobTitle,
            description,
            workSetup,
            workSetupRemarks,
            questions,
            lastEditedBy: userInfoSlice,
            status,
            updatedAt: Date.now(),
            screeningSetting,
            requireVideo,
            cvSecretPrompt,
            aiInterviewSecretPrompt,
            preScreeningQuestions,
            salaryNegotiable,
            minimumSalary: isNaN(Number(minimumSalary))
                ? null
                : Number(minimumSalary),
            maximumSalary: isNaN(Number(maximumSalary))
                ? null
                : Number(maximumSalary),
            country,
            province,
            // Backwards compatibility
            location: city,
            employmentType,
        };
        try {
            setIsSavingCareer(true);
            const response = await axios.post("/api/update-career", updatedCareer);
            if (response.status === 200) {
                candidateActionToast(
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                            marginLeft: 8,
                        }}
                    >
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#181D27" }}>
                            Career updated
                        </span>
                    </div>,
                    1300,
                    <i
                        className="la la-check-circle"
                        style={{ color: "#039855", fontSize: 32 }}
                    ></i>
                );
                setTimeout(() => {
                    window.location.href = `/recruiter-dashboard/careers/manage/${career._id}`;
                }, 1300);
            }
        } catch (error) {
            console.error(error);
            errorToast("Failed to update career", 1300);
        } finally {
            setIsSavingCareer(false);
        }
    };

    const confirmSaveCareer = (status: string) => {
        if (
            Number(minimumSalary) &&
            Number(maximumSalary) &&
            Number(minimumSalary) > Number(maximumSalary)
        ) {
            errorToast("Minimum salary cannot be greater than maximum salary", 1300);
            return;
        }

        setShowSaveModal(status);
    };

    const saveCareer = async (status: string) => {
        setShowSaveModal("");
        if (!status) {
            return;
        }

        // Validate all steps before saving
        setShowValidation(true);
        const validation = validateStep(currentStep);
        if (!validation.isValid) {
            // Set showValidation to true to display error messages
            setShowValidation(true);
            setFieldErrors(validation.fieldErrors);
            if (currentStep === 1) {
                setTeamAccessErrors(
                    validation.errors.filter((e) => e.includes("job owner"))
                );
            }
            errorToast(
                validation.errors[0] || "Please complete all required fields",
                2000
            );
            // Don't proceed with save - stay on current step with validation errors visible
            return;
        }
        // Only clear validation state if validation passes
        setFieldErrors({});
        setShowValidation(false);

        if (!savingCareerRef.current) {
            setIsSavingCareer(true);
            savingCareerRef.current = true;
            let userInfoSlice = {
                image: user.image,
                name: user.name,
                email: user.email,
            };
            const careerData = {
                jobTitle,
                description,
                workSetup,
                workSetupRemarks,
                questions,
                lastEditedBy: userInfoSlice,
                createdBy: userInfoSlice,
                screeningSetting,
                orgID,
                requireVideo,
                cvSecretPrompt,
                aiInterviewSecretPrompt,
                preScreeningQuestions,
                salaryNegotiable,
                minimumSalary: isNaN(Number(minimumSalary))
                    ? null
                    : Number(minimumSalary),
                maximumSalary: isNaN(Number(maximumSalary))
                    ? null
                    : Number(maximumSalary),
                country,
                province,
                // Backwards compatibility
                location: city,
                status,
                employmentType,
                teamMembers,
            };

            try {
                const response = await axios.post("/api/add-career", careerData);
                if (response.status === 200) {
                    // Clear draft after successful save
                    if (formType === "add" && user && orgID) {
                        try {
                            await axios.delete(
                                `/api/get-career-draft?orgID=${orgID}&userEmail=${encodeURIComponent(user.email)}`
                            );
                            setHasExistingDraft(false); // Reset draft status
                        } catch (error) {
                            console.error("Error clearing draft:", error);
                        }
                    }
                    candidateActionToast(
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 8,
                                marginLeft: 8,
                            }}
                        >
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#181D27" }}>
                                Career added {status === "active" ? "and published" : ""}
                            </span>
                        </div>,
                        1300,
                        <i
                            className="la la-check-circle"
                            style={{ color: "#039855", fontSize: 32 }}
                        ></i>
                    );
                    setTimeout(() => {
                        window.location.href = `/recruiter-dashboard/careers`;
                    }, 1300);
                }
            } catch (error) {
                savingCareerRef.current = false;
                setIsSavingCareer(false);
                // Check if response has errors array (validation errors)
                const responseData = error.response.data.errors;
                setValidationErrors(responseData);
                setShowErrorModal(true);
                // errorToast(errors[0], 2000);

            }
        }
    };

    useEffect(() => {
        const parseProvinces = () => {
            // Sort provinces alphabetically
            const sortedProvinces = [...philippineCitiesAndProvinces.provinces].sort(
                (a, b) => a.name.localeCompare(b.name)
            );

            setProvinceList(sortedProvinces);

            // Only set province if career has one, otherwise leave empty
            if (career?.province) {
                // Get selected province object
                const selectedProvinceObj = sortedProvinces.find(
                    (p) => p.name === career.province
                );

                // Sort cities alphabetically for selected province
                const sortedCities = philippineCitiesAndProvinces.cities
                    .filter((city) => city.province === selectedProvinceObj?.key)
                    .sort((a, b) => a.name.localeCompare(b.name));

                setCityList(sortedCities);
            } else {
                // No province selected, clear city list
                setProvince("");
                setCityList([]);
                setCity("");
            }
        };

        parseProvinces();
    }, [career]);



    // Render step content
    const renderStepContent = () => {
        if (formType !== "add") {
            // Edit mode - show all content at once (non-segmented)
            return null; // Will be handled below
        }

        switch (currentStep) {
            case 1: // Career Details & Team Access
                return (
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
                        fieldErrors={showValidation ? fieldErrors : {}}
                        setFieldErrors={setFieldErrors}
                    />
                );
            case 2: // CV Review & Pre-screening
                return (
                    <CVReviewStep
                        screeningSetting={screeningSetting}
                        setScreeningSetting={setScreeningSetting}
                        requireVideo={requireVideo}
                        setRequireVideo={setRequireVideo}
                        secretPrompt={cvSecretPrompt}
                        setSecretPrompt={setCvSecretPrompt}
                        preScreeningQuestions={preScreeningQuestions}
                        setPreScreeningQuestions={setPreScreeningQuestions}
                    />
                );
            case 3: // AI Interview Setup
                return (
                    <AIInterviewStep
                        questions={questions}
                        setQuestions={setQuestions}
                        jobTitle={jobTitle}
                        description={description}
                        requireVideo={requireVideo}
                        setRequireVideo={setRequireVideo}
                        screeningSetting={screeningSetting}
                        setScreeningSetting={setScreeningSetting}
                        secretPrompt={aiInterviewSecretPrompt}
                        setSecretPrompt={setAiInterviewSecretPrompt}
                        showValidation={showValidation}
                    />
                );
            case 4: // Review Career
                return (
                    <ReviewCareerStep
                        jobTitle={jobTitle}
                        employmentType={employmentType}
                        workSetup={workSetup}
                        city={city}
                        province={province}
                        country={country}
                        minimumSalary={minimumSalary}
                        maximumSalary={maximumSalary}
                        salaryNegotiable={salaryNegotiable}
                        teamMembers={teamMembers}
                        description={description}
                        cvScreeningSetting={screeningSetting}
                        cvSecretPrompt={cvSecretPrompt}
                        preScreeningQuestions={preScreeningQuestions}
                        aiInterviewScreeningSetting={screeningSetting}
                        requireVideo={requireVideo}
                        aiInterviewSecretPrompt={aiInterviewSecretPrompt}
                        questions={questions}
                        onEditStep={goToStep}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6 max-h-[calc(100vh-100px)] !pt-0
        flex flex-col">

            <div className="">
                {formType === "add" ? (
                    <>
                        <div className=" flex flex-row justify-between items-center w-full">
                            <h1 className="text-2xl font-medium text-[#111827]">
                                {currentStep !== 1 ? (
                                    <>
                                        <span className="text-[#6B7280] font-normal">[Draft] </span>
                                        <span className="font-bold !text-3xl">{jobTitle}</span>
                                    </>
                                ) : (
                                    "Add new career"
                                )}
                            </h1>
                            <div className="flex flex-row items-center gap-2.5 pb-4">
                                <button
                                    disabled={isSavingCareer}
                                    className="w-fit text-[#414651] bg-white border border-[#D5D7DA] px-4
                                    p-2 px-4 !text-sm font-bold !rounded-full
                                    py-2 rounded-full whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                    onClick={() => {
                                        saveDraft();
                                        confirmSaveCareer("inactive");
                                    }}
                                >
                                    Save as Unpublished
                                </button>
                                <button
                                    disabled={isSavingCareer}
                                    className={`w-fit p-2 px-4 !text-sm font-bold !rounded-full whitespace-nowrap border border-[#E9EAEB] 
                                        disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer flex flex-row items-center gap-2
                                        ${isSavingCareer
                                        ? "bg-[#D5D7DA] text-white"
                                        : "bg-black text-white"
                                        }`}
                                    onClick={() => {
                                        saveDraft();
                                        if (currentStep === STEPS.length) {
                                            // On Review Career step, publish the career
                                            
                                            confirmSaveCareer("active");
                                        } else {
                                            // On other steps, continue to next step
                                            goToNextStep();
                                        }
                                    }}
                                >
                                    <span className="las la-check-circle text-white text-xl ml-2"></span>
                                    {currentStep === STEPS.length ? "Publish" : "Save and Continue →"}
                                </button>
                            </div>
                        </div>

                        {/* //! Progress Indicator */}
                        <div className="w-full border-b pb-2 sm:pb-3">
                            <div className="w-full py-1 sm:py-1.5">
                                <div className="flex items-center w-full">
                                    {STEPS.map((step, index) => {
                                        const isActive = currentStep === step.id;
                                        const isCompleted = currentStep > step.id;
                                        const isFuture = currentStep < step.id;
                                        const isClickable = !isFuture;
                                        const isLast = index === STEPS.length - 1;
                                        const hasErrors = step.id === 1 && showValidation && Object.keys(fieldErrors).length > 0;

                                        return (
                                            <React.Fragment key={step.id}>
                                                {/* Circle + Label (stacked) */}
                                                <div className="flex flex-col items-center relative flex-shrink-0">
                                                    {/* Circle */}
                                                    <div
                                                        onClick={() => isClickable && goToStep(step.id)}
                                                        className={`relative w-6 h-6 rounded-full flex items-center justify-center transition-colors z-10 ${
                                                            isActive
                                                                ? hasErrors
                                                                    ? "bg-white border-none shadow-lg"
                                                                    : "bg-white border-[#181D27] shadow-lg"
                                                                : isCompleted
                                                                    ? "bg-black text-white border-white"
                                                                    : "bg-white border-[#D5D7DA]"
                                                        } ${isClickable
                                                            ? "cursor-pointer hover:scale-110 hover:shadow-md"
                                                            : isFuture
                                                                ? "cursor-not-allowed"
                                                                : "cursor-default"
                                                        }`}
                                                    >
                                                        {isCompleted ? (
                                                            <i className="la la-check text-base text-white !p-5 !text-1xl"></i>
                                                        ) : isActive && hasErrors ? (
                                                            <i className="las la-exclamation-triangle text-[#DC2626] text-2xl"></i>
                                                        ) : isActive ? (
                                                            <div className="las la-dot-circle text-black text-3xl"></div>
                                                        ) : (
                                                            <i className="las la-dot-circle text-[#D5D7DA] text-3xl"></i>
                                                        )}
                                                    </div>

                                                    <span
                                                        onClick={() => isClickable && goToStep(step.id)}
                                                        className={`mt-2 text-sm sm:text-xs md:text-sm text-center
                                                            whitespace-nowrap leading-tight transition-colors ${isActive
                                                                ? "font-semibold text-[#181D27]"
                                                                : "text-[#6B7280]"
                                                            } ${isClickable
                                                                ? "cursor-pointer hover:text-[#181D27]"
                                                                : isFuture
                                                                    ? "cursor-not-allowed"
                                                                    : "cursor-default"
                                                            }`}
                                                    >
                                                        {step.name}
                                                    </span>
                                                </div>

                                                {/* LINE (between steps only) - directly connected to circle */}
                                                {!isLast && (
                                                    <div className="flex-1 relative h-[3px] sm:h-[4px] md:h-[5px] -ml-[16px] -mr-[16px]">
                                                        {/* Background line */}
                                                        <div className="absolute inset-0 bg-[#E5E7EB] rounded-full" />

                                                        {/* Progress line */}
                                                        {index < currentStep - 1 && (
                                                            <div
                                                                className="absolute inset-0 rounded-full"
                                                                style={{
                                                                    background: 'linear-gradient(90deg, #9FCAED 0%, #CEB6DA 34%, #EBACC9 67%, #FCCEC0 100%)'
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>


                        {/* Step Content */}
                        <div className="mt-4">{renderStepContent()}</div>

                    </>
                ) : (
                    <div className="mb-[35px] flex flex-row justify-between items-center w-full">
                        <h1 className="text-2xl font-medium text-[#111827]">
                            Edit Career Details
                        </h1>
                        <div className="flex flex-row items-center gap-2.5">
                            <button
                                className="w-fit text-[#414651] bg-white border border-[#D5D7DA] px-4 py-2 rounded-full whitespace-nowrap cursor-pointer"
                                onClick={() => {
                                    setShowEditModal?.(false);
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                disabled={!isFormValid() || isSavingCareer}
                                className="w-fit text-[#414651] bg-white border border-[#D5D7DA] px-4 py-2 rounded-full whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50"
                                onClick={() => {
                                    updateCareer("inactive");
                                }}
                            >
                                Save Changes as Unpublished
                            </button>
                            <button
                                disabled={!isFormValid() || isSavingCareer}
                                className={`w-fit px-4 py-2 rounded-full whitespace-nowrap border border-[#E9EAEB] disabled:cursor-not-allowed disabled:opacity-50 ${!isFormValid() || isSavingCareer
                                    ? "bg-[#D5D7DA] text-white"
                                    : "bg-black text-white"
                                    }`}
                                onClick={() => {
                                    updateCareer("active");
                                }}
                            >
                                <i className="la la-check-circle text-white text-xl mr-2"></i>
                                Save Changes as Published
                            </button>
                        </div>
                    </div>
                )}
                {formType !== "add" && (
                    <div className="flex flex-row justify-between w-full gap-4 items-start mt-4 ">
                    <div className="w-[60%] flex flex-col gap-2">
                        <div className="layered-card-outer">
                            <div className="layered-card-middle">
                                <div className="flex flex-row items-center gap-2">
                                    <div className="w-8 h-8 bg-[#181D27] rounded-full flex items-center justify-center">
                                        <i className="la la-suitcase text-white text-xl"></i>
                                    </div>
                                    <span className="text-base text-[#181D27] font-bold">
                                        Career Information
                                    </span>
                                </div>
                                <div className="layered-card-content">
                                    <span>Job Title</span>
                                    <input
                                        value={jobTitle}
                                        className="form-control"
                                        placeholder="Enter job title"
                                        onChange={(e) => {
                                            setJobTitle(e.target.value || "");
                                        }}
                                    ></input>
                                    <span>Description</span>
                                    <RichTextEditor setText={setDescription} text={description} />
                                </div>
                            </div>
                        </div>
                        <InterviewQuestionGeneratorV2
                            questions={questions}
                            setQuestions={(questions) => setQuestions(questions)}
                            jobTitle={jobTitle}
                            description={description}
                            showValidation={showValidation}
                        />
                    </div>
                    <div className="w-[40%] flex flex-col gap-2">
                        <div className="layered-card-outer">
                            <div className="layered-card-middle">
                                <div className="flex flex-row items-center gap-2">
                                    <div className="w-8 h-8 bg-[#181D27] rounded-full flex items-center justify-center">
                                        <i className="la la-cog text-white text-xl"></i>
                                    </div>
                                    <span className="text-base text-[#181D27] font-bold">
                                        Settings
                                    </span>
                                </div>
                                <div className="layered-card-content">
                                    <div className="flex flex-row gap-2">
                                        <i className="la la-id-badge text-[#414651] text-xl"></i>
                                        <span>Screening Setting</span>
                                    </div>
                                    <CustomDropdown
                                        onSelectSetting={(setting) => {
                                            setScreeningSetting(setting);
                                        }}
                                        screeningSetting={screeningSetting}
                                        settingList={screeningSettingList}
                                    />
                                    <span>
                                        Jia automatically endorses candidates who meet the chosen criteria.
                                    </span>
                                    <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-[#E9EAEB]">
                                        <div className="flex flex-row items-center gap-2">
                                            <i className="la la-magic text-[#7C3AED] text-xl"></i>
                                            <span className="font-medium">CV Secret Prompt (optional)</span>
                                        </div>
                                        <p className="text-[#6B7280] text-sm">
                                            Secret Prompts give you extra control over Jia's evaluation style, complementing her accurate assessment of requirements from the job description.
                                        </p>
                                        <textarea
                                            className="form-control"
                                            rows={4}
                                            placeholder="Enter a secret prompt (e.g. Give higher fit scores to candidates who participate in hackathons or competitions.)"
                                            value={cvSecretPrompt}
                                            onChange={(e) => setCvSecretPrompt(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-row justify-between gap-2 mt-4 pt-4 border-t border-[#E9EAEB]">
                                        <div className="flex flex-row gap-2">
                                            <i className="la la-video text-[#414651] text-xl"></i>
                                            <span>Require Video Interview</span>
                                        </div>
                                        <div className="flex flex-row items-start gap-2">
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    checked={requireVideo}
                                                    onChange={() => setRequireVideo(!requireVideo)}
                                                />
                                                <span className="slider round"></span>
                                            </label>
                                            <span>{requireVideo ? "Yes" : "No"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                )}
                {showSaveModal && (
                    <CareerActionModal
                        action={showSaveModal}
                        onAction={(action) => saveCareer(action)}
                    />
                )}
                {showErrorModal && (
                    <ErrorModal
                        key="error-modal"
                        errors={validationErrors.length > 0 ? validationErrors : ["An error occurred"]}
                        onClose={() => {
                            console.log("Closing error modal");
                            setShowErrorModal(false);
                            // Clear errors after a short delay
                            setTimeout(() => {
                                setValidationErrors([]);
                            }, 100);
                        }}
                    />
                )}
                {/* Don't show loading animation if error modal is showing */}
                {isSavingCareer && !showErrorModal && (
                    <FullScreenLoadingAnimation
                        title={formType === "add" ? "Saving career..." : "Updating career..."}
                        subtext={`Please wait while we are ${formType === "add" ? "saving" : "updating"
                            } the career`}
                    />
                )}
            </div>
        </div>
    );
}

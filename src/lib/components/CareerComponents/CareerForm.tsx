"use client";

import { useEffect, useRef, useState } from "react";
import InterviewQuestionGeneratorV2 from "./InterviewQuestionGeneratorV2";
import RichTextEditor from "@/lib/components/CareerComponents/RichTextEditor";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
import philippineCitiesAndProvinces from "../../../../public/philippines-locations.json";
import { candidateActionToast, errorToast } from "@/lib/Utils";
import { useAppContext } from "@/lib/context/AppContext";
import axios from "axios";
import CareerActionModal from "./CareerActionModal";
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
    const [currentStep, setCurrentStep] = useState(1);
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
    const [salaryNegotiable, setSalaryNegotiable] = useState(
        career?.salaryNegotiable || true
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
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
        if (career?.teamMembers) {
            return career.teamMembers;
        }
        // Initialize empty, will be set in useEffect when user is available
        return [];
    });
    const [teamAccessErrors, setTeamAccessErrors] = useState<string[]>([]);

    // Initialize teamMembers with current user when user is available
    useEffect(() => {
        if (user && teamMembers.length === 0 && !career?.teamMembers) {
            // Check if we're loading from draft - if so, don't override
            if (formType === "add" && typeof window !== "undefined") {
                const draftKey = `career-draft-${orgID}`;
                const savedDraft = localStorage.getItem(draftKey);
                if (savedDraft) {
                    // Draft will be loaded in the next useEffect, skip initialization
                    return;
                }
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

    // Load draft from localStorage on mount (only for new careers)
    useEffect(() => {
        if (formType === "add" && typeof window !== "undefined") {
            const draftKey = `career-draft-${orgID}`;
            const savedDraft = localStorage.getItem(draftKey);
            if (savedDraft) {
                try {
                    const draft = JSON.parse(savedDraft);
                    if (draft.currentStep) setCurrentStep(draft.currentStep);
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
                    if (draft.salaryNegotiable !== undefined)
                        setSalaryNegotiable(draft.salaryNegotiable);
                    if (draft.minimumSalary) setMinimumSalary(draft.minimumSalary);
                    if (draft.maximumSalary) setMaximumSalary(draft.maximumSalary);
                    if (draft.questions) setQuestions(draft.questions);
                    if (draft.country) setCountry(draft.country);
                    if (draft.province) setProvince(draft.province);
                    if (draft.city) setCity(draft.city);
                    if (draft.teamMembers) setTeamMembers(draft.teamMembers);
                } catch (error) {
                    console.error("Error loading draft:", error);
                }
            }
        }
    }, [formType, orgID]);

    // Save draft to localStorage
    const saveDraft = () => {
        if (formType === "add" && typeof window !== "undefined") {
            const draftKey = `career-draft-${orgID}`;
            const draft = {
                currentStep,
                jobTitle,
                description,
                workSetup,
                workSetupRemarks,
                screeningSetting,
                employmentType,
                requireVideo,
                salaryNegotiable,
                minimumSalary,
                maximumSalary,
                questions,
                country,
                province,
                city,
                teamMembers,
                savedAt: Date.now(),
            };
            localStorage.setItem(draftKey, JSON.stringify(draft));
        }
    };

    // Auto-save draft when form data changes
    useEffect(() => {
        if (formType === "add") {
            const timeoutId = setTimeout(() => {
                saveDraft();
            }, 1000); // Debounce auto-save
            return () => clearTimeout(timeoutId);
        }
    }, [
        jobTitle,
        description,
        workSetup,
        screeningSetting,
        employmentType,
        requireVideo,
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
    ): { isValid: boolean; errors: string[] } => {
        const errors: string[] = [];

        if (step === 1) {
            // Career Details & Team Access
            if (!jobTitle?.trim()) errors.push("Job title is required");
            if (!description?.trim()) errors.push("Job description is required");
            if (!employmentType) errors.push("Employment type is required");
            if (!workSetup) errors.push("Work arrangement is required");
            if (!province) errors.push("State/Province is required");
            if (!city) errors.push("City is required");
            if (!minimumSalary || minimumSalary === "0")
                errors.push("Minimum salary is required");
            if (!maximumSalary || maximumSalary === "0")
                errors.push("Maximum salary is required");

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
            const hasQuestions = questions.some((q) => q.questions.length > 0);
            if (!hasQuestions) {
                errors.push("At least one interview question is required");
            }
        }

        return { isValid: errors.length === 0, errors };
    };

    const goToStep = (step: number) => {
        if (step < 1 || step > STEPS.length) return;

        // Validate current step before moving
        if (step > currentStep) {
            const validation = validateStep(currentStep);
            if (!validation.isValid) {
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

        setCurrentStep(step);
        setTeamAccessErrors([]);
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
        const validation = validateStep(currentStep);
        if (!validation.isValid) {
            errorToast(
                validation.errors[0] || "Please complete all required fields",
                2000
            );
            return;
        }

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
                    if (formType === "add" && typeof window !== "undefined") {
                        const draftKey = `career-draft-${orgID}`;
                        localStorage.removeItem(draftKey);
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
                errorToast("Failed to add career", 1300);
            } finally {
                savingCareerRef.current = false;
                setIsSavingCareer(false);
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
                    />
                );
            case 2: // CV Review & Pre-screening
                return (
                    <CVReviewStep
                        screeningSetting={screeningSetting}
                        setScreeningSetting={setScreeningSetting}
                        requireVideo={requireVideo}
                        setRequireVideo={setRequireVideo}
                    />
                );
            case 3: // AI Interview Setup
                return (
                    <AIInterviewStep
                        questions={questions}
                        setQuestions={setQuestions}
                        jobTitle={jobTitle}
                        description={description}
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
                        teamMembersCount={teamMembers.length}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6 max-h-[calc(100vh-150px)] overflow-auto flex flex-col bg-white">

            <div className="">
                {formType === "add" ? (
                    <>
                        <div className="mb-[35px] flex flex-row justify-between items-center w-full">
                            <h1 className="text-2xl font-medium text-[#111827]">
                                Add new career
                            </h1>
                            <div className="flex flex-row items-center gap-2.5">
                                <button
                                    disabled={isSavingCareer}
                                    className="w-fit text-[#414651] bg-white border border-[#D5D7DA] px-4 py-2 rounded-full whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50"
                                    onClick={() => {
                                        saveDraft();
                                        confirmSaveCareer("inactive");
                                    }}
                                >
                                    Save as Unpublished
                                </button>
                                <button
                                    disabled={isSavingCareer || currentStep === STEPS.length}
                                    className={`w-fit px-4 py-2 rounded-full whitespace-nowrap border border-[#E9EAEB] disabled:cursor-not-allowed disabled:opacity-50 ${isSavingCareer || currentStep === STEPS.length
                                        ? "bg-[#D5D7DA] text-white"
                                        : "bg-black text-white"
                                        }`}
                                    onClick={() => {
                                        saveDraft();
                                        goToNextStep();
                                    }}
                                >
                                    Save and Continue →
                                </button>
                            </div>
                        </div>

                        {/* //! Progress Indicator */}
                        <div className="mb-5 w-full">
                            <div className="flex items-center justify-between relative">
                                {STEPS.map((step, index) => {
                                    const isActive = currentStep === step.id;
                                    const isCompleted = currentStep > step.id;
                                    const isClickable = currentStep >= step.id || isCompleted;

                                    return (
                                        <div
                                            key={step.id}
                                            className="flex items-center flex-1 relative"
                                        >
                                            <div className="flex flex-col items-center flex-1 z-[2]">
                                                <div
                                                    onClick={() => isClickable && goToStep(step.id)}
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-semibold transition-all ${isActive
                                                        ? "bg-[#181D27] text-white border-[3px] border-[#181D27]"
                                                        : isCompleted
                                                            ? "bg-[#039855] text-white"
                                                            : "bg-[#E5E7EB] text-[#6B7280]"
                                                        } ${isClickable ? "cursor-pointer" : "cursor-default"}`}
                                                >
                                                    {isCompleted ? (
                                                        <i className="la la-check text-xl"></i>
                                                    ) : (
                                                        step.id
                                                    )}
                                                </div>
                                                <span
                                                    className={`mt-2 text-xs text-center max-w-[120px] ${isActive
                                                        ? "font-semibold text-[#181D27]"
                                                        : "font-normal text-[#6B7280]"
                                                        }`}
                                                >
                                                    {step.name}
                                                </span>
                                            </div>
                                            {index < STEPS.length - 1 && (
                                                <div
                                                    className={`absolute top-5 left-[20%] right-[20%] h-0.5 z-[1] ${currentStep > step.id
                                                        ? "bg-[#039855]"
                                                        : "bg-[#E5E7EB]"
                                                        }`}
                                                ></div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Step Content */}
                        <div className="mt-4">{renderStepContent()}</div>

                        {/* Navigation Buttons
                        <div className="mt-8 flex justify-between items-center w-full">
                            <button
                                disabled={currentStep === 1 || isSavingCareer}
                                onClick={goToPreviousStep}
                                className={`px-5 py-2.5 border rounded-lg flex items-center gap-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${currentStep === 1
                                        ? "bg-[#F3F4F6] text-[#9CA3AF] border-[#D5D7DA]"
                                        : "bg-white text-[#181D27] border-[#D5D7DA]"
                                    }`}
                            >
                                <i className="la la-arrow-left"></i>
                                Previous
                            </button>
                        </div> */}
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
                    <div className="flex flex-row justify-between w-full gap-4 items-start mt-4">
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
                                            This settings allows Jia to automatically endorse candidates
                                            who meet the chosen criteria.
                                        </span>
                                        <div className="flex flex-row justify-between gap-2">
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
                {isSavingCareer && (
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

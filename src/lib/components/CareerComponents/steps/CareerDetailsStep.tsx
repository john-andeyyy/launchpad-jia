"use client";

import RichTextEditor from "@/lib/components/CareerComponents/RichTextEditor";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
import TeamAccess, { TeamMember } from "../TeamAccess";
import philippineCitiesAndProvinces from "../../../../../public/philippines-locations.json";
import { useEffect } from "react";

const employmentTypeOptions = [{ name: "Full-Time" }, { name: "Part-Time" }];

const workSetupOptions = [
    { name: "Fully Remote" },
    { name: "Onsite" },
    { name: "Hybrid" },
];

interface CareerDetailsStepProps {
    jobTitle: string;
    setJobTitle: (value: string) => void;
    description: string;
    setDescription: (value: string) => void;
    employmentType: string;
    setEmploymentType: (value: string) => void;
    workSetup: string;
    setWorkSetup: (value: string) => void;
    workSetupRemarks: string;
    setWorkSetupRemarks: (value: string) => void;
    salaryNegotiable: boolean;
    setSalaryNegotiable: (value: boolean) => void;
    minimumSalary: string;
    setMinimumSalary: (value: string) => void;
    maximumSalary: string;
    setMaximumSalary: (value: string) => void;
    country: string;
    setCountry: (value: string) => void;
    province: string;
    setProvince: (value: string) => void;
    city: string;
    setCity: (value: string) => void;
    countryList: any[];
    provinceList: any[];
    cityList: any[];
    setCityList: (cities: any[]) => void;
    teamMembers: TeamMember[];
    setTeamMembers: (members: TeamMember[]) => void;
    teamAccessErrors: string[];
    fieldErrors: Record<string, boolean>;
    setFieldErrors: (errors: Record<string, boolean>) => void;
}

export default function CareerDetailsStep({
    jobTitle,
    setJobTitle,
    description,
    setDescription,
    employmentType,
    setEmploymentType,
    workSetup,
    setWorkSetup,
    workSetupRemarks,
    setWorkSetupRemarks,
    salaryNegotiable,
    setSalaryNegotiable,
    minimumSalary,
    setMinimumSalary,
    maximumSalary,
    setMaximumSalary,
    country,
    setCountry,
    province,
    setProvince,
    city,
    setCity,
    countryList,
    provinceList,
    cityList,
    setCityList,
    teamMembers,
    setTeamMembers,
    teamAccessErrors,
    fieldErrors,
    setFieldErrors,
}: CareerDetailsStepProps) {
    const handleProvinceChange = (selectedProvince: string) => {
        setProvince(selectedProvince);
        const provinceObj = provinceList.find((p) => p.name === selectedProvince);
        if (provinceObj) {
            const cities = philippineCitiesAndProvinces.cities
                .filter((city) => city.province === provinceObj.key)
                .sort((a, b) => a.name.localeCompare(b.name));
            setCityList(cities);
            // Clear city when province changes
            setCity("");
            // Clear province error if it exists
            if (fieldErrors.province) {
                setFieldErrors({ ...fieldErrors, province: false });
            }
        } else {
            setCityList([]);
            setCity("");
        }
    };

    // Fix text size and list styling for RichTextEditor
    useEffect(() => {
        const styleId = 'rich-text-editor-custom-styles';
        let style = document.getElementById(styleId) as HTMLStyleElement;

        if (!style) {
            style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .rich-text-editor-wrapper [contenteditable="true"] {
                    font-size: 14px !important;
                    line-height: 1.7 !important;
                    color: #181D27 !important;
                }
                .rich-text-editor-wrapper [contenteditable="true"] * {
                    color: #181D27 !important;
                }
                .rich-text-editor-wrapper ul,
                .rich-text-editor-wrapper ol {
                    margin-left: 24px !important;
                    margin-top: 8px !important;
                    margin-bottom: 8px !important;
                    padding-left: 24px !important;
                    list-style-position: outside !important;
                    color: #181D27 !important;
                }
                .rich-text-editor-wrapper ul {
                    list-style-type: disc !important;
                }
                .rich-text-editor-wrapper ul::marker,
                .rich-text-editor-wrapper ul li::marker {
                    color: #181D27 !important;
                }
                .rich-text-editor-wrapper ol {
                    list-style-type: decimal !important;
                }
                .rich-text-editor-wrapper ol::marker,
                .rich-text-editor-wrapper ol li::marker {
                    color: #181D27 !important;
                }
                .rich-text-editor-wrapper li {
                    margin-bottom: 4px !important;
                    display: list-item !important;
                    list-style-position: outside !important;
                    color: #181D27 !important;
                }
                .rich-text-editor-wrapper li::marker {
                    color: #181D27 !important;
                    font-weight: normal !important;
                }
                /* Ensure buttons don't lose focus from editor */
                .rich-text-editor-wrapper button[type="button"] {
                    user-select: none;
                    -webkit-user-select: none;
                }
            `;
            document.head.appendChild(style);
        }

       
        const wrapper = document.querySelector('.rich-text-editor-wrapper');
        if (wrapper) {
            // Intercept execCommand to ensure editor is focused before it runs
            const originalExecCommand = document.execCommand.bind(document);
            let execCommandOverride: ((commandId: string, showUI?: boolean, value?: string) => boolean) | null = null;

            execCommandOverride = (commandId: string, showUI?: boolean, value?: string) => {
                // If it's a list command, ensure editor is focused
                if (commandId === 'insertOrderedList' || commandId === 'insertUnorderedList') {
                    const editor = document.querySelector('.rich-text-editor-wrapper [contenteditable="true"]') as HTMLElement;
                    if (editor && document.activeElement !== editor && !editor.contains(document.activeElement)) {
                        editor.focus();
                    }
                }
                return originalExecCommand(commandId, showUI, value);
            };

            // Override execCommand
            (document as any).execCommand = execCommandOverride;

            return () => {
                // Restore original execCommand
                if (execCommandOverride) {
                    (document as any).execCommand = originalExecCommand;
                }
              
            };
        }
    }, []);

    return (
        <div className="flex flex-col lg:flex-row justify-between w-full gap-4 items-start">
            <div className="w-full lg:w-[75%] flex flex-col gap-4">
                {/* Basic Information */}

                <div className="layered-card-outer-career">
                    <div className="layered-card-middle">
                        <div className="flex flex-row items-center gap-2">

                            <span className="text-base text-[#181D27] font-bold text-lg pl-2 md:pl-4 pt-3">
                                1. Career Information
                            </span>
                        </div>
                        <div className="layered-card-content">
                            <span className="text-base text-[#181D27] font-bold text-lg">
                                Basic Information
                            </span>
                            {/* //!Job Title */}
                            <span>Job Title</span>
                            <div className="relative">
                                <input
                                    value={jobTitle}
                                    className={`form-control !pl-[10%] text-base ${fieldErrors.jobTitle ? "!border-[#DC2626]" : ""}`}
                                    placeholder="Enter job title"
                                    onChange={(e) => {
                                        setJobTitle(e.target.value || "");
                                        if (fieldErrors.jobTitle) {
                                            setFieldErrors({ ...fieldErrors, jobTitle: false });
                                        }
                                    }}
                                />
                                {fieldErrors.jobTitle && (
                                    <i className="las la-exclamation-circle text-[#DC2626] text-2xl absolute right-3 top-1/2 -translate-y-1/2"></i>
                                )}
                            </div>
                            {fieldErrors.jobTitle && (
                                <span className="text-[#DC2626] text-sm">This is a required field.</span>
                            )}

                            {/* //! Additional Information */}
                            <div className="pt-2 md:pt-0">
                                <div className="!border-none pt-2 md:pt-0 space-y-2 md:space-y-4  ">
                                    <span className="text-base text-[#181D27] font-bold text-lg ">
                                        Work Setting
                                    </span>
                                    {/* //! Work Setting */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <div>
                                            {/* //! Employment Type */}
                                            <label>Employment Type</label>
                                            <div className=" !text-black">
                                                <CustomDropdown
                                                    onSelectSetting={(value) => {
                                                        setEmploymentType(value);
                                                        if (fieldErrors.employmentType) {
                                                            setFieldErrors({ ...fieldErrors, employmentType: false });
                                                        }
                                                    }}
                                                    screeningSetting={employmentType}
                                                    settingList={employmentTypeOptions}
                                                    placeholder="Select Employment Type"
                                                    hasError={fieldErrors.employmentType}
                                                />
                                                {fieldErrors.employmentType && (
                                                    <span className="text-[#DC2626] text-sm">This is a required field.</span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            {/* //! Work Setup Arrangement */}
                                            <label>Work Setup Arrangement</label>
                                            <div className=" !text-black">
                                                <CustomDropdown
                                                    onSelectSetting={(value) => {
                                                        setWorkSetup(value);
                                                        if (fieldErrors.workSetup) {
                                                            setFieldErrors({ ...fieldErrors, workSetup: false });
                                                        }
                                                    }}
                                                    screeningSetting={workSetup}
                                                    settingList={workSetupOptions}
                                                    placeholder="Select Work Setup"
                                                    hasError={fieldErrors.workSetup}
                                                />
                                                {fieldErrors.workSetup && (
                                                    <span className="text-[#DC2626] text-sm">This is a required field.</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {/* //! Location */}
                                    <div className="pt-2">
                                        <span className="text-base text-[#181D27] font-bold text-lg ">
                                            Location
                                        </span>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                            <div>
                                                <label>Country</label>
                                                <div className=" !text-black">
                                                    <CustomDropdown
                                                        onSelectSetting={setCountry}
                                                        screeningSetting={country}
                                                        settingList={countryList}
                                                        placeholder="Select Country"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label >State / Province</label>
                                                <div className=" !text-black">
                                                    <CustomDropdown
                                                        onSelectSetting={handleProvinceChange}
                                                        screeningSetting={province}
                                                        settingList={provinceList}
                                                        placeholder="Select State / Province"
                                                        hasError={fieldErrors.province}
                                                    />
                                                    {fieldErrors.province && (
                                                        <span className="text-[#DC2626] text-sm">This is a required field.</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <label >City</label>
                                                <div className=" !text-black">
                                                    <CustomDropdown
                                                        onSelectSetting={(value) => {
                                                            setCity(value);
                                                            if (fieldErrors.city) {
                                                                setFieldErrors({ ...fieldErrors, city: false });
                                                            }
                                                        }}
                                                        screeningSetting={city}
                                                        settingList={cityList}
                                                        placeholder="Select City"
                                                        disabled={!province || cityList.length === 0}
                                                        hasError={fieldErrors.city}
                                                    />
                                                    {fieldErrors.city && (
                                                        <span className="text-[#DC2626] text-sm">This is a required field.</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* //! Salary */}
                                    <div className="flex flex-col gap-2 pt-2">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                            <span className="text-base text-[#181D27] font-bold text-lg">
                                                Salary
                                            </span>
                                            <div className="flex flex-row items-center gap-2">
                                                <span className="text-sm text-[#181D27]">Negotiable</span>
                                                <label className="switch">
                                                    <input
                                                        type="checkbox"
                                                        checked={salaryNegotiable}
                                                        onChange={() => {
                                                            const newNegotiable = !salaryNegotiable;
                                                            setSalaryNegotiable(newNegotiable);
                                                            if (newNegotiable) {
                                                                setMinimumSalary("");
                                                                setMaximumSalary("");
                                                                const updatedErrors = { ...fieldErrors };
                                                                if (fieldErrors.minimumSalary) {
                                                                    updatedErrors.minimumSalary = false;
                                                                }
                                                                if (fieldErrors.maximumSalary) {
                                                                    updatedErrors.maximumSalary = false;
                                                                }
                                                                setFieldErrors(updatedErrors);
                                                            }
                                                        }}
                                                    />
                                                    <span className="slider round"></span>

                                                </label>

                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                            <div className="flex flex-col gap-2">
                                                <span>Minimum Salary</span>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 
                                                    text-[#6c757d] text-base pointer-events-none z-10">
                                                        ₱
                                                    </span>
                                                    <input
                                                        type="number"
                                                        className={`form-control pl-5 pr-20  text-base ${(fieldErrors.minimumSalary && !salaryNegotiable) ? "!border-[#DC2626]" : ""}`}
                                                        placeholder="0"
                                                        min={0}
                                                        value={ minimumSalary}
                                                        onChange={(e) => {
                                                            if (!salaryNegotiable) {
                                                                setMinimumSalary(e.target.value || "");
                                                                if (fieldErrors.minimumSalary) {
                                                                    setFieldErrors({ ...fieldErrors, minimumSalary: false });
                                                                }
                                                            }
                                                        }}
                                                        disabled={salaryNegotiable}
                                                    />
                                                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none ${fieldErrors.maximumSalary ? "text-[#DC2626]" : "text-[#6c757d"}`}>
                                                        PHP
                                                    </span>
                                                    {(fieldErrors.minimumSalary && !salaryNegotiable) && (
                                                        <i className="las la-exclamation-circle text-[#DC2626] text-2xl absolute right-3 top-1/2 -translate-y-1/2 -translate-x-3/2"></i>
                                                    )}
                                                </div>
                                                {(fieldErrors.minimumSalary && !salaryNegotiable) && (
                                                    <span className="text-[#DC2626] text-sm">This is a required field.</span>
                                                )}

                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <span>Maximum Salary</span>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6c757d] text-base pointer-events-none z-10">
                                                        ₱
                                                    </span>
                                                    <input
                                                        type="number"
                                                        className={`form-control pl-5 pr-20  text-base ${fieldErrors.maximumSalary ? "!border-[#DC2626]" : ""}`}
                                                        placeholder="0"
                                                        min={0}
                                                        value={maximumSalary}
                                                        disabled={salaryNegotiable}
                                                        onChange={(e) => {
                                                            setMaximumSalary(e.target.value || "");
                                                            if (fieldErrors.maximumSalary) {
                                                                setFieldErrors({ ...fieldErrors, maximumSalary: false });
                                                            }
                                                        }}
                                                    />
                                                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none ${fieldErrors.maximumSalary ? "text-[#DC2626]" : "text-[#6c757d]"}`}>
                                                        PHP
                                                    </span>
                                                    {(fieldErrors.maximumSalary && !salaryNegotiable) && (
                                                    <i className="las la-exclamation-circle text-[#DC2626] text-2xl absolute right-3 top-1/2 -translate-y-1/2 -translate-x-3/2"></i>
                                                )}
                                                </div>
                                                
                                                {fieldErrors.maximumSalary && !salaryNegotiable && (
                                                    <span className="text-[#DC2626] text-sm">This is a required field.</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="layered-card-outer-career">
                    <div className="layered-card-middle">
                        <span className="text-base text-[#181D27] font-bold text-lg pl-2 md:pl-4 pt-3">
                            2. Job Description
                        </span>
                        <div className="flex flex-row items-center gap-2">

                            <div className="layered-card-content border-none rich-text-editor-wrapper">
                                {/* <span className="text-base text-[#181D27] font-bold text-lg">Description</span> */}
                                <div className="">
                                    <RichTextEditor
                                        setText={(text) => {
                                            setDescription(text);
                                            if (fieldErrors.description) {
                                                setFieldErrors({ ...fieldErrors, description: false });
                                            }
                                        }}
                                        text={description}
                                        hasError={fieldErrors.description}
                                    />
                                </div>
                                {fieldErrors.description && (
                                    <span className="text-[#DC2626] text-sm mt-1 block">This is a required field.</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>


                <TeamAccess
                    teamMembers={teamMembers}
                    setTeamMembers={setTeamMembers}
                    errors={teamAccessErrors}
                />
            </div>

            <div className="w-full lg:w-[30%] lg:sticky top-0">
                <div className="layered-card-outer-career">
                    <div className="layered-card-middle">
                        <div className="flex flex-row items-center gap-2 pl-2 md:pl-5 pt-2">
                            <img 
                                src="/icons/lightbulb.svg" 
                                alt="lightbulb" 
                                style={{ width: "20px", height: "20px" }}
                            />
                            <span className="text-base text-[#181D27] font-bold text-lg">
                                Tips
                            </span>
                        </div>
                        <div className="layered-card-content flex flex-col gap-4">
                            <span>
                                <span className="font-bold text-black"> Use clear, standard job titles</span> for better
                                searchability (e.g., "Software Engineer" instead of "Code Ninja" or "Tech Rockstar").
                            </span>
                            <span>
                                <span className="font-bold text-black"> Avoid abbreviations</span> or internal role codes that applicants may not understand
                                (e.g., use "QA Engineer" instead of "QE II" or "QA-TL").
                            </span>
                            <span>
                                <span className="font-bold text-black"> Keep it concise</span> — job titles should be no more than a few words
                                (2–4 max), avoiding fluff or marketing terms.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

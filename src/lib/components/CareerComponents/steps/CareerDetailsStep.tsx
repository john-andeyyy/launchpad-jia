"use client";

import RichTextEditor from "@/lib/components/CareerComponents/RichTextEditor";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
import TeamAccess, { TeamMember } from "../TeamAccess";
import philippineCitiesAndProvinces from "../../../../../public/philippines-locations.json";
import { useEffect, useState } from "react";
import { assetConstants } from "@/lib/utils/constantsV2";
import styles from "@/lib/styles/screens/careerDetailsStep.module.scss";

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
    salaryCurrency: string;
    setSalaryCurrency: (value: string) => void;
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
    hideSectionNumbers?: boolean;
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
    salaryCurrency,
    setSalaryCurrency,
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
    hideSectionNumbers = false,
}: CareerDetailsStepProps) {
    const [isMinCurrencyOpen, setIsMinCurrencyOpen] = useState(false);
    const [isMaxCurrencyOpen, setIsMaxCurrencyOpen] = useState(false);

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
        <div className={styles.container}>
            <div className={styles.mainContent}>
                {/* Basic Information */}

                <div className="layered-card-outer-career">
                    <div className="layered-card-middle">
                        <div className={styles.headerRow}>
                            <span className={styles.sectionTitle}>
                                {hideSectionNumbers ? "Career Information" : "1. Career Information"}
                            </span>
                        </div>
                        <div className="layered-card-content">
                            <span className={styles.basicInfoTitle}>
                                Basic Information
                            </span>
                            {/* //!Job Title */}
                            <span>Job Title</span>
                            <div className={styles.inputWrapper}>
                                <input
                                    value={jobTitle}
                                    className={`form-control ${styles.salaryInput} ${fieldErrors.jobTitle ? styles.inputError : styles.inputNormal}`}
                                    placeholder="Enter job title"
                                    onChange={(e) => {
                                        setJobTitle(e.target.value || "");
                                        if (fieldErrors.jobTitle) {
                                            setFieldErrors({ ...fieldErrors, jobTitle: false });
                                        }
                                    }}
                                />
                                {fieldErrors.jobTitle && (
                                    <i className={`las la-exclamation-circle ${styles.inputErrorIcon}`}></i>
                                )}
                            </div>
                            {fieldErrors.jobTitle && (
                                <span className={styles.errorText}>This is a required field.</span>
                            )}

                            {/* //! Additional Information */}
                            <div className={styles.workSettingSection}>
                                <div className={styles.workSettingContainer}>
                                    <span className={styles.workSettingTitle}>
                                        Work Setting
                                    </span>
                                    {/* //! Work Setting */}
                                    <div className={styles.workSettingGrid}>
                                        <div>
                                            {/* //! Employment Type */}
                                            <label>Employment Type</label>
                                            <div className={styles.textBlack}>
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
                                                    <span className={styles.errorText}>This is a required field.</span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            {/* //! Work Setup Arrangement */}
                                            <label>Work Setup Arrangement</label>
                                            <div className={styles.textBlack}>
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
                                                    <span className={styles.errorText}>This is a required field.</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {/* //! Location */}
                                    <div className={styles.locationSection}>
                                        <span className={styles.locationTitle}>
                                            Location
                                        </span>
                                        <div className={styles.locationGrid}>
                                            <div>
                                                <label>Country</label>
                                                <div className={styles.textBlack}>
                                                    <CustomDropdown
                                                        onSelectSetting={setCountry}
                                                        screeningSetting={country}
                                                        settingList={countryList}
                                                        placeholder="Select Country"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label>State / Province</label>
                                                <div className={styles.textBlack}>
                                                    <CustomDropdown
                                                        onSelectSetting={handleProvinceChange}
                                                        screeningSetting={province}
                                                        settingList={provinceList}
                                                        placeholder="Select State / Province"
                                                        hasError={fieldErrors.province}
                                                    />
                                                    {fieldErrors.province && (
                                                        <span className={styles.errorText}>This is a required field.</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <label>City</label>
                                                <div className={styles.textBlack}>
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
                                                        <span className={styles.errorText}>This is a required field.</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* //! Salary */}
                                    <div className={styles.salarySection}>
                                        <div className={styles.salaryHeader}>
                                            <span className={styles.salaryTitle}>
                                                Salary
                                            </span>
                                            <div className={styles.negotiableContainer}>
                                                <span className={styles.negotiableText}>Negotiable</span>
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
                                        <div className={styles.salaryGrid}>

                                            <div className={styles.salaryInputContainer}>
                                                <span>Minimum Salary</span>
                                                <div className={styles.inputWrapper}>
                                                    <span className={styles.currencySymbol}>
                                                        {salaryCurrency === "PHP" ? "₱" : "$"}
                                                    </span>
                                                    <input
                                                        type="text"
                                                        className={`form-control ${styles.salaryInput} ${(fieldErrors.minimumSalary && !salaryNegotiable) ? styles.inputError : styles.inputNormal}`}
                                                        placeholder="0"
                                                        value={minimumSalary}
                                                        onChange={(e) => {
                                                            if (!salaryNegotiable) {
                                                                // Remove all non-numeric characters and format with commas
                                                                const numbers = e.target.value.replace(/[^\d]/g, '');
                                                                const formatted = numbers ? numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
                                                                setMinimumSalary(formatted);
                                                                if (fieldErrors.minimumSalary) {
                                                                    setFieldErrors({ ...fieldErrors, minimumSalary: false });
                                                                }
                                                            }
                                                        }}
                                                        disabled={salaryNegotiable}
                                                    />
                                                    <div className={styles.currencySelectContainer}>
                                                        <select
                                                            className={`${styles.currencySelect} ${fieldErrors.minimumSalary ? styles.currencySelectError : styles.currencySelectNormal}`}
                                                            value={salaryCurrency || "PHP"}
                                                            onChange={(e) => {
                                                                setSalaryCurrency(e.target.value);
                                                                setIsMinCurrencyOpen(false);
                                                            }}
                                                            onFocus={() => setIsMinCurrencyOpen(true)}
                                                            onBlur={() => setIsMinCurrencyOpen(false)}
                                                            disabled={salaryNegotiable}
                                                        >
                                                            <option value="PHP">PHP</option>
                                                            <option value="USD">USD</option>
                                                        </select>
                                                        <img 
                                                            src={assetConstants.chevron} 
                                                            alt="" 
                                                            className={`${styles.chevronIcon} ${isMinCurrencyOpen ? styles.chevronRotated : ''}`}
                                                            style={{ width: '20px', height: '20px' }}
                                                        />
                                                    </div>
                                                    {(fieldErrors.minimumSalary && !salaryNegotiable) && (
                                                        <i className={`las la-exclamation-circle ${styles.salaryErrorIcon}`}></i>
                                                    )}
                                                </div>
                                                {(fieldErrors.minimumSalary && !salaryNegotiable) && (
                                                    <span className={styles.errorText}>This is a required field.</span>
                                                )}
                                            </div>
                                            <div className={styles.salaryInputContainer}>
                                                <span>Maximum Salary</span>
                                                <div className={styles.inputWrapper}>
                                                    <span className={styles.currencySymbol}>
                                                        {salaryCurrency === "PHP" ? "₱" : "$"}
                                                    </span>
                                                    <input
                                                        type="text"
                                                        className={`form-control ${styles.salaryInput} ${fieldErrors.maximumSalary ? styles.inputError : styles.inputNormal}`}
                                                        placeholder="0"
                                                        value={maximumSalary}
                                                        disabled={salaryNegotiable}
                                                        onChange={(e) => {
                                                            // Remove all non-numeric characters and format with commas
                                                            const numbers = e.target.value.replace(/[^\d]/g, '');
                                                            const formatted = numbers ? numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
                                                            setMaximumSalary(formatted);
                                                            if (fieldErrors.maximumSalary) {
                                                                setFieldErrors({ ...fieldErrors, maximumSalary: false });
                                                            }
                                                        }}
                                                    />
                                                    <div className={styles.currencySelectContainer}>
                                                        <select
                                                            className={`${styles.currencySelect} ${fieldErrors.maximumSalary ? styles.currencySelectError : styles.currencySelectNormal}`}
                                                            value={salaryCurrency || "PHP"}
                                                            onChange={(e) => {
                                                                setSalaryCurrency(e.target.value);
                                                                setIsMaxCurrencyOpen(false);
                                                            }}
                                                            onFocus={() => setIsMaxCurrencyOpen(true)}
                                                            onBlur={() => setIsMaxCurrencyOpen(false)}
                                                            disabled={salaryNegotiable}
                                                        >
                                                            <option value="PHP">PHP</option>
                                                            <option value="USD">USD</option>
                                                        </select>
                                                        <img 
                                                            src={assetConstants.chevron} 
                                                            alt="" 
                                                            className={`${styles.chevronIcon} ${isMaxCurrencyOpen ? styles.chevronRotated : ''}`}
                                                            style={{ width: '20px', height: '20px' }}
                                                        />
                                                    </div>
                                                    {(fieldErrors.maximumSalary && !salaryNegotiable) && (
                                                        <i className={`las la-exclamation-circle ${styles.salaryErrorIcon}`}></i>
                                                    )}
                                                </div>
                                                {fieldErrors.maximumSalary && !salaryNegotiable && (
                                                    <span className={styles.errorText}>This is a required field.</span>
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
                        <span className={styles.sectionTitle}>
                            {hideSectionNumbers ? "Job Description" : "2. Job Description"}
                        </span>
                        <div className={styles.jobDescriptionSection}>
                            <div className={`layered-card-content ${styles.richTextEditorWrapper} rich-text-editor-wrapper`}>
                                {/* <span className="text-base text-[#181D27] font-bold text-lg">Description</span> */}
                                <div>
                                    <RichTextEditor
                                        setText={(text) => {
                                            setDescription(text);
                                            if (fieldErrors.description) {
                                                setFieldErrors({ ...fieldErrors, description: false });
                                            }
                                        }}
                                        text={description}
                                        hasError={fieldErrors.description}
                                        btnBorder={true}
                                    />
                                </div>
                                {fieldErrors.description && (
                                    <span className={styles.errorTextBlock}>This is a required field.</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {!hideSectionNumbers && (
                    <TeamAccess
                        teamMembers={teamMembers}
                        setTeamMembers={setTeamMembers}
                        errors={teamAccessErrors}
                    />
                )}
            </div>

            <div className={styles.tipsSidebar}>
                <div className="layered-card-outer-career">
                    <div className="layered-card-middle">
                        <div className={styles.tipsHeader}>
                            <img
                                src="/icons/lightbulb.svg"
                                alt="lightbulb"
                                className={styles.tipsHeaderIcon}
                            />
                            <span className={styles.tipsHeaderTitle}>
                                Tips
                            </span>
                        </div>
                        <div className={`layered-card-content ${styles.tipsContent}`}>
                            <span className={styles.tipText}>
                                <span className={styles.tipTextBold}> Use clear, standard job titles</span> for better
                                searchability (e.g., "Software Engineer" instead of "Code Ninja" or "Tech Rockstar").
                            </span>
                            <span className={styles.tipText}>
                                <span className={styles.tipTextBold}> Avoid abbreviations</span> or internal role codes that applicants may not understand
                                (e.g., use "QA Engineer" instead of "QE II" or "QA-TL").
                            </span>
                            <span className={styles.tipText}>
                                <span className={styles.tipTextBold}> Keep it concise</span> — job titles should be no more than a few words
                                (2–4 max), avoiding fluff or marketing terms.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

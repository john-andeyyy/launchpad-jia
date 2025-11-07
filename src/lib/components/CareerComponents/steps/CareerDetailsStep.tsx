"use client";

import RichTextEditor from "@/lib/components/CareerComponents/RichTextEditor";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
import TeamAccess, { TeamMember } from "../TeamAccess";
import philippineCitiesAndProvinces from "../../../../../public/philippines-locations.json";

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
        } else {
            setCityList([]);
            setCity("");
        }
    };

    return (
        <div className="flex flex-col lg:flex-row justify-between w-full gap-4 items-start">
            <div className="w-full lg:w-[70%] flex flex-col gap-4">
                {/* Basic Information */}

                <div className="layered-card-outer">
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
                            <span>Job Title</span>
                            <input
                                value={jobTitle}
                                className="form-control !h-15 text-lg"
                                placeholder="Enter job title"
                                onChange={(e) => setJobTitle(e.target.value || "")}
                            />

                            {/* //! Additional Information */}
                            <div className="">
                                <div className="layered-card-content !border-none    ">
                                    <span className="text-base text-[#181D27] font-bold text-lg">
                                        Work Setting
                                    </span>
                                    {/* //! Work Setting */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-lg">
                                        <div>
                                            <label>Employment Type</label>
                                            <CustomDropdown
                                                onSelectSetting={setEmploymentType}
                                                screeningSetting={employmentType}
                                                settingList={employmentTypeOptions}
                                                placeholder="Select Employment Type"
                                            />
                                        </div>
                                        <div>
                                            <label>Work Setup Arrangement</label>
                                            <CustomDropdown
                                                onSelectSetting={setWorkSetup}
                                                screeningSetting={workSetup}
                                                settingList={workSetupOptions}
                                                placeholder="Select Work Setup"
                                            />
                                        </div>
                                    </div>
                                    {/* //! Location */}
                                    <div className="pt-2">
                                        <span className="text-base text-[#181D27] font-bold text-lg ">
                                            Location
                                        </span>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-lg">
                                            <div>
                                                <label>Country</label>
                                                <CustomDropdown
                                                    onSelectSetting={setCountry}
                                                    screeningSetting={country}
                                                    settingList={countryList}
                                                    placeholder="Select Country"
                                                />
                                            </div>
                                            <div className="text-lg">
                                                <label >State / Province</label>
                                                <CustomDropdown
                                                    onSelectSetting={handleProvinceChange}
                                                    screeningSetting={province}
                                                    settingList={provinceList}
                                                    placeholder="Select State / Province"
                                                />
                                            </div>
                                            <div className="text-lg">
                                                <label >City</label>
                                                <CustomDropdown
                                                    onSelectSetting={setCity}
                                                    screeningSetting={city}
                                                    settingList={cityList}
                                                    placeholder="Select City"
                                                    disabled={!province || cityList.length === 0}
                                                />
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
                                                        onChange={() => setSalaryNegotiable(!salaryNegotiable)}
                                                    />
                                                    <span className="slider round"></span>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                            <div className="flex flex-col gap-2">
                                                <span>Minimum Salary</span>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6c757d] text-base pointer-events-none">
                                                        ₱
                                                    </span>
                                                    <input
                                                        type="number"
                                                        className="form-control pl-5 pr-20 !h-15 text-lg"
                                                        placeholder="0"
                                                        min={0}
                                                        value={minimumSalary}
                                                        onChange={(e) => setMinimumSalary(e.target.value || "")}
                                                    />
                                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[#6c757d] text-sm pointer-events-none">
                                                        PHP
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <span>Maximum Salary</span>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6c757d] text-base pointer-events-none">
                                                        ₱
                                                    </span>
                                                    <input
                                                        type="number"
                                                        className="form-control pl-5 pr-20 !h-15 text-lg"
                                                        placeholder="0"
                                                        min={0}
                                                        value={maximumSalary}
                                                        onChange={(e) => setMaximumSalary(e.target.value || "")}
                                                    />
                                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[#6c757d] text-sm pointer-events-none">
                                                        PHP
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="layered-card-outer">
                    <div className="layered-card-middle">
                        <span className="text-base text-[#181D27] font-bold text-lg pl-2 md:pl-4 pt-3">
                            2. Job Description
                        </span>
                        <div className="flex flex-row items-center gap-2">


                            <div className="layered-card-content border-none">
                                <span className="text-base text-[#181D27] font-bold text-lg">Description</span>
                                <RichTextEditor setText={setDescription} text={description} />
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
                <div className="layered-card-outer">
                    <div className="layered-card-middle">
                        <span className="text-base text-[#181D27] font-bold text-lg pl-2 md:pl-5 pt-2" >
                            Tips
                        </span>
                        <div className="layered-card-content flex flex-col gap-4">
                            <span>
                                <span className="font-bold"> Use clear, standard job titles</span> for better
                                searchability (e.g., "Software Engineer" instead of "Code Ninja" or "Tech Rockstar").
                            </span>
                            <span>
                                <span className="font-bold"> Avoid abbreviations</span> or internal role codes that applicants may not understand
                                (e.g., use "QA Engineer" instead of "QE II" or "QA-TL").
                            </span>
                            <span>
                                <span className="font-bold"> Keep it concise</span> — job titles should be no more than a few words
                                (2–4 max), avoiding fluff or marketing terms.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

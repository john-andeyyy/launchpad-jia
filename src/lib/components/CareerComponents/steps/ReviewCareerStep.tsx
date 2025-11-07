"use client";

interface ReviewCareerStepProps {
    jobTitle: string;
    employmentType: string;
    workSetup: string;
    city: string;
    province: string;
    country: string;
    minimumSalary: string;
    maximumSalary: string;
    salaryNegotiable: boolean;
    teamMembersCount: number;
}

export default function ReviewCareerStep({
    jobTitle,
    employmentType,
    workSetup,
    city,
    province,
    country,
    minimumSalary,
    maximumSalary,
    salaryNegotiable,
    teamMembersCount,
}: ReviewCareerStepProps) {
    return (
        <div className="flex flex-col gap-4">
            <div className="layered-card-outer">
                <div className="layered-card-middle">
                    <div className="flex flex-row items-center gap-2">
                        <div className="w-8 h-8 bg-[#181D27] rounded-full flex items-center justify-center">
                            <i className="la la-eye text-white text-xl"></i>
                        </div>
                        <span className="text-base text-[#181D27] font-bold">Review Career Details</span>
                    </div>
                    <div className="layered-card-content">
                        <div className="flex flex-col gap-3">
                            <div>
                                <span className="text-sm font-semibold text-[#6B7280]">Job Title</span>
                                <p className="text-base text-[#181D27] mt-1">{jobTitle || "Not set"}</p>
                            </div>
                            <div>
                                <span className="text-sm font-semibold text-[#6B7280]">Employment Type</span>
                                <p className="text-base text-[#181D27] mt-1">{employmentType || "Not set"}</p>
                            </div>
                            <div>
                                <span className="text-sm font-semibold text-[#6B7280]">Work Setup</span>
                                <p className="text-base text-[#181D27] mt-1">{workSetup || "Not set"}</p>
                            </div>
                            <div>
                                <span className="text-sm font-semibold text-[#6B7280]">Location</span>
                                <p className="text-base text-[#181D27] mt-1">
                                    {city && province ? `${city}, ${province}, ${country}` : "Not set"}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm font-semibold text-[#6B7280]">Salary Range</span>
                                <p className="text-base text-[#181D27] mt-1">
                                    {minimumSalary && maximumSalary 
                                        ? `P ${minimumSalary} - P ${maximumSalary} PHP ${salaryNegotiable ? "(Negotiable)" : ""}` 
                                        : "Not set"}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm font-semibold text-[#6B7280]">Team Members</span>
                                <p className="text-base text-[#181D27] mt-1">{teamMembersCount} member(s)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


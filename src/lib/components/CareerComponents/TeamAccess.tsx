"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAppContext } from "@/lib/context/AppContext";
import { errorToast } from "@/lib/Utils";

export type TeamMemberRole = "Job Owner" | "Contributor" | "Reviewer";

export interface TeamMember {
    email: string;
    name: string;
    image?: string;
    role: TeamMemberRole;
}

interface TeamAccessProps {
    teamMembers: TeamMember[];
    setTeamMembers: (members: TeamMember[]) => void;
    errors?: string[];
    hideSectionNumbers?: boolean;
}

const roleDescriptions: Record<TeamMemberRole, string> = {
    "Job Owner": "Leads the hiring process for assigned jobs. Has access to all career settings.",
    "Contributor": "Helps evaluate candidates and assist with hiring tasks. Can move candidates through the pipeline, but cannot change any career settings.",
    "Reviewer": "Reviews candidates and provides feedback. Can only view candidate profiles and comment."
};

export default function TeamAccess({ teamMembers, setTeamMembers, errors = [], hideSectionNumbers = false }: TeamAccessProps) {
    const { user, orgID } = useAppContext();
    const [showMemberDropdown, setShowMemberDropdown] = useState(false);
    const [memberSearch, setMemberSearch] = useState("");
    const [availableMembers, setAvailableMembers] = useState<any[]>([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);
    const [openRoleDropdown, setOpenRoleDropdown] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const roleDropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    useEffect(() => {
        const fetchMembers = async () => {
            if (!orgID) return;
            setIsLoadingMembers(true);
            try {
                const response = await axios.post("/api/fetch-members", { orgID });
                // Filter out members that are already added and only show active members
                const addedEmails = teamMembers.map(m => m.email);
                const filtered = response.data.filter((member: any) =>
                    member.status !== "invited" && !addedEmails.includes(member.email)
                );
                setAvailableMembers(filtered);
            } catch (error) {
                console.error("Failed to fetch members:", error);
            } finally {
                setIsLoadingMembers(false);
            }
        };
        if (showMemberDropdown) {
            fetchMembers();
        }
    }, [showMemberDropdown, orgID, teamMembers]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowMemberDropdown(false);
            }
            // Close role dropdowns when clicking outside
            if (openRoleDropdown) {
                const roleDropdownRef = roleDropdownRefs.current[openRoleDropdown];
                if (roleDropdownRef && !roleDropdownRef.contains(event.target as Node)) {
                    setOpenRoleDropdown(null);
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openRoleDropdown]);

    const addMember = (member: any) => {
        const newMember: TeamMember = {
            email: member.email,
            name: member.name,
            image: member.image,
            role: "Contributor"
        };
        setTeamMembers([...teamMembers, newMember]);
        setShowMemberDropdown(false);
        setMemberSearch("");
    };

    const removeMember = (email: string) => {
        setTeamMembers(teamMembers.filter(m => m.email !== email));
    };

    const updateMemberRole = (email: string, role: TeamMemberRole) => {
        setTeamMembers(teamMembers.map(m =>
            m.email === email ? { ...m, role } : m
        ));
    };

    const filteredAvailableMembers = availableMembers.filter(member =>
        member.name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
        member.email?.toLowerCase().includes(memberSearch.toLowerCase())
    );

    // Ensure current user is in the list (only if user is available)
    if (!user) {
        return (
            <div className="layered-card-outer-career">
                <div className="layered-card-middle">
                    <div className="flex flex-row items-center gap-2">
                        <div className="w-8 h-8 bg-[#181D27] rounded-full flex items-center justify-center">
                            <i className="la la-users text-white text-lg"></i>
                        </div>
                        {/* <span className="text-base text-[#181D27] font-bold">3. Team Access</span> */}
                    </div>
                    <div className="layered-card-content">
                        <p className="text-[#6B7280] text-sm">Loading user information...</p>
                    </div>
                </div>
            </div>
        );
    }

    const currentUserMember = teamMembers.find(m => m.email === user.email) || {
        email: user.email,
        name: user.name,
        image: user.image,
        role: "Job Owner" as TeamMemberRole
    };

    const allMembers = teamMembers.some(m => m.email === user.email)
        ? teamMembers
        : [currentUserMember, ...teamMembers];

    return (
            <div className="layered-card-outer-career">
                <div className="layered-card-middle">
                    <div className="flex flex-row items-center gap-2">
                        <span className="text-base text-[#181D27] font-bold text-lg pl-2 md:pl-4 pt-3">
                            {hideSectionNumbers ? "Team Access" : "3. Team Access"}
                        </span>
                    </div>
                <div className="layered-card-content">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
                        <div className="flex-1">
                            <span className="text-base font-semibold text-[#181D27] block mb-1">Add more members</span>
                            <p className="text-base text-[#6B7280] m-0">You can add other members to collaborate on this career.</p>
                        </div>
                        <div className="relative w-full md:w-auto" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                                className="px-4 py-2 border border-[#D5D7DA] rounded-lg text-base
                                        text-[#181D27] bg-white cursor-pointer w-full md:min-w-[300px] text-left flex items-center justify-between
                                        shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center gap-2">
                                    <i className="la la-user text-base text-gray-500 !text-2xl"></i>
                                    <span className="text-base">Add member</span>
                                </div>
                                <i className="la la-chevron-down text-sm text-gray-500"></i>
                            </button>

                            {showMemberDropdown && (
                                <div className={`absolute ${hideSectionNumbers ?(" top-ful"):(" bottom-full") } right-0 mb-2 bg-white border border-[#E5E7EB] 
                                rounded-lg shadow-lg w-full md:min-w-[500px] max-h-[300px] overflow-hidden flex flex-col z-[1000] `}>
                                    <div className="p-3 border-b border-[#E5E7EB]">
                                        <input
                                            type="text"
                                            placeholder="Search member"
                                            value={memberSearch}
                                            onChange={(e) => setMemberSearch(e.target.value)}
                                            className="w-full px-3 py-2 border border-[#D5D7DA] rounded-md text-base"
                                        />
                                    </div>
                                    <div className="max-h-[500px] overflow-y-auto">
                                        {isLoadingMembers ? (
                                            <div className="p-5 text-center text-[#6B7280]">Loading...</div>
                                        ) : filteredAvailableMembers.length === 0 ? (
                                            <div className="p-5 text-center text-[#6B7280]">No members found</div>
                                        ) : (
                                            filteredAvailableMembers.map((member) => (
                                                <div
                                                    key={member.email}
                                                    onClick={() => addMember(member)}
                                                    className="p-3 cursor-pointer border-b border-[#F3F4F6] 
                                                    flex items-center gap-3 hover:bg-[#F9FAFB] "
                                                >
                                                    <div
                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold overflow-hidden"
                                                        style={{
                                                            background: member.image || `#${Math.floor(Math.random() * 16777215).toString(16)}`
                                                        }}
                                                    >
                                                        {member.image ? (
                                                            <img src={member.image} alt={member.name} className="w-full h-full rounded-full object-cover" />
                                                        ) : (
                                                            member.name?.charAt(0).toUpperCase()
                                                        )}
                                                    </div>
                                                    <div className="flex flex-row gap-1 justify-between w-full">
                                                        <div className="text-base font-medium text-[#181D27]">{member.name}</div>
                                                        <div className="text-sm text-[#6B7280]">{member.email}</div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {errors.length > 0 && (
                        <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg mb-4 flex items-center gap-2">
                            <i className="la la-exclamation-circle text-[#DC2626] text-lg"></i>
                            <div>
                                {errors.map((error, idx) => (
                                    <div key={idx} className="text-[#DC2626] text-sm">{error}</div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        {allMembers.map((member) => (
                            <div
                                key={member.email}
                                className="p-3 border border-[#E5E7EB] rounded-lg flex flex-col md:flex-row items-start md:items-center gap-3 relative"
                            >
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-semibold flex-shrink-0 overflow-hidden"
                                    style={{
                                        background: member.image || `#${Math.floor(Math.random() * 16777215).toString(16)}`
                                    }}
                                >
                                    {member.image ? (
                                        <img src={member.image} alt={member.name} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        member.name?.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 w-full md:w-auto">
                                    <div className="text-base font-medium text-[#181D27]">
                                        {member.name} {member.email === user.email && "(You)"}
                                    </div>
                                    <div className="text-sm text-[#6B7280] truncate">{member.email}</div>
                                </div>
                                <div
                                    className="relative w-full md:w-auto"
                                    ref={(el) => {
                                        if (el) {
                                            roleDropdownRefs.current[member.email] = el;
                                        }
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => setOpenRoleDropdown(openRoleDropdown === member.email ? null : member.email)}
                                        className="px-4 py-3 border border-[#D5D7DA] rounded-lg text-base
                                        text-[#181D27] bg-white cursor-pointer w-full md:min-w-[300px] text-left flex items-center justify-between
                                        shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <span className="font-medium text-base">{member.role}</span>
                                        <i className="la la-chevron-down text-sm text-[#6B7280]"></i>
                                    </button>
                                    {openRoleDropdown === member.email && (
                                        <div className={`absolute  ${
                                            !hideSectionNumbers ?(" top-full"):(" bottom-full max-h-[200px] p-2 overflow-y-auto") } right-0 mb-2 bg-white border 
                                        rounded-lg shadow-lg w-full md:w-[400px] overflow-y-auto
                                        `}>
                                            {(Object.keys(roleDescriptions) as TeamMemberRole[]).map((role) => (
                                                <div
                                                    key={role}
                                                    onClick={() => {
                                                        updateMemberRole(member.email, role);
                                                        setOpenRoleDropdown(null);
                                                    }}
                                                    className={`px-4 py-2 cursor-pointer border-b border-[#F3F4F6] last:border-b-0 hover:bg-[#F9FAFB] ${member.role === role ? 'bg-[#F8F9FC]' : ''
                                                        }`}
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                                <span className={`text-base font-medium text-[#181D27] ${member.role === role ? 'font-bold' : ''
                                                                    }`}>
                                                                    {role}
                                                                </span>
                                                                {member.role === role && (
                                                                    <i className="la la-check text-lg" style={{
                                                                        background: "linear-gradient(180deg, #9FCAED 0%, #CEB6DA 33%, #EBACC9 66%, #FCCEC0 100%)",
                                                                        WebkitBackgroundClip: "text",
                                                                        WebkitTextFillColor: "transparent",
                                                                        backgroundClip: "text",
                                                                        color: "transparent"
                                                                    }}></i>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-[#6B7280] m-0">{roleDescriptions[role]}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeMember(member.email)}
                                    className="h-10 w-10 flex items-center justify-center !rounded-full !border border-gray-300 
                                    bg-white hover:bg-gray-100 transition cursor-pointer"
                                >
                                    <i className="la la-trash text-xl text-gray-600 !text-gray-300"></i>
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 text-sm text-[#6B7280] italic">
                        *Admins can view all careers regardless of specific access settings.
                    </div>
                </div>
            </div>
        </div>
    );
}


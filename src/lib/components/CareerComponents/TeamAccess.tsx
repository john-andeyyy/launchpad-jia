"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAppContext } from "@/lib/context/AppContext";
import { errorToast } from "@/lib/Utils";
import { assetConstants } from "@/lib/utils/constantsV2";
import styles from "@/lib/styles/screens/teamAccess.module.scss";

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
                    <div className={styles.header}>
                        <div className={styles.loadingIconContainer}>
                            <i className={`la la-users ${styles.loadingIcon}`}></i>
                        </div>
                        {/* <span className="text-base text-[#181D27] font-bold">3. Team Access</span> */}
                    </div>
                    <div className="layered-card-content">
                        <p className={styles.loadingText}>Loading user information...</p>
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
                <div className={styles.header}>
                    <span className={styles.title}>
                        {hideSectionNumbers ? "Team Access" : "3. Team Access"}
                    </span>
                </div>
                <div className="layered-card-content">
                    <div className={styles.addMemberSection}>
                        <div className={styles.addMemberInfo}>
                            <span className={styles.addMemberTitle}>Add more members</span>
                            <p className={styles.addMemberDescription}>You can add other members to collaborate on this career.</p>
                        </div>
                        <div className={styles.dropdownWrapper} ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                                className={styles.addMemberButton}
                            >
                                <div className={styles.addMemberButtonContent}>
                                    <i className={`la la-user ${styles.addMemberButtonIcon}`}></i>
                                    <span>Add member</span>
                                </div>
                                <img 
                                    src={assetConstants.chevron} 
                                    alt="chevron" 
                                    className={styles.addMemberChevron}
                                    style={{ transform: showMemberDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }} 
                                />
                            </button>

                            {showMemberDropdown && (
                                <div className={`${styles.memberDropdown} ${hideSectionNumbers ? styles.memberDropdownTop : styles.memberDropdownBottom}`}>
                                    <div className={styles.memberSearchContainer}>
                                        <input
                                            type="text"
                                            placeholder="Search member"
                                            value={memberSearch}
                                            onChange={(e) => setMemberSearch(e.target.value)}
                                            className={styles.memberSearchInput}
                                        />
                                    </div>
                                    <div className={styles.memberList}>
                                        {isLoadingMembers ? (
                                            <div className={styles.loadingState}>Loading...</div>
                                        ) : filteredAvailableMembers.length === 0 ? (
                                            <div className={styles.emptyState}>No members found</div>
                                        ) : (
                                            filteredAvailableMembers.map((member) => (
                                                <div
                                                    key={member.email}
                                                    onClick={() => addMember(member)}
                                                    className={styles.memberItem}
                                                >
                                                    <div
                                                        className={styles.memberAvatar}
                                                        style={{
                                                            background: member.image || `#${Math.floor(Math.random() * 16777215).toString(16)}`
                                                        }}
                                                    >
                                                        {member.image ? (
                                                            <img src={member.image} alt={member.name} className={styles.memberAvatarImg} />
                                                        ) : (
                                                            member.name?.charAt(0).toUpperCase()
                                                        )}
                                                    </div>
                                                    <div className={styles.memberInfo}>
                                                        <div className={styles.memberName}>{member.name}</div>
                                                        <div className={styles.memberEmail}>{member.email}</div>
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
                        <div className={styles.errorContainer}>
                            <i className={`la la-exclamation-circle ${styles.errorIcon}`}></i>
                            <div>
                                {errors.map((error, idx) => (
                                    <div key={idx} className={styles.errorText}>{error}</div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={styles.membersList}>
                        {allMembers.map((member) => (
                            <div
                                key={member.email}
                                className={styles.memberCard}
                            >
                                <div
                                    className={styles.memberCardAvatar}
                                    style={{
                                        background: member.image || `#${Math.floor(Math.random() * 16777215).toString(16)}`
                                    }}
                                >
                                    {member.image ? (
                                        <img src={member.image} alt={member.name} className={styles.memberCardAvatarImg} />
                                    ) : (
                                        member.name?.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className={styles.memberCardInfo}>
                                    <div className={styles.memberCardName}>
                                        {member.name} {member.email === user.email && "(You)"}
                                    </div>
                                    <div className={styles.memberCardEmail}>{member.email}</div>
                                </div>
                                <div
                                    className={styles.roleDropdownWrapper}
                                    ref={(el) => {
                                        if (el) {
                                            roleDropdownRefs.current[member.email] = el;
                                        }
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => setOpenRoleDropdown(openRoleDropdown === member.email ? null : member.email)}
                                        className={styles.roleButton}
                                    >
                                        <span className={styles.roleButtonText}>{member.role}</span>
                                        <img 
                                            src={assetConstants.chevron} 
                                            alt="chevron" 
                                            className={styles.roleButtonChevron}
                                            style={{ transform: openRoleDropdown === member.email ? 'rotate(180deg)' : 'rotate(0deg)' }} 
                                        />
                                    </button>
                                    {openRoleDropdown === member.email && (
                                        <div className={`${styles.roleDropdown} ${hideSectionNumbers ? styles.roleDropdownWithScroll : ''}`}>
                                            {(Object.keys(roleDescriptions) as TeamMemberRole[]).map((role) => (
                                                <div
                                                    key={role}
                                                    onClick={() => {
                                                        updateMemberRole(member.email, role);
                                                        setOpenRoleDropdown(null);
                                                    }}
                                                    className={`${styles.roleOption} ${member.role === role ? styles.roleOptionSelected : ''}`}
                                                >
                                                    <div className={styles.roleOptionHeader}>
                                                        <span className={`${styles.roleOptionTitle} ${member.role === role ? styles.roleOptionTitleBold : ''}`}>
                                                            {role}
                                                        </span>
                                                        {member.role === role && (
                                                            <i className={`la la-check ${styles.roleOptionCheck}`}></i>
                                                        )}
                                                    </div>
                                                    <p className={styles.roleOptionDescription}>{roleDescriptions[role]}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeMember(member.email)}
                                    className={styles.removeButton}
                                >
                                    <i className={`la la-trash ${styles.removeButtonIcon}`}></i>
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className={styles.footerNote}>
                        *Admins can view all careers regardless of specific access settings.
                    </div>
                </div>
            </div>
        </div>
    );
}


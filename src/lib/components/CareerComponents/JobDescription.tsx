"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useAppContext } from "../../context/AppContext";
import DirectInterviewLinkV2 from "./DirectInterviewLinkV2";
import CareerLink from "./CareerLink";
import ReviewSection from "./steps/ReviewSection";
import ReviewField from "./steps/ReviewField";
import { TeamMember } from "./TeamAccess";
import CareerDetailsModal from "./modals/CareerDetailsModal";
import CVReviewModal from "./modals/CVReviewModal";
import AIInterviewModal from "./modals/AIInterviewModal";
import TeamAccessModal from "./modals/TeamAccessModal";
import { assetConstants } from "@/lib/utils/constantsV2";
import styles from "@/lib/styles/screens/jobDescription.module.scss";

export default function JobDescription({ formData, setFormData, editModal, isEditing, setIsEditing, handleCancelEdit }: { formData: any, setFormData: (formData: any) => void, editModal: boolean, isEditing: boolean, setIsEditing: (isEditing: boolean) => void, handleCancelEdit: () => void }) {
  const { user } = useAppContext();
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    careerDetails: true,
    cvReview: true,
    aiInterview: true,
  });
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleEditSection = (section: string) => {
    setOpenModal(section);
  };

  const handleCloseModal = () => {
    setOpenModal(null);
  };

  const formatSalaryValue = (value: string, negotiable: boolean) => {
    if (negotiable) return "Negotiable";
    if (!value) return "Not set";
    return `PHP ${value}`;
  };

  const getScreeningSettingDisplay = (setting?: string) => {
    if (!setting) return "Not set";
    if (setting.includes("Good Fit")) {
      return (
        <span >
          Automatically endorse candidates who are{" "}
          <span className={styles.screeningBadge}>
            Good Fit
          </span>
          {" "}and above
        </span>
      );
    }
    return setting;
  };

  const getTotalQuestionsCount = () => {
    return formData.questions?.reduce((acc: number, group: any) => acc + (group.questions?.length || 0), 0) || 0;
  };


  // Get team members
  const teamMembers: TeamMember[] = formData.teamMembers || [];

  async function deleteCareer() {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Deleting career...",
          text: "Please wait while we delete the career...",
          allowOutsideClick: false,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          },
        });

        try {
          const response = await axios.post("/api/delete-career", {
            id: formData._id,
          });

          if (response.data.success) {
            Swal.fire({
              title: "Deleted!",
              text: "The career has been deleted.",
              icon: "success",
              allowOutsideClick: false,
            }).then(() => {
              window.location.href = "/recruiter-dashboard/careers";
            });
          } else {
            Swal.fire({
              title: "Error!",
              text: response.data.error || "Failed to delete the career",
              icon: "error",
            });
          }
        } catch (error) {
          console.error("Error deleting career:", error);
          Swal.fire({
            title: "Error!",
            text: "An error occurred while deleting the career",
            icon: "error",
          });
        }
      }
    });
  }

  return (
    <div className={`${styles.container} ${styles.noTopPadding}`}>
      <div className={styles.mainLayout}>
        {/* //? Left Column - Main Content */}
        <div className={styles.mainContent}>
          {/* //! Career Details & Team Access Section */}
          <div className="">
            <ReviewSection
              icon="la la-suitcase"
              title="Career Details & Team Access"
              isExpanded={expandedSections.careerDetails}
              onToggle={() => toggleSection("careerDetails")}
              onEdit={() => handleEditSection("careerDetails")}
              className={styles.noMarginTop}
            >
              <div className={styles.sectionContent}>
                <ReviewField label="Job Title" value={formData.jobTitle || "Not set"} className={styles.fieldWithBorder} />

                <div className={styles.grid3Cols}>
                  <ReviewField label="Employment Type" value={formData.employmentType || "Not set"} />
                  <ReviewField label="Work Arrangement" value={formData.workSetup || "Not set"} />
                </div>

                <div className={styles.grid3Cols}>
                  <ReviewField label="Country" value={formData.country || "Philippines"} />
                  <ReviewField label="State / Province" value={formData.province || "Not set"} />
                  <ReviewField label="City" value={formData.city || formData.city || "Not set"} />
                </div>

                <div className={styles.grid3Cols}>
                  <div>
                    <span className={styles.salaryLabel}>Minimum Salary</span>
                    <div className={styles.salaryValue}>
                      {formatSalaryValue(formData.minimumSalary, formData.salaryNegotiable)}
                    </div>
                  </div>
                  <div>
                    <span className={styles.salaryLabel}>Maximum Salary</span>
                    <div className={styles.salaryValue}>
                      {formatSalaryValue(formData.maximumSalary, formData.salaryNegotiable)}
                    </div>
                  </div>
                </div>

                {/* //! Job Description */}
                {formData.description && (
                  <div className={styles.jobDescriptionContainer}>
                    <span className={styles.jobDescriptionLabel}>Job Description</span>
                    <div
                      className={styles.jobDescriptionContent}
                      dangerouslySetInnerHTML={{
                        __html: formData.description
                      }}
                    />
                  </div>
                )}
              </div>
            </ReviewSection>


          </div>
          {/* //! CV Review & Pre-Screening Questions Section */}
          <ReviewSection
            icon="la la-file-text"
            title="CV Review & Pre-Selecting Workflow"
            isExpanded={expandedSections.cvReview}
            onToggle={() => toggleSection("cvReview")}
            onEdit={() => handleEditSection("cvReview")}

          >
            <div className={styles.sectionContent}>
              <ReviewField
                label="CV Screening"
                value={getScreeningSettingDisplay(formData.cvScreeningSetting || formData.screeningSetting)}
              />

              {formData.cvSecretPrompt && (
                <div className={styles.secretPromptSection}>
                  <span className={styles.secretPromptLabel}>CV Secret Prompt</span>
                  <div className={styles.secretPromptContent}>
                    {formData.cvSecretPrompt.split('\n').map((line: string, idx: number) => (
                      <div key={idx}>{line}</div>
                    ))}
                  </div>
                </div>
              )}

              {formData.preScreeningQuestions && formData.preScreeningQuestions.length > 0 && (
                <div className={styles.preScreeningSection}>
                  <div className={styles.preScreeningHeader}>
                    <span className={styles.preScreeningLabel}>
                      Pre-Screening Questions
                    </span>
                    <span className={styles.preScreeningCount}>
                      {formData.preScreeningQuestions.length}
                    </span>
                  </div>
                  <div className={styles.preScreeningList}>
                    {formData.preScreeningQuestions.map((question: any, index: number) => (
                      <div key={question.id || index} className={styles.preScreeningItem}>
                        <div className={styles.preScreeningItemContent}>
                          <span className={styles.preScreeningNumber}>
                            {index + 1}.
                          </span>
                          <div className={styles.preScreeningQuestion}>
                            <p className={styles.preScreeningQuestionText}>
                              {question.question}
                            </p>
                            {question.type === "dropdown" || question.type === "checkboxes" ? (
                              question.options && question.options.length > 0 ? (
                                <div className={styles.preScreeningOptions}>
                                  {question.options.map((option: any) => (
                                    <div key={option.id} className={styles.preScreeningOption}>
                                      <span className={styles.bullet}>•</span>
                                      <span>{option.value}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : null
                            ) : question.type === "range" ? (
                              <div className={styles.preScreeningRange}>
                                {question.rangeType === "currency" && question.currency && (
                                  <div className={styles.preScreeningRangeItem}>
                                    <span className={styles.bullet}>•</span>
                                    <span>
                                      <span className={styles.preScreeningRangeLabel}>Preferred: </span>
                                      {question.currency === "PHP" ? "PHP" : "$"}
                                      {question.minValue || "0"} - {question.currency === "PHP" ? "" : "$"}
                                      {question.maxValue || "0"} {question.currency}
                                    </span>
                                  </div>
                                )}
                                {question.rangeType === "number" && (
                                  <div className={styles.preScreeningRangeItem}>
                                    <span className={styles.bullet}>•</span>
                                    <span>
                                      {question.minValue || "0"} - {question.maxValue || "0"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className={styles.preScreeningTypeHint}>
                                {question.type === "short-answer" && "Short answer"}
                                {question.type === "long-answer" && "Long answer"}
                                {question.type === "text" && "Text input"}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ReviewSection>

          {/* //!   AI Interview Setup Section */}
          <ReviewSection
            icon="la la-comments"
            title="AI Interview Setup"
            isExpanded={expandedSections.aiInterview}
            onToggle={() => toggleSection("aiInterview")}
            onEdit={() => handleEditSection("aiInterview")}
          >
            <div className={styles.sectionContent}>
              <ReviewField
                label="AI Interview Screening"
                value={getScreeningSettingDisplay(formData.aiInterviewScreeningSetting || formData.screeningSetting)}
              />

              <div className={styles.videoSection}>
                <p className={styles.videoLabel}>Require Video Interview</p>
                <div className={styles.videoValue}>
                  {formData.requireVideo ? "Yes" : "No"}
                  {formData.requireVideo ? <img
                    alt=""
                    src={assetConstants.checkV2}
                    className={styles.videoIcon}
                  /> : <img
                    alt=""
                    src={assetConstants.xV2}
                    className={styles.videoIcon}
                  />}
                </div>
              </div>

              {formData.aiInterviewSecretPrompt && (
                <div className={styles.aiSecretPromptSection}>
                  <div className={styles.aiSecretPromptHeader}>
                    <i className={`la la-magic ${styles.aiSecretPromptIcon}`}></i>
                    <span className={styles.aiSecretPromptLabel}>AI Interview Secret Prompt</span>
                  </div>
                  <div className={styles.aiSecretPromptContent}>
                    {formData.aiInterviewSecretPrompt.split('\n').map((line: string, idx: number) => {
                      const cleanLine = line.replace(/^•\s*/, '').trim();
                      if (!cleanLine) return null;
                      return (
                        <div key={idx} className={styles.aiSecretPromptLine}>
                          <span className={styles.bullet}>•</span>
                          <span className={styles.text}>{cleanLine}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {formData.questions && formData.questions.length > 0 && (
                <div className={styles.questionsSection}>
                  <div className={styles.questionsHeader}>
                    <span className={styles.questionsLabel}>Interview Questions</span>
                    <span className={styles.questionsCount}>
                      {getTotalQuestionsCount()}
                    </span>
                  </div>
                  <div className={styles.questionsList}>
                    {formData.questions.map((group: any, groupIdx: number) => {
                      if (!group.questions || group.questions.length === 0) return null;

                      let questionNumber = 1;
                      for (let i = 0; i < groupIdx; i++) {
                        if (formData.questions[i].questions) {
                          questionNumber += formData.questions[i].questions.length;
                        }
                      }
                      return (
                        <div key={groupIdx} className={styles.questionGroup}>
                          <div className={styles.questionGroupCategory}>
                            {group.category}
                          </div>
                          <div className={styles.questionGroupList}>
                            {group.questions.map((question: any, qIdx: number) => {
                              const currentQuestionNumber = questionNumber + qIdx;
                              const questionText = typeof question === 'string'
                                ? question
                                : (question.question || question.text || '');
                              return (
                                <div key={question.id || qIdx} className={styles.questionItem}>
                                  <span className={styles.questionNumber}>
                                    {currentQuestionNumber}.
                                  </span>
                                  <span className={styles.questionText}>
                                    {questionText}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </ReviewSection>
        </div>

        {/* //! Right Column - Sidebar */}
        <div className={styles.sidebar}>
          {/* //! Team Access Section */}
          <div className={`layered-card-outer-career ${styles.teamAccessCard}`}>
            <div className="layered-card-middle">
              <div className={styles.teamAccessHeader}>
                <div className={styles.teamAccessTitle}>
                  <span className={styles.teamAccessTitleText}>Team Access</span>
                </div>
                <div className={styles.teamAccessActions}>
                  <button
                    onClick={() => handleEditSection("teamAccess")}
                    className={styles.editButton}
                    title="Edit"
                  >
                    <i className={`la la-pen ${styles.editIcon}`}></i>
                  </button>
                </div>
              </div>
              <div className={`${styles.teamMembersList} layered-card-content`}>
                {teamMembers.length > 0 ? (
                  teamMembers.map((member) => {
                    const isCurrentUser = user?.email === member.email;
                    return (
                      <div key={member.email} className={styles.teamMemberItem}>
                        <div 
                          className={styles.teamMemberAvatar}
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTooltipPosition({
                              x: rect.left + rect.width / 2,
                              y: rect.top + rect.height + 8
                            });
                            setSelectedMember(member);
                          }}
                        >
                          {member.image ? (
                            <img
                              src={member.image}
                              alt={member.name}
                              className={styles.teamMemberAvatarImg}
                            />
                          ) : (
                            <div className={styles.teamMemberAvatarPlaceholder}>
                              <span className={styles.teamMemberAvatarInitial}>
                                {member.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className={styles.teamMemberInfo}>
                          <div className={styles.teamMemberNameRow}>
                            <p className={styles.teamMemberName}>
                              {member.name}
                            </p>
                            {isCurrentUser && (
                              <span className={styles.teamMemberYou}>(You)</span>
                            )}
                          </div>
                          <p className={styles.teamMemberEmail}>
                            {member.email}
                          </p>
                        </div>
                        <div className={styles.teamMemberRole}>
                          <span className={styles.teamMemberRoleText}>
                            {member.role}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className={styles.noTeamMembers}>No team members added</div>
                )}
              </div>
            </div>
          </div>

          {/* Member Details Tooltip/Modal */}
          {selectedMember && tooltipPosition && (
            <>
              {/* Backdrop */}
              <div
                className={styles.tooltipBackdrop}
                onClick={() => {
                  setSelectedMember(null);
                  setTooltipPosition(null);
                }}
              />
              {/* Tooltip */}
              <div
                className={styles.tooltip}
                style={{
                  left: `${tooltipPosition.x}px`,
                  top: `${tooltipPosition.y}px`,
                  transform: 'translateX(-50%)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.tooltipContent}>
                  <div className={styles.tooltipNameRow}>
                    <p className={styles.tooltipName}>
                      {selectedMember.name}
                      {user?.email === selectedMember.email && (
                        <span className={styles.tooltipYou}>(You)</span>
                      )}
                    </p>
                    <p className={styles.tooltipEmail}>
                      {selectedMember.email}
                    </p>
                    <p className={styles.tooltipRole}>
                      {selectedMember.role}
                    </p>
                  </div>
                </div>
                {/* Arrow */}
                <div className={styles.tooltipArrow} />
              </div>
            </>
          )}
          {/* //! Career Link */}
          <CareerLink career={formData} />

          {/* //! Direct Interview Link */}
          <DirectInterviewLinkV2 formData={formData} setFormData={setFormData} />

          {/* //! Advanced Settings */}
          <div className="layered-card-outer-career">
            <div className="layered-card-middle">
              <div className={styles.advancedSettingsHeader}>
                <span className={styles.advancedSettingsTitle}>Advanced Settings</span>
              </div>
              <div className={`${styles.advancedSettingsContent} layered-card-content`}>
                <button
                  onClick={deleteCareer}
                  className={styles.deleteButton}
                >
                  <i className={`la la-trash ${styles.deleteIcon}`}></i>
                  <span>Delete this career</span>
                </button>
                <span className={styles.deleteWarning}>
                  Be careful, this action cannot be undone.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* //! Individual Edit Modals */}
      {openModal === "careerDetails" && (
        <CareerDetailsModal
          formData={formData}
          setFormData={setFormData}
          onClose={handleCloseModal}
        />
      )}
      {openModal === "cvReview" && (
        <CVReviewModal
          formData={formData}
          setFormData={setFormData}
          onClose={handleCloseModal}
        />
      )}
      {openModal === "aiInterview" && (
        <AIInterviewModal
          formData={formData}
          setFormData={setFormData}
          onClose={handleCloseModal}
        />
      )}
      {openModal === "teamAccess" && (
        <TeamAccessModal
          formData={formData}
          setFormData={setFormData}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

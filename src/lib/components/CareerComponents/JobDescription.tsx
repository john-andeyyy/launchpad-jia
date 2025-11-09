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

export default function JobDescription({ formData, setFormData, editModal, isEditing, setIsEditing, handleCancelEdit }: { formData: any, setFormData: (formData: any) => void, editModal: boolean, isEditing: boolean, setIsEditing: (isEditing: boolean) => void, handleCancelEdit: () => void }) {
  const { user } = useAppContext();
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    careerDetails: true,
    cvReview: true,
    aiInterview: true,
  });

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
          <span className="inline-block bg-blue-100 text-blue-500 border !border-blue-200 !font-bold px-3 py-1 rounded-full text-sm font-medium">
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
    <div className="flex flex-col gap-4 max-w-[1400px] w-full mx-auto px-4 py-6 !pt-0">
      <div className="flex flex-row gap-6 items-start">
        {/* //? Left Column - Main Content */}
        <div className="flex-1 flex flex-col gap-4">
          {/* //! Career Details & Team Access Section */}
          <div className="">
            <ReviewSection
              icon="la la-suitcase"
              title="Career Details & Team Access"
              isExpanded={expandedSections.careerDetails}
              onToggle={() => toggleSection("careerDetails")}
              onEdit={() => handleEditSection("careerDetails")}
              className="!mt-0 !pt-0"
            >
              <div className="flex flex-col gap-3">
                <ReviewField label="Job Title" value={formData.jobTitle || "Not set"} className="border-b border-[#E9EAEB] pb-3" />

                <div className="grid grid-cols-3 gap-3 border-b border-[#E9EAEB] pb-3">
                  <ReviewField label="Employment Type" value={formData.employmentType || "Not set"} />
                  <ReviewField label="Work Arrangement" value={formData.workSetup || "Not set"} />
                </div>

                <div className="grid grid-cols-3 gap-3 border-b border-[#E9EAEB] pb-3">
                  <ReviewField label="Country" value={formData.country || "Philippines"} />
                  <ReviewField label="State / Province" value={formData.province || "Not set"} />
                  <ReviewField label="City" value={formData.city || formData.city || "Not set"} />
                </div>

                <div className="grid grid-cols-3 gap-3 border-b border-[#E9EAEB] pb-3">
                  <div>
                    <span className="text-md font-semibold text-gray-700">Minimum Salary</span>
                    <div className="text-base  text-gray-600 mt-1">
                      {formatSalaryValue(formData.minimumSalary, formData.salaryNegotiable)}
                    </div>
                  </div>
                  <div>
                    <span className="text-md font-semibold text-gray-700">Maximum Salary</span>
                    <div className={`text-base mt-1  text-gray-600`}>
                      {formatSalaryValue(formData.maximumSalary, formData.salaryNegotiable)}
                    </div>
                  </div>
                </div>

                {/* //! Job Description */}
                {formData.description && (
                  <div className=" pb-3">
                    <span className="text-md font-semibold text-gray-700">Job Description</span>
                    <div
                      className="  mt-1 rich-text-content !text-gray-800"
                      dangerouslySetInnerHTML={{
                        __html: formData.description
                      }}
                    />
                    <style dangerouslySetInnerHTML={{
                      __html: `
                                              .rich-text-content {
                                                  line-height: 1.7;
                                                  color: #181D27;
                                              }
                                              .rich-text-content b,
                                              .rich-text-content strong {
                                                  font-weight: 700;
                                                  color: #181D27;
                                              }
                                              .rich-text-content i,
                                              .rich-text-content em {
                                                  font-style: italic;
                                              }
                                              .rich-text-content u {
                                                  text-decoration: underline;
                                              }
                                              .rich-text-content p {
                                                  margin-bottom: 12px;
                                                  line-height: 1.7;
                                              }
                                              .rich-text-content > div {
                                                  margin-bottom: 12px;
                                                  line-height: 1.7;
                                              }
                                              .rich-text-content div:empty {
                                                  margin-bottom: 8px;
                                              }
                                              .rich-text-content ul {
                                                  list-style-type: disc;
                                                  margin-left: 24px;
                                                  margin-top: 12px;
                                                  margin-bottom: 12px;
                                                  padding-left: 24px;
                                              }
                                              .rich-text-content ol {
                                                  list-style-type: decimal;
                                                  margin-left: 24px;
                                                  margin-top: 12px;
                                                  margin-bottom: 12px;
                                                  padding-left: 24px;
                                              }
                                              .rich-text-content li {
                                                  margin-bottom: 8px;
                                                  display: list-item;
                                                  line-height: 1.7;
                                                  padding-left: 4px;
                                              }
                                              .rich-text-content ul ul,
                                              .rich-text-content ol ul {
                                                  list-style-type: disc;
                                                  margin-top: 8px;
                                                  margin-bottom: 8px;
                                              }
                                              .rich-text-content ul ul li {
                                                  margin-bottom: 6px;
                                              }
                                              .rich-text-content br {
                                                  line-height: 1.7;
                                              }
                                              .rich-text-content div br {
                                                  display: block;
                                                  margin-top: 8px;
                                                  content: "";
                                              }
                                          `
                    }} />
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
            <div className="flex flex-col gap-4">
              <ReviewField
                label="CV Screening"
                value={getScreeningSettingDisplay(formData.cvScreeningSetting || formData.screeningSetting)}
              />

              {formData.cvSecretPrompt && (
                <div className="border-t border-[#E9EAEB] pt-3 ">
                  <span className="text-md font-semibold text-gray-800">CV Secret Prompt</span>
                  <div className="text-base text-gray-600 mt-1 whitespace-pre-line pl-2">
                    {formData.cvSecretPrompt.split('\n').map((line: string, idx: number) => (
                      <div key={idx}>{line}</div>
                    ))}
                  </div>
                </div>
              )}

              {formData.preScreeningQuestions && formData.preScreeningQuestions.length > 0 && (
                <div className="border-t border-[#E9EAEB] pt-4">
                  <div className="flex flex-row items-center gap-2 mb-4">
                    <span className="text-sm font-semibold text-gray-700">
                      Pre-Screening Questions
                    </span>
                    <span className="w-6 h-6 rounded-full border border-[#E9EAEB] bg-white flex items-center justify-center text-xs font-semibold text-gray-700">
                      {formData.preScreeningQuestions.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-4">
                    {formData.preScreeningQuestions.map((question: any, index: number) => (
                      <div key={question.id || index}>
                        <div className="flex flex-row items-start">
                          <span className="text-base font-semibold text-gray-800 min-w-[24px]">
                            {index + 1}.
                          </span>
                          <div className="flex-1">
                            <p className=" text-gray-600 !text-md !font-bold  mb-1">
                              {question.question}
                            </p>
                            {question.type === "dropdown" || question.type === "checkboxes" ? (
                              question.options && question.options.length > 0 ? (
                                <div className="flex flex-col ">
                                  {question.options.map((option: any) => (
                                    <div key={option.id} className="text-base text-gray-700 flex items-center">
                                      <span className="mr-2 mt-1">•</span>
                                      <span>{option.value}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : null
                            ) : question.type === "range" ? (
                              <div className="text-base text-gray-700">
                                {question.rangeType === "currency" && question.currency && (
                                  <div className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>
                                      <span className="font-medium">Preferred: </span>
                                      {question.currency === "PHP" ? "PHP" : "$"}
                                      {question.minValue || "0"} - {question.currency === "PHP" ? "" : "$"}
                                      {question.maxValue || "0"} {question.currency}
                                    </span>
                                  </div>
                                )}
                                {question.rangeType === "number" && (
                                  <div className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>
                                      {question.minValue || "0"} - {question.maxValue || "0"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-base text-gray-500 italic">
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
            <div className="flex flex-col gap-4">
              <ReviewField
                label="AI Interview Screening"
                value={getScreeningSettingDisplay(formData.aiInterviewScreeningSetting || formData.screeningSetting)}
              />

              <div className="flex flex-row items-center justify-between gap-2 border-y pt-3 border-gray-300 pb-3">
                <p className="!text-md font-semibold text-gray-700 mb-0 !font-bold">Require Video Interview</p>
                <div className="text-md font-bold text-gray-800 x-2 flex items-center gap-2">
                  {formData.requireVideo ? "Yes" : "No"}
                  {formData.requireVideo ? <img
                    alt=""
                    src={assetConstants.checkV2}
                  /> : <img
                    alt=""
                    src={assetConstants.xV2}
                  />}
                </div>
              </div>

              {formData.aiInterviewSecretPrompt && (
                <div className="border-b border-gray-300 pb-3">
                  <div className="flex flex-row items-center gap-2 mb-2">
                    <i className="la la-magic text-[#7C3AED] text-lg"></i>
                    <span className="text-sm font-semibold text-gray-800">AI Interview Secret Prompt</span>
                  </div>
                  <div className="text-base text-[#181D27] mt-1 pl-2">
                    {formData.aiInterviewSecretPrompt.split('\n').map((line: string, idx: number) => {
                      const cleanLine = line.replace(/^•\s*/, '').trim();
                      if (!cleanLine) return null;
                      return (
                        <div key={idx} className="flex flex-row items-start gap-2 mb-1">
                          <span className="text-[#181D27]">•</span>
                          <span className="flex-1">{cleanLine}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {formData.questions && formData.questions.length > 0 && (
                <div className="pb-3">
                  <div className="flex flex-row items-center gap-2 mb-3">
                    <span className="text-md font-semibold text-gray-700">Interview Questions</span>
                    <span className="bg-[#F3F4F6]  text-gray-600 text-xs font-medium px-2 py-1 rounded-full border border-[#E9EAEB]">
                      {getTotalQuestionsCount()}
                    </span>
                  </div>
                  <div className="flex flex-col gap-4 mt-2">
                    {formData.questions.map((group: any, groupIdx: number) => {
                      if (!group.questions || group.questions.length === 0) return null;

                      let questionNumber = 1;
                      for (let i = 0; i < groupIdx; i++) {
                        if (formData.questions[i].questions) {
                          questionNumber += formData.questions[i].questions.length;
                        }
                      }
                      return (
                        <div key={groupIdx} className="flex flex-col gap-2">
                          <div className="text-sm font-bold text-gray-700 mb-1">
                            {group.category}
                          </div>
                          <div className="flex flex-col gap-2 pl-2">
                            {group.questions.map((question: any, qIdx: number) => {
                              const currentQuestionNumber = questionNumber + qIdx;
                              const questionText = typeof question === 'string'
                                ? question
                                : (question.question || question.text || '');
                              return (
                                <div key={question.id || qIdx} className="flex flex-row items-start gap-2">
                                  <span className="text-sm pl-3 font-semibold  text-gray-600 min-w-[20px] pt-1">
                                    {currentQuestionNumber}.
                                  </span>
                                  <span className="mb-0 text-gray-600 !text-base flex-1 justify-center items-center ">
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
        <div className="w-[400px] flex flex-col">
          {/* //! Team Access Section */}
          <div className="layered-card-outer-career !mt-0 !pt-0">
            <div className="layered-card-middle">
              <div className="flex flex-row items-center justify-between">
                <div className="flex flex-row items-center gap-2">
                  <span className="text-base text-black font-bold pl-2">Team Access</span>
                </div>
                <div className="flex flex-row items-center gap-2">
                  <button
                    onClick={() => handleEditSection("teamAccess")}
                    className="w-8 h-8 flex items-center justify-center hover:bg-[#F3F4F6] rounded-full transition-colors
                                border !border-gray-500 !rounded-full"
                    title="Edit"
                  >
                    <i className="la la-pen text-[#6B7280] text-base !text-2xl"></i>
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-3 layered-card-content">
                {teamMembers.length > 0 ? (
                  teamMembers.map((member) => {
                    const isCurrentUser = user?.email === member.email;
                    return (
                      <div key={member.email} className="flex flex-row items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                          {member.image ? (
                            <img
                              src={member.image}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#E9EAEB] flex items-center justify-center">
                              <span className="text-[#6B7280] text-sm font-semibold">
                                {member.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-row items-center gap-2">
                            <p className="text-base text-[#181D27] font-semibold mb-0">
                              {member.name}
                            </p>
                            {isCurrentUser && (
                              <span className="text-sm  text-gray-600">(You)</span>
                            )}
                          </div>
                          <p className="text-sm  text-gray-600 truncate mb-0">
                            {member.email}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="text-sm  text-gray-600 font-medium">
                            {member.role}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm  text-gray-600">No team members added</div>
                )}
              </div>
            </div>
          </div>
          {/* //! Career Link */}
          <CareerLink career={formData} />

          {/* //! Direct Interview Link */}
          <DirectInterviewLinkV2 formData={formData} setFormData={setFormData} />

          {/* //! Advanced Settings */}
          <div className="layered-card-outer-career">
            <div className="layered-card-middle">
              <div className="flex flex-row items-center gap-2">
                <span className="text-base text-black font-bold pl-2">Advanced Settings</span>
              </div>
              <div className=" layered-card-content">
                <div className="flex flex-col gap-3">
                  <button
                    onClick={deleteCareer}
                    className="flex flex-row items-center justify-center gap-2 bg-white text-[#B32318] border 
                  !bg-red-50 !rounded-full px-4 py-2 cursor-pointer 
                  font-bold text-sm !hover:bg-[#B32318]  transition-colors "
                  >
                    <i className="la la-trash text-danger text-lg"></i>
                    <span>Delete this career</span>
                  </button>
                  <span className="text-sm text-[#717680] text-center">
                    Be careful, this action cannot be undone.
                  </span>
                </div>
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

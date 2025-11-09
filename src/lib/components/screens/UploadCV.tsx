// TODO (Job Portal) - Check API

"use client";

import Loader from "@/lib/components/commonV2/Loader";
import styles from "@/lib/styles/screens/uploadCV.module.scss";
import { useAppContext } from "@/lib/context/ContextV2";
import { assetConstants, pathConstants } from "@/lib/utils/constantsV2";
import { checkFile } from "@/lib/utils/helpersV2";
import { CORE_API_URL, errorToast } from "@/lib/Utils";
import axios from "axios";
import Markdown from "react-markdown";
import { useEffect, useRef, useState } from "react";


export default function () {
  const fileInputRef = useRef(null);
  const { user, setModalType } = useAppContext();
  const [buildingCV, setBuildingCV] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [digitalCV, setDigitalCV] = useState(null);
  const [editingCV, setEditingCV] = useState(null);
  const [file, setFile] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState(null);
  const [isScreening, setIsScreening] = useState(false);
  const [preScreeningQuestions, setPreScreeningQuestions] = useState([]);
  const [preScreeningAnswers, setPreScreeningAnswers] = useState({});
  const [screeningResult, setScreeningResult] = useState(null);
  const [userCV, setUserCV] = useState(null);
  const cvSections = [
    "Introduction",
    "Current Position",
    "Contact Info",
    "Skills",
    "Experience",
    "Education",
    "Projects",
    "Certifications",
    "Awards",
  ];
  const step = ["Submit CV", "Pre-Screening Questions", "Review"];
  const stepStatus = ["Completed", "Pending", "In Progress"];

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFile(e.dataTransfer.files);
  }

  function handleEditCV(section) {
    setEditingCV(section);

    if (section != null) {
      setTimeout(() => {
        const sectionDetails = document.getElementById(section);

        if (sectionDetails) {
          sectionDetails.focus();
        }
      }, 100);
    }
  }

  function handleFile(files) {
    const file = checkFile(files);

    if (file) {
      setFile(file);
      handleFileSubmit(file);
    }
  }

  function handleFileChange(e) {
    const files = e.target.files;

    if (files.length > 0) {
      handleFile(files);
    }
  }

  function handleModal() {
    setModalType("jobDescription");
  }

  function handleRedirection(type) {
    if (type == "dashboard") {
      window.location.href = pathConstants.dashboard;
    }

    if (type == "interview") {
      sessionStorage.setItem("interviewRedirection", pathConstants.dashboard);
      window.location.href = `/interview/${interview.interviewID}`;
    }
  }

  function handleRemoveFile(e) {
    e.stopPropagation();
    e.target.value = "";

    setFile(null);
    setHasChanges(false);
    setUserCV(null);

    const storedCV = localStorage.getItem("userCV");

    if (storedCV != "null") {
      setDigitalCV(storedCV);
    } else {
      setDigitalCV(null);
    }
  }

  function handleReviewCV() {
    const parsedUserCV = JSON.parse(digitalCV);
    const formattedCV = {};

    cvSections.forEach((section, index) => {
      formattedCV[section] = parsedUserCV.digitalCV[index].content.trim() || "";
    });

    setFile(parsedUserCV.fileInfo);
    setUserCV(formattedCV);
  }

  function handleUploadCV() {
    fileInputRef.current.click();
  }

  function processState(index, isAdvance = false) {
    const currentStepIndex = step.indexOf(currentStep);

    if (currentStepIndex == index) {
      if (index == stepStatus.length - 1) {
        return stepStatus[0];
      }

      return isAdvance || userCV || buildingCV ? stepStatus[2] : stepStatus[1];
    }

    if (currentStepIndex > index) {
      return stepStatus[0];
    }

    return stepStatus[1];
  }

  useEffect(() => {
    const storedSelectedCareer = sessionStorage.getItem("selectedCareer");
    const storedCV = localStorage.getItem("userCV");

    if (storedCV && storedCV != "null") {
      setDigitalCV(storedCV);
    }

    if (storedSelectedCareer) {
      const parseStoredSelectedCareer = JSON.parse(storedSelectedCareer);
      fetchInterview(parseStoredSelectedCareer.id);
    } else {
      alert("No application is currently being managed.");
      window.location.href = pathConstants.dashboard;
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("hasChanges", JSON.stringify(hasChanges));
  }, [hasChanges]);

  function fetchInterview(interviewID) {
    axios({
      method: "POST",
      url: "/api/job-portal/fetch-interviews",
      data: { email: user.email, interviewID },
    })
      .then((res) => {
        const result = res.data;

        if (result.error) {
          alert(result.error);
          window.location.href = pathConstants.dashboard;
        } else {
          if (result[0].cvStatus) {
            alert("This application has already been processed.");
            window.location.href = pathConstants.dashboard;
          } else {
            setCurrentStep(step[0]);
            setInterview(result[0]);
            setPreScreeningQuestions(result[0].preScreeningQuestions || []);
            // Load existing answers if any
            if (result[0].preScreeningAnswers) {
              if (Array.isArray(result[0].preScreeningAnswers)) {
                const flatAnswers = {};
                result[0].preScreeningAnswers.forEach((item) => {
                  flatAnswers[item.id] = item.answer;
                });
                setPreScreeningAnswers(flatAnswers);
              } else {
                // Old format: { questionId: answer } - use as is for backwards compatibility
                setPreScreeningAnswers(result[0].preScreeningAnswers);
              }
            }
            setLoading(false);
          }
        }
      })
      .catch((err) => {
        alert("Error fetching existing applied jobs.");
        window.location.href = pathConstants.dashboard;
        console.log(err);
      });
  }

  function handleCVScreen() {
    if (editingCV != null) {
      alert("Please save the changes first.");
      return false;
    }

    const allEmpty = Object.values(userCV).every(
      (value: any) => value.trim() == ""
    );

    if (allEmpty) {
      alert("No details to be save.");
      return false;
    }

    let parsedDigitalCV = {
      errorRemarks: null,
      digitalCV: null,
    };

    if (digitalCV) {
      parsedDigitalCV = JSON.parse(digitalCV);

      if (parsedDigitalCV.errorRemarks) {
        alert(
          "Please fix the errors in the CV first.\n\n" +
          parsedDigitalCV.errorRemarks
        );
        return false;
      }
    }

    // Save CV changes if any
    if (hasChanges) {
      const formattedUserCV = cvSections.map((section) => ({
        name: section,
        content: userCV[section]?.trim() || "",
      }));

      parsedDigitalCV.digitalCV = formattedUserCV;

      const data = {
        name: user.name,
        cvData: parsedDigitalCV,
        email: user.email,
        fileInfo: null,
      };

      if (file) {
        data.fileInfo = {
          name: file.name,
          size: file.size,
          type: file.type,
        };
      }

      axios({
        method: "POST",
        url: `/api/whitecloak/save-cv`,
        data,
      })
        .then(() => {
          localStorage.setItem(
            "userCV",
            JSON.stringify({ ...data, ...data.cvData })
          );
        })
        .catch((err) => {
          alert("Error saving CV. Please try again.");
          setCurrentStep(step[0]);
          console.log(err);
        });
    }

    // Navigate to Pre-Screening Questions step
    setCurrentStep(step[1]);
  }

  function handleAnswerChange(questionId, value) {
    setPreScreeningAnswers({
      ...preScreeningAnswers,
      [questionId]: value,
    });
  }

  function handleRangeAnswerChange(questionId, field, value) {
    setPreScreeningAnswers({
      ...preScreeningAnswers,
      [questionId]: {
        ...(preScreeningAnswers[questionId] || {}),
        [field]: value,
      },
    });
  }

  function formatNumberWithCommas(value) {
    if (!value) return "";
    // Remove all non-digit characters
    const numbers = value.toString().replace(/\D/g, "");
    // Add commas for thousands
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function handleNumberInput(value, isCurrency = false) {
    if (!value) return "";
    // Remove all non-digit characters
    const numbers = value.toString().replace(/\D/g, "");
    // Format with commas
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function handlePreScreeningContinue() {
    // Validate that all questions are answered
    const unansweredQuestions = preScreeningQuestions.filter((q) => {
      const answer = preScreeningAnswers[q.id];
      if (q.type === "range") {
        return !answer || !answer.minValue || !answer.maxValue;
      }
      if (q.type === "checkboxes") {
        return !Array.isArray(answer) || answer.length === 0;
      }
      return !answer || answer === "";
    });

    if (unansweredQuestions.length > 0) {
      // alert("Please answer all pre-screening questions before continuing.");
      errorToast("Please answer all pre-screening questions before continuing.", "top-center");
      return;
    }

    // Show loading screen immediately
    setIsScreening(true);
    setHasChanges(true);

    // Organize answers into structured format: [{ id, question, answer }]
    const organizedAnswers = preScreeningQuestions.map((question) => {
      return {
        id: question.id,
        question: question.question,
        answer: preScreeningAnswers[question.id] || null,
      };
    });

    // Save pre-screening answers first
    axios({
      url: "/api/whitecloak/save-pre-screening-answers",
      method: "POST",
      data: {
        interviewID: interview.interviewID,
        preScreeningAnswers: organizedAnswers,
      },
    })
      .then(() => {
        // Then proceed to screening
        return axios({
          url: "/api/whitecloak/screen-cv",
          method: "POST",
          data: {
            interviewID: interview.interviewID,
            userEmail: user.email,
          },
        });
      })
      .then((res) => {
        const result = res.data;

        if (result.error) {
          alert(result.message);
          setIsScreening(false);
          setCurrentStep(step[1]);
        } else {
          setCurrentStep(step[2]);
          setScreeningResult(result);
          setIsScreening(false);
        }
      })
      .catch((err) => {
        alert("Error processing your application. Please try again.");
        setIsScreening(false);
        setCurrentStep(step[1]);
        console.log(err);
      })
      .finally(() => {
        setHasChanges(false);
      });
  }

  function handleFileSubmit(file) {
    setBuildingCV(true);
    setHasChanges(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fName", file.name);
    formData.append("userEmail", user.email);

    axios({
      method: "POST",
      url: `${CORE_API_URL}/upload-cv`,
      data: formData,
    })
      .then((res) => {
        axios({
          method: "POST",
          url: `/api/whitecloak/digitalize-cv`,
          data: { chunks: res.data.cvChunks },
        })
          .then((res) => {
            const result = res.data.result;
            const parsedUserCV = JSON.parse(result);
            const formattedCV = {};

            cvSections.forEach((section, index) => {
              formattedCV[section] =
                parsedUserCV.digitalCV[index].content.trim();
            });

            setDigitalCV(result);
            setUserCV(formattedCV);
          })
          .catch((err) => {
            alert("Error building CV. Please try again.");
            console.log(err);
          })
          .finally(() => {
            setBuildingCV(false);
          });
      })
      .catch((err) => {
        alert("Error building CV. Please try again.");
        setBuildingCV(false);
        console.log(err);
      });
  }

  return (
    <>
      {loading && <Loader loaderData={""} loaderType={""} />}

      {interview && (
        <div className={styles.uploadCVContainer}>
          <div className={styles.uploadCVHeader}>
            {interview.organization && interview.organization.image && (
              <img alt="" src={interview.organization.image} />
            )}
            <div className={styles.textContainer}>
              <span className={styles.tag}>You're applying for</span>
              <span className={styles.title}>{interview.jobTitle}</span>
              {interview.organization && interview.organization.name && (
                <span className={styles.name}>
                  {interview.organization.name}
                </span>
              )}
              <span className={styles.description} onClick={handleModal}>
                View job description
              </span>
            </div>
          </div>

          <div className={styles.stepContainer}>
            <div className={styles.step}>
              {step.map((_, index) => (
                <div className={styles.stepBar} key={index}>
                  <img
                    alt=""
                    src={
                      assetConstants[
                      processState(index, true)
                        .toLowerCase()
                        .replace(" ", "_")
                      ]
                    }
                  />
                  {index < step.length - 1 && (
                    <hr
                      className={
                        styles[
                        processState(index).toLowerCase().replace(" ", "_")
                        ]
                      }
                    />
                  )}
                </div>
              ))}
            </div>

            <div className={styles.step}>
              {step.map((item, index) => (
                <span
                  className={`${styles.stepDetails} ${styles[
                    processState(index, true).toLowerCase().replace(" ", "_")
                  ]
                    }`}
                  key={index}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {currentStep == step[0] && (
            <>
              {!buildingCV && !userCV && !file && (
                <div className={styles.cvManageContainer}>
                  <div
                    className={styles.cvContainer}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <img alt="" src={assetConstants.uploadV2} />
                    <button onClick={handleUploadCV}>Upload CV</button>
                    <span>
                      Choose or drag and drop a file here. Our AI tools will
                      automatically pre-fill your CV and also check how well it
                      matches the role.
                    </span>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    style={{ display: "none" }}
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />

                  <div className={styles.cvContainer}>
                    <img alt="" src={assetConstants.review} />
                    <button
                      className={`${digitalCV ? "" : "disabled"}`}
                      disabled={!digitalCV}
                      onClick={handleReviewCV}
                    >
                      Review Current CV
                    </button>
                    <span>
                      Already uploaded a CV? Take a moment to review your
                      details before we proceed.
                    </span>
                  </div>
                </div>
              )}

              {buildingCV && file && (
                <div className={styles.cvDetailsContainer}>
                  <div className={styles.gradient}>
                    <div className={styles.cvDetailsCard}>
                      <span className={styles.sectionTitle}>
                        <img alt="" src={assetConstants.account} />
                        Submit CV
                      </span>
                      <div className={styles.detailsContainer}>
                        <span className={styles.fileTitle}>
                          <img alt="" src={assetConstants.completed} />
                          {file.name}
                        </span>
                        <div className={styles.loadingContainer}>
                          <img alt="" src={assetConstants.loading} />
                          <div className={styles.textContainer}>
                            <span className={styles.title}>
                              Extracting information from your CV...
                            </span>
                            <span className={styles.description}>
                              Jia is building your profile...
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!buildingCV && userCV && (
                <div className={styles.cvDetailsContainer}>
                  <div className={styles.gradient}>
                    <div className={styles.cvDetailsCard}>
                      <span className={styles.sectionTitle}>
                        <img alt="" src={assetConstants.account} />
                        Submit CV
                        <div className={styles.editIcon}>
                          <img
                            alt=""
                            src={
                              file ? assetConstants.xV2 : assetConstants.save
                            }
                            onClick={file ? handleRemoveFile : handleUploadCV}
                            onContextMenu={(e) => e.preventDefault()}
                          />
                        </div>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          style={{ display: "none" }}
                          ref={fileInputRef}
                          onChange={handleFileChange}
                        />
                      </span>

                      <div className={styles.detailsContainer}>
                        {file ? (
                          <span className={styles.fileTitle}>
                            <img alt="" src={assetConstants.completed} />
                            {file.name}
                          </span>
                        ) : (
                          <span className={styles.fileTitle}>
                            <img alt="" src={assetConstants.fileV2} />
                            You can also upload your CV and let our AI
                            automatically fill in your profile information.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {cvSections.map((section, index) => (
                    <div key={index} className={styles.gradient}>
                      <div className={styles.cvDetailsCard}>
                        <span className={styles.sectionTitle}>
                          {section}

                          <div className={styles.editIcon}>
                            <img
                              alt=""
                              src={
                                editingCV == section
                                  ? assetConstants.save
                                  : assetConstants.edit
                              }
                              onClick={() =>
                                handleEditCV(
                                  editingCV == section ? null : section
                                )
                              }
                              onContextMenu={(e) => e.preventDefault()}
                            />
                          </div>
                        </span>

                        <div className={styles.detailsContainer}>
                          {editingCV == section ? (
                            <textarea
                              id={section}
                              placeholder="Upload your CV to auto-fill this section."
                              value={
                                userCV && userCV[section] ? userCV[section] : ""
                              }
                              onBlur={(e) => {
                                e.target.placeholder =
                                  "Upload your CV to auto-fill this section.";
                              }}
                              onChange={(e) => {
                                setUserCV({
                                  ...userCV,
                                  [section]: e.target.value,
                                });
                                setHasChanges(true);
                              }}
                              onFocus={(e) => {
                                e.target.placeholder = "";
                              }}
                            />
                          ) : (
                            <div
                              className={`${styles.sectionDetails} ${userCV &&
                                userCV[section] &&
                                userCV[section].trim()
                                ? styles.withDetails
                                : ""
                                }`}
                            >
                              <Markdown>
                                {userCV &&
                                  userCV[section] &&
                                  userCV[section].trim()
                                  ? userCV[section].trim()
                                  : "Upload your CV to auto-fill this section."}
                              </Markdown>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={handleCVScreen}>
                    Continue <i className="las la-arrow-right !text-white ml-2"></i>
                  </button>
                </div>
              )}
            </>
          )}

          {/* //! Pre-Screening Questions */}
          {currentStep == step[1] && (
            <>
              {isScreening ? (
                <div className={styles.cvScreeningContainer}>
                  <img alt="" src={assetConstants.loading} />
                  <span className={styles.title}>Sit tight!</span>
                  <span className={styles.description}>
                    Our smart reviewer is checking your qualifications.
                  </span>
                  <span className={styles.description}>
                    We'll let you know what's next in just a moment.
                  </span>
                </div>
              ) : (
                <div className={styles.preScreeningContainer}>
                  <div>
                    <h1 className="text-2xl font-bold">Quick Pre-Screening</h1>
                    <p className="text-md text-gray-500">
                      Just a few short questions to help your recruiters assess you faster. takes less than a minute.
                    </p>
                  </div>
                  {preScreeningQuestions.length > 0 ? (
                    preScreeningQuestions.map((question, index) => (
                      <div key={question.id} className={styles.gradient}>
                        <div className={styles.cvDetailsCard}>
                          <span className={styles.sectionTitle}>
                            {question.question}
                          </span>
                          <div className={styles.detailsContainer}>
                            {question.type === "dropdown" && (
                              <select
                                className={styles.questionInput}
                                value={
                                  preScreeningAnswers[question.id] || ""
                                }
                                onChange={(e) => {
                                  // Save the actual option text value, not the ID
                                  handleAnswerChange(question.id, e.target.value);
                                }}
                              >
                                <option value="">Select an option</option>
                                {question.options?.map((option) => (
                                  <option key={option.id} value={option.value}>
                                    {option.value}
                                  </option>
                                ))}
                              </select>
                            )}
                            {question.type === "range" && (
                              <div className="flex flex-row gap-4 w-full">
                                <div className={styles.rangeInputGroup} style={{ flex: 1 }}>
                                  <label>Minimum {question.rangeType === "currency" ? "Salary" : "Value"}</label>
                                  <div className={styles.currencyInput}>
                                    {question.rangeType === "currency" && (
                                      <span className={styles.currencySymbol}>
                                        {question.currency === "PHP" ? "₱" : "$"}
                                      </span>
                                    )}
                                    <input
                                      type="text"
                                      className={styles.questionInput}
                                      placeholder="0"
                                      value={
                                        preScreeningAnswers[question.id]?.minValue || ""
                                      }
                                      onChange={(e) => {
                                        const formatted = handleNumberInput(
                                          e.target.value,
                                          question.rangeType === "currency"
                                        );
                                        handleRangeAnswerChange(
                                          question.id,
                                          "minValue",
                                          formatted
                                        );
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className={styles.rangeInputGroup} style={{ flex: 1 }}>
                                  <label>Maximum {question.rangeType === "currency" ? "Salary" : "Value"}</label>
                                  <div className={styles.currencyInput}>
                                    {question.rangeType === "currency" && (
                                      <span className={styles.currencySymbol}>
                                        {question.currency === "PHP" ? "₱" : "$"}
                                      </span>
                                    )}
                                    <input
                                      type="text"
                                      className={styles.questionInput}
                                      placeholder="0"
                                      value={
                                        preScreeningAnswers[question.id]?.maxValue || ""
                                      }
                                      onChange={(e) => {
                                        const formatted = handleNumberInput(
                                          e.target.value,
                                          question.rangeType === "currency"
                                        );
                                        handleRangeAnswerChange(
                                          question.id,
                                          "maxValue",
                                          formatted
                                        );
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                            {question.type === "short-answer" && (
                              <input
                                type="text"
                                className={styles.questionInput}
                                value={preScreeningAnswers[question.id] || ""}
                                onChange={(e) =>
                                  handleAnswerChange(question.id, e.target.value)
                                }
                                placeholder="Enter your answer"
                              />
                            )}
                            {question.type === "long-answer" && (
                              <textarea
                                className={styles.questionTextarea}
                                value={preScreeningAnswers[question.id] || ""}
                                onChange={(e) =>
                                  handleAnswerChange(question.id, e.target.value)
                                }
                                placeholder="Enter your answer"
                                rows={4}
                              />
                            )}
                            {question.type === "checkboxes" && (
                              <div className={styles.checkboxContainer}>
                                {question.options?.map((option) => {
                                  const currentAnswers = Array.isArray(preScreeningAnswers[question.id])
                                    ? preScreeningAnswers[question.id]
                                    : [];
                                  // Check if the option value (text) is in the answers array
                                  const isChecked = currentAnswers.includes(option.value);
                                  return (
                                    <label
                                      key={option.id}
                                      className={styles.checkboxLabel}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            // Save the option value (text), not the ID
                                            handleAnswerChange(question.id, [
                                              ...currentAnswers,
                                              option.value,
                                            ]);
                                          } else {
                                            // Remove the option value (text)
                                            handleAnswerChange(
                                              question.id,
                                              currentAnswers.filter(
                                                (value) => value !== option.value
                                              )
                                            );
                                          }
                                        }}
                                      />
                                      <span>{option.value}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.gradient}>
                      <div className={styles.cvDetailsCard}>
                        <span className={styles.sectionTitle}>
                          QUICK PRE SCREENING QUESTION
                        </span>
                        <div className={styles.detailsContainer}>
                          <span className={styles.sectionDetails}>
                            No pre-screening questions available.
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <button onClick={handlePreScreeningContinue}>
                    Continue <i className="las la-arrow-right !text-white ml-2"></i>
                  </button>
                </div>
              )}
            </>
          )}

          {currentStep == step[2] && screeningResult && (
            <div className={styles.cvResultContainer}>
              {screeningResult.applicationStatus == "Dropped" ? (
                <>
                  <img alt="" src={assetConstants.userRejected} />
                  <span className={styles.title}>
                    This role may not be the best match.
                  </span>
                  <span className={styles.description}>
                    Based on your CV, it looks like this position might not be
                    the right fit at the moment.
                  </span>
                  <br />
                  <span className={styles.description}>
                    Review your screening results and see recommended next
                    steps.
                  </span>
                  <div className={styles.buttonContainer}>
                    <button onClick={() => handleRedirection("dashboard")}>
                      View Dashboard
                    </button>
                  </div>
                </>
              ) : screeningResult.status == "For AI Interview" ? (
                <>
                  <img alt="" src={assetConstants.checkV3} />
                  <span className={styles.title}>
                    Hooray! You’re a strong fit for this role.
                  </span>
                  <span className={styles.description}>
                    Jia thinks you might be a great match.
                  </span>
                  <br />
                  <span className={`${styles.description} ${styles.bold}`}>
                    Ready to take the next step?
                  </span>
                  <span className={styles.description}>
                    You may start your AI interview now.
                  </span>
                  <div className={styles.buttonContainer}>
                    <button onClick={() => handleRedirection("interview")}>
                      Start AI Interview
                    </button>
                    <button
                      className="secondaryBtn"
                      onClick={() => handleRedirection("dashboard")}
                    >
                      View Dashboard
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <img alt="" src={assetConstants.userCheck} />
                  <span className={styles.title}>
                    Your CV is now being reviewed by the hiring team.
                  </span>
                  <span className={styles.description}>
                    We’ll be in touch soon with updates about your application.
                  </span>
                  <div className={styles.buttonContainer}>
                    <button onClick={() => handleRedirection("dashboard")}>
                      View Dashboard
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}

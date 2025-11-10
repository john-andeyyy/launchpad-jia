"use client";
import { useState } from "react";

export default function CustomDropdown(props) {
    const { onSelectSetting, screeningSetting, settingList, placeholder, disabled, hasError } = props;
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
        <div className="dropdown w-100 relative">
          <button
            disabled={disabled !== undefined ? disabled : settingList.length === 0}
            className="dropdown-btn fade-in-bottom"
            style={{ 
                width: "100%", 
                textTransform: "capitalize",
                border: hasError ? "2px solid #DC2626" : "1px solid #ddd",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
            }}
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
          >
            <span>
              <i
                className={
                  settingList.find(
                    (setting) => setting.name === screeningSetting
                  )?.icon
                }
              ></i>{" "}
              {screeningSetting?.replace("_", " ") || placeholder}
            </span>
            <img 
              src="/icons/chevron.svg" 
              alt="chevron" 
              style={{ 
                width: "16px", 
                height: "16px",
                opacity: disabled !== undefined && disabled ? 0.5 : 1,
                transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease"
              }} 
            />
          </button>
          <div
            className={`dropdown-menu w-100 mt-1 org-dropdown-anim${
              dropdownOpen ? " show" : ""
            }`}
            style={{
              padding: "10px",
              maxHeight: 200,
              overflowY: "auto",
            }}
          >
            {settingList.map((setting, index) => (
              <div style={{ borderBottom: "1px solid #ddd" }} key={index}>
                <button
                  className="dropdown-item d-flex align-items-center"
                  style={{
                    minWidth: 220,
                    borderRadius: screeningSetting === setting.name ? 0 : 10,
                    overflow: "hidden",
                    paddingBottom: 10,
                    paddingTop: 10,
                    color: "#181D27",
                    fontWeight: screeningSetting === setting.name ? 700 : 500,
                    background: screeningSetting === setting.name ? "#F8F9FC" : "transparent",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    whiteSpace: "wrap",
                    textTransform: "capitalize",
                  }}
                  onClick={() => {
                    onSelectSetting(setting.name);
                    setDropdownOpen(false);
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "5px" }}>
                  {setting.icon && <i className={setting.icon}></i>} {setting.name?.replace("_", " ")}
                  </div>
                  {setting.name === screeningSetting && (
                            <i
                                className="la la-check"
                                style={{
                                    fontSize: "20px",
                                    background: "linear-gradient(180deg, #9FCAED 0%, #CEB6DA 33%, #EBACC9 66%, #FCCEC0 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                    color: "transparent"
                                }}
                            ></i>
                        )}
                </button>
              </div>
            ))}
          </div>
        </div>
  );
}


// ! CustomDropdownProps interface
/*
"use client";
import { useState } from "react";

export default function CustomDropdown(props) {
    const { onSelectSetting, screeningSetting, settingList, placeholder, disabled } = props;
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedSetting = settingList.find(
    (setting) => setting.name === screeningSetting
  );
  const hasValidSelection = selectedSetting && screeningSetting;
  const displayText = hasValidSelection 
    ? selectedSetting.name?.replace("_", " ") 
    : placeholder;

  const isDisabled = disabled !== undefined ? disabled : settingList.length === 0;

  return (
        <div className="dropdown w-100">
          <span>{props.label}</span>
          <button
            disabled={isDisabled}
            className="dropdown-btn fade-in-bottom"
            style={{ width: "100%", textTransform: "capitalize" }}
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
          >
            <span>
              <i
                className={hasValidSelection ? selectedSetting?.icon : ""}
              ></i>{" "}
              {displayText}
            </span>
            <i className="la la-angle-down ml-10"></i>
          </button>
          <div
            className={`dropdown-menu w-100 mt-1 org-dropdown-anim${
              dropdownOpen ? " show" : ""
            }`}
            style={{
              padding: "10px",
              maxHeight: 200,
              overflowY: "auto",
            }}
          >
            {settingList.map((setting, index) => (
              <div style={{ borderBottom: "1px solid #ddd" }} key={index}>
                <button
                  className="dropdown-item d-flex align-items-center"
                  style={{
                    minWidth: 220,
                    borderRadius: screeningSetting === setting.name ? 0 : 10,
                    overflow: "hidden",
                    paddingBottom: 10,
                    paddingTop: 10,
                    color: "#181D27",
                    fontWeight: screeningSetting === setting.name ? 700 : 500,
                    background: screeningSetting === setting.name ? "#F8F9FC" : "transparent",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    whiteSpace: "wrap",
                    textTransform: "capitalize",
                  }}
                  onClick={() => {
                    onSelectSetting(setting.name);
                    setDropdownOpen(false);
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "5px" }}>
                  {setting.icon && <i className={setting.icon}></i>} {setting.name?.replace("_", " ")}
                  </div>
                  {setting.name === screeningSetting && (
                            <i
                                className="la la-check"
                                style={{
                                    fontSize: "20px",
                                    background: "linear-gradient(180deg, #9FCAED 0%, #CEB6DA 33%, #EBACC9 66%, #FCCEC0 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                    color: "transparent"
                                }}
                            ></i>
                        )}
                </button>
              </div>
            ))}
          </div>
        </div>
  );
} */
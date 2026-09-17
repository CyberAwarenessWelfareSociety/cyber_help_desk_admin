import React, { useState } from "react";
import styles from "../Aadhar/SimpleModal.module.css";
import api from "../../../Utils/api";
import toast from "react-hot-toast";
import { MdClose, MdPerson, MdInfo, MdLocationOn } from "react-icons/md";

const SimpleModal = ({ apiName, apiId, onClose }) => {
  const [inputValue, setInputValue] = useState(""); // For CIN, DIN, or id
  const [formData,setFormData]=useState({})
  const [typeValue, setTypeValue] = useState("aadhaar"); // Default to 'aadhaar' for case 4
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Input validation based on API
  const validateInput = (value, type = "") => {
    switch (apiId) {
      case 1: // mcaByCIN
      case 2: // mcaByCIN1
        return /^[A-Z][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/.test(value); // CIN format
      case 3: // mcaByDIN
        return /^[0-9]{8}$/.test(value); // DIN format (8-digit number)
      case 4: // udidDocReport
        return type === "aadhaar" && /^[0-9]{12}$/.test(value); // Aadhaar: 12-digit number
      default:
        return false;
    }
  };

  // Get input label and placeholder based on API
  const getInputConfig = () => {
    switch (apiId) {
      case 1:
      case 2:
        return { label: "CIN", placeholder: "Enter CIN (e.g., U01100AP2018PTC107442)" };
      case 3:
        return { label: "DIN", placeholder: "Enter DIN (e.g., 09597232)" };
      case 4:
        return [
          { label: "Type", placeholder: "Select Type" },
          { label: "Aadhaar Number", placeholder: "Enter Aadhaar Number (e.g., 205921031911)" },
        ];
      default:
        return { label: "Input", placeholder: "Enter required value" };
    }
  };

  // Get API endpoint
  const getApiEndpoint = () => {
    switch (apiId) {
      case 1:
        return "/v1/mcaByCIN";
      case 2:
        return "/v1/mcaByCIN1";
      case 3:
        return "/v1/mcaByDIN";
      case 4:
        return `/v1/udidDocReport?type=${typeValue}&id=${inputValue}`;
      default:
        return null;
    }
  };

  // Construct request body (not needed for GET requests like case 4)
  const getRequestBody = () => {
    switch (apiId) {
      case 1:
      case 2:
        return { CIN: inputValue };
      case 3:
        return { DIN: inputValue };
      case 4:
        return null; // No body for GET request
      default:
        return {};
    }
  };

  const handleSubmit = async () => {
    if (!validateInput(inputValue, typeValue)) {
      setError(
        apiId === 4
          ? "Please enter a valid 12-digit Aadhaar number."
          : `Please enter a valid ${getInputConfig().label?.toLowerCase() || "input"}.`
      );
      return;
    }

    setError("");
    const endpoint = getApiEndpoint();
    if (!endpoint) {
      setError("No API endpoint found for this card!");
      return;
    }

    try {
      setResult(null);
      setLoading(true);
      let res;
      if (apiId === 4) {
        // Use GET for case 4
        res = await api.get(endpoint);
      } else {
        // Use POST for other cases
        res = await api.post(endpoint, getRequestBody());
      }
      console.log(res);
      setResult(res.data);

      if (res.data?.success) {
        const msg = res.data?.message || "Details fetched successfully";
        toast.success(msg);
      } else {
        const err = res.data?.message || "Failed to fetch details or empty response";
        toast.error(err);
        setError(err);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Something went wrong while fetching data.";
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const renderDetailCard = (icon, title, items) => (
    <div className={styles.detailCard}>
      <div className={styles.cardHeader}>
        {icon}
        <h3>{title}</h3>
      </div>
      <div className={styles.cardContent}>
        {Object.entries(items).map(
          ([key, value]) =>
            value !== undefined &&
            value !== null &&
            value !== "" &&
            value !== "null" && (
              <div key={key} className={styles.detailItem}>
                <span className={styles.detailLabel}>
                  {key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                  :
                </span>
                <span className={styles.detailValue}>{value.toString()}</span>
              </div>
            )
        )}
      </div>
    </div>
  );

  const renderResultSection = () => {
    if (loading) {
      return (
        <div className={styles.skeletonLoader}>
          <div className={styles.skeletonCard}></div>
          <div className={styles.skeletonRow}></div>
          <div className={styles.skeletonRow}></div>
        </div>
      );
    }

    if (!result) return null;

    switch (apiId) {
      case 1: // mcaByCIN
        return (
          <div className={styles.resultsContainer}>
            {result.data?.response[0]?.response?.data?.map(
              (item, index) => (
                <div key={index}>
                  {renderDetailCard(
                    item.addressType === "Registered Address" ? <MdLocationOn /> : <MdInfo />,
                    item.addressType === "Registered Address"
                      ? "Registered Address"
                      : `Balance Sheet ${item.financialYear}`,
                    {
                      "Company Name": item.companyName,
                      CIN: item.CIN,
                      "Company Status": item.companyStatus,
                      Type: item.type,
                      "Incorporation Date": item.incorporationDate,
                      "ROC Name": item.ROCName,
                      "Email Address": item.emailAddress,
                      Area: item.area,
                      City: item.city,
                      District: item.district,
                      State: item.state,
                      Country: item.country,
                      Pincode: item.pincode,
                      "Address Line 1": item.addressLine1,
                      "Address Line 2": item.addressLine2,
                      "Financial Year": item.financialYear,
                      "Financial Range": item.financialRange,
                      "Is Audit Status Applicable": item.isAuditStatusApplicable,
                    }
                  )}
                </div>
              )
            )}
          </div>
        );
      case 2: // mcaByCIN1
        return (
          <div className={styles.resultsContainer}>
            {result.data?.response[0]?.response?.data?.map(
              (director, index) => (
                <div key={index}>
                  {renderDetailCard(<MdPerson />, `Director ${index + 1}`, {
                    "First Name": director.firstName,
                    "Middle Name": director.middleName,
                    "Last Name": director.lastName,
                    "Father First Name": director.fatherFirstName,
                    "Father Middle Name": director.fatherMidName,
                    "Father Last Name": director.fatherLastName,
                    DOB: director.DOB,
                    DIN: director.DIN,
                    "DIN Status": director.DINStatus,
                    "Company Name": director.companyName,
                    CIN: director.CIN,
                    "Association Status": director.associationStatus,
                  })}
                </div>
              )
            )}
          </div>
        );
      case 3: // mcaByDIN
        return (
          <div className={styles.resultsContainer}>
            {result.success ? (
              renderDetailCard(<MdInfo />, "DIN Details", {
                Status: result.data?.response[0]?.responseStatus,
                Message: result.data?.message,
                Code: result.data?.code,
              })
            ) : (
              renderDetailCard(<MdInfo />, "DIN Error", {
                Message: result.message,
              })
            )}
          </div>
        );
      case 4: // udidDocReport
        return (
          <div className={styles.resultsContainer}>
            {result.success && result.result?.applicant ? (
              renderDetailCard(<MdPerson />, "UDID Details", {
                "Full Name": result.result.applicant.full_name,
                "Aadhaar Number": result.result.applicant.aadhaar_no,
                "Application Number": result.result.applicant.application_number,
                "UDID Number": result.result.applicant.udid_number,
                Mobile: result.result.applicant.mobile,
                Status: result.result.applicant.status,
                Hospital: result.result.applicant.hospital,
                "Document Type": result.result.document_type,
              })
            ) : (
              renderDetailCard(<MdInfo />, "UDID Error", {
                Message: result.message || "No data available",
              })
            )}
          </div>
        );
      default:
        return (
          <div className={styles.resultsContainer}>
            {result && Object.keys(result).length > 0 ? (
              renderDetailCard(<MdInfo />, "API Response", result.data)
            ) : (
              <div className={styles.noData}>No data available</div>
            )}
          </div>
        );
    }
  };

  const { label, placeholder } = getInputConfig();

  return (
    <div className={styles.modalBackdrop}>
      <div className={`${styles.modal} ${result ? styles.expanded : ""}`}>
        <div className={styles.modalHeader}>
          <h2>{apiName}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <MdClose />
          </button>
        </div>

        <div className={styles.modalBody}>
          {!result && (
            <>
              <div className={styles.inputSection}>
                {apiId === 4 ? (
                  <>
                    <label>{getInputConfig()[0].label}</label>
                    <select
                      value={typeValue}
                      onChange={(e) => {
                        const val = e.target.value.toLowerCase();
                        setTypeValue(val);
                        setError(
                          validateInput(inputValue, val) || inputValue.length === 0
                            ? ""
                            : "Invalid Aadhaar number format"
                        );
                      }}
                      className={styles.input}
                    >
                      <option value="aadhaar">Aadhaar</option>
                    </select>
                    <label>{getInputConfig()[1].label}</label>
                    <input
                      type="text"
                      placeholder={getInputConfig()[1].placeholder}
                      value={inputValue}
                      onChange={(e) => {
                        const val = e.target.value;
                        setInputValue(val);
                        setError(
                          validateInput(val, typeValue) || val.length === 0
                            ? ""
                            : "Invalid Aadhaar number format"
                        );
                      }}
                      maxLength={12}
                      className={styles.input}
                    />
                  </>
                ) : (
                  <>
                    <label>{label}</label>
                    <input
                      type="text"
                      placeholder={placeholder}
                      value={inputValue}
                      onChange={(e) => {
                        const val = apiId === 1 || apiId === 2 ? e.target.value.toUpperCase() : e.target.value;
                        setInputValue(val);
                        setError(
                          validateInput(val) || val.length === 0
                            ? ""
                            : `Invalid ${label.toLowerCase()} format`
                        );
                      }}
                      maxLength={apiId === 1 || apiId === 2 ? 21 : 8}
                      className={styles.input}
                    />
                  </>
                )}
                {error && <p className={styles.error}>{error}</p>}
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.accessBtn}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className={styles.spinner}></div>
                      Loading...
                    </>
                  ) : (
                    "Fetch Details"
                  )}
                </button>
              </div>
            </>
          )}

          <div className={styles.resultSection}>
            {!loading && result && (
              <>
                {result.message && (
                  <p className={styles.successMessage}>
                    <MdInfo /> {result.message}
                  </p>
                )}
                <div className={styles.resultBox}>{renderResultSection()}</div>

                <div className={styles.actions}>
                  <button
                    className={styles.accessBtn}
                    
                    onClick={() => {
                      setResult(null);
                      setTypeValue("aadhaar"); // Reset to 'aadhaar' for case 4
                      setInputValue("");
                    }}
                  >
                    New Search
                  </button>
                  <button className={styles.cancelBtn} onClick={onClose}>
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleModal;
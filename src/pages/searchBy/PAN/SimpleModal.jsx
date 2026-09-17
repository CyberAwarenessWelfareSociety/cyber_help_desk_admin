import React, { useState } from "react";
import styles from "../Aadhar/SimpleModal.module.css";
import api from "../../../Utils/api";
import toast from "react-hot-toast";
import { MdClose, MdPerson, MdCreditCard, MdInfo, MdCalendarToday, MdEmail, MdPhone, MdLocationOn } from "react-icons/md";

const SimpleModal = ({ apiName, apiId, onClose }) => {
  const [panNumber, setPanNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const validatePAN = (number) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(number);

  const getApiEndpoint = () => {
    switch (apiId) {
      case 1:
        return `/v1/panToAadhaar?pan_no=${panNumber}`;
      case 2:
        return `/v1/panDetailsPlus?pan_no=${panNumber}`;
      case 3:
        return `/v1/panToName?pan_no=${panNumber}`;
      case 4:
        return `/v1/panBasic?pan_no=${panNumber}`;
      case 5:
        return `/v1/panDetailsPrime?pan_no=${panNumber}`;
      case 6:
        return `/v1/panToUan_d1?pan_number=${panNumber}`;
      case 7:
        return `/v1/panMsmeCheck_d1?pan_number=${panNumber}`;
      default: return null;
    }
  };

  const handleSubmit = async () => {
    if (!validatePAN(panNumber)) {
      setError("Please enter a valid PAN number.");
      return;
    }

    setError("");
    const endpoint = getApiEndpoint();
    if (!endpoint) {
      setError("No API endpoint found for this card!");
      return;
    }

    try {
      setResult(null); // clear old results
      setLoading(true);
      const res = await api.get(`${endpoint}`);
      console.log(res);
      setResult(res.data);

      if (res.data?.success) {
        const msg = res.data?.meta?.message || "Details fetched successfully";
        toast.success(msg);
        setLoading(false);
      } else {
        const err = res.data?.meta?.message || "Failed to fetch details or Empty response";
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
        {Object.entries(items).map(([key, value]) => (
          value !== undefined && value !== null && value !== "" && (
            <div key={key} className={styles.detailItem}>
              <span className={styles.detailLabel}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
              <span className={styles.detailValue}>{value.toString()}</span>
            </div>
          )
        ))}
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
      case 1:
        return (
          <div className={styles.resultsContainer}>
            {renderDetailCard(<MdCreditCard />, "PAN to Aadhaar Details", {
              "Aadhaar": result.result?.data?.aadhaar_number,
              "DoB": result.result?.data?.dob,
              "Gender": result.result?.data?.gender,
              "Name": result.result?.data?.name,
              "PAN": result.result?.data?.pan_number
            })}
          </div>
        );
      case 2:
        return (
          <div className={styles.resultsContainer}>
            {renderDetailCard(<MdPerson />, "Personal Details", {
              "Aadhar Linked": result.result?.aadhaar ? "Yes" : "No",
              "Address": result.result?.address,
              "Category": result.result?.category,
              "DoB": result.result?.dob,
              "DoB Check": result.result?.dob ? "Yes" : "No",
              "DoB Verified": result.result?.dobVerified ? "Yes" : "No",
              "DOI": result.result?.doi,
              "Email": result.result?.emailId,
              "Father's Name": result.result?.fatherName,
              "Gender": result.result?.gender,
              "Less Info": result.result?.lessInfo,
              "Masked Aadhaar": result.result?.maskedAadhaar,
              "Mobile No": result.result?.mobileNumber,
              "Name": result.result?.name,
              "PAN No": result.result?.panNumber,
              "Tax": result.result?.tax
            })}
            
            {result.result?.split_address && (
              renderDetailCard(<MdLocationOn />, "Address Details", {
                "Address 1": result.result.split_address.address1,
                "Address 2": result.result.split_address.address2,
                "Address 3": result.result.split_address.address3,
                "City": result.result.split_address.city,
                "State": result.result.split_address.state,
                "Country": result.result.split_address.country,
                "Pincode": result.result.split_address.pincode
              })
            )}
            
            {result.result?.split_name && (
              renderDetailCard(<MdPerson />, "Name Details", {
                "First Name": result.result.split_name.firstName,
                "Middle Name": result.result.split_name.middleName,
                "Last Name": result.result.split_name.lastName
              })
            )}
          </div>
        );
      case 3:
        return (
          <div className={styles.resultsContainer}>
            {renderDetailCard(<MdCreditCard />, "PAN Details", {
              "Masked Aadhaar": result.result?.maskedAadhaar,
              "Name": result.result?.name,
              "PAN No": result.result?.panNumber
            })}
          </div>
        );
      case 4:
        return (
          <div className={styles.resultsContainer}>
            {renderDetailCard(<MdPerson />, "Basic PAN Details", {
              "Name": result.result?.full_name,
              "Age": result.result?.age,
              "DoB": result.result?.date_of_birth,
              "Gender": result.result?.gender?.gender,
              "Confidence": result.result?.gender?.confidence,
              "PAN No": result.result?.pan,
              "PAN Type": result.result?.pan_type,
              "Aadhaar Masked": result.result?.validation?.aadhaar_masked,
              "Is Valid": result.result?.validation?.is_valid ? "Yes" : "No"
            })}
            
            {result.result?.split_name && (
              renderDetailCard(<MdPerson />, "Name Breakdown", {
                "First Name": result.result.split_name.first_name,
                "Middle Name": result.result.split_name.middle_name,
                "Last Name": result.result.split_name.last_name
              })
            )}
          </div>
        );
      case 5:
        return (
          <div className={styles.resultsContainer}>
            {renderDetailCard(<MdInfo />, "PAN Prime Details", {
              "PAN No": result.result?.pan,
              "IP Used": result.result?.ip_used,
              "Source": result.result?.source
            })}
          </div>
        );
      case 6:
        return (
          <div className={styles.resultsContainer}>
            {renderDetailCard(<MdInfo />, "PAN to UAN Details", {
              "Message": result.result?.message,
              "Sub Code": result.result?.sub_code,
              "Timestamp": result.result?.timestamp
            })}
          </div>
        );
      case 7:
        return (
          <div className={styles.resultsContainer}>
            {renderDetailCard(<MdPerson />, "PAN MSME Details", {
              "PAN Number": result.result?.pan_number,
              "Migration Status": result.result?.migration_status,
              "Udyam Exists": result.result?.udyam_exists ? "Yes" : "No",
              "Category": result.result?.pan_details?.category,
              "Status": result.result?.pan_details?.status
            })}
            
            {result.result?.pan_details && (
              <>
                {renderDetailCard(<MdPerson />, "Personal Details", {
                  "Full Name": result.result.pan_details.full_name,
                  "DoB": result.result.pan_details.dob,
                  "Gender": result.result.pan_details.gender,
                  "Masked Aadhaar": result.result.pan_details.masked_aadhaar,
                  "Aadhaar Linked": result.result.pan_details.aadhaar_linked ? "Yes" : "No"
                })}
                
                {result.result.pan_details.full_name_split && (
                  <div className={styles.detailCard}>
                    <div className={styles.cardHeader}>
                      <MdPerson />
                      <h3>Name Parts</h3>
                    </div>
                    <div className={styles.cardContent}>
                      {result.result.pan_details.full_name_split.map((item, index) => (
                        <div key={index} className={styles.detailItem}>
                          <span className={styles.detailLabel}>Part {index + 1}:</span>
                          <span className={styles.detailValue}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );
      default:
        return (
          <div className={styles.resultsContainer}>
            {result && Object.keys(result).length > 0 ? (
              <>
                {result.meta && (
                  <div className={styles.metaSection}>
                    <h3><MdInfo /> Request Information</h3>
                    {renderDetailCard(<MdInfo />, "API Response", result.meta)}
                  </div>
                )}
                {result.result && typeof result.result === 'object' ? (
                  renderDetailCard(<MdInfo />, "Result Details", result.result)
                ) : (
                  <div className={styles.detailCard}>
                    <div className={styles.cardHeader}>
                      <MdInfo />
                      <h3>Result</h3>
                    </div>
                    <div className={styles.cardContent}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailValue}>{result.result}</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.noData}>No data available</div>
            )}
          </div>
        );
    }
  };

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
                <label>PAN Number</label>
                <input
                  type="text"
                  placeholder="Enter Your PAN Number (e.g., ABCDE1234F)"
                  value={panNumber}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setPanNumber(val);
                    setError(
                      validatePAN(val) || val.length === 0 ? "" : "Invalid PAN format"
                    );
                  }}
                  maxLength={10}
                  className={styles.input}
                />
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
                {result.meta?.message && (
                  <p className={styles.successMessage}>
                    <MdInfo /> {result.meta.message}
                  </p>
                )}
                <div className={styles.resultBox}>
                  {renderResultSection()}
                </div>
                
                <div className={styles.actions}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => setResult(null)}
                  >
                    New Search
                  </button>
                  <button
                    className={styles.closeResultBtn}
                    onClick={onClose}
                  >
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
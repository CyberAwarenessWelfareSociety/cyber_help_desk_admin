import React, { useState } from "react";
import styles from "./SimpleModal.module.css";
import api from "../../../Utils/api";
import toast from "react-hot-toast";
import {
  MdClose,
  MdInfo,
  MdPerson,
  MdPhone,
  MdEmail,
  MdLocationOn,
  MdCreditCard,
  MdCalendarToday,
} from "react-icons/md";

const SimpleModal = ({ apiName, apiId, onClose }) => {
  const [aadharNumber, setAadharNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
const [type,setType]=useState("")
  const validateAadhar = (number) => /^\d{12}$/.test(number);

  const getApiEndpoint = () => {
    switch (apiId) {
      case 1:
        return `/v1/aadharToPan?aadhaar_no=${aadharNumber}`;
      case 2:
        return `/v1/aadharToNamePhoneMask?aadhaar_no=${aadharNumber}`;
      case 3:
        return `/v1/aadharDataCheck?aadhaar_no=${aadharNumber}`;
      case 4:
        return `/v1/aadharDetails?aadhaar_no=${aadharNumber}`;
      case 5:
        return `/v1/aadharVerify?aadhaar_no=${aadharNumber}`;
      case 6:
        return `/v1/aadharToMaskPan?aadhaar_no=${aadharNumber}`;
      case 7:
        return `/v1/aadharProWithDetails?aadhaar_no=${aadharNumber}`;
      case 8:
        return `/v1/aadharToRationPdf?aadhaar_no=${aadharNumber}&type=${type}`;
      case 9:
        return `/v1/aadharDataV1?aadhaar=${aadharNumber}`;
      case 10:
        return `/v1/aadhaarToUan_d1?aadhaar_number=${aadharNumber}`;
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    if (!validateAadhar(aadharNumber)) {
      setError("Please enter a valid 12-digit Aadhaar number.");
      return;
    }

    setError("");
    const endpoint = getApiEndpoint();
    if (!endpoint) {
      setError("No API endpoint found for this card!");
      return;
    }

    try {
      setResult(null); // Clear old results
      setLoading(true);
      const res = apiId === 9 ? await api.post(endpoint) : await api.get(endpoint);
      setResult(res.data);

      if (res.data?.success) {
        const msg = res.data?.meta?.message || "Details fetched successfully";
        toast.success(msg);
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
              <span className={styles.detailLabel}>
                {key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}:
              </span>
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
            {renderDetailCard(<MdCreditCard />, "Aadhaar to PAN Details", {
              Aadhaar: result.result?.aadhaar,
              "PAN Number": result.result?.pan_no,
            })}
          </div>
        );
      case 2:
        return (
          <div className={styles.resultsContainer}>
            {renderDetailCard(<MdPerson />, "Personal Details", {
              Aadhaar: result.result?.aadhaar,
              Name: result.result?.responseData?.name,
              Mobile: result.result?.responseData?.mobile,
              UID: result.result?.responseData?.uid,
            })}
          </div>
        );
        case 8:
  return (
    <div className={styles.resultsContainer}>
      <div className={styles.metaSection}>
        <h3>
          <MdInfo /> Request Information
        </h3>
        {renderDetailCard(<MdInfo />, "API Response", {
          Status: result.meta?.status ? result.meta.status.charAt(0).toUpperCase() + result.meta.status.slice(1) : 'N/A',
          Message: result.meta?.message || 'N/A',
          Timestamp: result.meta?.timestamp || 'N/A',
        })}
      </div>
      {result.result?.pdfData && result.result.pdfData.startsWith('data:application/pdf;base64,') ? (
        <div className={styles.pdfContainer}>
          <h3>Ration Card PDF</h3>
          <embed
            src={result.result.pdfData}
            type="application/pdf"
            width="100%"
            height="600px"
            className={styles.pdfEmbed}
          />
        </div>
      ) : (
        <div className={styles.noData}>No valid PDF data available</div>
      )}
    </div>
  );
        case 7:
    const details = result?.result?.details || {};
    return (
      <div className={styles.resultsContainer}>
        <div className={styles.detailCard}>
          <div className={styles.cardHeader}>
            <MdInfo size={18} />
            <h3>Request Information</h3>
          </div>
          <div className={styles.cardContent}>
            {renderDetailCard(<MdInfo />, "API Response", {
              Status: result.meta?.status ? result.meta.status.charAt(0).toUpperCase() + result.meta.status.slice(1) : 'N/A',
              Message: result.meta?.message || 'N/A',
              Timestamp: result.meta?.timestamp || 'N/A'
            })}
          </div>
        </div>
        <div className={styles.detailCard}>
          <div className={styles.cardHeader}>
            <MdPerson size={18} />
            <h3>Aadhaar Pro Details</h3>
          </div>
          <div className={styles.cardContent}>
            {renderDetailCard(<MdPerson />, "Personal Details", {
              "Aadhaar Number": result.result?.aadhaar || 'N/A',
              "PAN Number": result.result?.pan_no || 'N/A',
              "PAN Type": details.pan_type || 'N/A',
              "Full Name": details.full_name || 'N/A',
              "Date of Birth": details.date_of_birth || 'N/A',
              Age: details.age || 'N/A'
            })}
            {details.split_name && (
              <>
                <h3>Name Details</h3>
                {renderDetailCard(<MdPerson />, "Split Name", {
                  "First Name": details.split_name.first_name || 'N/A',
                  "Middle Name": details.split_name.middle_name || 'N/A',
                  "Last Name": details.split_name.last_name || 'N/A'
                })}
              </>
            )}
            {details.gender && (
              <>
                <h3>Gender Details</h3>
                {renderDetailCard(<MdPerson />, "Gender Information", {
                  Gender: details.gender.gender || 'N/A',
                  Confidence: details.gender.confidence || 'N/A'
                })}
              </>
            )}
            {details.validation && (
              <>
                <h3>Validation Details</h3>
                {renderDetailCard(<MdCreditCard />, "Validation Information", {
                  "Is Valid": details.validation.is_valid || 'N/A',
                  "Aadhaar Masked": details.validation.aadhaar_masked || 'N/A'
                })}
              </>
            )}
          </div>
        </div>
      </div>
    );
case 4:
    const data = result?.result?.data || {};
    return (
      <div className={styles.resultsContainer}>
        <div className={styles.detailCard}>
          <div className={styles.cardHeader}>
            <MdInfo size={18} />
            <h3>Request Information</h3>
          </div>
          <div className={styles.cardContent}>
            {renderDetailCard(<MdInfo />, "API Response", {
              Status: result.meta?.status ? result.meta.status.charAt(0).toUpperCase() + result.meta.status.slice(1) : 'N/A',
              Message: result.meta?.message || 'N/A',
              Timestamp: result.meta?.timestamp || 'N/A'
            })}
          </div>
        </div>
        <div className={styles.detailCard}>
          <div className={styles.cardHeader}>
            <MdPerson size={18} />
            <h3>Aadhaar Verification Details</h3>
          </div>
          <div className={styles.cardContent}>
            {renderDetailCard(<MdPerson />, "Personal Details", {
              "Aadhaar Number": data.aadhaar_no || 'N/A',
              Name: data.name || 'N/A',
              "Date of Birth": data.dateOfBirth || 'N/A',
              Gender: data.genderCode || 'N/A',
              "Relation Type": data.relation_type ? data.relation_type.replace(/_/g, ' ') : 'N/A',
              "Relation Name": data.r_name || 'N/A',
              Mobile: data.mobile || 'N/A',
              "Full Address": data.full_address || 'N/A'
            })}
            {data.split_address && (
              <>
                <h3>Address Details</h3>
                {renderDetailCard(<MdLocationOn />, "Split Address", {
                  "House No": data.split_address.house_no || 'N/A',
                  Locality: data.split_address.locality || 'N/A',
                  Village: data.split_address.village || 'N/A',
                  Subdistrict: data.split_address.subdistrict || 'N/A',
                  District: data.split_address.district || 'N/A',
                  State: data.split_address.state || 'N/A',
                  Pincode: data.split_address.pincode || 'N/A'
                })}
              </>
            )}
            {data.photo && (
              <div className={styles.imageContainer}>
                <h3>Profile Photo</h3>
                {data.photo.startsWith('data:image/jpeg;base64,') && data.photo.length > 20 ? (
                  <img src={data.photo} alt="Aadhaar Photo" className={styles.profileImage} />
                ) : (
                  <p className={styles.noData}>Invalid or missing photo</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
        case 9:
        return (
          <div className={styles.resultsContainer}>
            <div className={styles.tableSection}>
              <h3>
                <MdInfo /> Aadhaar Linked Records
              </h3>
              <div className={styles.tableContainer}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Father's Name</th>
                      <th>Mobile No</th>
                      <th>Alternate Mobile</th>
                      <th>ID</th>
                      <th>Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result?.result?.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item?.name || "N/A"}</td>
                        <td>{item?.fname || "N/A"}</td>
                        <td>{item?.mobile || "N/A"}</td>
                        <td>{item?.alt || "N/A"}</td>
                        <td>{item?.id || "N/A"}</td>
                        <td>{item?.address || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 10:
        return (
          <div className={styles.resultsContainer}>
            {result.result ? (
              renderDetailCard(<MdPerson />, "Aadhaar to UAN Details", {
                "UAN Number": result.result.uan,
                Status: result.meta?.status,
                Message: result.meta?.message,
              })
            ) : (
              <div className={styles.noData}>
                No data available for this Aadhaar number
              </div>
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
                    <h3>
                      <MdInfo /> Request Information
                    </h3>
                    {renderDetailCard(<MdInfo />, "API Response", result.meta)}
                  </div>
                )}
                {result.result && typeof result.result === "object" ? (
                  renderDetailCard(<MdInfo />, "Result Details", result.result)
                ) : (
                  <div className={styles.detailCard}>
                    <div className={styles.cardHeader}>
                      <MdInfo />
                      <h3>Result</h3>
                    </div>
                    <div className={styles.cardContent}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailValue}>
                          {result.result}
                        </span>
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
                <label>Aadhaar Number</label>
                <input
                  type="text"
                  placeholder="Enter 12-digit Aadhaar Number"
                  value={aadharNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setAadharNumber(val);
                    setError(
                      validateAadhar(val) || val.length === 0 ? "" : "Invalid Aadhaar format"
                    );
                  }}
                  maxLength={12}
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
                <div className={styles.resultBox}>{renderResultSection()}</div>

                <div className={styles.actions}>
                  <button
                    className={styles.accessBtn}
                    onClick={() => setResult(null)}
                  >
                    New Search
                  </button>
                  <div></div>
                  <button
                    className={styles.cancelBtn}
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
import React, { useState } from "react";
import styles from "./SimpleModal.module.css";
import api from "../../Utils/api";
import toast from "react-hot-toast";
import { MdClose, MdCheckCircle, MdError, MdInfo, MdPhone, MdCreditCard, MdBadge, MdNumbers } from "react-icons/md";

const SimpleModal = ({ apiName, apiId, onClose }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    pan_number: "",
    dob: "",
    mobile_number: "",
    email: "",
    gender: "",
    pincode: "",
    consent_text: "",
    consent: "",
    vpa: "",
    account_number: "",
    ifsc_code: "",
    aadhaar_number: "",
    din_number: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }

  const getApiEndpoint = () => {
    switch (apiId) {
      case 1:
        return `/v1/mobileTomultipleVehicleRc?mobile_number=${formData.mobile_number}`;
      case 2:
        return `/v1/mobileToMultipleUpi_d1?mobile_number=${formData.mobile_number}`;
      case 3:
        return `/v1/mobileToPan_d1?mobile_number=${formData.mobile_number}`;
      case 4:
        return `/v1/mobileToDlDetails_d1?mobile_number=${formData.mobile_number}`;
      case 5:
        return `/v1/mobileToUanList_d1?mobile_number=${formData.mobile_number}`;
      case 6:
        return `/v1/panToUan_d1?pan_number=${formData.pan_number}`;
      case 7:
        return `/v1/aadhaarToUan_d1?aadhaar_number=${formData.aadhaar_number}`;
      case 8:
        return `/v1/dinToPan_d1?din_number=${formData.din_number}`;
      case 9:
        return `/v1/panMsmeCheck_d1?pan_number=${formData.pan_number}`;

      default:
        return null;
    }
  };

  const handleSubmit = async () => {

    setError("");
    const endpoint = getApiEndpoint();
    if (!endpoint) {
      setError("No API endpoint found for this card!");
      return;
    }

    if (apiId === 1 || apiId === 2 || apiId === 3 || apiId === 4 || apiId === 5) {
      if (
        !formData.mobile_number.trim()
      ) {
        setError("All fields are required.");
        return;
      }
    }

    if (apiId === 6 || apiId === 9) {
      if (!formData.pan_number.trim()) {
        setError("All fields are required.");
        return;
      }
    }

    if (apiId === 7) {
      if (!formData.aadhaar_number.trim()) {
        setError("All fields are required.");
        return;
      }
    }

    if (apiId === 8) {
      if (!formData.din_number.trim()) {
        setError("All fields are required.");
        return;
      }
    }

    const validateMobile = (number) => /^\d{10}$/.test(number);
    const validatePAN = (pan) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
    const validateAadhaar = (aadhaar) => /^\d{12}$/.test(aadhaar);
    // const validateDIN = (din) => /^\d{10}$/.test(din);


    if ((apiId === 1 || apiId === 2 || apiId === 3 || apiId === 4 || apiId === 5) && !validateMobile(formData.mobile_number)) {
      setError("Please enter a valid 10-digit Mobile number.");
      return;
    }

    const cleanPAN = formData.pan_number.trim().toUpperCase();
    if ((apiId === 6 || apiId === 9) && !validatePAN(cleanPAN)) {
      setError("Please enter a valid PAN Number.");
      return;
    }

    if (apiId === 7 && !validateAadhaar(formData.aadhaar_number)) {
      setError("Please enter a valid Aadhaar number.");
      return;
    }

    // if (apiId === 8 && !validateDIN(formData.din_number)) {
    //   setError("Please enter a valid DIN number.");
    //   return;
    // }

    try {
      setLoading(true);
      console.log("current endpoint : ", endpoint)
      const res = await api.get(endpoint);
      setResult(res.data);
      console.log("after submission : ", res)

      if (res?.status === 200) {
        const msg =
          res.data?.meta?.message || "Details fetched successfully";
        setLoading(false)
        toast.success(msg);
      }

    } catch (err) {
      console.error(err)
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

  const renderGridItem = (label, value) => (
    <div className={styles.detailItem}>
      <span className={styles.detailLabel}>{label}:</span>
      <span className={styles.detailValue}>{value || "-"}</span>
    </div>
  );

  const renderResultSection = () => {
    switch (apiId) {
      case 1:
        return (
          <div className={styles.resultsContainer}>
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <MdInfo size={18} />
                <span>Vehicle RC Numbers</span>
              </div>
              <div className={styles.cardContent}>
                {result?.result?.rc_number?.map((item, index) => (
                  <div key={index} className={styles.listItem}>
                    <strong>RC Number {index + 1}:</strong> {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className={styles.resultsContainer}>
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <MdInfo size={18} />
                <span>UPI Information</span>
              </div>
              <div className={styles.cardContent}>
                {renderGridItem("Name at Bank", result?.result?.name_at_bank || 'N/A')}
                
                <h4>VPAs</h4>
                {result?.result?.vpas?.map((item, index) => (
                  <div key={index} className={styles.listItem}>
                    {index + 1}. {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className={styles.resultsContainer}>
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <MdInfo size={18} />
                <span>PAN Details</span>
              </div>
              <div className={styles.cardContent}>
                {renderGridItem("Full Name", result?.result?.full_name || 'N/A')}
                {renderGridItem("Gender", result?.result?.gender || 'N/A')}
                {renderGridItem("Email", result?.result?.email || 'N/A')}
                {renderGridItem("Aadhaar Number", result?.result?.masked_aadhaar || 'N/A')}
                {renderGridItem("Aadhaar Linked", result?.result?.aadhaar_linked ? 'Yes' : 'No' || 'N/A')}
                {renderGridItem("PAN Number", result?.result?.pan_number || 'N/A')}
                {renderGridItem("Phone Number", result?.result?.phone_number || 'N/A')}
                {renderGridItem("DOB", result?.result?.dob || 'N/A')}
                {renderGridItem("DOB Verified", result?.result?.dob_verified ? 'Yes' : 'No' || 'N/A')}
                {renderGridItem("DOB Check", result?.result?.dob_check ? 'Yes' : 'No' || 'N/A')}
                {renderGridItem("Less Info", result?.result?.less_info ? 'Yes' : 'No' || 'N/A')}
                {renderGridItem("Input DOB", result?.result?.input_dob || 'N/A')}
                {renderGridItem("Category", result?.result?.category || 'N/A')}
                
                <h4>Address</h4>
                {renderGridItem("City", result?.result?.address?.city || 'N/A')}
                {renderGridItem("Country", result?.result?.address?.country || 'N/A')}
                {renderGridItem("Full Address", result?.result?.address?.full || 'N/A')}
                {renderGridItem("Line 1", result?.result?.address?.line_1 || 'N/A')}
                {renderGridItem("Line 2", result?.result?.address?.line_2 || 'N/A')}
                {renderGridItem("State", result?.result?.address?.state || 'N/A')}
                {renderGridItem("Street Name", result?.result?.address?.street_name || 'N/A')}
                {renderGridItem("Zip code", result?.result?.address?.zip || 'N/A')}
                
                <h4>Full Name Split</h4>
                {result?.result?.full_name_split?.map((item, index) => (
                  <div key={index} className={styles.listItem}>
                    {index + 1}. {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className={styles.resultsContainer}>
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <MdInfo size={18} />
                <span>Driver's License Details</span>
              </div>
              <div className={styles.cardContent}>
                {renderGridItem("Status", result?.status)}
                {renderGridItem("Message", Object.keys(result?.data || {}).length === 0 ? 'N/A' : result?.data?.error)}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className={styles.resultsContainer}>
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <MdInfo size={18} />
                <span>UAN List</span>
              </div>
              <div className={styles.cardContent}>
                {renderGridItem("Message", result?.result?.message || 'N/A')}
                {renderGridItem("Sub Code", result?.result?.sub_code || 'N/A')}
                {renderGridItem("TimeStamp", result?.result?.timestamp || 'N/A')}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className={styles.resultsContainer}>
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <MdInfo size={18} />
                <span>PAN to UAN</span>
              </div>
              <div className={styles.cardContent}>
                {renderGridItem("Message", result?.result?.message || 'N/A')}
                {renderGridItem("Sub Code", result?.result?.sub_code || 'N/A')}
                {renderGridItem("TimeStamp", result?.result?.timestamp || 'N/A')}
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className={styles.resultsContainer}>
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <MdInfo size={18} />
                <span>Aadhaar to UAN</span>
              </div>
              <div className={styles.cardContent}>
                {/* Add content for case 7 when available */}
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className={styles.resultsContainer}>
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <MdInfo size={18} />
                <span>DIN to PAN</span>
              </div>
              <div className={styles.cardContent}>
                {renderGridItem("First Name", result?.result?.first_name || 'N/A')}
                {renderGridItem("Last Name", result?.result?.last_name || 'N/A')}
                {renderGridItem("Middle Name", result?.result?.middle_name || 'N/A')}
                {renderGridItem("Father's First Name", result?.result?.father_first_name || 'N/A')}
                {renderGridItem("Father's Last Name", result?.result?.father_last_name || 'N/A')}
                {renderGridItem("Father's Middle Name", result?.result?.middle_name || 'N/A')}
                {renderGridItem("PAN Number", result?.result?.pan_number || 'N/A')}
                {renderGridItem("Resident of India", result?.result?.resident_of_india || 'N/A')}
                {renderGridItem("DOB", result?.result?.date_of_birth || 'N/A')}
                {renderGridItem("DIN Number", result?.result?.din_number || 'N/A')}
                {renderGridItem("DIN Status", result?.result?.din_status || 'N/A')}
                {renderGridItem("Membership Number", result?.result?.membership_number || 'N/A')}
              </div>
            </div>
          </div>
        );

      case 9:
        return (
          <div className={styles.resultsContainer}>
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <MdInfo size={18} />
                <span>PAN MSME Check</span>
              </div>
              <div className={styles.cardContent}>
                {renderGridItem("Full Name", result?.result?.pan_details?.full_name || 'N/A')}
                {renderGridItem("DOB", result?.result?.pan_details?.dob || 'N/A')}
                {renderGridItem("Gender", result?.result?.pan_details?.gender || 'N/A')}
                {renderGridItem("Masked Aadhaar", result?.result?.pan_details?.masked_aadhaar || 'N/A')}
                {renderGridItem("Aadhaar Linked", result?.result?.pan_details?.aadhaar_linked ? 'Yes' : 'No' || 'N/A')}
                {renderGridItem("PAN Number", result?.result?.pan_number || 'N/A')}
                {renderGridItem("Migration Status", result?.result?.migration_status || 'N/A')}
                {renderGridItem("Udyam Exists", result?.result?.udyam_exists ? 'Yes' : 'No' || 'N/A')}
                {renderGridItem("Category", result?.result?.pan_details?.category || 'N/A')}
                {renderGridItem("Status", result?.result?.pan_details?.status || 'N/A')}
                
                <h4>Full Name Split</h4>
                {result?.result?.pan_details?.full_name_split?.map((item, index) => (
                  <div key={index} className={styles.listItem}>
                    {index + 1}. {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className={styles.resultsContainer}>
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <MdInfo size={18} />
                <span>Raw Response Data</span>
              </div>
              <div className={styles.cardContent}>
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </div>
            </div>
          </div>
        );
    }
  };


  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={`${styles.modal} ${result ? styles.expanded : ""}`} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{apiName}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <MdClose size={24} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {loading ? (
            <div className={styles.skeletonLoader}>
              <div className={styles.skeletonCard}></div>
              <div className={styles.skeletonRow} style={{width: '60%'}}></div>
              <div className={styles.skeletonRow}></div>
              <div className={styles.skeletonRow} style={{width: '80%'}}></div>
            </div>
          ) : !result ? (
            <>
              {(apiId === 1 || apiId === 2 || apiId === 3 || apiId === 4 || apiId === 5) && (
                <div className={styles.inputSection}>
                  <label>
                    <MdPhone size={18} />
                    Mobile Number
                  </label>
                  <input
                    name="mobile_number"
                    type="tel"
                    placeholder="Enter your Mobile Number"
                    value={formData.mobile_number}
                    maxLength={10}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  />
                </div>
              )}

              {(apiId === 6 || apiId === 9) && (
                <div className={styles.inputSection}>
                  <label>
                    <MdCreditCard size={18} />
                    PAN Number
                  </label>
                  <input
                    name="pan_number"
                    type="text"
                    placeholder="Enter your PAN Number"
                    value={formData.pan_number.toUpperCase()}
                    onChange={(e) =>
                      handleChange({
                        target: { name: "pan_number", value: e.target.value.toUpperCase() }
                      })
                    }
                    className={styles.input}
                    required
                  />
                </div>
              )}

              {(apiId === 7) && (
                <div className={styles.inputSection}>
                  <label>
                    <MdBadge size={18} />
                    Aadhaar Number
                  </label>
                  <input
                    name="aadhaar_number"
                    type="text"
                    placeholder="Enter your Aadhaar Number"
                    value={formData.aadhaar_number}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  />
                </div>
              )}

              {(apiId === 8) && (
                <div className={styles.inputSection}>
                  <label>
                    <MdNumbers size={18} />
                    DIN Number
                  </label>
                  <input
                    name="din_number"
                    type="text"
                    placeholder="Enter DIN Number"
                    value={formData.din_number.toUpperCase()}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  />
                </div>
              )}

              {error && (
                <div className={styles.error}>
                  <MdError size={18} />
                  {error}
                </div>
              )}

              <div className={styles.actions}>
                <button className={styles.accessBtn} onClick={handleSubmit} disabled={loading}>
                  {loading ? <div className={styles.spinner}></div> : null}
                  {loading ? "Processing..." : "Submit"}
                </button>
              </div>
            </>
          ) : (
            <div className={styles.resultSection}>
              <div className={styles.successMessage}>
                <MdCheckCircle size={18} />
                {result.meta?.message || "Request completed successfully"}
              </div>
              {renderResultSection()}
              <div className={styles.actions}>
                <button className={styles.accessBtn} onClick={() => setResult(null)}>
                  New Search
                </button>
                <button className={styles.cancelBtn} onClick={onClose}>
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleModal;
import React, { useState } from "react";
import styles from "./SimpleModal.module.css";
import api from "../../Utils/api";
import toast from "react-hot-toast";
import { MdClose, MdCheckCircle, MdError, MdInfo, MdPerson, MdEmail, MdPhone, MdCreditCard, MdLocationOn } from "react-icons/md";

const SimpleModal = ({ apiName, apiId, onClose }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [inputNumber, setInputNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [inputEmail, setEmail] = useState("");

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
        return `/v1/experianCreditReportV2`;
      case 2:
        return `/v1/bankMobileToAccount`;
      case 3:
        return `/v1/upiVpaVerification`;
      case 4:
        return `/v1/upiVpa360`;
      case 5:
        return `/v1/upiVpaToAccount`;
      case 6:
        return `/v1/bankVerifyPennyless`;
      case 7:
        return `/v1/bankVerifyPennydrop`;

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

    if (apiId === 1) {
      // required fields check
      if (
        !formData.first_name.trim() ||
        !formData.last_name.trim() ||
        !formData.pan_number.trim() ||
        !formData.dob.trim() ||
        !formData.mobile_number.trim() ||
        !formData.email.trim() ||
        !formData.gender.trim() ||
        !formData.pincode.trim() ||
        !formData.consent_text.trim()
      ) {
        setError("All fields are required.");
        return;
      }
    }

    if (apiId === 2 ) {
      if (!formData.mobile_number.trim() || !formData.consent.trim() || !formData.consent_text.trim()) {
        setError("All fields are required.");
        return;
      }
    }

    if (apiId === 3 || apiId === 4 || apiId === 5) {
      if (!formData.vpa.trim() || !formData.consent.trim() || !formData.consent_text.trim()) {
        setError("All fields are required.");
        return;
      }
    }

    if (apiId === 6 || apiId === 7) {
      if (!formData.account_number.trim() || !formData.ifsc_code.trim() || !formData.consent.trim() || !formData.consent_text.trim())  {
        setError("All fields are required.");
        return;
      }
    }


    const validateMobile = (number) => /^\d{10}$/.test(number);
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePAN = (pan) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);


    if ((apiId === 1 || apiId === 2) && !validateMobile(formData.mobile_number)) {
      setError("Please enter a valid 10-digit Mobile number.");
      return;
    }

    if (apiId === 1 && !validateEmail(formData.email)) {
      setError("Please enter a valid Email address.");
      return;
    }

    if (apiId === 1 && !validatePAN(formData.pan_number)) {
      setError("Please enter a valid PAN number.");
      return;
    }


    let payload = {};
    switch (apiId) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        payload = {
          ...formData,
        };
        break;

      default:
        break;
    }

    console.log("before submission : ", payload);

    try {
      setLoading(true);
      console.log("current endpoint : ", endpoint)
      const res = await api.post(endpoint, payload);
      setResult(res.data?.result);
      console.log("after submission : ", res.data)

      if (res.data?.success) {
        const msg =
          res.data?.meta?.message || "Details fetched successfully";
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
      case 3:
  case 4:
    return (
      <div className={styles.resultsContainer}>
        <div className={styles.detailCard}>
          <div className={styles.cardHeader}>
            <MdInfo size={18} />
            <span>Request Information</span>
          </div>
          <div className={styles.cardContent}>
            {renderGridItem("Status", result.meta?.status ? result.meta.status.charAt(0).toUpperCase() + result.meta.status.slice(1) : 'N/A')}
            {renderGridItem("Message", result.meta?.message)}
            {renderGridItem("Timestamp", result.meta?.timestamp)}
          </div>
        </div>
        <div className={styles.detailCard}>
          <div className={styles.cardHeader}>
            <MdInfo size={18} />
            <span>VPA Information</span>
          </div>
          <div className={styles.cardContent}>
            {renderGridItem("UPI ID", result?.upi_id)}
            {renderGridItem("Full Name", result?.full_name)}
            {renderGridItem("Bank", result?.bank)}
            {renderGridItem("Branch", result?.branch)}
            {renderGridItem("Centre", result?.centre)}
            {renderGridItem("District", result?.district)}
            {renderGridItem("State", result?.state)}
            {renderGridItem("Address", result?.address)}
            {renderGridItem("Contact", result?.contact)}
            {renderGridItem("City", result?.city)}
          </div>
        </div>
      </div>
    );
      case 5:
      case 6:
      case 7:
        return (
          <div className={styles.resultsContainer}>
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <MdInfo size={18} />
                <span>VPA Information</span>
              </div>
              <div className={styles.cardContent}>
                {renderGridItem("VPA", result?.vpa || 'N/A')}
                {renderGridItem("Name", result?.name || 'N/A')}
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
              {apiId === 1 && (
                <div className={styles.formContainer}>
                  <div className={styles.inputSection}>
                    <label>
                      <MdPerson size={18} />
                      First Name
                    </label>
                    <input
                      name="first_name"
                      type="text"
                      placeholder="Enter your First Name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className={styles.input}
                      required
                    />
                  </div>

                  <div className={styles.inputSection}>
                    <label>
                      <MdPerson size={18} />
                      Last Name
                    </label>
                    <input
                      name="last_name"
                      type="text"
                      placeholder="Enter your Last Name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className={styles.input}
                      required
                    />
                  </div>

                  <div className={styles.inputSection}>
                    <label>
                      <MdCreditCard size={18} />
                      PAN Number
                    </label>
                    <input
                      name="pan_number"
                      type="text"
                      placeholder="Enter your PAN Number"
                      value={formData.pan_number}
                      onChange={handleChange}
                      className={styles.input}
                      required
                    />
                  </div>

                  <div className={styles.inputSection}>
                    <label>Date of Birth</label>
                    <input
                      name="dob"
                      type="date"
                      placeholder="Enter your Date of Birth"
                      value={formData.dob}
                      onChange={handleChange}
                      className={styles.input}
                      required
                    />
                  </div>

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

                  <div className={styles.inputSection}>
                    <label>
                      <MdEmail size={18} />
                      Email Address
                    </label>
                    <input
                      name="email"
                      type="email"
                      placeholder="Enter your Email"
                      value={formData.email}
                      onChange={handleChange}
                      className={styles.input}
                      required
                    />
                  </div>

                  <div className={styles.inputSection}>
                    <label>Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className={styles.input}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="O">Other</option>
                    </select>
                  </div>

                  <div className={styles.inputSection}>
                    <label>
                      <MdLocationOn size={18} />
                      Pincode
                    </label>
                    <input
                      name="pincode"
                      type="text"
                      placeholder="Enter your Pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      className={styles.input}
                      required
                    />
                  </div>

                  <div className={styles.inputSection}>
                    <label>Consent Agreement</label>
                    <textarea
                      name="consent_text"
                      placeholder="Consent Agreement"
                      value={formData.consent_text}
                      onChange={handleChange}
                      className={styles.input}
                      required
                    />
                  </div>
                </div>
              )}

              {(apiId === 2) && (
                <div className={styles.formContainer}>
                  <div className={styles.inputSection}>
                    <label>
                      <MdPhone size={18} />
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      placeholder="Enter Mobile Number"
                      name="mobile_number"
                      value={formData.mobile_number}
                      onChange={handleChange}
                      maxLength={10}
                      className={styles.input}
                      required
                    />
                  </div>
                  
                  <div className={styles.inputSection}>
                    <label>Consent</label>
                    <select
                      name="consent"
                      value={formData.consent}
                      onChange={handleChange}
                      className={styles.input}
                      required
                    >
                      <option value="">Select Consent</option>
                      <option value="Y">Yes</option>
                      <option value="N">No</option>
                    </select>
                  </div>
                  
                  <div className={styles.inputSection}>
                    <label>Consent Text</label>
                    <input
                      type="text"
                      placeholder="Enter consent text"
                      name="consent_text"
                      value={formData.consent_text}
                      onChange={handleChange}
                      className={styles.input}
                    />
                  </div>
                </div>
              )}

              {(apiId === 3 || apiId === 4 || apiId === 5) && (
                <div className={styles.formContainer}>
                  <div className={styles.inputSection}>
                    <label>VPA ID</label>
                    <input
                      type="text"
                      placeholder="Enter vpa id e.g. john@upi"
                      name="vpa"
                      value={formData.vpa}
                      onChange={handleChange}
                      className={styles.input}
                      required
                    />
                  </div>

                  <div className={styles.inputSection}>
                    <label>Consent</label>
                    <select
                      name="consent"
                      value={formData.consent}
                      onChange={handleChange}
                      className={styles.input}
                      required
                    >
                      <option value="">Select Consent</option>
                      <option value="Y">Yes</option>
                      <option value="N">No</option>
                    </select>
                  </div>

                  <div className={styles.inputSection}>
                    <label>Consent Text</label>
                    <input
                      type="text"
                      placeholder="Enter consent text"
                      name="consent_text"
                      value={formData.consent_text}
                      onChange={handleChange}
                      className={styles.input}
                    />
                  </div>
                </div>
              )}
              
              {(apiId === 6 || apiId === 7) && (
                <div className={styles.formContainer}>
                  <div className={styles.inputSection}>
                    <label>Account Number</label>
                    <input
                      type="tel"
                      placeholder="Enter account number"
                      name="account_number"
                      value={formData.account_number}
                      maxLength={12}
                      onChange={handleChange}
                      className={styles.input}
                      required
                    />
                  </div>

                  <div className={styles.inputSection}>
                    <label>IFSC Code</label>
                    <input
                      type="text"
                      placeholder="Enter IFSC code"
                      name="ifsc_code"
                      value={formData.ifsc_code}
                      onChange={handleChange}
                      className={styles.input}
                      required
                    />
                  </div>
                  
                  <div className={styles.inputSection}>
                    <label>Consent</label>
                    <select
                      name="consent"
                      value={formData.consent}
                      onChange={handleChange}
                      className={styles.input}
                      required
                    >
                      <option value="">Select Consent</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>

                  <div className={styles.inputSection}>
                    <label>Consent Text</label>
                    <input
                      type="text"
                      placeholder="Enter consent text"
                      name="consent_text"
                      value={formData.consent_text}
                      onChange={handleChange}
                      className={styles.input}
                    />
                  </div>
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
                Request completed successfully
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
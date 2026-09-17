import React, { useState } from "react";
import styles from "./SimpleModal.module.css";
import api from "../../Utils/api";
import toast from "react-hot-toast";
import { MdClose, MdCheckCircle, MdError, MdInfo, MdPerson, MdEmail, MdPhone } from "react-icons/md";

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
        return `/v1/wspicture?phone=${formData.mobile_number}`;
      case 2:
        return `/v1/wchk?phone=${formData.mobile_number}`;
      case 3:
        return `/v1/about?phone=${formData.mobile_number}`;
      case 4:
        return `/v1/bizinfo?phone=${formData.mobile_number}`;
      case 5:
        return `/v1/gmailCheck?email=${formData.email}`;
      case 6:
        return `/v1/infocheck?query=${formData.email}`;
      case 7:
        return `/v1/infocheck?query=${formData.mobile_number}`;
      case 8:
        return `/v1/whatsappChecker`;
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

    if (apiId === 1 || apiId === 2 || apiId === 3 || apiId === 4 || apiId === 7) {
      if (!formData.mobile_number.trim()) {
        setError("All fields are required.");
        return;
      }
    }

    if (apiId === 5 || apiId === 6) {
      if (!formData.email) {
        setError("All fields are required.");
        return;
      }
    }

    const validateMobile = (number) => /^\d{10}$/.test(number);
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePAN = (pan) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);

    if ((apiId === 1 || apiId === 2 || apiId === 3 || apiId === 4 || apiId === 7) && !validateMobile(formData.mobile_number)) {
      setError("Please enter a valid 10-digit Mobile number.");
      return;
    }

    if ((apiId === 8) && !validateMobile(formData.mobile_number)) {
      setError("Please enter a valid 10-digit Mobile number.");
      return;
    }

    if ((apiId === 5 || apiId === 6) && !validateEmail(formData.email)) {
      setError("Please enter a valid Email address.");
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
      case 8:
        payload = {
          mobile: formData.mobile_number,
        }
        break;
      default:
        break;
    }

    if (apiId === 8) {
      try {
        setLoading(true);
        console.log("current endpoint : ", endpoint)
        const res = await api.post(endpoint, payload);
        setResult(res);
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
    } else {
      try {
        setLoading(true);
        console.log("current endpoint : ", endpoint)
        const res = await api.get(endpoint);
        setResult(res);
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
                <span>WhatsApp Picture Response</span>
              </div>
              <div className={styles.cardContent}>
                {renderGridItem("Status", result?.status)}
                {renderGridItem("Message", result?.data)}
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
                <span>WhatsApp Check Response</span>
              </div>
              <div className={styles.cardContent}>
                {renderGridItem("Status", result?.status)}
                {renderGridItem("Message", result?.data ? result.data : 'N/A')}
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
                <span>WhatsApp About Response</span>
              </div>
              <div className={styles.cardContent}>
                {renderGridItem("Status", result?.status)}
                {renderGridItem("Message", Object.keys(result?.data || {}).length === 0 ? 'N/A' : result?.data?.message)}
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
                <span>Business Info Response</span>
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
                <span>Gmail Check Response</span>
              </div>
              <div className={styles.cardContent}>
                {renderGridItem("Status Code", result?.status)}
                {renderGridItem("Status", result?.data?.status)}
                {result?.data?.picture && (
                  <div className={styles.imageContainer}>
                    <img src={result.data.picture} alt="Profile" className={styles.profileImage} />
                  </div>
                )}
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
            <span>Request Information</span>
          </div>
          <div className={styles.cardContent}>
            {renderGridItem("Status", result?.meta?.status ? result.meta.status.charAt(0).toUpperCase() + result.meta.status.slice(1) : 'N/A')}
            {renderGridItem("Message", result?.meta?.message)}
            {renderGridItem("Timestamp", result?.meta?.timestamp)}
          </div>
        </div>
        <div className={styles.detailCard}>
          <div className={styles.cardHeader}>
            <MdInfo size={18} />
            <span>Email Info Check</span>
          </div>
          <div className={styles.cardContent}>
            {renderGridItem("Found", result?.found)}
            {renderGridItem("Quota", result?.quota || 'N/A')}
            {result?.result?.length > 0 ? (
              <div className={styles.tableContainer}>
                <h4>Result Details</h4>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Sr.No</th>
                      <th>Source Name</th>
                      <th>Breach Date</th>
                      <th>Unverified</th>
                      <th>Passwordless</th>
                      <th>Compilation</th>
                      <th>Country</th>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Fields</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.result.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item?.source?.name || 'N/A'}</td>
                        <td>{item?.source?.breach_date || 'N/A'}</td>
                        <td>{item?.source?.unverified || 'N/A'}</td>
                        <td>{item?.source?.passwordless || 'N/A'}</td>
                        <td>{item?.source?.compilation || 'N/A'}</td>
                        <td>{item?.country || 'N/A'}</td>
                        <td>{item?.name || 'N/A'}</td>
                        <td>{item?.phone || 'N/A'}</td>
                        <td>{item?.email || 'N/A'}</td>
                        <td>{item?.fields?.join(', ') || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className={styles.noData}>No result data available</p>
            )}
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
                <span>Mobile Info Check</span>
              </div>
              <div className={styles.cardContent}>
                {renderGridItem("Found", result?.data?.found)}
                {renderGridItem("Quota", result?.data?.quota || 'N/A')}
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
            <span>WhatsApp Account Details</span>
          </div>
          <div className={styles.cardContent}>
            {renderGridItem("Account Status", result?.result?.status)}
            {renderGridItem("Is Business Account", result?.result?.is_business ? "Yes" : "No")}
            {result?.result?.profile_pic_url ? (
              <div className={styles.imageContainer}>
                <img src={result.result.profile_pic_url} alt="Profile" className={styles.profileImage} />
              </div>
            ) : (
              renderGridItem("Profile Picture", "N/A")
            )}
            {renderGridItem("Business Name", result?.result?.business_name)}
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
              {(apiId === 1 || apiId === 2 || apiId === 3 || apiId === 4 || apiId === 7 || apiId === 8) && (
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

              {(apiId === 5 || apiId === 6) && (
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
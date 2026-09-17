import React, { useState } from "react";
import styles from "./SimpleModal.module.css";
import api from "../../Utils/api";
import toast from "react-hot-toast";
import { MdClose, MdInfo } from "react-icons/md";

const SimpleModal = ({ apiName, apiId, onClose }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [inputNumber, setInputNumber] = useState("");
  const [inputEmail, setEmail] = useState("");
  const [formData, setFormData] = useState({
    mobile: "",
    name_lookup: "",
    first_name: "",
    last_name: "",
  });

  const validateMobile = (number) => /^\d{10}$/.test(number);
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const getApiEndpoint = () => {
    switch (apiId) {
      case 1:
        return `/v1/emailFootprint`;
      case 2:
        return `/v1/whatsappChecker`;
      case 3:
        return `/v1/mobileFootprintPremium`;
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    setError("");
    const endpoint = getApiEndpoint();
    if (!endpoint) {
      setError("No API endpoint found for this card!");
      toast.error("No API endpoint found for this card!");
      return;
    }

    if (apiId === 1 && !validateEmail(inputEmail)) {
      setError("Please enter a valid email address.");
      toast.error("Please enter a valid email address.");
      return;
    }

    if (apiId !== 1 && !validateMobile(inputNumber)) {
      setError("Please enter a valid 10-digit mobile number.");
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    let payload = {};
    switch (apiId) {
      case 1:
        payload = { email: inputEmail };
        break;
      case 2:
      case 3:
        payload = { mobile: inputNumber };
        break;
      default:
        break;
    }

    try {
      setLoading(true);
      setResult(null);
      const res = await api.post(endpoint, payload);
      setResult(res.data);

      if (res.data?.success) {
        const msg = res.data?.meta?.message || "Details fetched successfully";
        toast.success(msg);
      } else {
        const err = res.data?.meta?.message || "Failed to fetch details";
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
        <div className={styles.loaderWrapper}>
          <div className={styles.loader}></div>
          <p>Fetching data...</p>
        </div>
      );
    }

    if (!result) return null;

    switch (apiId) {
      case 1:
        return (
          <div className={styles.resultsContainer}>
            <div className={styles.metaSection}>
              <h3>
                <MdInfo /> Request Information
              </h3>
              {renderDetailCard(<MdInfo />, "API Response", {
                Status: result.meta?.status ? result.meta.status.charAt(0).toUpperCase() + result.meta.status.slice(1) : "N/A",
                Message: result.meta?.message || "N/A",
                Timestamp: result.meta?.timestamp || "N/A",
              })}
            </div>
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <MdInfo />
                <h3>Email Footprint Details</h3>
              </div>
              <div className={styles.cardContent}>
                {renderDetailCard(<MdInfo />, "Service Registrations", {
                  "Amazon Registered": result.result?.amazon?.registered ? "Yes" : "No",
                  "Amazon Message": result.result?.amazon?.message || "N/A",
                  "Apple Registered": result.result?.apple?.registered ? "Yes" : "No",
                  "Apple Message": result.result?.apple?.message || "N/A",
                  "Facebook Registered": result.result?.facebook?.registered ? "Yes" : "No",
                  "Facebook Message": result.result?.facebook?.message || "N/A",
                  "Flipkart Registered": result.result?.flipkart?.registered ? "Yes" : "No",
                  "Flipkart Message": result.result?.flipkart?.message || "N/A",
                  "Github Registered": result.result?.github?.registered ? "Yes" : "No",
                  "Github Message": result.result?.github?.message || "N/A",
                  "Instagram Registered": result.result?.instagram?.registered ? "Yes" : "No",
                  "Instagram Message": result.result?.instagram?.message || "N/A",
                  "Paytm Registered": result.result?.paytm?.registered ? "Yes" : "No",
                  "Paytm Message": result.result?.paytm?.message || "N/A",
                  "Twitter Registered": result.result?.twitter?.registered ? "Yes" : "No",
                  "Twitter Message": result.result?.twitter?.message || "N/A",
                  "Whatsapp Registered": result.result?.whatsapp?.registered ? "Yes" : "No",
                  "Whatsapp Message": result.result?.whatsapp?.message || "N/A",
                })}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className={styles.resultsContainer}>
            <div className={styles.metaSection}>
              <h3>
                <MdInfo /> Request Information
              </h3>
              {renderDetailCard(<MdInfo />, "API Response", {
                Status: result.meta?.status ? result.meta.status.charAt(0).toUpperCase() + result.meta.status.slice(1) : "N/A",
                Message: result.meta?.message || "N/A",
                Timestamp: result.meta?.timestamp || "N/A",
              })}
            </div>
            {renderDetailCard(<MdInfo />, "WhatsApp Checker Details", {
              "Business Name": result.result?.business_name || "N/A",
              "Is Business": result.result?.is_business ? "Yes" : "No",
              "Profile Pic URL": result.result?.profile_pic_url || "N/A",
              Status: result.result?.status || "N/A",
            })}
            {result.result?.profile_pic_url && (
              <div className={styles.imageContainer}>
                <h3>Profile Picture</h3>
                <img
                  src={result.result.profile_pic_url}
                  alt="WhatsApp Profile"
                  className={styles.profileImage}
                  onError={(e) => (e.target.style.display = "none")} // Hide broken images
                />
              </div>
            )}
          </div>
        );
case 3:
  const dataBreachesData = result.result?.data_breaches_data ? JSON.parse(result.result.data_breaches_data) : [];
  const dataBreachesLists = result.result?.data_breaches_data_lists ? JSON.parse(result.result.data_breaches_data_lists) : { names: [], emails: [], phones: [] };
  const toName = result.result?.to_name ? JSON.parse(result.result.to_name) : {};

  return (
    <div className={styles.resultsContainer}>
      <div className={styles.metaSection}>
        <h3>
          <MdInfo /> Request Information
        </h3>
        {renderDetailCard(<MdInfo />, "API Response", {
          Status: result.meta?.status ? result.meta.status.charAt(0).toUpperCase() + result.meta.status.slice(1) : "N/A",
          Message: result.meta?.message || "N/A",
          Timestamp: result.meta?.timestamp || "N/A",
        })}
      </div>
      <div className={styles.detailCard}>
        <div className={styles.cardHeader}>
          <MdInfo />
          <h3>Mobile Footprint Details</h3>
        </div>
        <div className={styles.cardContent}>
          {renderDetailCard(<MdInfo />, "Phone Information", {
            "Mobile Number": result.result?.value || "N/A",
            Type: result.result?.type || "N/A",
            Status: result.result?.status || "N/A",
            "Is Disposable": result.result?.is_disposable ? "Yes" : "No",
            "Is Valid": result.result?.is_valid ? "Yes" : "No",
            "Is Suspicious Format": result.result?.is_suspicious_format ? "Yes" : "No",
            "Is Valid Format": result.result?.is_valid_format ? "Yes" : "No",
            "Country Code": result.result?.country_code || "N/A",
            "Is Ported": result.result?.is_ported ? "Yes" : "No",
            "Original Network": result.result?.original_network || "N/A",
            "Current Network": result.result?.current_network || "N/A",
            "Original MNO Code": result.result?.original_mno_code || "N/A",
            "Current MNO Code": result.result?.current_mno_code || "N/A",
            Score: result.result?.score || "N/A",
            "Score Cluster": result.result?.score_cluster || "N/A",
            "Reason Codes": result.result?.reason_codes || "N/A",
            "First Seen": result.result?.first_seen || "N/A",
          })}
          {renderDetailCard(<MdInfo />, "Social Media Presence", {
            "Has WhatsApp": result.result?.has_whatsapp ? "Yes" : "No",
            "Has Flipkart": result.result?.has_flipkart ? "Yes" : "No",
            "Has Telegram": result.result?.has_telegram ? "Yes" : "No",
            "Has Instagram": result.result?.has_instagram ? "Yes" : "No",
            "Has Google": result.result?.has_google ? "Yes" : "No",
            "Has Office365": result.result?.has_office365 ? "Yes" : "No",
            "Has Facebook": result.result?.has_facebook ? "Yes" : "No",
            "Has Twitter": result.result?.has_twitter ? "Yes" : "No",
            "Has Weibo": result.result?.has_weibo ? "Yes" : "No",
          })}
          {renderDetailCard(<MdInfo />, "Identity Information", {
            "To Name": toName.first_name && toName.last_name ? `${toName.first_name} ${toName.last_name}` : "N/A",
            "Name Confidence": toName.confidence || "N/A",
            "Identity Email Count": result.result?.identity_email_count || "N/A",
            "Identity IP Count": result.result?.identity_ip_count || "N/A",
            "Identity Name Count": result.result?.identity_name_count || "N/A",
            "Email Partials Count": result.result?.email_partials_count || "N/A",
            "Email Partials List": result.result?.email_partials_list || "N/A",
            "Phone Partials Count": result.result?.phone_partials_count || "N/A",
          })}
          {renderDetailCard(<MdInfo />, "Data Breach Summary", {
            "Data Breaches Count": result.result?.data_breaches_count || "N/A",
            "First Breach": result.result?.data_breaches_first_breach || "N/A",
            "Last Breach": result.result?.data_breaches_last_breach || "N/A",
            "Data Breaches List": result.result?.data_breaches_list || "N/A",
          })}
        </div>
      </div>
      {dataBreachesData.length > 0 && (
        <div className={styles.tableSection}>
          <h3>Data Breaches Details</h3>
          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Title</th>
                  <th>Names</th>
                  <th>Emails</th>
                </tr>
              </thead>
              <tbody>
                {dataBreachesData.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.id || "N/A"}</td>
                    <td>{item.date || "N/A"}</td>
                    <td>{item.title || "N/A"}</td>
                    <td>{item.names?.map(n => `${n.first_name} ${n.last_name}`).join(", ") || "N/A"}</td>
                    <td>{item.emails?.join(", ") || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {dataBreachesLists.names.length > 0 && (
        <div className={styles.tableSection}>
          <h3>Data Breaches Names</h3>
          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {dataBreachesLists.names.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.first_name || "N/A"}</td>
                    <td>{item.last_name || "N/A"}</td>
                    <td>{item.count || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {dataBreachesLists.emails.length > 0 && (
        <div className={styles.tableSection}>
          <h3>Data Breaches Emails</h3>
          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Email</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {dataBreachesLists.emails.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.value || "N/A"}</td>
                    <td>{item.count || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
      default:
        return (
          <div className={styles.resultsContainer}>
            <div className={styles.metaSection}>
              <h3>
                <MdInfo /> Request Information
              </h3>
              {renderDetailCard(<MdInfo />, "API Response", {
                Status: result.meta?.status ? result.meta.status.charAt(0).toUpperCase() + result.meta.status.slice(1) : "N/A",
                Message: result.meta?.message || "N/A",
                Timestamp: result.meta?.timestamp || "N/A",
              })}
            </div>
            <pre className={styles.jsonPre}>{JSON.stringify(result.result, null, 2)}</pre>
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
          {loading ? (
            <div className={styles.loaderWrapper}>
              <div className={styles.loader}></div>
              <p>Fetching data...</p>
            </div>
          ) : !result ? (
            <div className={styles.inputGroup}>
              {apiId === 1 && (
                <div className={styles.inputSection}>
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter your Email"
                    value={inputEmail}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                  />
                </div>
              )}
              {(apiId === 2 || apiId === 3) && (
                <div className={styles.inputSection}>
                  <label>Mobile Number</label>
                  <input
                    type="text"
                    placeholder="Enter 10-digit Mobile Number"
                    value={inputNumber}
                    onChange={(e) => setInputNumber(e.target.value.replace(/\D/g, ""))}
                    maxLength={10}
                    className={styles.input}
                  />
                </div>
              )}
              {error && <p className={styles.error}>{error}</p>}
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
                <button className={styles.cancelBtn} onClick={onClose}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.resultSection}>
              {result.meta?.message && (
                <p className={styles.successMessage}>
                  <MdInfo /> {result.meta.message}
                </p>
              )}
              <div className={styles.resultBox}>{renderResultSection()}</div>
              <div className={styles.actions}>
                <button
                  className={styles.accessBtn}
                  onClick={() => {
                    setResult(null);
                    setError("");
                    setInputNumber("");
                    setEmail("");
                    setFormData({
                      mobile: "",
                      name_lookup: "",
                      first_name: "",
                      last_name: "",
                    });
                  }}
                >
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
import React, { useState } from "react";
import styles from "../Mobile/SimpleModal.module.css";
import api from "../../Utils/api";
import toast from "react-hot-toast";
import { MdClose, MdInfo } from "react-icons/md";

const SimpleModal = ({ apiName, apiId, onClose }) => {
  const [uan, setUan] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const getApiEndpoint = () => {
    switch (apiId) {
      case 1: return "/v1/contactToGst";
      case 2: return "/v1/mobileToUan";
      case 3: return "/v1/mobileToProfileV1";
      case 4: return "/v1/mobileFootprint";
      case 5: return "/v1/upiMobileToVpaBasic";
      case 6: return "/v1/upiMobileToVpaAdvance";
      case 7: return "/v1/mobileFootprint";
      case 8: return "/v1/mobileToLPG";
      default: return null;
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

    // Validate input
    const isUan = apiId === 2;
    const input = uan.trim();
    const mobileRegex = /^\d{10}$/;
    const uanRegex = /^\d{12}$/;

   

    const payload = { mobile: input };

    try {
      setResult(null);
      setLoading(true);
      const res = await api.post(endpoint, payload);
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

  const renderGridItem = (label, value) => (
    <div className={styles.infoItem}>
      <label>{label}:</label>
      <span>{value || "N/A"}</span>
    </div>
  );

  const renderResultSection = () => {
    if (!result) return null;

    switch (apiId) {
      case 1:
        const data1 = result?.result[0] || {};
        return (
          <div className={styles.resultGrid}>
            <section className={styles.metaSection}>
              <h3>Request Information</h3>
              <div className={styles.infoGrid}>
                {renderGridItem("Status", result.meta?.status ? result.meta.status.charAt(0).toUpperCase() + result.meta.status.slice(1) : null)}
                {renderGridItem("Message", result.meta?.message)}
                {renderGridItem("Timestamp", result.meta?.timestamp)}
              </div>
            </section>
            <section className={styles.resultSection}>
              <h3>GST Details</h3>
              <div className={styles.infoGrid}>
                {renderGridItem("Mobile", data1?.mobile)}
                {renderGridItem("GSTIN", data1?.gstin)}
                {renderGridItem("Legal Name", data1?.legal_name)}
                {renderGridItem("Trade Name", data1?.trade_name)}
              </div>
            </section>
          </div>
        );
      case 2:
        const data2 = result?.result || {};
        return (
          <div className={styles.resultGrid}>
            <section className={styles.metaSection}>
              <h3>Request Information</h3>
              <div className={styles.infoGrid}>
                {renderGridItem("Status", result.meta?.status ? result.meta.status.charAt(0).toUpperCase() + result.meta.status.slice(1) : null)}
                {renderGridItem("Message", result.meta?.message)}
                {renderGridItem("Timestamp", result.meta?.timestamp)}
              </div>
            </section>
            <section className={styles.resultSection}>
              <h3>UAN Details</h3>
              <div className={styles.infoGrid}>
                {renderGridItem("UAN", data2?.uan)}
              </div>
            </section>
          </div>
        );
case 3:
    const data3 = result?.result || {};
    return (
      <div className={styles.resultGrid}>
        <section className={styles.metaSection}>
          <h3>Request Information</h3>
          <div className={styles.infoGrid}>
            {renderGridItem("Status", result.meta?.status ? result.meta.status.charAt(0).toUpperCase() + result.meta.status.slice(1) : null)}
            {renderGridItem("Message", result.meta?.message)}
            {renderGridItem("Timestamp", result.meta?.timestamp)}
          </div>
        </section>
        <section className={styles.resultSection}>
          <h3>Profile Details</h3>
          <div className={styles.infoGrid}>
            {renderGridItem("Mobile", data3?.mobile)}
            {renderGridItem("Full Name", data3?.details?.personal_info?.full_name)}
            {renderGridItem("Age", data3?.details?.personal_info?.age)}
            {renderGridItem("Gender", data3?.details?.personal_info?.gender)}
            {renderGridItem("Date of Birth", data3?.details?.personal_info?.dob)}
            {renderGridItem("Total Income", data3?.details?.personal_info?.total_income)}
            {renderGridItem("Occupation", data3?.details?.personal_info?.occupation)}
          </div>
          {data3?.details?.phone_info?.length > 0 && (
            <>
              <h3>Phone Information</h3>
              <div className={styles.tableContainer}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Sr.No</th>
                      <th>Reported Date</th>
                      <th>Type Code</th>
                      <th>Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data3.details.phone_info.map((phone, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{phone?.reported_date || "N/A"}</td>
                        <td>{phone?.type_code || "N/A"}</td>
                        <td>{phone?.number || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {data3?.details?.address_info?.length > 0 && (
            <>
              <h3>Addresses</h3>
              <div className={styles.tableContainer}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Sr.No</th>
                      <th>Address</th>
                      <th>State</th>
                      <th>Postal Code</th>
                      <th>Type</th>
                      <th>Reported Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data3.details.address_info.map((add, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{add?.address || "N/A"}</td>
                        <td>{add?.state || "N/A"}</td>
                        <td>{add?.postal || "N/A"}</td>
                        <td>{add?.type || "N/A"}</td>
                        <td>{add?.reported_date || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {data3?.details?.email_info?.length > 0 && (
            <>
              <h3>Emails</h3>
              <div className={styles.tableContainer}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Sr.No</th>
                      <th>Email Address</th>
                      <th>Reported Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data3.details.email_info.map((em, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{em?.email_address || "N/A"}</td>
                        <td>{em?.reported_date || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {data3?.details?.identity_info && (
            <>
              <h3>Identity Information</h3>
              <div className={styles.infoGrid}>
                {data3.details.identity_info?.pan_number?.length > 0 && data3.details.identity_info.pan_number.map((pan, index) => (
                  <div key={index} className={styles.infoItem}>
                    <label>PAN Number {index + 1}:</label>
                    <span>{pan?.id_number || "N/A"}</span>
                  </div>
                ))}
                {data3.details.identity_info?.passport_number?.length === 0 && data3.details.identity_info?.driving_license?.length === 0 &&
                 data3.details.identity_info?.voter_id?.length === 0 && data3.details.identity_info?.aadhaar_number?.length === 0 &&
                 data3.details.identity_info?.ration_card?.length === 0 && data3.details.identity_info?.other_id?.length === 0 &&
                 data3.details.identity_info?.pan_number?.length === 0 && (
                  <p className={styles.noData}>No identity information available</p>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    );
      case 4:
      case 7:
        const data47 = result?.result || {};
        return (
          <div className={styles.resultGrid}>
            <section className={styles.metaSection}>
              <h3>Request Information</h3>
              <div className={styles.infoGrid}>
                {renderGridItem("Status", result.meta?.status ? result.meta.status.charAt(0).toUpperCase() + result.meta.status.slice(1) : null)}
                {renderGridItem("Message", result.meta?.message)}
                {renderGridItem("Timestamp", result.meta?.timestamp)}
              </div>
            </section>
            <section className={styles.resultSection}>
              <h3>Footprint Details</h3>
              <div className={styles.infoGrid}>
                {renderGridItem("Amazon", data47?.amazon)}
                {renderGridItem("Facebook", data47?.facebook)}
                {renderGridItem("Github", data47?.github)}
                {renderGridItem("WhatsApp", data47?.whatsapp)}
              </div>
              <h3>Apple</h3>
              <div className={styles.infoGrid}>
                {renderGridItem("Message", data47?.apple?.message)}
                {renderGridItem("Registered", data47?.apple?.registered ? "Yes" : "No")}
              </div>
              <h3>Flipkart</h3>
              <div className={styles.infoGrid}>
                {renderGridItem("Message", data47?.flipkart?.message)}
                {renderGridItem("Registered", data47?.flipkart?.registered ? "Yes" : "No")}
              </div>
              <h3>Instagram</h3>
              <div className={styles.infoGrid}>
                {renderGridItem("Message", data47?.instagram?.message)}
                {renderGridItem("Registered", data47?.instagram?.registered ? "Yes" : "No")}
              </div>
              <h3>Paytm</h3>
              <div className={styles.infoGrid}>
                {renderGridItem("Message", data47?.paytm?.message)}
                {renderGridItem("Registered", data47?.paytm?.registered ? "Yes" : "No")}
              </div>
              <h3>Twitter</h3>
              <div className={styles.infoGrid}>
                {renderGridItem("Message", data47?.twitter?.message)}
                {renderGridItem("Registered", data47?.twitter?.registered ? "Yes" : "No")}
              </div>
            </section>
          </div>
        );
      case 5:
        const data5 = result?.result || {};
        return (
          <div className={styles.resultGrid}>
            <section className={styles.metaSection}>
              <h3>Request Information</h3>
              <div className={styles.infoGrid}>
                {renderGridItem("Status", result.meta?.status ? result.meta.status.charAt(0).toUpperCase() + result.meta.status.slice(1) : null)}
                {renderGridItem("Message", result.meta?.message)}
                {renderGridItem("Timestamp", result.meta?.timestamp)}
              </div>
            </section>
            <section className={styles.resultSection}>
              <h3>UPI Basic Details</h3>
              <div className={styles.infoGrid}>
                {renderGridItem("Name", data5?.name)}
                {renderGridItem("VPA", data5?.vpa)}
              </div>
            </section>
          </div>
        );
case 6:
    const data6 = result?.result || {};
    return (
      <div className={styles.resultGrid}>
        <section className={styles.metaSection}>
          <h3>Request Information</h3>
          <div className={styles.infoGrid}>
            {renderGridItem("Status", result.meta?.status ? result.meta.status.charAt(0).toUpperCase() + result.meta.status.slice(1) : null)}
            {renderGridItem("Message", result.meta?.message)}
            {renderGridItem("Timestamp", result.meta?.timestamp)}
          </div>
        </section>
        <section className={styles.resultSection}>
          <h3>UPI Advanced Details</h3>
          <div className={styles.infoGrid}>
            {renderGridItem("Mobile Number", data6?.mobile_number)}
            {renderGridItem("Name", data6?.name)}
            {renderGridItem("IFSC", data6?.ifsc)}
            {renderGridItem("VPA", data6?.vpa)}
            {renderGridItem("Account Type", data6?.account_type)}
            {renderGridItem("Entity Type", data6?.entity_type)}
          </div>
          {data6?.ifsc_details && (
            <>
              <h3>IFSC Details</h3>
              <div className={styles.infoGrid}>
                {renderGridItem("Bank", data6?.ifsc_details?.bank)}
                {renderGridItem("IFSC", data6?.ifsc_details?.ifsc)}
                {renderGridItem("Branch", data6?.ifsc_details?.branch)}
                {renderGridItem("Centre", data6?.ifsc_details?.centre)}
                {renderGridItem("District", data6?.ifsc_details?.district)}
                {renderGridItem("State", data6?.ifsc_details?.state)}
                {renderGridItem("Address", data6?.ifsc_details?.address)}
                {renderGridItem("Contact", data6?.ifsc_details?.contact)}
                {renderGridItem("City", data6?.ifsc_details?.city)}
                {renderGridItem("ISO 3166", data6?.ifsc_details?.iso_3166)}
                {renderGridItem("IMPS", data6?.ifsc_details?.imps ? "Yes" : "No")}
                {renderGridItem("RTGS", data6?.ifsc_details?.rtgs ? "Yes" : "No")}
                {renderGridItem("NEFT", data6?.ifsc_details?.neft ? "Yes" : "No")}
                {renderGridItem("UPI", data6?.ifsc_details?.upi ? "Yes" : "No")}
              </div>
            </>
          )}
        </section>
      </div>
    );
        case 8:
        const data8 = result?.result || {};
        return (
          <div className={styles.resultGrid}>
            <section className={styles.metaSection}>
              <h3>Request Information</h3>
              <div className={styles.infoGrid}>
                {renderGridItem("Status", result.meta?.status ? result.meta.status.charAt(0).toUpperCase() + result.meta.status.slice(1) : null)}
                {renderGridItem("Message", result.meta?.message)}
                {renderGridItem("Timestamp", result.meta?.timestamp)}
              </div>
            </section>
            <section className={styles.resultSection}>
              <h3>LPG Details</h3>
              <div className={styles.infoGrid}>
                {renderGridItem("Name", data8?.name)}
                {renderGridItem("Bank", data8?.bank)}
                {renderGridItem("Branch", data8?.branch)}
                {renderGridItem("Center", data8?.center)}
                {renderGridItem("District", data8?.district)}
                {renderGridItem("State", data8?.state)}
                {renderGridItem("Address", data8?.address)}
                {renderGridItem("Contact", data8?.contact)}
                {renderGridItem("City", data8?.city)}
              </div>
            </section>
          </div>
        );
      default:
        return (
          <div className={styles.resultGrid}>
            <pre className={styles.jsonPre}>{JSON.stringify(result, null, 2)}</pre>
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
        {loading ? (
          <div className={styles.loaderWrapper}>
            <div className={styles.loader}></div>
            <p>Fetching data...</p>
          </div>
        ) : !result ? (
          <div className={styles.modalBody}>
            <div className={styles.inputSection}>
              
              <input
                type="text"
                placeholder={ "Enter Your 10-digit Mobile Number"}
                value={uan}
                onChange={(e) => setUan(e.target.value)}
                maxLength={apiId === 2 ? 12 : 10}
                className={styles.input}
              />
            </div>
            {error && (
              <p className={styles.error}>
                <MdInfo /> {error}
              </p>
            )}
            <div className={styles.actions}>
              <button className={styles.accessBtn} onClick={handleSubmit} disabled={loading}>
                Submit
              </button>
              <button className={styles.cancelBtn} onClick={onClose}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.resultSection}>
            <p className={styles.successMessage}>
              <MdInfo /> {result.meta?.message || "Details fetched successfully"}
            </p>
            <div className={styles.resultBox}>
              {renderResultSection()}
            </div>
            <div className={styles.actions}>
              <button
                className={styles.accessBtn}
                onClick={() => {
                  setResult(null);
                  setError("");
                  setUan("");
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
  );
};

export default SimpleModal;
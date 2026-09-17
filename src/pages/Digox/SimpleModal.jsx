import React, { useState } from "react";
import styles from "./SimpleModal.module.css"; 
import api from "../../Utils/api";
import toast from "react-hot-toast";
import { MdClose } from "react-icons/md";

const SimpleModal = ({ apiName, apiId, onClose }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [inputNumber, setInputNumber] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");

  const getApiEndpoint = () => {
    switch (apiId) {
      case 1:
        return `/v1/mobileDataV1?mobile=${inputNumber}`;
      case 2:
        return `/v1/aadharDataV1?aadhaar=${aadharNumber}`;
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

    if (apiId === 1 && !inputNumber) {
      setError("Please enter a number.");
      return;
    }
    if (apiId === 2 && !aadharNumber) {
      setError("Please enter aadhaar number.");
      return;
    }

    const validateAadhar = (number) => /^\d{12}$/.test(number);
    const validateMobile = (number) => /^\d{10}$/.test(number);

    if (apiId === 1 && !validateMobile(inputNumber)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (apiId === 2 && !validateAadhar(aadharNumber)) {
      setError("Please enter a valid 12-digit Aadhar number.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(endpoint);
      setResult(res.data);

      if (res.data?.success) {
        const msg = res.data?.meta?.message || "Details fetched successfully";
        toast.success(msg);
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

  const renderResultSection = () => {
    return (
      <div className={styles.resultGrid}>
        <table>
          <thead>
            <tr>
              <th>Sr.No</th>
              <th>Name</th>
              <th>Father's Name</th>
              <th>Mobile No</th>
              <th>Alternate Mobile No</th>
              <th>Id</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {result?.result?.map((item, index) => (
              <tr key={index}>
                <td>{index + 1 || "N/A"}</td>
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
    );
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={`${styles.modal} ${result ? styles.expanded : ""}`}>
        <h2>{apiName}</h2>

        {loading ? (
          <div className={styles.loaderWrapper}>
            <div className={styles.loader}></div>
            <p>Fetching data...</p>
          </div>
        ) : !result ? (
          <>
            {apiId === 1 && (
              <div>
                <input
                  type="text"
                  placeholder="Enter Mobile Number"
                  value={inputNumber}
                  onChange={(e) => setInputNumber(e.target.value)}
                  maxLength={10}
                  className={styles.input}
                />
              </div>
            )}

            {apiId === 2 && (
              <div>
                <input
                  type="text"
                  placeholder="Enter Aadhaar Number"
                  value={aadharNumber}
                  onChange={(e) => setAadharNumber(e.target.value)}
                  maxLength={12}
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
                Submit
              </button>
              <button className={styles.cancelBtn} onClick={onClose}>
                <MdClose />
              </button>
            </div>
          </>
        ) : (
          <div className={styles.resultSection}>
            <p className={styles.successMessage}>{result.meta?.message}</p>
            {renderResultSection()}
            <div className={styles.actions}>
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

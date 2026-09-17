import React, { useState } from "react";
import styles from "../Aadhar/SimpleModal.module.css";
import api from "../../../Utils/api";
import toast from "react-hot-toast";
import {
  MdClose,
  MdPerson,
  MdCreditCard,
  MdInfo,
  MdLocationOn,
} from "react-icons/md";

const SimpleModal = ({ apiName, apiId, onClose }) => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Input validation based on API
  const validateInput = (value) => {
    switch (apiId) {
      case 1: // ewaybillByNumber
        return /^[0-9]{12}$/.test(value); // 12-digit number
      case 2: // echallanByVehicle
        return /^[A-Z]{2}[0-9]{2}[A-Z]{0,2}[0-9]{4}$/.test(value); // Vehicle number format
      case 3: // gstLookup
        return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(value); // GSTIN format
      case 4: // blackspotByState
      case 5: // noentryByState
        return /^[0-9]+$/.test(value); // Numeric state code
      default:
        return false;
    }
  };

  // Get input label and placeholder based on API
  const getInputConfig = () => {
    switch (apiId) {
      case 1:
        return { label: "E-Way Bill Number", placeholder: "Enter E-Way Bill Number (e.g., 101000609218)" };
      case 2:
        return { label: "Vehicle Number", placeholder: "Enter Vehicle Number (e.g., RJ52GA6994)" };
      case 3:
        return { label: "GSTIN", placeholder: "Enter GSTIN (e.g., 06AAACQ8721F1ZK)" };
      case 4:
      case 5:
        return { label: "State Code", placeholder: "Enter State Code (e.g., 6 for Haryana, 22 for Chhattisgarh)" };
      default:
        return { label: "Input", placeholder: "Enter required value" };
    }
  };

  // Get API endpoint
  const getApiEndpoint = () => {
    switch (apiId) {
      case 1:
        return "/v1/ewaybillByNumber";
      case 2:
        return "/v1/echallanByVehicle";
      case 3:
        return "/v1/gstLookup";
      case 4:
        return "/v1/blackspotByState";
      case 5:
        return "/v1/noentryByState";
      default:
        return null;
    }
  };

  // Construct request body
  const getRequestBody = () => {
    switch (apiId) {
      case 1:
        return { ewbNo: inputValue };
      case 2:
        return { vehicleNumber: inputValue };
      case 3:
        return { gstin: inputValue };
      case 4:
      case 5:
        return { stateCode: inputValue };
      default:
        return {};
    }
  };

  const handleSubmit = async () => {
    if (!validateInput(inputValue)) {
      setError(`Please enter a valid ${getInputConfig().label.toLowerCase()}.`);
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
      const res = await api.post(endpoint, getRequestBody());
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
            value !== "" && (
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
      case 1: // ewaybillByNumber
        return (
          <div className={styles.resultsContainer}>
            {renderDetailCard(<MdInfo />, "E-Way Bill Details", {
              Status: result.data?.response[0]?.responseStatus,
              Error: result.data?.response[0]?.response?.errorCodes,
              Message: result.data?.message,
              Code: result.data?.code,
            })}
          </div>
        );
      case 2: // echallanByVehicle
        return (
          <div className={styles.resultsContainer}>
            {result.data?.response[0]?.response?.data?.Pending_data?.map(
              (challan, index) => (
                <div key={index}>
                  {renderDetailCard(<MdInfo />, `Pending Challan ${index + 1}`, {
                    "Challan No": challan.challan_no,
                    "Date Time": challan.challan_date_time,
                    "Place": challan.challan_place,
                    Status: challan.challan_status,
                    "Fine Imposed": challan.fine_imposed,
                    "Owner Name": challan.owner_name,
                    "Violator Name": challan.name_of_violator,
                    Department: challan.department,
                    "State Code": challan.state_code,
                    "RTO District": challan.rto_distric_name,
                    Offences: challan.offence_details
                      ?.map((off) => off.name)
                      .join(", "),
                  })}
                </div>
              )
            )}
            {result.data?.response[0]?.response?.data?.Disposed_data?.map(
              (challan, index) => (
                <div key={index}>
                  {renderDetailCard(<MdInfo />, `Disposed Challan ${index + 1}`, {
                    "Challan No": challan.challan_no,
                    "Date Time": challan.challan_date_time,
                    "Place": challan.challan_place,
                    Status: challan.challan_status,
                    "Fine Imposed": challan.fine_imposed,
                    "Owner Name": challan.owner_name,
                    "Violator Name": challan.name_of_violator,
                    Department: challan.department,
                    "State Code": challan.state_code,
                    "Receipt No": challan.receipt_no,
                    "Received Amount": challan.received_amount,
                    Offences: challan.offence_details
                      ?.map((off) => off.name)
                      .join(", "),
                  })}
                </div>
              )
            )}
          </div>
        );
      case 3: // gstLookup
        return (
          <div className={styles.resultsContainer}>
            {renderDetailCard(<MdInfo />, "GST Lookup Details", {
              Status: result.data?.response[0]?.responseStatus,
              Error: result.data?.response[0]?.response?.error,
              "Error Description": result.data?.response[0]?.response?.error_description,
              Message: result.data?.message,
              Code: result.data?.code,
            })}
          </div>
        );
      case 4: // blackspotByState
        return (
          <div className={styles.resultsContainer}>
            {result.data?.response[0]?.response?.map(
              (spot, index) => (
                <div key={index}>
                  {renderDetailCard(<MdLocationOn />, `Blackspot ${index + 1}`, {
                    "District": spot.nameOfDistrict,
                    "Location": spot.nameOfTheLocation,
                    "Police Station": spot.policeStationName,
                    "Road Name": spot.roadName,
                    "State": spot.state,
                    "State Code": spot.stateCode,
                    "Starting Distance": spot.startingFromDistance,
                    "Ending Distance": spot.endingToDistance,
                  })}
                </div>
              )
            )}
          </div>
        );
      case 5: // noentryByState
        return (
          <div className={styles.resultsContainer}>
            {result.data?.response[0]?.response?.map(
              (entry, index) => (
                <div key={index}>
                  {renderDetailCard(<MdInfo />, `No-Entry Zone ${index + 1}`, {
                    "Area Name": entry.areaName,
                    "No-Entry Time": entry.noEntryTime,
                    "District": entry.districtName,
                    "State": entry.stateName,
                    "State Code": entry.stateCode,
                  })}
                </div>
              )
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
                <label>{label}</label>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={inputValue}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setInputValue(val);
                    setError(
                      validateInput(val) || val.length === 0
                        ? ""
                        : `Invalid ${label.toLowerCase()} format`
                    );
                  }}
                  maxLength={apiId === 1 ? 12 : apiId === 3 ? 15 : 10}
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
                {result.message && (
                  <p className={styles.successMessage}>
                    <MdInfo /> {result.message}
                  </p>
                )}
                <div className={styles.resultBox}>{renderResultSection()}</div>

                <div className={styles.actions}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => setResult(null)}
                  >
                    New Search
                  </button>
                  <button className={styles.closeResultBtn} onClick={onClose}>
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
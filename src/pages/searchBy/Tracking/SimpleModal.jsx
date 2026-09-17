import React, { useState } from "react";
import styles from "./SimpleModal.module.css";
import api from "../../../Utils/api";
import toast from "react-hot-toast";
import { MdClose, MdInfo } from "react-icons/md";

const SimpleModal = ({ apiName, apiId, apiFields, onClose }) => {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const getApiEndpoint = () => {
    switch (apiId) {
      case 1:
        return "/v1/RCbyNumber";
      case 2:
        return "/v1/RCbyChassis";
      case 3:
        return "/v1/RCbyEngine";
      case 4:
        return "/v1/fastagTracking";
      case 5:
        return "/v1/sarathiLookup";
      case 6:
        return "/v1/vehicleTonumber";
      case 7:
        return "/v1/vehicleTonumberPremium";
      case 8:
        return "/v1/rcAdvanced_d1";
      default:
        return null;
    }
  };

  const validateForm = () => {
    for (const field of apiFields) {
      const value = formData[field.name]?.trim() || "";
      if (!value) {
        setError(`Please enter ${field.placeholder}`);
        return false;
      }
      if (apiId === 8 && field.name === "rcAdvanced_d1") {
        if (!/^[A-Z]{2}[0-9]{1,2}[A-Z]{0,2}[0-9]{4}$/.test(value)) {
          setError("Please enter a valid vehicle number (e.g., HR36AH6771)");
          return false;
        }
      }
      if (apiId === 5 && field.name === "dob") {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          setError("Please enter a valid DOB (YYYY-MM-DD)");
          return false;
        }
      }
    }
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setError("");
    const endpoint = getApiEndpoint();
    if (!endpoint) {
      setError("No API endpoint found.");
      return;
    }

    try {
      setLoading(true);
      let res;
      if (apiId === 8) {
        res = await api.get(`${endpoint}?rc_number=${formData.rcAdvanced_d1}`);
      } else {
        res = await api.post(endpoint, formData);
      }
      setResult(res.data);

      if (
        (res.data?.stautsMessage && res.data?.stautsMessage === "OK") ||
        (res.data?.code && res.data?.code == "200") ||
        (res.data?.success && res.data?.success === true)
      ) {
        const msg = res.data?.meta?.message || "Details fetched successfully";
        toast.success(msg);
      } else {
        const err =
          res.data?.meta?.message ||
          res.data?.message ||
          "Failed to fetch details";
        toast.error(err);
        setError(err);
      }
    } catch (err) {
      const error =
        err.response?.data?.message ||
        err.message ||
        "Something went wrong while fetching data.";
      toast.error(error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

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

    if (result?.error === "true" || error) {
      return (
        <p className={styles.error}>
          {result?.message || error || "Something went wrong to get result"}
        </p>
      );
    }

    const renderDetailCard = (icon, title, items) => (
      <div className={styles.detailCard}>
        <div className={styles.cardHeader}>
          {icon}
          <h3>{title}</h3>
        </div>
        <div className={styles.cardContent}>
          {Object.entries(items).map(([key, value]) => (
            value && (
              <div key={key} className={styles.detailItem}>
                <span className={styles.detailLabel}>{key.replace(/_/g, ' ')}:</span>
                <span className={styles.detailValue}>{value}</span>
              </div>
            )
          ))}
        </div>
      </div>
    );

    switch (apiId) {
      case 1: // RCbyNumber
      case 2: // RCbyChassis
      case 3: // RCbyEngine
      case 7: // vehicleTonumberPremium
        const rcData = result?.data;
        if (!rcData) {
          return <div className={styles.noData}>Vehicle data not available.</div>;
        }
        return (
          <div className={styles.resultsContainer}>
            {renderDetailCard(<MdInfo />, "Vehicle Overview", {
              "Registration Number": rcData.rc_regn_no,
              "Registration Date": rcData.rc_regn_dt,
              "Valid Until": rcData.rc_regn_upto,
              "Purchase Date": rcData.rc_purchase_dt,
              "Vehicle Category": rcData.rc_vch_catg_desc || rcData.rc_vch_catg,
              "Vehicle Class": rcData.rc_vh_class_desc,
              "Maker": rcData.rc_maker_desc,
              "Model": rcData.rc_maker_model,
            })}
            {renderDetailCard(<MdInfo />, "Owner Details", {
              "Owner Name": rcData.rc_owner_name,
              "Owner Serial": rcData.rc_owner_sr,
              "Mobile Number": rcData.rc_owner_mobile,
              "Present Address": rcData.rc_present_address,
              "Permanent Address": rcData.rc_permanent_address,
              "Registered At": rcData.rc_registered_at,
            })}
            {renderDetailCard(<MdInfo />, "Technical Specifications", {
              "Chassis Number": rcData.rc_chasi_no,
              "Engine Number": rcData.rc_eng_no,
              "Cubic Capacity": rcData.rc_cubic_cap ? `${rcData.rc_cubic_cap} cc` : null,
              "Fuel Type": rcData.rc_fuel_desc,
              "Color": rcData.rc_color,
              "Manufacture Month/Year": rcData.rc_manu_month_yr,
              "Wheelbase": rcData.rc_wheelbase ? `${rcData.rc_wheelbase} mm` : null,
              "Unladen Weight": rcData.rc_unld_wt ? `${rcData.rc_unld_wt} kg` : null,
              "Gross Vehicle Weight": rcData.rc_gvw ? `${rcData.rc_gvw} kg` : null,
              "Loading Capacity": rcData.loadingCapacity ? `${rcData.loadingCapacity} kg` : null,
            })}
            {renderDetailCard(<MdInfo />, "Validity & Insurance", {
              "Fitness Valid Until": rcData.rc_fit_upto,
              "Tax Paid Until": rcData.rc_tax_upto,
              "PUCC Valid Until": rcData.rc_pucc_upto,
              "PUCC Number": rcData.rc_pucc_no,
              "Insurance Company": rcData.rc_insurance_comp,
              "Insurance Policy No": rcData.rc_insurance_policy_no,
              "Insurance Valid Until": rcData.rc_insurance_upto,
              "Financer": rcData.rc_financer,
            })}
            {renderDetailCard(<MdInfo />, "Additional Details", {
              "Body Type": rcData.rc_body_type_desc,
              "Emission Norms": rcData.rc_norms_desc,
              "Seating Capacity": rcData.rc_seat_cap,
              "Vehicle Age": rcData.vehicleAge,
              "Status": rcData.rc_status,
              "Blacklist Status": rcData.rc_blacklist_status,
              "NOC Details": rcData.rc_noc_details,
              "Sale Amount": rcData.rc_sale_amt,
            })}
          </div>
        );

      case 4: // fastagTracking
        const trackingData = result?.data || [];
        if (!trackingData.length) {
          return <div className={styles.noData}>No tracking data available.</div>;
        }
        return (
          <div className={styles.resultsContainer}>
            <div className={styles.tableSection}>
              <h3><MdInfo /> Fastag Tracking History</h3>
              <div className={styles.tableContainer}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Time</th>
                      <th>Toll Plaza</th>
                      <th>Coordinates</th>
                      <th>Vehicle Type</th>
                      <th>Vehicle Reg. No.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trackingData.map((entry, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          {new Date(entry.readerReadTime).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                            timeZone: "Asia/Kolkata",
                          })}
                        </td>
                        <td>{entry.tollPlazaName || "N/A"}</td>
                        <td>{entry.tollPlazaGeocode || "N/A"}</td>
                        <td>{entry.vehicleType || "N/A"}</td>
                        <td>{entry.vehicleRegNo || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {renderDetailCard(<MdInfo />, "Summary", {
              "Total Toll Crossings": trackingData.length,
              "First Recorded": new Date(trackingData[trackingData.length - 1].readerReadTime).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "Asia/Kolkata",
              }),
              "Last Recorded": new Date(trackingData[0].readerReadTime).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "Asia/Kolkata",
              }),
            })}
          </div>
        );

      case 5: // sarathiLookup
        const licenseData = result?.data;
        if (!licenseData) {
          return <div className={styles.noData}>License data not available.</div>;
        }
        return (
          <div className={styles.resultsContainer}>
            {renderDetailCard(<MdInfo />, "Personal Information", {
              "License Number": licenseData?.license?.licenseNumber,
              "Name": licenseData?.personal?.name,
              "Father's Name": licenseData?.personal?.fatherName,
              "Date of Birth": licenseData?.personal?.dateOfBirth,
              "Gender": licenseData?.personal?.gender,
              "Blood Group": licenseData?.personal?.bloodGroup,
              "Mobile": licenseData?.personal?.mobileNumber,
              "Address": licenseData?.personal?.address,
            })}
            {renderDetailCard(<MdInfo />, "License Details", {
              "Issued By": licenseData?.license?.issuedAuthority,
              "Issue Date": licenseData?.license?.issuedDate,
              "Status": licenseData?.license?.status,
              "Non-Transport Validity": licenseData?.license?.validity?.nonTransport,
            })}
            {licenseData?.drivingClasses?.length > 0 && (
              <div className={styles.tableSection}>
                <h3><MdInfo /> Driving Classes</h3>
                <div className={styles.tableContainer}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Class</th>
                        <th>Issued</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {licenseData.drivingClasses.map((cls, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{cls.class || "N/A"}</td>
                          <td>{cls.issued || "N/A"}</td>
                          <td>{cls.status || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );

      case 6: // vehicleTonumber
        const vehicleData = result?.data;
        if (!vehicleData) {
          return <div className={styles.noData}>Vehicle data not available.</div>;
        }
        return (
          <div className={styles.resultsContainer}>
            {renderDetailCard(<MdInfo />, "Vehicle Information", {
              "Vehicle Number": vehicleData.vehicleNumber,
              "Owner Name": vehicleData.ownerName,
              "Mobile Number": vehicleData.mobileNumber,
              "Chassis Number": vehicleData.chassisNumber,
              "Gross Vehicle Weight": vehicleData.grossVehicleWtKG ? `${vehicleData.grossVehicleWtKG} kg` : null,
            })}
          </div>
        );

      case 8: // rcAdvanced_d1
        const rcAdvancedData = result?.result;
        if (!rcAdvancedData) {
          return <div className={styles.noData}>RC data not available.</div>;
        }
        return (
          <div className={styles.resultsContainer}>
            {renderDetailCard(<MdInfo />, "Vehicle Overview", {
              "RC Number": rcAdvancedData.rc_number,
              "Registration Date": rcAdvancedData.registration_date,
              "Vehicle Category": rcAdvancedData.vehicle_category_description,
              "Maker": rcAdvancedData.maker_description,
              "Model": rcAdvancedData.maker_model,
              "Body Type": rcAdvancedData.body_type,
            })}
            {renderDetailCard(<MdInfo />, "Owner Details", {
              "Owner Name": rcAdvancedData.owner_name,
              "Father Name": rcAdvancedData.father_name,
              "Mobile Number": rcAdvancedData.mobile_number,
              "Present Address": rcAdvancedData.present_address,
              "Permanent Address": rcAdvancedData.permanent_address,
              "Registered At": rcAdvancedData.registered_at,
            })}
            {renderDetailCard(<MdInfo />, "Technical Specifications", {
              "Chassis Number": rcAdvancedData.vehicle_chasi_number,
              "Engine Number": rcAdvancedData.vehicle_engine_number,
              "Cubic Capacity": rcAdvancedData.cubic_capacity ? `${rcAdvancedData.cubic_capacity} cc` : null,
              "Fuel Type": rcAdvancedData.fuel_type,
              "Color": rcAdvancedData.color,
              "Manufacturing Date": rcAdvancedData.manufacturing_date_formatted,
              "Unladen Weight": rcAdvancedData.unladen_weight ? `${rcAdvancedData.unladen_weight} kg` : null,
              "Gross Weight": rcAdvancedData.vehicle_gross_weight ? `${rcAdvancedData.vehicle_gross_weight} kg` : null,
              "Wheelbase": rcAdvancedData.wheelbase ? `${rcAdvancedData.wheelbase} mm` : null,
            })}
            {renderDetailCard(<MdInfo />, "Validity & Insurance", {
              "Fitness Valid Until": rcAdvancedData.fit_up_to,
              "Tax Paid Until": rcAdvancedData.tax_upto,
              "PUCC Upto": rcAdvancedData.pucc_upto,
              "Financer": rcAdvancedData.financer,
              "Financed": rcAdvancedData.financed ? "Yes" : "No",
              "Insurance Upto": rcAdvancedData.insurance_upto,
            })}
            {renderDetailCard(<MdInfo />, "Additional Details", {
              "Emission Norms": rcAdvancedData.norms_type,
              "Seating Capacity": rcAdvancedData.seat_capacity,
              "Owner Number": rcAdvancedData.owner_number,
              "RC Status": rcAdvancedData.rc_status,
              "Blacklist Status": rcAdvancedData.blacklist_status,
              "NOC Details": rcAdvancedData.noc_details,
            })}
          </div>
        );

      default:
        return (
          <div className={styles.resultsContainer}>
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <MdInfo />
                <h3>Result</h3>
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
    <div className={styles.modalBackdrop}>
      <div className={`${styles.modal} ${result ? styles.expanded : ""}`}>
        <div className={styles.modalHeader}>
          <h2>{apiName}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <MdClose />
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.inputSection}>
            {apiFields.map((field) => (
              <div key={field.name}>
                <label>{field.placeholder}</label>
                <input
                  type={field.type || "text"}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={formData[field.name] || ""}
                  onChange={handleInputChange}
                  maxLength={apiId === 8 ? 10 : undefined}
                  className={styles.input}
                />
              </div>
            ))}
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
            <button className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
          </div>
          <div className={styles.resultSection}>
            {result && !loading && (
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
                    className={styles.accessBtn}
                    onClick={() => {
                      setResult(null);
                      setError("");
                      setFormData({});
                    }}
                  >
                    New Search
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
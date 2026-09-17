import React, { useState } from "react";
import styles from "./SimpleModal.module.css";
import api from "../../Utils/api";
import toast from "react-hot-toast";
import { MdClose, MdPerson, MdBusiness, MdCreditCard, MdInfo } from "react-icons/md";

const SimpleModal = ({ apiName, apiId, onClose }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    father_name: "",
    address: "",
  });
  const [formData2, setFormData2] = useState({
    name_match_type: "",
    entity_type: "",
    address: "",
  });
  const [inputNumber, setInputNumber] = useState("");
  const [inputName, setInputName] = useState("");
  const [establishmentCode, setEstablishmentCode] = useState("");
  const [uan, setUan] = useState("");
  const [code, setCode] = useState("");
  const [uanLatestV2, setUanLatestV2] = useState({
    uan: "",
    pan: "",
    mobile: "",
    dob: "",
    employer_name: "",
    employee_name: "",
  });

  const getApiEndpoint = () => {
    switch (apiId) {
      case 1:
        return `/v1/crimeCheckIndividualFull`;
      case 2:
        return `/v1/mobileToEsic`;
      case 3:
        return `/v1/estDetailsByName`;
      case 4:
        return `/v1/estDetailsByCode`;
      case 5:
        return `/v1/uanLatestV1`;
      case 6:
        return `/v1/uanHistoryV1`;
      case 7:
        return `/v1/uanLatestV2`;
      case 8:
        return `/v1/uanHistoryV2`;
      case 9:
        return `/v1/uanLatestV3`;
      case 10:
        return `/v1/uanHistoryV3`;
      case 11:
        return `/v1/mobileToUan`;
      case 12:
        return `/v1/crimeCheckEntityFull`;
      case 13:
        return `/v1/SearchContact?code=${code}&number=${inputNumber}`;
      default:
        return null;
    }
  };

  const validatePAN = (number) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(number);

  const handleSubmit = async () => {
    if (apiId === 1) {
      if (!formData?.name || !formData?.father_name || !formData?.address) {
        setError("Please fill all the fields.");
        toast.error("Please fill all the fields.");
        return;
      }
    }

    if (apiId === 2 || apiId === 11) {
      if (!inputNumber || inputNumber.length !== 10) {
        setError("Please enter a valid 10-digit mobile number.");
        toast.error("Please enter a valid 10-digit mobile number.");
        return;
      }
    }

    if (apiId === 3) {
      if (!inputName) {
        setError("Please enter a valid Establishment name.");
        toast.error("Please enter a valid Establishment name.");
        return;
      }
    }

    if (apiId === 4) {
      if (!establishmentCode) {
        setError("Please enter a valid Establishment code.");
        toast.error("Please enter a valid Establishment code.");
        return;
      }
    }

    if (apiId === 5 || apiId === 6 || apiId === 10) {
      if (!uan) {
        setError("Please enter a valid UAN.");
        toast.error("Please enter UAN no.");
        return;
      }
    }

    if (apiId === 7 || apiId === 8 || apiId === 9) {
      if (!uanLatestV2?.uan) {
        setError("Please enter a valid UAN.");
        toast.error("Please enter UAN no.");
        return;
      }
      if (uanLatestV2.pan && !validatePAN(uanLatestV2.pan)) {
        setError("Please enter a valid PAN number.");
        toast.error("Please enter a valid PAN number.");
        return;
      }
    }

    if (apiId === 12) {
      if (!inputName || !formData2?.name_match_type || !formData2?.entity_type || !formData2?.address) {
        setError("Please fill all the fields.");
        toast.error("Please fill all the fields.");
        return;
      }
    }

    if (apiId === 13) {
      if (!inputNumber || inputNumber.length !== 10) {
        setError("Please enter a valid 10-digit mobile number.");
        toast.error("Please enter a valid 10-digit mobile number.");
        return;
      }
      if (!code) {
        setError("Please enter a valid code.");
        toast.error("Please enter a valid code.");
        return;
      }
    }

    setError("");
    const endpoint = getApiEndpoint();
    if (!endpoint) {
      setError("No API endpoint found for this card!");
      return;
    }

    let payload = {};
    switch (apiId) {
      case 1:
        payload = {
          name: formData.name,
          father_name: formData.father_name,
          address: formData.address,
        };
        break;
      case 2:
        payload = {
          mobile: inputNumber,
        };
        break;
      case 3:
        payload = {
          establishment_name: inputName,
        };
        break;
      case 4:
        payload = {
          establishment_code: establishmentCode,
        };
        break;
      case 5:
        payload = {
          uan,
        };
        break;
      case 6:
        payload = {
          uan,
        };
        break;
      case 7:
      case 8:
      case 9:
        payload = {
          uan: uanLatestV2.uan,
          pan: uanLatestV2.pan || undefined,
          mobile: uanLatestV2.mobile || undefined,
          dob: uanLatestV2.dob || undefined,
          employer_name: uanLatestV2.employer_name || undefined,
          employee_name: uanLatestV2.employee_name || undefined,
        };
        break;
      case 10:
        payload = {
          uan,
        };
        break;
      case 11:
        payload = {
          mobile: inputNumber,
        };
        break;
      case 12:
        payload = {
          name: inputName,
          name_match_type: formData2.name_match_type,
          entity_type: formData2.entity_type,
          address: formData2.address,
        };
        break;
      default:
        break;
    }

    try {
      setLoading(true);
      const res = apiId === 13 ? await api.get(endpoint) : await api.post(endpoint, payload);
      setResult(res.data);

      if (res.data?.success || res.data?.status) {
        const msg = res.data?.meta?.message || "Details fetched successfully";
        toast.success(msg);
      } else {
        const err = res.data?.meta?.message || res.data?.message || "Failed to fetch details or Empty response";
        toast.error(err);
        setError(err);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Something went wrong while fetching data.";
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
      case 1: // crimeCheckIndividualFull
        const results = Array.isArray(result.result) ? result.result : [];
        if (!results.length) {
          return <div className={styles.noData}>No data available</div>;
        }
        return (
          <div className={styles.resultsContainer}>
            {results.map((record, index) => (
              <div key={index} className={styles.detailCard}>
                <div className={styles.cardHeader}>
                  <MdInfo />
                  <h3>Record #{index + 1}</h3>
                </div>
                <div className={styles.cardContent}>
                  {Object.entries(record).map(([key, value]) => (
                    value !== undefined && value !== null && value !== "" && (
                      <div key={key} className={styles.detailItem}>
                        <span className={styles.detailLabel}>
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                        </span>
                        <span className={styles.detailValue}>
                          {typeof value === 'object' ? JSON.stringify(value) : value.toString()}
                        </span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            ))}
            {renderDetailCard(<MdInfo />, "Request Details", {
              "Request ID": result.meta?.request_id,
              "Status": result.meta?.status,
              "Timestamp": result.meta?.timestamp,
            })}
          </div>
        );

      case 2:
        return (
          <div className={styles.resultsContainer}>
            <div className={styles.noData}>No data available</div>
          </div>
        );

      case 3:
      case 4:
        const data = result.result;
        return (
          <div className={styles.resultsContainer}>
            {renderDetailCard(<MdBusiness />, "Validity Status", {
              "Establishment Code": data.validity_status?.establishment_code,
              "Establishment Name": data.validity_status?.establishment_name,
              "Establishment Status": data.validity_status?.establishment_status,
              "Registration Status": data.validity_status?.registration_status,
              "Post Coverage": data.validity_status?.post_coverage,
            })}
            {renderDetailCard(<MdBusiness />, "Establishment Status", {
              "Exemption Status": data.establishment_status?.exemption_status,
              "Working Status": data.establishment_status?.working_status,
              "Coverage Section": data.establishment_status?.coverage_section,
              "Actionable Status": data.establishment_status?.actionable_status,
              "Date of Coverage": data.establishment_status?.date_of_coverage,
            })}
            {renderDetailCard(<MdBusiness />, "Establishment Details", {
              "Name": data.establishment_details?.establishment_name,
              "Code": data.establishment_details?.establishment_code,
              "PAN Status": data.establishment_details?.pan_status,
              "Section Applicable": data.establishment_details?.section_applicable,
              "Primary Business": data.establishment_details?.primary_business_activity,
              "Ownership Type": data.establishment_details?.ownership_type,
              "Date of Setup": data.establishment_details?.date_of_setup,
              "Address": data.establishment_details?.address,
              "Pincode": data.establishment_details?.pincode,
              "City": data.establishment_details?.city,
              "District": data.establishment_details?.district,
              "State": data.establishment_details?.state,
              "Country": data.establishment_details?.country,
              "EPFO Office Name": data.establishment_details?.epfo_office_name,
              "EPFO Office Address": data.establishment_details?.epfo_office_address,
              "ESIC Code": data.establishment_details?.esic_code,
              "Zone": data.establishment_details?.zone,
              "Region": data.establishment_details?.region,
            })}
            {data.director_details?.length > 0 && (
              <div className={styles.detailCard}>
                <div className={styles.cardHeader}>
                  <MdPerson />
                  <h3>Director Details</h3>
                </div>
                <div className={styles.cardContent}>
                  {data.director_details.map((dir, i) => (
                    <div key={i} className={styles.directorSection}>
                      <h4>Director #{i + 1}</h4>
                      {renderDetailCard(null, "", {
                        "Name": dir?.name,
                        "Designation": dir?.designation,
                        "Date of Birth": dir?.dob,
                        "Father's Name": dir?.f_name,
                        "Address": dir?.residential_address,
                        "Date of Position": dir?.date_of_position,
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {renderDetailCard(<MdInfo />, "Additional Information", {
              "Establishment ID": data?.additional_information?.establishment_id,
              "CIN Code": data?.additional_information?.cin_code,
              "ESIC Code": data?.additional_information?.esic_code,
              "LIN Code": data?.additional_information?.lin_code,
              "Startup Order No": data?.additional_information?.startup_order_no,
              "Startup Order Date": data?.additional_information?.startup_order_date,
              "MSME Order No": data?.additional_information?.msme_order_no,
              "MSME Order Date": data?.additional_information?.msme_order_date,
            })}
            {data.payment_details?.length > 0 && apiId === 4 && (
              <div className={styles.tableSection}>
                <h3>Payment Details</h3>
                <div className={styles.tableContainer}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>No. of Employees</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.payment_details.map((pay, i) => (
                        <tr key={i}>
                          <td>{pay?.month}</td>
                          <td>{pay?.number_of_employees}</td>
                          <td>{pay?.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className={styles.resultsContainer}>
            {renderDetailCard(<MdPerson />, "UAN Details", {
              "Name": result.result?.name,
              "UAN": result.result?.uan,
              "DoB": result.result?.dob,
              "Member Id": result.result?.member_id,
              "Date of Joining": result.result?.date_of_joining,
              "Date of Exit": result.result?.date_of_exit,
              "Company Name": result.result?.company_name,
              "Company Address": result.result?.company_address,
            })}
          </div>
        );

      case 6:
      case 10:
        const records = Object.values(result.result || {});
        return (
          <div className={styles.resultsContainer}>
            <div className={styles.tableSection}>
              <h3>UAN Employment History</h3>
              {records.length > 0 ? (
                <div className={styles.tableContainer}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>UAN</th>
                        <th>Name</th>
                        <th>Guardian Name</th>
                        <th>Establishment Name</th>
                        <th>Member ID</th>
                        <th>Date of Joining</th>
                        <th>Date of Exit</th>
                        <th>Last PF Submitted</th>
                        <th>Error Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((rec, idx) => (
                        <tr key={idx}>
                          <td>{rec?.uan}</td>
                          <td>{rec?.name}</td>
                          <td>{rec?.guardian_name}</td>
                          <td>{rec?.establishment_name}</td>
                          <td>{rec?.member_id}</td>
                          <td>{rec?.date_of_joining || "-"}</td>
                          <td>{rec?.date_of_exit || "-"}</td>
                          <td>{rec?.last_pf_submitted || "-"}</td>
                          <td className={rec.error_message ? styles.errorText : ""}>
                            {rec.error_message || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No UAN records found</p>
              )}
            </div>
          </div>
        );

      case 7:
      case 8:
      case 9:
        const d7 = result.result || {};
        return (
          <div className={styles.resultsContainer}>
            {d7.uan?.length > 0 && (
              <div className={styles.detailCard}>
                <div className={styles.cardHeader}>
                  <MdCreditCard />
                  <h3>UAN(s)</h3>
                </div>
                <div className={styles.cardContent}>
                  {d7.uan.map((u, i) => (
                    <div key={i} className={styles.detailItem}>
                      <span className={styles.detailLabel}>UAN {i + 1}:</span>
                      <span className={styles.detailValue}>{u}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {d7.summary && (
              <>
                {renderDetailCard(<MdInfo />, "Summary", {
                  "Matching UAN": d7.summary?.matching_uan,
                  "Currently Employed": d7.summary.is_employed ? "Yes" : "No",
                  "UAN Count": d7.summary?.uan_count,
                  "Date of Exit Marked": d7.summary?.date_of_exit_marked ? "Yes" : "No",
                  "Employee Name Match": d7.summary?.employee_name_match,
                  "Employer Name Match": d7.summary?.employer_name_match,
                })}
                {d7.summary.recent_employer_data && (
                  renderDetailCard(<MdBusiness />, "Recent Employer", {
                    "Establishment ID": d7.summary.recent_employer_data?.establishment_id,
                    "Establishment Name": d7.summary.recent_employer_data?.establishment_name,
                    "Member ID": d7.summary.recent_employer_data?.member_id,
                    "Date of Joining": d7.summary.recent_employer_data?.date_of_joining,
                    "Date of Exit": d7.summary.recent_employer_data?.date_of_exit,
                    "Leave Reason": d7.summary.recent_employer_data?.leave_reason,
                    "Employer Confidence Score": d7.summary.recent_employer_data?.employer_confidence_score,
                    "Matching UAN": d7.summary.recent_employer_data?.matching_uan,
                  })
                )}
              </>
            )}
            {d7.uan_details && Object.keys(d7.uan_details).map((uanKey) => {
              const uanData = d7.uan_details[uanKey];
              return (
                <div key={uanKey} className={styles.detailCard}>
                  <div className={styles.cardHeader}>
                    <MdPerson />
                    <h3>UAN Details - {uanKey}</h3>
                  </div>
                  <div className={styles.cardContent}>
                    {renderDetailCard(null, "Basic Details", {
                      "Name": uanData.basic_details?.name,
                      "Gender": uanData.basic_details?.gender,
                      "Employee Confidence Score": uanData.basic_details?.employee_confidence_score,
                      "Date of Birth": uanData.basic_details?.date_of_birth,
                      "Mobile": uanData.basic_details?.mobile,
                      "Aadhaar Verification Status": uanData.basic_details?.aadhaar_verification_status,
                    })}
                    {renderDetailCard(null, "Employment Details", {
                      "Establishment Name": uanData.employment_details?.establishment_name,
                      "Establishment ID": uanData.employment_details?.establishment_id,
                      "Member ID": uanData.employment_details?.member_id,
                      "Employee Confidence Score": uanData.employment_details?.employee_confidence_score,
                      "Date of Joining": uanData.employment_details?.date_of_joining,
                      "Date of Exit": uanData.employment_details?.date_of_exit,
                      "Leave Reason": uanData.employment_details?.leave_reason,
                    })}
                  </div>
                </div>
              );
            })}
            {d7.uan_source?.length > 0 && (
              renderDetailCard(<MdInfo />, "UAN Source", {
                "Sources": d7.uan_source.map(src => `${src.uan} - ${src.source}`).join(", "),
              })
            )}
          </div>
        );

      default:
        return (
          <div className={styles.resultsContainer}>
            {result && Object.keys(result).length > 0 ? (
              <>
                {result.meta && (
                  renderDetailCard(<MdInfo />, "Request Information", result.meta)
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
          {!result ? (
            <>
              {apiId === 1 && (
                <div className={styles.inputGroup}>
                  <div className={styles.inputSection}>
                    <label>Name</label>
                    <input
                      type="text"
                      placeholder="Enter name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={styles.input}
                      required
                    />
                  </div>
                  <div className={styles.inputSection}>
                    <label>Father's Name</label>
                    <input
                      type="text"
                      placeholder="Enter father's name"
                      value={formData.father_name}
                      onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                      className={styles.input}
                      required
                    />
                  </div>
                  <div className={styles.inputSection}>
                    <label>Address</label>
                    <input
                      type="text"
                      placeholder="Enter address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className={styles.input}
                      required
                    />
                  </div>
                </div>
              )}
              {apiId === 2 && (
                <div className={styles.inputSection}>
                  <label>Mobile Number</label>
                  <input
                    type="text"
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                    value={inputNumber}
                    onChange={(e) => setInputNumber(e.target.value)}
                    className={styles.input}
                    required
                  />
                </div>
              )}
              {apiId === 3 && (
                <div className={styles.inputSection}>
                  <label>Establishment Name</label>
                  <input
                    type="text"
                    placeholder="Enter establishment name"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    className={styles.input}
                    required
                  />
                </div>
              )}
              {apiId === 4 && (
                <div className={styles.inputSection}>
                  <label>Establishment Code</label>
                  <input
                    type="text"
                    placeholder="Enter establishment code"
                    value={establishmentCode}
                    onChange={(e) => setEstablishmentCode(e.target.value)}
                    className={styles.input}
                    required
                  />
                </div>
              )}
              {apiId === 5 && (
                <div className={styles.inputSection}>
                  <label>UAN Number</label>
                  <input
                    type="text"
                    placeholder="Enter UAN number"
                    value={uan}
                    onChange={(e) => setUan(e.target.value)}
                    className={styles.input}
                    maxLength={12}
                    required
                  />
                </div>
              )}
              {apiId === 6 && (
                <div className={styles.inputSection}>
                  <label>UAN Number</label>
                  <input
                    type="text"
                    placeholder="Enter UAN number"
                    value={uan}
                    onChange={(e) => setUan(e.target.value)}
                    className={styles.input}
                    maxLength={12}
                    required
                  />
                </div>
              )}
              {apiId === 7 && (
                <div className={styles.inputGroup}>
                  <div className={styles.inputSection}>
                    <label>UAN Number</label>
                    <input
                      type="text"
                      name="uan"
                      placeholder="Enter UAN number"
                      value={uanLatestV2?.uan || ''}
                      onChange={(e) => setUanLatestV2({ ...uanLatestV2, uan: e.target.value })}
                      className={styles.input}
                      maxLength={12}
                    />
                  </div>
                  <div className={styles.inputSection}>
                    <label>PAN Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="Enter PAN number"
                      value={uanLatestV2?.pan || ''}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setUanLatestV2({ ...uanLatestV2, pan: val });
                      }}
                      className={styles.input}
                      maxLength={10}
                    />
                  </div>
                  <div className={styles.inputSection}>
                    <label>Mobile Number (Optional)</label>
                    <input
                      type="text"
                      name="mobile"
                      placeholder="Enter mobile number"
                      value={uanLatestV2?.mobile || ''}
                      onChange={(e) => setUanLatestV2({ ...uanLatestV2, mobile: e.target.value })}
                      className={styles.input}
                      maxLength={10}
                    />
                  </div>
                  <div className={styles.inputSection}>
                    <label>Date of Birth (Optional)</label>
                    <input
                      type="date"
                      name="dob"
                      placeholder="Select date of birth"
                      value={uanLatestV2?.dob || ''}
                      onChange={(e) => setUanLatestV2({ ...uanLatestV2, dob: e.target.value })}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.inputSection}>
                    <label>Employer Name (Optional)</label>
                    <input
                      type="text"
                      name="employer_name"
                      placeholder="Enter employer name"
                      value={uanLatestV2?.employer_name || ''}
                      onChange={(e) => setUanLatestV2({ ...uanLatestV2, employer_name: e.target.value })}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.inputSection}>
                    <label>Employee Name (Optional)</label>
                    <input
                      type="text"
                      name="employee_name"
                      placeholder="Enter employee name"
                      value={uanLatestV2?.employee_name || ''}
                      onChange={(e) => setUanLatestV2({ ...uanLatestV2, employee_name: e.target.value })}
                      className={styles.input}
                    />
                  </div>
                </div>
              )}
              {apiId === 8 && (
                <div className={styles.inputGroup}>
                  <div className={styles.inputSection}>
                    <label>UAN Number</label>
                    <input
                      type="text"
                      name="uan"
                      placeholder="Enter UAN number"
                      value={uanLatestV2?.uan || ''}
                      onChange={(e) => setUanLatestV2({ ...uanLatestV2, uan: e.target.value })}
                      className={styles.input}
                      maxLength={12}
                    />
                  </div>
                  <div className={styles.inputSection}>
                    <label>PAN Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="Enter PAN number"
                      value={uanLatestV2?.pan || ''}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setUanLatestV2({ ...uanLatestV2, pan: val });
                      }}
                      className={styles.input}
                      maxLength={10}
                    />
                  </div>
                  <div className={styles.inputSection}>
                    <label>Mobile Number (Optional)</label>
                    <input
                      type="text"
                      name="mobile"
                      placeholder="Enter mobile number"
                      value={uanLatestV2?.mobile || ''}
                      onChange={(e) => setUanLatestV2({ ...uanLatestV2, mobile: e.target.value })}
                      className={styles.input}
                      maxLength={10}
                    />
                  </div>
                  <div className={styles.inputSection}>
                    <label>Date of Birth (Optional)</label>
                    <input
                      type="date"
                      name="dob"
                      placeholder="Select date of birth"
                      value={uanLatestV2?.dob || ''}
                      onChange={(e) => setUanLatestV2({ ...uanLatestV2, dob: e.target.value })}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.inputSection}>
                    <label>Employer Name (Optional)</label>
                    <input
                      type="text"
                      name="employer_name"
                      placeholder="Enter employer name"
                      value={uanLatestV2?.employer_name || ''}
                      onChange={(e) => setUanLatestV2({ ...uanLatestV2, employer_name: e.target.value })}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.inputSection}>
                    <label>Employee Name (Optional)</label>
                    <input
                      type="text"
                      name="employee_name"
                      placeholder="Enter employee name"
                      value={uanLatestV2?.employee_name || ''}
                      onChange={(e) => setUanLatestV2({ ...uanLatestV2, employee_name: e.target.value })}
                      className={styles.input}
                    />
                  </div>
                </div>
              )}
              {apiId === 9 && (
                <div className={styles.inputGroup}>
                  <div className={styles.inputSection}>
                    <label>UAN Number</label>
                    <input
                      type="text"
                      name="uan"
                      placeholder="Enter UAN number"
                      value={uanLatestV2?.uan || ''}
                      onChange={(e) => setUanLatestV2({ ...uanLatestV2, uan: e.target.value })}
                      className={styles.input}
                      maxLength={12}
                    />
                  </div>
                  <div className={styles.inputSection}>
                    <label>PAN Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="Enter PAN number"
                      value={uanLatestV2?.pan || ''}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setUanLatestV2({ ...uanLatestV2, pan: val });
                      }}
                      className={styles.input}
                      maxLength={10}
                    />
                  </div>
                  <div className={styles.inputSection}>
                    <label>Mobile Number (Optional)</label>
                    <input
                      type="text"
                      name="mobile"
                      placeholder="Enter mobile number"
                      value={uanLatestV2?.mobile || ''}
                      onChange={(e) => setUanLatestV2({ ...uanLatestV2, mobile: e.target.value })}
                      className={styles.input}
                      maxLength={10}
                    />
                  </div>
                  <div className={styles.inputSection}>
                    <label>Date of Birth (Optional)</label>
                    <input
                      type="date"
                      name="dob"
                      placeholder="Select date of birth"
                      value={uanLatestV2?.dob || ''}
                      onChange={(e) => setUanLatestV2({ ...uanLatestV2, dob: e.target.value })}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.inputSection}>
                    <label>Employer Name (Optional)</label>
                    <input
                      type="text"
                      name="employer_name"
                      placeholder="Enter employer name"
                      value={uanLatestV2?.employer_name || ''}
                      onChange={(e) => setUanLatestV2({ ...uanLatestV2, employer_name: e.target.value })}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.inputSection}>
                    <label>Employee Name (Optional)</label>
                    <input
                      type="text"
                      name="employee_name"
                      placeholder="Enter employee name"
                      value={uanLatestV2?.employee_name || ''}
                      onChange={(e) => setUanLatestV2({ ...uanLatestV2, employee_name: e.target.value })}
                      className={styles.input}
                    />
                  </div>
                </div>
              )}
              {apiId === 10 && (
                <div className={styles.inputSection}>
                  <label>UAN Number</label>
                  <input
                    type="text"
                    placeholder="Enter UAN number"
                    value={uan}
                    onChange={(e) => setUan(e.target.value)}
                    className={styles.input}
                    maxLength={12}
                    required
                  />
                </div>
              )}
              {apiId === 11 && (
                <div className={styles.inputSection}>
                  <label>Mobile Number</label>
                  <input
                    type="text"
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                    value={inputNumber}
                    onChange={(e) => setInputNumber(e.target.value)}
                    className={styles.input}
                    required
                  />
                </div>
              )}
              {apiId === 12 && (
                <div className={styles.inputGroup}>
                  <div className={styles.inputSection}>
                    <label>Name</label>
                    <input
                      type="text"
                      placeholder="Enter name"
                      value={inputName}
                      onChange={(e) => setInputName(e.target.value)}
                      className={styles.input}
                      required
                    />
                  </div>
                  <div className={styles.inputSection}>
                    <label>Name Match Type</label>
                    <input
                      type="text"
                      name="name_match_type"
                      placeholder="Enter name match type (exact/partial)"
                      value={formData2?.name_match_type}
                      onChange={(e) => setFormData2({ ...formData2, [e.target.name]: e.target.value })}
                      className={styles.input}
                      required
                    />
                  </div>
                  <div className={styles.inputSection}>
                    <label>Entity Type</label>
                    <input
                      type="text"
                      name="entity_type"
                      placeholder="Enter entity type"
                      value={formData2?.entity_type}
                      onChange={(e) => setFormData2({ ...formData2, [e.target.name]: e.target.value })}
                      className={styles.input}
                      required
                    />
                  </div>
                  <div className={styles.inputSection}>
                    <label>Address</label>
                    <input
                      type="text"
                      name="address"
                      placeholder="Enter address"
                      value={formData2?.address}
                      onChange={(e) => setFormData2({ ...formData2, [e.target.name]: e.target.value })}
                      className={styles.input}
                      required
                    />
                  </div>
                </div>
              )}
              {apiId === 13 && (
                <div className={styles.inputGroup}>
                  <div className={styles.inputSection}>
                    <label>Mobile Number</label>
                    <input
                      type="text"
                      placeholder="Enter 10-digit mobile number"
                      value={inputNumber}
                      maxLength={10}
                      onChange={(e) => setInputNumber(e.target.value)}
                      className={styles.input}
                      required
                    />
                  </div>
                  <div className={styles.inputSection}>
                    <label>Code</label>
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className={styles.input}
                      required
                    />
                  </div>
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
            </>
          ) : (
            <div className={styles.resultSection}>
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
                    setFormData({ name: "", father_name: "", address: "" });
                    setFormData2({ name_match_type: "", entity_type: "", address: "" });
                    setInputNumber("");
                    setInputName("");
                    setEstablishmentCode("");
                    setUan("");
                    setCode("");
                    setUanLatestV2({
                      uan: "",
                      pan: "",
                      mobile: "",
                      dob: "",
                      employer_name: "",
                      employee_name: "",
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
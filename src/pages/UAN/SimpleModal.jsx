import React, { useState } from "react";
import styles from "./SimpleModal.module.css";
import api from "../../Utils/api";
import toast from "react-hot-toast";
import { MdClose, MdCheckCircle, MdError, MdDownload, MdInfo } from "react-icons/md";

const SimpleModal = ({ apiName, apiId, onClose }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [inputNumber, setInputNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [inputEmail, setEmail] = useState("");
  const [dob, setDob] = useState("");

  const validatePAN = (number) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(number);

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

  const [uanLatestV2, setuanLatestV2] = useState({
    uan: "",
    pan: "",
    mobile: "",
    dob: "",
    employer_name: "",
    employee_name: ""
  })

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
        return `/v1/uanToAadhaar?uan_no=${inputNumber}&dob=${dob}`;
      case 2:
        return `/v1/uanLatestV1`;
      case 3:
        return `/v1/uanHistoryV1`;
      case 4:
        return `/v1/uanLatestV2`;
      case 5:
        return `/v1/uanHistoryV2`;
      case 6:
        return `/v1/uanLatestV3`;
      case 7:
        return `/v1/uanHistoryV3`;
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


    const validateMobile = (number) => /^\d{10}$/.test(number);
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePAN = (pan) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);

    // if (( apiId === 2 || apiId === 3 || apiId === 7) && inputNumber.length !== 12) {
    //   setError("Please enter a valid UAN number.");
    //   return;
    // }

    if ((apiId === 4 || apiId === 5 || apiId === 6) && uanLatestV2.uan.length !== 12) {
      setError("Please enter a valid UAN number.");
      return;
    }


    if (apiId === 1 && !dob) {
      setError("Please enter DOB");
      return;
    }

    let payload = {};
    switch (apiId) {

      case 2:
      case 3:
      case 7:
        payload = {
          uan: inputNumber,
        };
        break;
      case 4:
      case 5:
      case 6:
        if (uanLatestV2.pan && !validatePAN(uanLatestV2.pan)) {
          setError("Please enter a valid PAN number.");
          return;
        }
        payload = {
          uan: uanLatestV2.uan,
          pan: uanLatestV2.pan || undefined,
          mobile: uanLatestV2.mobile || undefined,
          dob: uanLatestV2.dob || undefined,
          employer_name: uanLatestV2.employer_name || undefined,
          employee_name: uanLatestV2.employee_name || undefined,
        };
        break;


      default:
        break;
    }

    console.log("before submission : ", payload);

    if (apiId === 4 || apiId === 5 || apiId === 6 || apiId === 7) {
      try {
        setLoading(true);
        console.log("current endpoint : ", endpoint)
        const res = await api.post(endpoint, payload);
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
      return;

    }

    if (apiId === 1) {
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

    } else {
      try {
        setLoading(true);
        console.log("current endpoint : ", endpoint)
        const res = await api.get(endpoint, payload);
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
                <span>RC Details</span>
              </div>
              <div className={styles.cardContent}>
                {renderGridItem("RC Id", result.result?.rcId)}
                {renderGridItem("FPS Id", result.result?.fpsId)}
                {renderGridItem("State", result.result?.state)}
                {renderGridItem("Address", result.result?.full_address)}
              </div>
            </div>
            
            {result.result?.pdfData && (
              <div className={styles.detailCard}>
                <div className={styles.cardHeader}>
                  <MdDownload size={18} />
                  <span>PDF Document</span>
                </div>
                <div className={styles.cardContent}>
                  <iframe src={result.result.pdfData} width="100%" height="500px" title="PDF Viewer" />
                  <div className={styles.actions} style={{ marginTop: '16px' }}>
                    <a href={result.result.pdfData} download className={styles.accessBtn}>
                      <MdDownload size={16} />
                      Download PDF
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className={styles.resultsContainer}>
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <MdInfo size={18} />
                <span>UAN Details</span>
              </div>
              <div className={styles.cardContent}>
                {renderGridItem("Name", result.result?.name)}
                {renderGridItem("UAN", result.result?.uan)}
                {renderGridItem("Date of Birth", result.result?.dob)}
                {renderGridItem("Member ID", result.result?.member_id)}
                {renderGridItem("Date of Joining", result.result?.date_of_joining)}
                {renderGridItem("Date of Exit", result.result?.date_of_exit)}
                {renderGridItem("Company Name", result.result?.company_name)}
                {renderGridItem("Company Address", result.result?.company_address)}
              </div>
            </div>
          </div>
        );

      case 3:
        const records = Object.values(result.result || {});

        return (
          <div className={styles.resultsContainer}>
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <MdInfo size={18} />
                <span>UAN Employment History</span>
              </div>
              <div className={styles.cardContent}>
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
                            <td style={{ color: rec.error_message ? "red" : "inherit" }}>
                              {rec.error_message || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className={styles.noData}>No UAN records found</div>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        const d7 = result.result || {};

        return (
          <div className={styles.resultsContainer}>
            {/* UAN List */}
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <MdInfo size={18} />
                <span>UAN(s)</span>
              </div>
              <div className={styles.cardContent}>
                {d7.uan?.length > 0 ? (
                  <ul>
                    {d7.uan.map((u, i) => <li key={i}>{u}</li>)}
                  </ul>
                ) : (
                  <div className={styles.noData}>No UAN found</div>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <MdInfo size={18} />
                <span>Summary</span>
              </div>
              <div className={styles.cardContent}>
                {d7.summary && (
                  <>
                    {renderGridItem("Matching UAN", d7?.summary?.matching_uan)}
                    {renderGridItem("Currently Employed", d7?.summary.is_employed ? "Yes" : "No")}
                    {renderGridItem("UAN Count", d7?.summary?.uan_count)}
                    {renderGridItem("Date of Exit Marked", d7?.summary?.date_of_exit_marked ? "Yes" : "No")}
                    {renderGridItem("Employee Name match", d7?.summary?.employee_name_match)}
                    {renderGridItem("Employer Name match", d7?.summary?.employer_name_match)}

                    {d7?.summary.recent_employer_data && (
                      <>
                        <h4>Recent Employer</h4>
                        {renderGridItem("Establishment ID", d7.summary.recent_employer_data?.establishment_id)}
                        {renderGridItem("Establishment Name", d7.summary.recent_employer_data?.establishment_name)}
                        {renderGridItem("Member ID", d7.summary.recent_employer_data?.member_id)}
                        {renderGridItem("Date of Joining", d7.summary.recent_employer_data?.date_of_joining || "-")}
                        {renderGridItem("Date of Exit", d7.summary.recent_employer_data?.date_of_exit || "-")}
                        {renderGridItem("Leave Reason", d7.summary.recent_employer_data?.leave_reason || "-")}
                        {renderGridItem("Employer Confidence Score", d7?.summary?.recent_employer_data?.employer_confidence_score || "-")}
                        {renderGridItem("Matching UAN", d7?.summary?.recent_employer_data?.matching_uan || "-")}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* UAN Details */}
            {d7.uan_details && Object.keys(d7.uan_details).map((uanKey) => {
              const uanData = d7.uan_details[uanKey];
              return (
                <div key={uanKey} className={styles.detailCard}>
                  <div className={styles.cardHeader}>
                    <MdInfo size={18} />
                    <span>UAN Details - {uanKey}</span>
                  </div>
                  <div className={styles.cardContent}>
                    <h4>Basic Details</h4>
                    {renderGridItem("Name", uanData.basic_details?.name)}
                    {renderGridItem("Gender", uanData.basic_details?.gender)}
                    {renderGridItem("Employee Confidence Score", uanData.basic_details?.employee_confidence_score)}
                    {renderGridItem("Date of Birth", uanData.basic_details?.date_of_birth)}
                    {renderGridItem("Mobile", uanData.basic_details?.mobile || "-")}
                    {renderGridItem("Aadhaar Verification Status", uanData.basic_details?.aadhaar_verification_status)}

                    <h4>Employment Details</h4>
                    {renderGridItem("Establishment Name", uanData.employment_details?.establishment_name)}
                    {renderGridItem("Establishment ID", uanData.employment_details?.establishment_id)}
                    {renderGridItem("Member ID", uanData.employment_details?.member_id)}
                    {renderGridItem("Employee Confidence Score", uanData.employment_details?.employee_confidence_score)}
                    {renderGridItem("Date of Joining", uanData.employment_details?.date_of_joining || "-")}
                    {renderGridItem("Date of Exit", uanData.employment_details?.date_of_exit || "-")}
                    {renderGridItem("Leave Reason", uanData.employment_details?.leave_reason || "-")}
                  </div>
                </div>
              );
            })}

            {/* UAN Source */}
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <MdInfo size={18} />
                <span>UAN Source</span>
              </div>
              <div className={styles.cardContent}>
                {d7.uan_source?.length > 0 ? (
                  <ul>
                    {d7.uan_source.map((src, idx) => (
                      <li key={idx}>
                        <strong>{src?.uan}</strong> — {src?.source}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className={styles.noData}>No UAN source info</div>
                )}
              </div>
            </div>
          </div>
        );

      case 5:
        const d8 = result.result || {};

        return (
          <div className={styles.resultsContainer}>
            {/* Meta Information Section */}
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <MdInfo size={18} />
                <span>Request Information</span>
              </div>
              <div className={styles.cardContent}>
                {renderGridItem("Status", result.meta?.status || "N/A")}
                {renderGridItem("Message", result.meta?.message || "N/A")}
                {renderGridItem("Timestamp", result.meta?.timestamp || "N/A")}
                {renderGridItem("Name of DOB filtering score", d8?.name_dob_filtering_score || "N/A")}
                {renderGridItem("Partial output", d8?.partial_output ? 'Yes' : 'No' || "N/A")}
              </div>
            </div>

            {/* Dynamic UAN Handling */}
            {result.result?.uan?.map((uanId) => {
              const uanData = result.result?.uan_details?.[uanId];
              const summaryData = result.result?.summary;
              const recentEmployer = summaryData?.recent_employer_data;
              const uan_details = result?.result?.uan_details[0];
              const uanKey = Object.keys(result?.result?.uan_details || {})[0];

              return (
                <div key={uanId} className={styles.detailCard}>
                  <div className={styles.cardHeader}>
                    <MdInfo size={18} />
                    <span>UAN Summary - {uanId}</span>
                  </div>
                  <div className={styles.cardContent}>
                    {renderGridItem("Is Employed", summaryData?.is_employed ? "Yes" : "No")}
                    {renderGridItem("UAN Count", summaryData?.uan_count || "N/A")}
                    {renderGridItem("Matching UAN", summaryData?.matching_uan || "N/A")}
                    {renderGridItem("Date of exit marked", summaryData?.date_of_exit_marked ? "Yes" : "No" || "N/A")}

                    {recentEmployer && (
                      <>
                        <h4>Recent Employer</h4>
                        {renderGridItem("Date of exit", recentEmployer?.date_of_exit || "N/A")}
                        {renderGridItem("Date of Joining", recentEmployer?.date_of_joining || "N/A")}
                        {renderGridItem("Employer confidence score", recentEmployer?.employer_confidence_score || "N/A")}
                        {renderGridItem("Establishment ID", recentEmployer?.establishment_id || "N/A")}
                        {renderGridItem("Establishment Name", recentEmployer?.establishment_name || "N/A")}
                        {renderGridItem("Leave reason", recentEmployer?.leave_reason || "N/A")}
                        {renderGridItem("Member ID", recentEmployer?.member_id || "N/A")}
                      </>
                    )}

                    <h4>UANs</h4>
                    {result?.result?.uan?.map((u, i) => (
                      <div key={i}>
                        {renderGridItem("UAN Number", u)}
                      </div>
                    ))}

                    <h4>Basic Details</h4>
                    {renderGridItem("Name", result?.result?.uan_details[uanKey]?.basic_details?.name || "N/A")}
                    {renderGridItem("Gender", result?.result?.uan_details[uanKey]?.basic_details?.gender || "N/A")}
                    {renderGridItem("Mobile", result?.result?.uan_details[uanKey]?.basic_details?.mobile || "N/A")}
                    {renderGridItem("Employee confidence score", result?.result?.uan_details[uanKey]?.basic_details?.employee_confidence_score || "N/A")}
                    {renderGridItem("Date of Birth", result?.result?.uan_details[uanKey]?.basic_details?.date_of_birth || "N/A")}
                    {renderGridItem("Aadhar verification status", result?.result?.uan_details[uanKey]?.basic_details?.aadhaar_verification_status || "N/A")}

                    <h4>Employment Details</h4>
                    {renderGridItem("Date of exit", result?.result?.uan_details[uanKey]?.employment_details?.date_of_exit || "N/A")}
                    {renderGridItem("Date of joining", result?.result?.uan_details[uanKey]?.employment_details?.date_of_joining || "N/A")}
                    {renderGridItem("Employer Confidence score", result?.result?.uan_details[uanKey]?.employment_details?.employer_confidence_score || "N/A")}
                    {renderGridItem("Establishment Id", result?.result?.uan_details[uanKey]?.employment_details?.establishment_id || "N/A")}
                    {renderGridItem("Leave Reason", result?.result?.uan_details[uanKey]?.employment_details?.leave_reason || "N/A")}
                    {renderGridItem("Member Id", result?.result?.uan_details[uanKey]?.employment_details?.member_id || "N/A")}

                    <h4>Employment history</h4>
                    {result?.result?.uan_details[uanKey]?.employment_history?.map((u, i) => (
                      <div key={i} style={{ marginBottom: '16px', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                        {renderGridItem("Member Id", u?.member_id)}
                        {renderGridItem("Date of Exit", u?.date_of_exit)}
                        {renderGridItem("Date of Joining", u?.date_of_joining)}
                        {renderGridItem("Employer confidence score", u?.employer_confidence_score)}
                        {renderGridItem("Employment Period in months", u?.employment_period_in_months)}
                        {renderGridItem("Establishment Id", u?.establishment_id)}
                        {renderGridItem("Establishment Name", u?.establishment_name)}
                        {renderGridItem("Leave Reason", u?.leave_reason)}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* UAN Source Section */}
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <MdInfo size={18} />
                <span>Data Source</span>
              </div>
              <div className={styles.cardContent}>
                {result.result?.uan_source?.map((source, index) => (
                  <div key={index} style={{ marginBottom: '12px' }}>
                    {renderGridItem(`Source ${index + 1}`, `${source.source || "N/A"} (UAN: ${source.uan || "N/A"})`)}
                  </div>
                ))}
                {renderGridItem("Name-DOB Score", result.result?.name_dob_filtering_score ?? "N/A")}
              </div>
            </div>
          </div>
        );

      case 6:
        const epfo_details = result?.result?.epfo_details;
        const summary = result?.result?.summary;
        const uan_details = result?.result?.uan_details;
        const uan_source = result?.result?.uan_source;
        const uanKey = Object.keys(result?.result?.uan_details || {})[0];

        return (
          <div className={styles.resultsContainer}>
            {/* Meta Information Section */}
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <MdInfo size={18} />
                <span>Request Information</span>
              </div>
              <div className={styles.cardContent}>
                {renderGridItem("Status", result.meta?.status || "Unknown")}
                {renderGridItem("Message", result.meta?.message || "No message provided")}
                {renderGridItem("Timestamp", result.meta?.timestamp)}
              </div>
            </div>

            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <MdInfo size={18} />
                <span>EPFO Details</span>
              </div>
              <div className={styles.cardContent}>
                {renderGridItem("Date of setup", epfo_details?.establishment_info?.date_of_setup)}
                {renderGridItem("Establishment Id", epfo_details?.establishment_info?.establishment_id)}
                {renderGridItem("Establishment Name", epfo_details?.establishment_info?.establishment_name || 'N/A')}
                {renderGridItem("Ownership type", epfo_details?.establishment_info?.ownership_type || 'N/A')}

                <h4>Matches</h4>
                {epfo_details?.matches?.map((match, index) => (
                  <div key={index} style={{ marginBottom: '16px', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                    {renderGridItem("Name", match?.name)}
                    {renderGridItem("Confidence", match?.confidence)}
                    <h5>EPF history</h5>
                    {renderGridItem("APR-25", match?.epf_history?.APR - 25 == "true" ? "No" : "Yes")}
                    {renderGridItem("JUN-25", match?.epf_history?.JUN - 25 == "true" ? "No" : "Yes")}
                    {renderGridItem("MAY-25", match?.epf_history?.MAY - 25 == "true" ? "No" : "Yes")}
                  </div>
                ))}

                <h4>PF Filling Details</h4>
                {epfo_details?.pf_filing_details?.map((pf, i) => (
                  <div key={i} style={{ marginBottom: '12px', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                    {renderGridItem("Wage Month", pf?.wage_month)}
                    {renderGridItem("Total Amount", pf?.total_amount)}
                    {renderGridItem("Employees Count", pf?.employees_count)}
                  </div>
                ))}
              </div>
            </div>

            {/* UAN Summary Section */}
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <MdInfo size={18} />
                <span>UAN Summary</span>
              </div>
              <div className={styles.cardContent}>
                {renderGridItem("Date of exit", summary?.date_of_exit_market ? 'Yes' : 'No')}
                {renderGridItem("Employee Name match", summary?.employee_name_match || "N/A")}
                {renderGridItem("Employer Name match", summary?.employer_name_match || "N/A")}
                {renderGridItem("Is employed", summary?.is_employed ? 'Yes' : 'No' || "N/A")}
                {renderGridItem("Matching UAN", summary?.matching_uan || "N/A")}
                {renderGridItem("UAN Count", summary?.uan_count || "N/A")}

                <h4>Recent employer data</h4>
                {renderGridItem("Date of exit", summary?.recent_employer_data?.date_of_exit || "N/A")}
                {renderGridItem("Date of Joining", summary?.recent_employer_data?.date_of_joining || "N/A")}
                {renderGridItem("Employer confidence score", summary?.recent_employer_data?.employer?.confidence_score || "N/A")}
                {renderGridItem("Establishment Id", summary?.recent_employer_data?.establishment_id || "N/A")}
                {renderGridItem("Establishment Name", summary?.recent_employer_data?.establishment_name || "N/A")}
                {renderGridItem("Leave Reason", summary?.recent_employer_data?.leave_reason || "N/A")}
                {renderGridItem("Matching UAN", summary?.recent_employer_data?.matching_uan || "N/A")}
                {renderGridItem("Member Id", summary?.recent_employer_data?.member_id || "N/A")}

                <h4>EPFO</h4>
                {renderGridItem("Has pf filling details", summary?.recent_employer_data?.epfo?.has_pf_filings_details ? 'Yes' : 'No' || "N/A")}
                {renderGridItem("Is name unique", summary?.recent_employer_data?.epfo?.is_name_unique ? 'Yes' : 'No' || "N/A")}
                {renderGridItem("Is recent", summary?.recent_employer_data?.epfo?.is_recent ? 'Yes' : 'No' || "N/A")}
              </div>
            </div>

            {/* UAN Section */}
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <MdInfo size={18} />
                <span>UAN Numbers</span>
              </div>
              <div className={styles.cardContent}>
                {result?.result?.uan?.map((u, i) => (
                  <div key={i}>
                    {renderGridItem("UAN", u)}
                  </div>
                ))}
              </div>
            </div>

            {/* Basic Details Section */}
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <MdInfo size={18} />
                <span>Personal Details</span>
              </div>
              <div className={styles.cardContent}>
                {renderGridItem("Name", result.result?.uan_details?.[uanKey]?.basic_details?.name)}
                {renderGridItem("Gender", result.result?.uan_details?.[uanKey]?.basic_details?.gender)}
                {renderGridItem("Date of Birth", result.result?.uan_details?.[uanKey]?.basic_details?.date_of_birth)}
                {renderGridItem("Mobile", result.result?.uan_details?.[uanKey]?.basic_details?.mobile || "N/A")}
                {renderGridItem("Employee Confidence Score", result.result?.uan_details?.[uanKey]?.basic_details?.employee_confidence_score || "N/A")}
                {renderGridItem("Aadhaar Status", result.result?.uan_details?.[uanKey]?.basic_details?.aadhaar_verification_status === 1 ? "Verified" : "Not Verified")}
              </div>
            </div>

            {/* Additional Personal Details */}
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <MdInfo size={18} />
                <span>Additional Information</span>
              </div>
              <div className={styles.cardContent}>
                {renderGridItem("Email", result.result?.uan_details?.[uanKey]?.additional_details?.email)}
                {renderGridItem("PAN", result.result?.uan_details?.[uanKey]?.additional_details?.pan)}
                {renderGridItem("Bank Account", result.result?.uan_details?.[uanKey]?.additional_details?.bank_acc_no)}
                {renderGridItem("Bank IFSC", result.result?.uan_details?.[uanKey]?.additional_details?.bank_ifsc)}
                {renderGridItem("Bank Branch", result.result?.uan_details?.[uanKey]?.additional_details?.bank_address)}
                {renderGridItem("Relative's Name", result.result?.uan_details?.[uanKey]?.additional_details?.relative_name)}
                {renderGridItem("Relation", result.result?.uan_details?.[uanKey]?.additional_details?.relation)}
                {renderGridItem("Aadhaar", result.result?.uan_details?.[uanKey]?.additional_details?.aadhaar || 'N/A')}
                {renderGridItem("Member Id", result.result?.uan_details?.[uanKey]?.additional_details?.member_id)}
              </div>
            </div>

            {/* EPFO Details Section */}
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <MdInfo size={18} />
                <span>Employment Details</span>
              </div>
              <div className={styles.cardContent}>
                {renderGridItem("Date of Exit", result.result?.uan_details?.[uanKey]?.employment_details?.date_of_exit)}
                {renderGridItem("Date of Joining", result.result?.uan_details?.[uanKey]?.employment_details?.date_of_joining)}
                {renderGridItem("Establishment Name", result.result?.uan_details?.[uanKey]?.employment_details?.establishment_name)}
                {renderGridItem("Establishment ID", result.result?.uan_details?.[uanKey]?.employment_details?.establishment_id)}
                {renderGridItem("Leave Reason", result.result?.uan_details?.[uanKey]?.employment_details?.leave_reason || "N/A")}
                {renderGridItem("Member ID", result.result?.uan_details?.[uanKey]?.employment_details?.member_id)}
              </div>
            </div>

            {/* Recent PF Filings */}
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <MdInfo size={18} />
                <span>Recent PF Filings</span>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.tableContainer}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Total Amount</th>
                        <th>Employees Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.result?.epfo_details?.pf_filing_details?.map((filing, index) => (
                        <tr key={index}>
                          <td>{filing.wage_month}</td>
                          <td>₹{filing.total_amount?.toLocaleString('en-IN')}</td>
                          <td>{filing.employees_count?.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* EPF Contribution History */}
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <MdInfo size={18} />
                <span>EPF Contribution History</span>
              </div>
              <div className={styles.cardContent}>
                {result.result?.epfo_details?.matches?.map((match, index) => (
                  <div key={index} className={styles.epfMatch}>
                    {renderGridItem("Name", `${match?.name} (Confidence: ${match?.confidence})`)}
                    <div className={styles.epfMonths}>
                      {Object.entries(match.epf_history || {}).map(([month, status]) => (
                        <span key={month} className={status === "true" ? styles.activeMonth : styles.inactiveMonth}>
                          {month}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className={styles.detailCard}>
            <div className={styles.cardHeader}>
              <MdInfo size={18} />
              <span>UAN Information</span>
            </div>
            <div className={styles.cardContent}>
              {renderGridItem("UAN", result?.result?.uan || "No data available")}
            </div>
          </div>
        )


      default:
        return (
          <div className={styles.detailCard}>
            <div className={styles.cardHeader}>
              <MdInfo size={18} />
              <span>Raw Response Data</span>
            </div>
            <div className={styles.cardContent}>
              <pre>{JSON.stringify(result, null, 2)}</pre>
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
                <div className={styles.inputSection}>
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className={styles.input}
                  />
                </div>
              )}

              {(apiId === 1 || apiId === 2 || apiId === 3 || apiId === 7) && (
                <div className={styles.inputSection}>
                  <label>UAN Number</label>
                  <input
                    type="tel"
                    placeholder="Enter Your UAN Number"
                    value={inputNumber}
                    onChange={(e) => setInputNumber(e.target.value)}
                    maxLength={12}
                    minLength={12}
                    className={styles.input}
                  />
                </div>
              )}

              {(apiId === 4 || apiId === 5 || apiId === 6) && (
                <div>
                  <div className={styles.inputSection}>
                    <label>UAN Number</label>
                    <input
                      type="text"
                      name="uan"
                      placeholder="UAN"
                      value={uanLatestV2?.uan || ''}
                      onChange={(e) => setuanLatestV2({ ...uanLatestV2, uan: e.target.value })}
                      className={styles.input}
                      maxLength={12}
                      minLength={12}
                    />
                  </div>
                  
                  <div className={styles.inputSection}>
                    <label>PAN Number</label>
                    <input
                      type="text"
                      placeholder="Enter Your PAN Number"
                      value={uanLatestV2?.pan || ''}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setuanLatestV2({ ...uanLatestV2, pan: val });
                      }}
                      className={styles.input}
                      maxLength={10}
                    />
                  </div>
                  
                  <div className={styles.inputSection}>
                    <label>Mobile Number</label>
                    <input
                      type="text"
                      name="mobile"
                      placeholder="Enter your mobile number"
                      value={uanLatestV2?.mobile || ''}
                      onChange={(e) => setuanLatestV2({ ...uanLatestV2, mobile: e.target.value })}
                      className={styles.input}
                      maxLength={10}
                    />
                  </div>
                  
                  <div className={styles.inputSection}>
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      name="dob"
                      placeholder="Select your date of birth"
                      value={uanLatestV2?.dob || ''}
                      onChange={(e) => setuanLatestV2({ ...uanLatestV2, dob: e.target.value })}
                      className={styles.input}
                    />
                  </div>
                  
                  <div className={styles.inputSection}>
                    <label>Employer Name</label>
                    <input
                      type="text"
                      name="employer_name"
                      placeholder="Employer Name"
                      value={uanLatestV2?.employer_name || ''}
                      onChange={(e) => setuanLatestV2({ ...uanLatestV2, employer_name: e.target.value })}
                      className={styles.input}
                    />
                  </div>
                  
                  <div className={styles.inputSection}>
                    <label>Employee Name</label>
                    <input
                      type="text"
                      name="employee_name"
                      placeholder="Employee Name"
                      value={uanLatestV2?.employee_name || ''}
                      onChange={(e) => setuanLatestV2({ ...uanLatestV2, employee_name: e.target.value })}
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
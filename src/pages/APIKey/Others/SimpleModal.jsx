
import React, { useState } from "react";
import styles from "../Aadhar/SimpleModal.module.css";
import api from "../../../Utils/api";
import toast from "react-hot-toast";
import { MdClose, MdInfo } from "react-icons/md";

const SimpleModal = ({ apiName, apiId, onClose }) => {
  const [inputNumber, setInputNumber] = useState("");
    const [formData,setFormData]=useState({})
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dob, setDob] = useState("");
  const [stateCode, setStateCode] = useState("");

  const validateRation = (number) => /^\d{12}$/.test(number);
  const validateMobile = (number) => /^\d{10}$/.test(number);

  const getApiEndpoint = () => {
    switch (apiId) {
      case 1:
        return `/v1/voterVerification?epic_no=${inputNumber}`;
      case 2:
        return `/v1/ayushmanCard?aadhaar_no=${inputNumber}&state_code=${stateCode}`;
      case 3:
        return `/v1/uanToAadhaar?uan_no=${inputNumber}&dob=${dob}`;
      case 4:
        return `/v1/mobilePrefill`;
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    if (apiId !== 4) {
      if (!validateRation(inputNumber)) {
        setError("Please enter a valid 12-digit input number.");
        toast.error("Please enter a valid 12-digit input number.");
        return;
      }
    }

    if (apiId === 4) {
      if (!validateMobile(inputNumber)) {
        setError("Please enter a valid 10-digit mobile number.");
        toast.error("Please enter a valid 10-digit mobile number.");
        return;
      }
      if (
        !inputNumber.trim() ||
        !formData.name_lookup?.toString().trim() ||
        !formData.first_name?.trim() ||
        !formData.last_name?.trim()
      ) {
        setError("All fields are required.");
        toast.error("All fields are required.");
        return;
      }
    }

    if (apiId === 2 && !stateCode) {
      setError("Please select a state.");
      toast.error("Please select a state.");
      return;
    }

    if (apiId === 3 && !dob) {
      setError("Please enter date of birth.");
      toast.error("Please enter date of birth.");
      return;
    }

    setError("");
    const endpoint = getApiEndpoint();
    if (!endpoint) {
      setError("No API endpoint found for this card!");
      toast.error("No API endpoint found for this card!");
      return;
    }

    let payload = {};
    if (apiId === 4) {
      payload = {
        name_lookup: Number(formData.name_lookup),
        first_name: formData.first_name,
        last_name: formData.last_name,
        mobile: inputNumber,
      };
    }

    try {
      setLoading(true);
      setResult(null);
      const res = apiId === 4 ? await api.post(endpoint, payload) : await api.get(endpoint);
      setResult(res.data);

      if (res.data?.success) {
        const msg = res.data?.meta?.message || "Details fetched successfully";
        toast.success(msg);
      } else {
        const err = res.data?.meta?.message || "Failed to fetch details or empty response";
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
                <h3>Voter Verification Details</h3>
              </div>
              <div className={styles.cardContent}>
                {renderDetailCard(<MdInfo />, "Voter Information", {
                  "Home State Code": result.result?.homeStateCode || "N/A",
                  "District Code": result.result?.districtCode || "N/A",
                  "RC Id": result.result?.rcId || "N/A",
                  "FPS Id": result.result?.fpsId || "N/A",
                  "Home State Name": result.result?.homeStateName || "N/A",
                  "Home Dist Name": result.result?.homeDistName || "N/A",
                  Address: result.result?.address || "N/A",
                  "Scheme Name": result.result?.schemeName || "N/A",
                })}
                {result.result?.memberDetailsList?.length > 0 && (
                  <div className={styles.tableSection}>
                    <h3>Member Details</h3>
                    <div className={styles.tableContainer}>
                      <table className={styles.dataTable}>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Member Name</th>
                            <th>Member ID</th>
                            <th>UID</th>
                            <th>Relationship Code</th>
                            <th>Relationship Name</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.result.memberDetailsList.map((member, index) => (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>{member?.memberName || "N/A"}</td>
                              <td>{member?.memberId || "N/A"}</td>
                              <td>{member?.uid || "N/A"}</td>
                              <td>{member?.relationship_code || "N/A"}</td>
                              <td>{member?.releationship_name || "N/A"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
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
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <MdInfo />
                <h3>Ayushman Card Details</h3>
              </div>
              <div className={styles.cardContent}>
                {renderDetailCard(<MdInfo />, "Ration Information", {
                  "Ration No": result.result?.ration_no || "N/A",
                })}
                {result.result?.data?.length > 0 && (
                  <div className={styles.tableSection}>
                    <h3>Family Member Details</h3>
                    <div className={styles.tableContainer}>
                      <table className={styles.dataTable}>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Sr No</th>
                            <th>Name (Local Language)</th>
                            <th>Name (English)</th>
                            <th>Father Name (Local Language)</th>
                            <th>Father Name (English)</th>
                            <th>Gender</th>
                            <th>Relation</th>
                            <th>DoB</th>
                            <th>UID No</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.result.data.map((data, index) => (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>{data?.srno || "N/A"}</td>
                              <td>{data?.Nameof_Family_Member_LL || "N/A"}</td>
                              <td>{data?.Nameof_Family_Member_EN || "N/A"}</td>
                              <td>{data?.Father_Name_LL || "N/A"}</td>
                              <td>{data?.Father_Name_EN || "N/A"}</td>
                              <td>{data?.Gender || "N/A"}</td>
                              <td>{data?.RELATION || "N/A"}</td>
                              <td>{data?.DOB || "N/A"}</td>
                              <td>{data?.UIDNo || "N/A"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 3:
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
                <h3>UAN to Aadhaar Details</h3>
              </div>
              <div className={styles.cardContent}>
                {renderDetailCard(<MdInfo />, "UAN Information", {
                  "RC Id": result.result?.rcId || "N/A",
                  "FPS Id": result.result?.fpsId || "N/A",
                  State: result.result?.state || "N/A",
                  Address: result.result?.full_address || "N/A",
                })}
              </div>
            </div>
            {result.result?.pdfData && result.result.pdfData.startsWith("data:application/pdf;base64,") ? (
              <div className={styles.pdfContainer}>
                <h3>Ration Card PDF</h3>
                <embed
                  src={result.result.pdfData}
                  type="application/pdf"
                  width="100%"
                  height="600px"
                  className={styles.pdfEmbed}
                />
                <a href={result.result.pdfData} download="ration_card.pdf" className={styles.downloadBtn}>
                  Download PDF
                </a>
              </div>
            ) : result.result?.pdfData ? (
              <div className={styles.noData}>Invalid or missing PDF data</div>
            ) : null}
          </div>
        );
      case 4:
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
                <h3>Mobile Prefill Details</h3>
              </div>
              <div className={styles.cardContent}>
                {renderDetailCard(<MdInfo />, "Personal Information", {
                  Name: result.result?.name || "N/A",
                  Age: result.result?.age || "N/A",
                  Gender: result.result?.gender || "N/A",
                  PAN: result.result?.pan || "N/A",
                  Email: result.result?.email || "N/A",
                  DoB: result.result?.dob || "N/A",
                  Score: result.result?.score || "N/A",
                })}
                {result.result?.address?.length > 0 && (
                  <div className={styles.tableSection}>
                    <h3>Address Details</h3>
                    <div className={styles.tableContainer}>
                      <table className={styles.dataTable}>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>State</th>
                            <th>First Line of Address</th>
                            <th>Second Line of Address</th>
                            <th>Third Line of Address</th>
                            <th>Postal Code</th>
                            <th>City</th>
                            <th>Country Code</th>
                            <th>Reported Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.result.address.map((item, index) => (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>{item?.state || "N/A"}</td>
                              <td>{item?.first_line_of_address || "N/A"}</td>
                              <td>{item?.second_line_of_address || "N/A"}</td>
                              <td>{item?.third_line_of_address || "N/A"}</td>
                              <td>{item?.postal_code || "N/A"}</td>
                              <td>{item?.city || "N/A"}</td>
                              <td>{item?.country_code || "N/A"}</td>
                              <td>{item?.reported_date || "N/A"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
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
        <div className={styles.modalBody}>
          {loading ? (
            <div className={styles.loaderWrapper}>
              <div className={styles.loader}></div>
              <p>Fetching data...</p>
            </div>
          ) : !result ? (
            <div className={styles.inputGroup}>
              {(apiId === 1 || apiId === 2 || apiId === 3) && (
                <div className={styles.inputSection}>
                  <label>Input Number</label>
                  <input
                    type="text"
                    placeholder="Enter 12-digit Input Number"
                    value={inputNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setInputNumber(val);
                      setError(
                        validateRation(val) || val.length === 0
                          ? ""
                          : "Invalid input format"
                      );
                    }}
                    maxLength={12}
                    className={styles.input}
                  />
                </div>
              )}
              {apiId === 2 && (
                <div className={styles.inputSection}>
                  <label>State</label>
                  <select
                    name="state"
                    id="state"
                    value={stateCode}
                    onChange={(e) => setStateCode(e.target.value)}
                    className={styles.input}
                  >
                    <option value="">Select State</option>
                    <option value="1">Jammu and Kashmir</option>
                    <option value="2">Himachal Pradesh</option>
                    <option value="3">Punjab</option>
                    <option value="4">Chandigarh</option>
                    <option value="5">Uttarakhand</option>
                    <option value="6">Haryana</option>
                    <option value="7">Delhi</option>
                    <option value="8">Rajasthan</option>
                    <option value="9">Uttar Pradesh</option>
                    <option value="10">Bihar</option>
                    <option value="11">Sikkim</option>
                    <option value="12">Arunachal Pradesh</option>
                    <option value="13">Nagaland</option>
                    <option value="14">Manipur</option>
                    <option value="15">Mizoram</option>
                    <option value="16">Tripura</option>
                    <option value="17">Meghalaya</option>
                    <option value="18">Assam</option>
                    <option value="19">West Bengal</option>
                    <option value="20">Jharkhand</option>
                    <option value="21">Odisha</option>
                    <option value="22">Chhattisgarh</option>
                    <option value="23">Madhya Pradesh</option>
                    <option value="24">Gujarat</option>
                    <option value="26">Dadra and Nagar Haveli and Daman and Diu</option>
                    <option value="27">Maharashtra</option>
                    <option value="28">Andhra Pradesh (Before Division)</option>
                    <option value="29">Karnataka</option>
                    <option value="30">Goa</option>
                    <option value="31">Lakshadweep</option>
                    <option value="32">Kerala</option>
                    <option value="33">Tamil Nadu</option>
                    <option value="34">Puducherry</option>
                    <option value="35">Andaman and Nicobar Islands</option>
                    <option value="36">Telangana</option>
                    <option value="37">Andhra Pradesh</option>
                    <option value="38">Ladakh</option>
                    <option value="97">Other Territory</option>
                    <option value="99">Centre Jurisdiction</option>
                  </select>
                </div>
              )}
              {apiId === 3 && (
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
              {apiId === 4 && (
                <div className={styles.inputSection}>
                  <label>Mobile Number</label>
                  <input
                    type="text"
                    placeholder="Enter 10-digit Mobile Number"
                    value={inputNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setInputNumber(val);
                      setError(
                        validateMobile(val) || val.length === 0
                          ? ""
                          : "Invalid mobile number format"
                      );
                    }}
                    maxLength={10}
                    className={styles.input}
                  />
                  <label>Name Lookup</label>
                  <input
                    type="number"
                    placeholder="Enter Name Lookup"
                    value={formData.name_lookup}
                    onChange={(e) => setFormData({ ...formData, name_lookup: e.target.value })}
                    className={styles.input}
                  />
                  <label>First Name</label>
                  <input
                    type="text"
                    placeholder="Enter First Name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className={styles.input}
                  />
                  <label>Last Name</label>
                  <input
                    type="text"
                    placeholder="Enter Last Name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
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
                    setDob("");
                    setStateCode("");
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

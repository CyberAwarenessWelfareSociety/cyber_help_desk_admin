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
  const [firstName, setFirstName] = useState("");
  const [code, setCode] = useState("");
  const [formData, setFormData] = useState({
    mobile: "",
    name_lookup: "",
    first_name: "",
    last_name: "",
  });

  const getApiEndpoint = () => {
    switch (apiId) {
      case 1:
        return `/v1/mobileToName`;
      case 2:
        return `/v1/mobilePrefill`;
      case 3:
        return `/v1/mobileToProfileV1`;
      case 4:
        return `/v1/mobileToProfileV2`;
      case 5:
        return `/v1/mobileAddress`;
      case 6:
        return `/v1/mobileAge`;
      case 7:
        return `/v1/mobileRevokeStatus`;
      case 8:
        return `/v1/mobileRevokeDetail`;
      case 9:
        return `/v1/mobileRevokeDate`;
      case 10:
        return `/v1/mobileRevokeDatePlus`;
      case 11:
        return `/v1/mdnLookup`;
      case 12:
        return `/v1/mobileToEsic`;
      case 13:
        return `/v1/mobileToUan`;
      case 14:
        return `/v1/mobileDataV1?mobile=${inputNumber}`;
      case 15:
        return `/v1/mobileToPan_d1?mobile_number=${inputNumber}`;
      case 16:
        return `/v1/mobileToDlDetails_d1?mobile_number=${inputNumber}`;
      case 17:
        return `/v1/mobileToUanList_d1?mobile_number=${inputNumber}`;
      case 18:
        return `/v1/infocheck?query=${inputNumber}`;
      case 19:
        return `/v1/SearchContact?code=${code}&number=${inputNumber}`;
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

    if (apiId === 1 || apiId === 2) {
      if (!inputNumber.trim()) {
        setError("All fields are required.");
        toast.error("All fields are required.");
        return;
      }
    }

    const validateMobile = (number) => /^\d{10}$/.test(number);

    if (apiId !== 0 && !validateMobile(inputNumber)) {
      setError("Please enter a valid 10-digit mobile number.");
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    // if (apiId === 4 && !firstName.trim()) {
    //   setError("Please enter a valid name.");
    //   toast.error("Please enter a valid name.");
    //   return;
    // }

    if (apiId === 19 && !code.trim()) {
      setError("Please enter a valid code.");
      toast.error("Please enter a valid code.");
      return;
    }

    let payload = {};
    switch (apiId) {
      case 1:
      case 2:
        payload = {
          name_lookup: Number(formData.name_lookup),
          first_name: formData.first_name,
          last_name: formData.last_name,
          mobile: inputNumber,
        };
        break;
      case 3:
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
      case 10:
      case 11:
      case 12:
      case 13:
        payload = {
          mobile: inputNumber,
        };
        break;
      case 4:
        payload = {};
        if (inputNumber) {
          payload.mobile = inputNumber;
        }
        if (firstName) {
          payload.name = firstName;
        }
        break;
      case 19:
        payload = {
          code: code,
          number: inputNumber,
        };
        break;
      default:
        break;
    }

    try {
      setLoading(true);
      const res = await api.post(endpoint, payload);
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
          <div className={styles.resultGrid}>
            <section className={styles.metaSection}>
              <h3>Request Information</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Status:</label>
                  <span>
                    {result.meta?.status
                      ? result.meta.status.charAt(0).toUpperCase() +
                        result.meta.status.slice(1)
                      : "N/A"}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <label>Message:</label>
                  <span>{result.meta?.message || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Timestamp:</label>
                  <span>{result.meta?.timestamp || "N/A"}</span>
                </div>
              </div>
            </section>
            <section className={styles.resultSection}>
              <h3>Name Details</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Full Name:</label>
                  <span>{result.result?.name || "N/A"}</span>
                </div>
              </div>
            </section>
          </div>
        );
      case 2:
        return (
          <div className={styles.resultGrid}>
            <section className={styles.metaSection}>
              <h3>Request Information</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Status:</label>
                  <span>
                    {result.meta?.status
                      ? result.meta.status.charAt(0).toUpperCase() +
                        result.meta.status.slice(1)
                      : "N/A"}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <label>Message:</label>
                  <span>{result.meta?.message || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Timestamp:</label>
                  <span>{result.meta?.timestamp || "N/A"}</span>
                </div>
              </div>
            </section>
            <section className={styles.resultSection}>
              <h3>Profile Details</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Full Name:</label>
                  <span>{result.result?.name || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Age:</label>
                  <span>{result.result?.age || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Date of Birth:</label>
                  <span>{result.result?.dob || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Gender:</label>
                  <span>{result.result?.gender || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>PAN:</label>
                  <span>{result.result?.pan || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Email:</label>
                  <span>{result.result?.email || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Score:</label>
                  <span>{result.result?.score || "N/A"}</span>
                </div>
              </div>
              <h3>Address Details</h3>
              {result.result?.address?.length > 0 ? (
                <div className={styles.tableContainer}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Sr.No</th>
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
              ) : (
                <p className={styles.noData}>
                  No address information available
                </p>
              )}
            </section>
          </div>
        );
      case 3:
        const details = result?.result?.details || {};
        return (
          <div className={styles.resultGrid}>
            <section className={styles.metaSection}>
              <h3>Request Information</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Status:</label>
                  <span>
                    {result.meta?.status
                      ? result.meta.status.charAt(0).toUpperCase() +
                        result.meta.status.slice(1)
                      : "N/A"}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <label>Message:</label>
                  <span>{result.meta?.message || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Timestamp:</label>
                  <span>{result.meta?.timestamp || "N/A"}</span>
                </div>
              </div>
            </section>
            <section className={styles.resultSection}>
              <h3>Profile Details</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Mobile Number:</label>
                  <span>{result.result?.mobile || "N/A"}</span>
                </div>
              </div>
              <h3>Personal Info</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Full Name:</label>
                  <span>{details.personal_info?.full_name || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Age:</label>
                  <span>{details.personal_info?.age || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Date of Birth:</label>
                  <span>{details.personal_info?.dob || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Gender:</label>
                  <span>{details.personal_info?.gender || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Occupation:</label>
                  <span>{details.personal_info?.occupation || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Total Income:</label>
                  <span>{details.personal_info?.total_income || "N/A"}</span>
                </div>
              </div>
              <h3>Phone Info</h3>
              {details.phone_info?.length > 0 ? (
                <div className={styles.tableContainer}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Sr.No</th>
                        <th>Number</th>
                        <th>Type Code</th>
                        <th>Reported Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.phone_info.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item?.number || "N/A"}</td>
                          <td>{item?.type_code || "N/A"}</td>
                          <td>{item?.reported_date || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className={styles.noData}>No phone information available</p>
              )}
              <h3>Email Info</h3>
              {details.email_info?.length > 0 ? (
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
                      {details.email_info.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item?.email_address || "N/A"}</td>
                          <td>{item?.reported_date || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className={styles.noData}>No email information available</p>
              )}
              <h3>Address Info</h3>
              {details.address_info?.length > 0 ? (
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
                      {details.address_info.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item?.address || "N/A"}</td>
                          <td>{item?.state || "N/A"}</td>
                          <td>{item?.postal || "N/A"}</td>
                          <td>{item?.type || "N/A"}</td>
                          <td>{item?.reported_date || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className={styles.noData}>
                  No address information available
                </p>
              )}
              <h3>Identity Info</h3>
              <div className={styles.infoGrid}>
                {details.identity_info?.pan_number?.length > 0 ? (
                  details.identity_info.pan_number.map((item, index) => (
                    <div key={index} className={styles.infoItem}>
                      <label>PAN Number:</label>
                      <span>{item?.id_number || "N/A"}</span>
                    </div>
                  ))
                ) : (
                  <p className={styles.noData}>No PAN number available</p>
                )}
                {details.identity_info?.aadhaar_number?.length > 0 ? (
                  details.identity_info.aadhaar_number.map((item, index) => (
                    <div key={index} className={styles.infoItem}>
                      <label>Aadhaar Number:</label>
                      <span>{item?.aadhaar_number || "N/A"}</span>
                    </div>
                  ))
                ) : (
                  <p className={styles.noData}>No Aadhaar number available</p>
                )}
                {details.identity_info?.driving_license?.length > 0 ? (
                  details.identity_info.driving_license.map((item, index) => (
                    <div key={index} className={styles.infoItem}>
                      <label>Driving License:</label>
                      <span>{item?.driving_license || "N/A"}</span>
                    </div>
                  ))
                ) : (
                  <p className={styles.noData}>No driving license available</p>
                )}
                {details.identity_info?.voter_id?.length > 0 ? (
                  details.identity_info.voter_id.map((item, index) => (
                    <div key={index} className={styles.infoItem}>
                      <label>Voter ID:</label>
                      <span>{item?.voter_id || "N/A"}</span>
                    </div>
                  ))
                ) : (
                  <p className={styles.noData}>No voter ID available</p>
                )}
                {details.identity_info?.ration_card?.length > 0 ? (
                  details.identity_info.ration_card.map((item, index) => (
                    <div key={index} className={styles.infoItem}>
                      <label>Ration Card:</label>
                      <span>{item?.ration_number || "N/A"}</span>
                    </div>
                  ))
                ) : (
                  <p className={styles.noData}>No ration card available</p>
                )}
                {details.identity_info?.other_id?.length > 0 ? (
                  details.identity_info.other_id.map((item, index) => (
                    <div key={index} className={styles.infoItem}>
                      <label>Other ID:</label>
                      <span>{item?.id_number || "N/A"}</span>
                    </div>
                  ))
                ) : (
                  <p className={styles.noData}>No other ID available</p>
                )}
              </div>
            </section>
          </div>
        );
      case 4:
        return (
          <div className={styles.resultGrid}>
            <section className={styles.metaSection}>
              <h3>Request Information</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Status:</label>
                  <span>
                    {result.meta?.status
                      ? result.meta.status.charAt(0).toUpperCase() +
                        result.meta.status.slice(1)
                      : "N/A"}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <label>Message:</label>
                  <span>{result.meta?.message || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Timestamp:</label>
                  <span>{result.meta?.timestamp || "N/A"}</span>
                </div>
              </div>
            </section>
            <section className={styles.resultSection}>
              <h3>Profile Details</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Name:</label>
                  <span>{result.result?.name || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Mobile Number:</label>
                  <span>{result.result?.mobile || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Reference ID:</label>
                  <span>{result.result?.reference || "N/A"}</span>
                </div>
              </div>
              <h3>Personal Info</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Full Name:</label>
                  <span>
                    {result.result?.personal_info?.full_name || "N/A"}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <label>Age:</label>
                  <span>{result.result?.personal_info?.age || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Date of Birth:</label>
                  <span>{result.result?.personal_info?.dob || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Gender:</label>
                  <span>{result.result?.personal_info?.gender || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Occupation:</label>
                  <span>
                    {result.result?.personal_info?.occupation || "N/A"}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <label>Total Income:</label>
                  <span>
                    {result.result?.personal_info?.total_income || "N/A"}
                  </span>
                </div>
              </div>
              <h3>Phone Info</h3>
              {result.result?.phone_info?.length > 0 ? (
                <div className={styles.tableContainer}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Sr.No</th>
                        <th>Number</th>
                        <th>Type Code</th>
                        <th>Reported Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.result.phone_info.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item?.number || "N/A"}</td>
                          <td>{item?.type_code || "N/A"}</td>
                          <td>{item?.reported_date || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className={styles.noData}>No phone information available</p>
              )}
              <h3>Email Info</h3>
              {result.result?.email_info?.length > 0 ? (
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
                      {result.result.email_info.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item?.email_address || "N/A"}</td>
                          <td>{item?.reported_date || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className={styles.noData}>No email information available</p>
              )}
              <h3>Address Info</h3>
              {result.result?.address_info?.length > 0 ? (
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
                      {result.result.address_info.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item?.address || "N/A"}</td>
                          <td>{item?.state || "N/A"}</td>
                          <td>{item?.postal || "N/A"}</td>
                          <td>{item?.type || "N/A"}</td>
                          <td>{item?.reported_date || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className={styles.noData}>
                  No address information available
                </p>
              )}
              <h3>Identity Info</h3>
              <div className={styles.infoGrid}>
                {result.result?.identity_info?.pan_number?.length > 0 ? (
                  result.result.identity_info.pan_number.map((item, index) => (
                    <div key={index} className={styles.infoItem}>
                      <label>PAN Number:</label>
                      <span>{item?.id_number || "N/A"}</span>
                    </div>
                  ))
                ) : (
                  <p className={styles.noData}>No PAN number available</p>
                )}
                {result.result?.identity_info?.aadhaar_number?.length > 0 ? (
                  result.result.identity_info.aadhaar_number.map(
                    (item, index) => (
                      <div key={index} className={styles.infoItem}>
                        <label>Aadhaar Number:</label>
                        <span>{item?.aadhaar_number || "N/A"}</span>
                      </div>
                    )
                  )
                ) : (
                  <p className={styles.noData}>No Aadhaar number available</p>
                )}
                {result.result?.identity_info?.driving_license?.length > 0 ? (
                  result.result.identity_info.driving_license.map(
                    (item, index) => (
                      <div key={index} className={styles.infoItem}>
                        <label>Driving License:</label>
                        <span>{item?.driving_license || "N/A"}</span>
                      </div>
                    )
                  )
                ) : (
                  <p className={styles.noData}>No driving license available</p>
                )}
                {result.result?.identity_info?.voter_id?.length > 0 ? (
                  result.result.identity_info.voter_id.map((item, index) => (
                    <div key={index} className={styles.infoItem}>
                      <label>Voter ID:</label>
                      <span>{item?.voter_id || "N/A"}</span>
                    </div>
                  ))
                ) : (
                  <p className={styles.noData}>No voter ID available</p>
                )}
                {result.result?.identity_info?.ration_card?.length > 0 ? (
                  result.result.identity_info.ration_card.map((item, index) => (
                    <div key={index} className={styles.infoItem}>
                      <label>Ration Card:</label>
                      <span>{item?.ration_number || "N/A"}</span>
                    </div>
                  ))
                ) : (
                  <p className={styles.noData}>No ration card available</p>
                )}
                {result.result?.identity_info?.other_id?.length > 0 ? (
                  result.result.identity_info.other_id.map((item, index) => (
                    <div key={index} className={styles.infoItem}>
                      <label>Other ID:</label>
                      <span>{item?.id_number || "N/A"}</span>
                    </div>
                  ))
                ) : (
                  <p className={styles.noData}>No other ID available</p>
                )}
                {result.result?.identity_info?.passport_number?.length > 0 ? (
                  result.result.identity_info.passport_number.map(
                    (item, index) => (
                      <div key={index} className={styles.infoItem}>
                        <label>Passport Number:</label>
                        <span>{item?.id_number || "N/A"}</span>
                      </div>
                    )
                  )
                ) : (
                  <p className={styles.noData}>No passport number available</p>
                )}
              </div>
            </section>
          </div>
        );
      case 5:
        return (
          <div className={styles.resultGrid}>
            <section className={styles.metaSection}>
              <h3>Request Information</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Status:</label>
                  <span>
                    {result.meta?.status
                      ? result.meta.status.charAt(0).toUpperCase() +
                        result.meta.status.slice(1)
                      : "N/A"}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <label>Message:</label>
                  <span>{result.meta?.message || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Timestamp:</label>
                  <span>{result.meta?.timestamp || "N/A"}</span>
                </div>
              </div>
            </section>
            <section className={styles.resultSection}>
              <h3>Address Details</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Address Count:</label>
                  <span>{result.result?.address_count || "N/A"}</span>
                </div>
              </div>
              {result.result?.addresses?.length > 0 ? (
                <div className={styles.tableContainer}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Sr.No</th>
                        <th>Category</th>
                        <th>Address</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.result.addresses.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item?.category || "N/A"}</td>
                          <td>{item?.address || "N/A"}</td>
                          <td>{item?.date || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className={styles.noData}>No addresses found</p>
              )}
            </section>
          </div>
        );

      case 6:
        return (
          <div className={styles.resultGrid}>
            <section className={styles.metaSection}>
              <h3>Request Information</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Status:</label>
                  <span>
                    {result.meta?.status
                      ? result.meta.status.charAt(0).toUpperCase() +
                        result.meta.status.slice(1)
                      : "N/A"}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <label>Message:</label>
                  <span>{result.meta?.message || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Timestamp:</label>
                  <span>{result.meta?.timestamp || "N/A"}</span>
                </div>
              </div>
            </section>
            <section className={styles.resultSection}>
              <h3>Mobile Age Details</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Mobile Number:</label>
                  <span>{result.result?.mobileno || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Response Code:</label>
                  <span>{result.result?.responseCode || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>AON Bucket:</label>
                  <span>{result.result?.aonBucket || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Number Valid:</label>
                  <span>{result.result?.numberValid || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Number Active:</label>
                  <span>{result.result?.numberActive || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Country:</label>
                  <span>{result.result?.country || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Telco Name:</label>
                  <span>{result.result?.telcoName || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Ported:</label>
                  <span>{result.result?.ported || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Ported Network:</label>
                  <span>{result.result?.portedNetwork || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Roaming:</label>
                  <span>{result.result?.roaming || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Number in Radio Range:</label>
                  <span>{result.result?.isNumberInRadioRange || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Ported Country:</label>
                  <span>{result.result?.pcountry || "N/A"}</span>
                </div>
              </div>
            </section>
          </div>
        );
        return (
          <div className={styles.resultGrid}>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label>Aon Bucket:</label>
                <span>{result?.aonBucket || "N/A"}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Telco Name:</label>
                <span>{result?.telcoName || "N/A"}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Country:</label>
                <span>{result?.country || "N/A"}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Is Number in Radio Range:</label>
                <span>{result?.isNumberInRadioRange || "N/A"}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Mobile No:</label>
                <span>{result?.mobileno || "N/A"}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Number Active:</label>
                <span>{result?.numberActive || "N/A"}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Number Valid:</label>
                <span>{result?.numberValid || "N/A"}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Ported:</label>
                <span>{result?.pcountry || "N/A"}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Is Ported:</label>
                <span>{result?.ported || "N/A"}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Ported Network:</label>
                <span>{result?.portedNetwork || "N/A"}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Roaming:</label>
                <span>{result?.roaming || "N/A"}</span>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className={styles.resultGrid}>
            <section className={styles.metaSection}>
              <h3>Request Information</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Status:</label>
                  <span>
                    {result.meta?.status
                      ? result.meta.status.charAt(0).toUpperCase() +
                        result.meta.status.slice(1)
                      : "N/A"}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <label>Message:</label>
                  <span>{result.meta?.message || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Timestamp:</label>
                  <span>{result.meta?.timestamp || "N/A"}</span>
                </div>
              </div>
            </section>
            <section className={styles.resultSection}>
              <h3>Revoke Status Details</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Mobile Number:</label>
                  <span>{result.result?.mobileno || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Revoked:</label>
                  <span>{result.result?.revoked || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Revoke Date:</label>
                  <span>{result.result?.date || "N/A"}</span>
                </div>
              </div>
            </section>
          </div>
        );
      case 8:
        return (
          <div className={styles.resultGrid}>
            <section className={styles.metaSection}>
              <h3>Request Information</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Status:</label>
                  <span>
                    {result.meta?.status
                      ? result.meta.status.charAt(0).toUpperCase() +
                        result.meta.status.slice(1)
                      : "N/A"}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <label>Message:</label>
                  <span>{result.meta?.message || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Timestamp:</label>
                  <span>{result.meta?.timestamp || "N/A"}</span>
                </div>
              </div>
            </section>
            <section className={styles.resultSection}>
              <h3>Revoke Detail</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Minimum Days:</label>
                  <span>{result.result?.minDays || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Maximum Days:</label>
                  <span>{result.result?.maxDays || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Revoke Status:</label>
                  <span>{result.result?.revokeStatus || "N/A"}</span>
                </div>
              </div>
            </section>
          </div>
        );
      case 9:
      case 10:
      case 11:
        return <div className={styles.resultGrid}></div>;

      case 12:
        return (
          <div className={styles.resultGrid}>
            <p className={styles.noData}>No data available</p>
          </div>
        );

      case 13:
        return (
          <div className={styles.resultGrid}>
            <section className={styles.metaSection}>
              <h3>Request Information</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Status:</label>
                  <span>
                    {result.meta?.status
                      ? result.meta.status.charAt(0).toUpperCase() +
                        result.meta.status.slice(1)
                      : "N/A"}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <label>Message:</label>
                  <span>{result.meta?.message || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Timestamp:</label>
                  <span>{result.meta?.timestamp || "N/A"}</span>
                </div>
              </div>
            </section>
            <section className={styles.uanResult}>
              <h3>UAN Found</h3>
              <div className={styles.uanCard}>
                <p className={styles.uanLabel}>Universal Account Number</p>
                <p className={styles.uanValue}>{result.result?.uan || "N/A"}</p>
              </div>
            </section>
          </div>
        );

      case 14:
        return (
          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
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

      case 15:
        return (
          <div className={styles.resultGrid}>
            <section className={styles.metaSection}>
              <h3>Request Information</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Status:</label>
                  <span>
                    {result.meta?.status
                      ? result.meta.status.charAt(0).toUpperCase() +
                        result.meta.status.slice(1)
                      : "N/A"}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <label>Message:</label>
                  <span>{result.meta?.message || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Timestamp:</label>
                  <span>{result.meta?.timestamp || "N/A"}</span>
                </div>
              </div>
            </section>
            <section className={styles.resultSection}>
              <h3>PAN Details</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>PAN Number:</label>
                  <span>{result.result?.pan_number || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Full Name:</label>
                  <span>{result.result?.full_name || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Masked Aadhaar:</label>
                  <span>{result.result?.masked_aadhaar || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Gender:</label>
                  <span>{result.result?.gender || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Date of Birth:</label>
                  <span>{result.result?.dob || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Aadhaar Linked:</label>
                  <span>{result.result?.aadhaar_linked ? "Yes" : "No"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>DOB Verified:</label>
                  <span>{result.result?.dob_verified ? "Yes" : "No"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>DOB Check:</label>
                  <span>{result.result?.dob_check ? "Yes" : "No"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Category:</label>
                  <span>{result.result?.category || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Less Info:</label>
                  <span>{result.result?.less_info ? "Yes" : "No"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Email:</label>
                  <span>{result.result?.email || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Phone Number:</label>
                  <span>{result.result?.phone_number || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Input DOB:</label>
                  <span>{result.result?.input_dob || "N/A"}</span>
                </div>
              </div>
              <h3>Full Name Split</h3>
              <div className={styles.infoGrid}>
                {result.result?.full_name_split?.map((item, index) => (
                  <div key={index} className={styles.infoItem}>
                    <label>Part {index + 1}:</label>
                    <span>{item || "N/A"}</span>
                  </div>
                )) || (
                  <p className={styles.noData}>No name split data available</p>
                )}
              </div>
              <h3>Address Details</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Line 1:</label>
                  <span>{result.result?.address?.line_1 || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Line 2:</label>
                  <span>{result.result?.address?.line_2 || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Street Name:</label>
                  <span>{result.result?.address?.street_name || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Zip Code:</label>
                  <span>{result.result?.address?.zip || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>City:</label>
                  <span>{result.result?.address?.city || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>State:</label>
                  <span>{result.result?.address?.state || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Country:</label>
                  <span>{result.result?.address?.country || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Full Address:</label>
                  <span>{result.result?.address?.full || "N/A"}</span>
                </div>
              </div>
            </section>
          </div>
        );
      case 16:
        return (
          <div className={styles.resultGrid}>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label>Status:</label>
                <span>{result?.status || "N/A"}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Message:</label>
                <span>
                  {Object.keys(result?.data || {}).length === 0
                    ? "N/A"
                    : result?.data?.error || "N/A"}
                </span>
              </div>
            </div>
          </div>
        );

      case 17:
        return (
          <div className={styles.resultGrid}>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label>Message:</label>
                <span>{result?.message || "N/A"}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Sub Code:</label>
                <span>{result?.sub_code || "N/A"}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Timestamp:</label>
                <span>{result?.timestamp || "N/A"}</span>
              </div>
            </div>
          </div>
        );

      case 18:
        return (
          <div className={styles.resultGrid}>
            <section className={styles.resultSection}>
              <h3>Info Check Details</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Found:</label>
                  <span>{result?.found || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Quota:</label>
                  <span>{result?.quota || "N/A"}</span>
                </div>
              </div>
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
                          <td>{item.source?.name || "N/A"}</td>
                          <td>{item.source?.breach_date || "N/A"}</td>
                          <td>{item.source?.unverified || "N/A"}</td>
                          <td>{item.source?.passwordless || "N/A"}</td>
                          <td>{item.source?.compilation || "N/A"}</td>
                          <td>{item?.country || "N/A"}</td>
                          <td>{item?.name || "N/A"}</td>
                          <td>{item?.phone || "N/A"}</td>
                          <td>{item?.email || "N/A"}</td>
                          <td>{item?.fields?.join(", ") || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className={styles.noData}>No result data available</p>
              )}
            </section>
          </div>
        );
      case 19:
        return (
          <div className={styles.resultGrid}>
            <section className={styles.metaSection}>
              <h3>Facebook Information</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Full Name:</label>
                  <span>{result?.data?.fullName || "N/A"}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Facebook ID:</label>
                  <span>{result?.data?.facebookID?.fbId || "N/A"}</span>
                </div>
              </div>
              <h3>Image Information</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Image URL:</label>
                  <span>{result?.data?.images[0]?.url || "N/A"}</span>
                </div>
              </div>
              <h3>Other Names</h3>
              {result?.data?.otherNames?.map((name, index) => (
                <div key={index} className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <label>Type {index + 1}:</label>
                    <span>{name?.type || "N/A"}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Name {index + 1}:</label>
                    <span>{name?.name || "N/A"}</span>
                  </div>
                </div>
              ))}
            </section>
          </div>
        );

      default:
        return (
          <div className={styles.resultGrid}>
            <pre className={styles.jsonPre}>
              {JSON.stringify(result, null, 2)}
            </pre>
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
            {(apiId === 1 || apiId === 2) && (
              <div className={styles.inputGroup}>
                <div className={styles.inputSection}>
                  <label>Mobile Number</label>
                  <input
                    type="text"
                    placeholder="Enter 10-digit Mobile Number"
                    value={inputNumber}
                    onChange={(e) => setInputNumber(e.target.value)}
                    maxLength={10}
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.inputSection}>
                  <label>Name Lookup</label>
                  <input
                    type="number"
                    placeholder="Enter Name Lookup"
                    value={formData.name_lookup}
                    onChange={(e) =>
                      setFormData({ ...formData, name_lookup: e.target.value })
                    }
                    className={styles.input}
                  />
                </div>
                <div className={styles.inputSection}>
                  <label>First Name</label>
                  <input
                    type="text"
                    placeholder="Enter First Name"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    className={styles.input}
                  />
                </div>
                <div className={styles.inputSection}>
                  <label>Last Name</label>
                  <input
                    type="text"
                    placeholder="Enter Last Name"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    className={styles.input}
                  />
                </div>
              </div>
            )}
            {(apiId === 3 ||
              apiId === 5 ||
              apiId === 6 ||
              apiId === 7 ||
              apiId === 8 ||
              apiId === 9 ||
              apiId === 10 ||
              apiId === 11 ||
              apiId === 12 ||
              apiId === 13 ||
              apiId === 14 ||
              apiId === 15 ||
              apiId === 16 ||
              apiId === 17 ||
              apiId === 18) && (
              <div className={styles.inputGroup}>
                <div className={styles.inputSection}>
                  <label>Mobile Number</label>
                  <input
                    type="text"
                    placeholder="Enter 10-digit Mobile Number"
                    value={inputNumber}
                    onChange={(e) => setInputNumber(e.target.value)}
                    maxLength={10}
                    className={styles.input}
                    required
                  />
                </div>
              </div>
            )}
            {apiId === 4 && (
              <div className={styles.inputGroup}>
                <div className={styles.inputSection}>
                  <label>Mobile Number</label>
                  <input
                    type="text"
                    placeholder="Enter 10-digit Mobile Number"
                    value={inputNumber}
                    onChange={(e) => setInputNumber(e.target.value)}
                    maxLength={10}
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.inputSection}>
                  <label>Name</label>
                  <input
                    type="text"
                    placeholder="Enter Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={styles.input}
                    required
                  />
                </div>
              </div>
            )}
            {apiId === 19 && (
              <div className={styles.inputGroup}>
                <div className={styles.inputSection}>
                  <label>Mobile Number</label>
                  <input
                    type="text"
                    placeholder="Enter 10-digit Mobile Number"
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
                    placeholder="Enter Code"
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
              <MdInfo />{" "}
              {result.meta?.message || "Details fetched successfully"}
            </p>
            <div className={styles.resultBox}>{renderResultSection()}</div>
            <div className={styles.actions}>
              <button
                className={styles.accessBtn}
                onClick={() => {
                  setResult(null);
                  setError("");
                  setInputNumber("");
                  setFirstName("");
                  setCode("");
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
  );
};

export default SimpleModal;

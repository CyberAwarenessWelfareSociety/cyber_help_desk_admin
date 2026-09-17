import React, { useState } from "react";
import styles from "../Aadhar/SimpleModal.module.css";
import api from "../../../Utils/api";
import toast from "react-hot-toast";
import { MdClose, MdPerson, MdFamilyRestroom, MdDownload, MdPictureAsPdf } from "react-icons/md";

const SimpleModal = ({ apiName, apiId, onClose }) => {
  const [rationNumber, setRationNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [type, setType] = useState(null);

  const validateRation = (number) => /^\d{12}$/.test(number);

  const getApiEndpoint = () => {
    switch (apiId) {
      case 1: return `/v1/rationBasic?ration_no=${rationNumber}`;
      case 2: return `/v1/upRationFull?ration_no=${rationNumber}`;
      case 3: return `/v1/rationPdf?ration_no=${rationNumber}&type=${type}`;
      default: return null;
    }
  };

  const handleSubmit = async () => {
    if (!validateRation(rationNumber)) {
      setError("Please enter a valid Ration number.");
      return;
    }
    if (apiId === 3 && !type){
      setError("Please select a type");
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
      const res = await api.get(endpoint);
      setResult(res.data);
      console.log("response of api", res.data);

      if (res.data?.success === true) {
        const msg = res.data?.meta?.message || "Details fetched successfully";
        toast.success(msg);
      }
      if (res.data?.success === false) {
        const err = res.data?.meta?.message || "Failed to fetch details or Empty response";
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
      case 1:
        return (
          <div className={styles.resultsContainer}>
            {renderDetailCard(<MdPerson />, "Ration Basic Details", {
              "Home State Code": result.result?.homeStateCode,
              "District Code": result.result?.districtCode,
              "RC Id": result.result?.rcId,
              "FPS Id": result.result?.fpsId,
              "Home State Name": result.result?.homeStateName,
              "Home Dist Name": result.result?.homeDistName,
              "Address": result.result?.address,
              "Scheme Name": result.result?.schemeName
            })}

            {result?.result?.memberDetailsList?.map((member, index) => (
              <div key={index} className={styles.detailCard}>
                <div className={styles.cardHeader}>
                  <MdFamilyRestroom />
                  <h3>Family Member #{index + 1}</h3>
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Member Name:</span>
                    <span className={styles.detailValue}>{member?.memberName || "-"}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Member ID:</span>
                    <span className={styles.detailValue}>{member?.memberId || "-"}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>UID:</span>
                    <span className={styles.detailValue}>{member?.uid || "-"}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Relationship Code:</span>
                    <span className={styles.detailValue}>{member?.relationship_code || "-"}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Relationship Name:</span>
                    <span className={styles.detailValue}>{member?.releationship_name || "-"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 2:
        return (
          <div className={styles.resultsContainer}>
            {renderDetailCard(<MdPerson />, "Ration Details", {
              "Ration No": result.result?.ration_no
            })}

            {result?.result?.data?.map((data, index) => (
              <div key={index} className={styles.detailCard}>
                <div className={styles.cardHeader}>
                  <MdFamilyRestroom />
                  <h3>Family Member #{index + 1}</h3>
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Sr No:</span>
                    <span className={styles.detailValue}>{data?.srno || "-"}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Name (LL):</span>
                    <span className={styles.detailValue}>{data?.Nameof_Family_Member_LL || "-"}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Name (EN):</span>
                    <span className={styles.detailValue}>{data?.Nameof_Family_Member_EN || "-"}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Father Name (LL):</span>
                    <span className={styles.detailValue}>{data?.Father_Name_LL || "-"}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Father Name (EN):</span>
                    <span className={styles.detailValue}>{data?.Father_Name_EN || "-"}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Gender:</span>
                    <span className={styles.detailValue}>{data?.Gender || "-"}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Relation:</span>
                    <span className={styles.detailValue}>{data?.RELATION || "-"}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>DoB:</span>
                    <span className={styles.detailValue}>{data?.DOB || "-"}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>UID No:</span>
                    <span className={styles.detailValue}>{data?.UIDNo || "-"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 3:
        return (
          <div className={styles.resultsContainer}>
            {renderDetailCard(<MdPerson />, "Ration PDF Details", {
              "RC Id": result.result?.rcId,
              "FPS Id": result.result?.fpsId,
              "State": result.result?.state,
              "Address": result.result?.full_address
            })}

            {result.result?.pdfData && (
              <div className={styles.pdfSection}>
                <div className={styles.pdfHeader}>
                  <MdPictureAsPdf />
                  <h3>Ration Card PDF</h3>
                </div>
                <div className={styles.pdfContainer}>
                  <iframe
                    src={result.result.pdfData}
                    width="100%"
                    height="500px"
                    title="PDF Viewer"
                    className={styles.pdfViewer}
                  />
                </div>
                <div className={styles.pdfActions}>
                  <a
                    href={result.result.pdfData}
                    download="RationCard.pdf"
                    className={styles.downloadBtn}
                  >
                    <MdDownload /> Download PDF
                  </a>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className={styles.resultsContainer}>
            {result && Object.keys(result).length > 0 ? (
              <>
                {result.meta && (
                  <div className={styles.metaSection}>
                    <h3>Request Information</h3>
                    {renderDetailCard(<MdPerson />, "API Response", result.meta)}
                  </div>
                )}
                {result.result && typeof result.result === 'object' ? (
                  renderDetailCard(<MdPerson />, "Result Details", result.result)
                ) : (
                  <div className={styles.detailCard}>
                    <div className={styles.cardHeader}>
                      <MdPerson />
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
          {!result && (
            <>
              {apiId === 3 && (
                <div className={styles.inputSection}>
                  <label>Type</label>
                  <select
                    value={type || ""}
                    onChange={(e) => setType(e.target.value)}
                    className={styles.selectInput}
                  >
                    <option value="">Select Type</option>
                    <option value="1">Yes (1)</option>
                    <option value="0">No (0)</option>
                  </select>
                </div>
              )}
              
              <div className={styles.inputSection}>
                <label>Ration Number</label>
                <input
                  type="text"
                  placeholder="Enter Your Ration Number"
                  value={rationNumber}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRationNumber(val);
                    setError(validateRation(val) || val.length === 0 ? "" : "Invalid Ration format");
                  }}
                  maxLength={12}
                  className={styles.input}
                />
              </div>
              
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
              </div>
            </>
          )}

          <div className={styles.resultSection}>
            {!loading && result && (
              <>
                {result.meta?.message && (
                  <p className={styles.successMessage}>
                    {result.meta.message}
                  </p>
                )}
                <div className={styles.resultBox}>
                  {renderResultSection()}
                </div>
                
                <div className={styles.actions}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => setResult(null)}
                  >
                    New Search
                  </button>
                  <button
                    className={styles.closeResultBtn}
                    onClick={onClose}
                  >
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
// import React, { useState } from "react";
// import styles from "../Aadhar/SimpleModal.module.css"; // Adjust the path as necessary
// import api from "../../../Utils/api";
// import toast from "react-hot-toast";

// const SimpleModal = ({ apiName, apiId, onClose }) => {
//   const [rationNumber, setRationNumber] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);
//   const [type, setType] = useState(0);

//   const validateRation = (number) => /^\d{12}$/.test(number);

//   const getApiEndpoint = () => {
//     switch (apiId) {
//       case 1:
//         return "/v1/rationBasic?ration_no=";
//       case 2:
//         return "/v1/upRationFull?ration_no=";
//       case 3:
//         return "/v1/rationPdf?ration_no=";
//       default:
//         return null;
//     }
//   };

//   const handleSubmit = async () => {
//     if (!validateRation(rationNumber)) {
//       setError("Please enter a valid Ration number.");
//       return;
//     }

//     setError("");
//     const endpoint = getApiEndpoint();
//     if (!endpoint) {
//       setError("No API endpoint found for this card!");
//       return;
//     }

//     try {
//       setLoading(true);
//       const res = await api.get(`${endpoint}${rationNumber}&type=${type}`);
//       setResult(res.data);
//       if (res.data?.success === true) {
//         const msg =
//           res.data?.meta?.message === ""
//             ? "Details fetched successfully"
//             : res.data?.meta?.message;
//         toast.success(msg);
//         setError(msg);
//       }
//       if (res.data?.success === false) {
//         const err =
//           res.data?.meta?.message ||
//           "Failed to fetch details or Empty response";
//         toast.error(err);
//         setError(err);
//       }
//       console.log("response of api", res.data);
//     } catch (err) {
//       console.error(err);

//       const error =
//         err.response?.data?.message ||
//         err.message ||
//         "Something went wrong while fetching data.";
//       toast.error(error);
//       setError(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderResultSection = () => {
//     if (loading) {
//       return (
//         <div className={styles.skeletonLoader}>
//           <div className={styles.skeletonRow}></div>
//           <div className={styles.skeletonRow}></div>
//           <div className={styles.skeletonRow}></div>
//         </div>
//       );
//     }

//     if (!result) return null;
//     const renderGridItem = (label, value) => (
//       <div className={styles.gridRow}>
//         <div className={styles.gridLabel}>{label}:</div>
//         <div className={styles.gridValue}>{value || "-"}</div>
//       </div>
//     );

//     switch (apiId) {
//       case 1: // aadharToPan
//         return (
//           <div className={styles.resultBox}>
//             <p>
//               <strong>Home State Code:</strong> {result.result?.homeStateCode}
//             </p>
//             <p>
//               <strong>District Code:</strong> {result.result?.districtCode}
//             </p>
//             <p>
//               <strong>RC Id:</strong> {result.result?.rcId}
//             </p>
//             <p>
//               <strong>FPS Id:</strong> {result.result?.fpsId}
//             </p>
//             <p>
//               <strong>Home State Code:</strong> {result.result?.homeStateName}
//             </p>
//             <p>
//               <strong>Home Dist Name:</strong> {result.result?.homeDistName}
//             </p>
//             <p>
//               <strong>Address:</strong> {result.result?.address}
//             </p>
//             <p>
//               <strong>Scheme Name:</strong> {result.result?.schemeName}
//             </p>

//             {result?.result?.memberDetailsList?.map((member, index) => (
//               <div key={index}>
//                 <p>
//                   <strong>Member Name:</strong> {member?.memberId}
//                 </p>
//                 <p>
//                   <strong>Member Id:</strong> {member?.memberName}
//                 </p>
//                 <p>
//                   <strong>UID:</strong> {member?.uid}
//                 </p>
//                 <p>
//                   <strong>relationship_code:</strong>{" "}
//                   {member?.relationship_code}
//                 </p>
//                 <p>
//                   <strong>relationship_name:</strong>{" "}
//                   {member?.releationship_name}
//                 </p>
//               </div>
//             ))}
//           </div>
//         );

//       case 2: // aadharToNamePhoneMask
//         return (
//           <div className={styles.resultBox}>
//             <h2>
//               <strong>Ration No:</strong> {result.result?.ration_no}
//             </h2>
//             {result?.result?.data?.map((data, index) => (
//               <div key={index}>
//                 <p>
//                   <strong>Sr No:</strong> {data?.srno}
//                 </p>
//                 <p>
//                   <strong>Name of Family Member LL:</strong>{" "}
//                   {data?.Nameof_Family_Member_LL}
//                 </p>
//                 <p>
//                   <strong>Name of Family Member EN:</strong>{" "}
//                   {data?.Nameof_Family_Member_EN}
//                 </p>
//                 <p>
//                   <strong>Father Name LL:</strong> {data?.Father_Name_LL}
//                 </p>
//                 <p>
//                   <strong>Father Name EN:</strong> {data?.Father_Name_EN}
//                 </p>
//                 <p>
//                   <strong>Gender:</strong> {data?.Father_Name_LL}
//                 </p>
//                 <p>
//                   <strong>Relation:</strong> {data?.RELATION}
//                 </p>
//                 <p>
//                   <strong>DoB:</strong> {data?.DOB}
//                 </p>
//                 <p>
//                   <strong>UID No:</strong> {data?.UIDNo}
//                 </p>
//               </div>
//             ))}
//           </div>
//         );

//       case 3: // aadharDataCheck
//         return (
//           <div className={styles.resultBox}>
//             <p>
//               <strong>RC Id:</strong> {result.result?.rcId}
//             </p>
//             <p>
//               <strong>FPS Id:</strong> {result.result?.fpsId}
//             </p>
//             <p>
//               <strong>State:</strong> {result.result?.state}
//             </p>
//             <p>
//               <strong>Address:</strong> {result.result?.full_address}
//             </p>
//             {result.result?.pdfData && (
//               <div className={styles.pdfContainer}>
//                 {/* Embedded PDF viewer */}
//                 <iframe
//                   src={result.result.pdfData}
//                   width="100%"
//                   height="500px"
//                   title="PDF Viewer"
//                 />

//                 {/* Download button */}
//                 <a
//                   href={result.result.pdfData}
//                   download
//                   className={styles.downloadBtn}
//                 >
//                   Download PDF
//                 </a>
//               </div>
//             )}
//           </div>
//         );

//       default:
//         return (
//           <div className={styles.resultBox}>
//             <pre>{JSON.stringify(result, null, 2)}</pre>
//           </div>
//         );
//     }
//   };

//   return (
//     <div className={styles.modalBackdrop}>
//       <div className={`${styles.modal} ${result ? styles.expanded : ""}`}>
//         <h2>{apiName}</h2>

//         {loading ? (
//           <div className={styles.loaderWrapper}>
//             <div className={styles.loader}></div>
//             <p>Fetching data...</p>
//           </div>
//         ) : !result ? (
//           <>
//             <input
//               type="text"
//               placeholder="Enter Your Ration Number"
//               value={rationNumber}
//               onChange={(e) => {
//                 const val = e.target.value;
//                 setRationNumber(val);
//                 setError(
//                   validateRation(val) || val.length === 0
//                     ? ""
//                     : "Invalid Ration format"
//                 );
//               }}
//               maxLength={12}
//               className={styles.input}
//             />
//             {error && <p className={styles.error}>{error}</p>}

//             <div className={styles.actions}>
//               <button
//                 className={styles.accessBtn}
//                 onClick={handleSubmit}
//                 disabled={loading}
//               >
//                 Submit
//               </button>
//               <button className={styles.cancelBtn} onClick={onClose}>
//                 Cancel
//               </button>
//             </div>
//           </>
//         ) : (
//           <div className={styles.resultSection}>
//             <p className={styles.successMessage}>{result.meta?.message}</p>
//             {renderResultSection()}
//             <div className={styles.actions}>
//               <button className={styles.cancelBtn} onClick={onClose}>
//                 Close
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SimpleModal;



// import React, { useState } from "react";
// import styles from "../Aadhar/SimpleModal.module.css";
// import api from "../../../Utils/api";
// import toast from "react-hot-toast";
// import { MdClose } from "react-icons/md";

// const SimpleModal = ({ apiName, apiId, onClose }) => {
//   const [rationNumber, setRationNumber] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);
//   const [type, setType] = useState(null);

//   const validateRation = (number) => /^\d{12}$/.test(number);

//   const getApiEndpoint = () => {
//     switch (apiId) {
//       case 1: return `/v1/rationBasic?ration_no=${rationNumber}`;
//       case 2: return `/v1/upRationFull?ration_no=${rationNumber}`;
//       case 3: return `/v1/rationPdf?ration_no=${rationNumber}&type=${type}`;
//       default: return null;
//     }
//   };

//   const handleSubmit = async () => {
//     if (!validateRation(rationNumber)) {
//       setError("Please enter a valid Ration number.");
//       return;
//     }
//     if (apiId === 3 && !type){
//       setError("Please select a type");
//       return;
//     }

//     setError("");
//     const endpoint = getApiEndpoint();
//     if (!endpoint) {
//       setError("No API endpoint found for this card!");
//       return;
//     }

//     try {
//       setResult(null);
//       setLoading(true);
//       const res = await api.get(endpoint);
//       setResult(res.data);
//       console.log("response of api", res.data);

//       if (res.data?.success === true) {
//         const msg = res.data?.meta?.message || "Details fetched successfully";
//         toast.success(msg);
//       }
//       if (res.data?.success === false) {
//         const err = res.data?.meta?.message || "Failed to fetch details or Empty response";
//         toast.error(err);
//         setError(err);
//       }
//     } catch (err) {
//       const errorMsg = err.response?.data?.message || err.message || "Something went wrong while fetching data.";
//       toast.error(errorMsg);
//       setError(errorMsg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderGridItem = (label, value) => (
//     <div className={styles.gridRow}>
//       <div className={styles.gridLabel}>{label}:</div>
//       <div className={styles.gridValue}>{value || "-"}</div>
//     </div>
//   );

//   const renderResultSection = () => {
//     if (loading) {
//       return (
//         <div className={styles.skeletonLoader}>
//           <div className={styles.skeletonRow}></div>
//           <div className={styles.skeletonRow}></div>
//           <div className={styles.skeletonRow}></div>
//         </div>
//       );
//     }

//     if (!result) return null;

//     switch (apiId) {
//       case 1:
//         return (
//           <div className={styles.resultGrid}>
//             {renderGridItem("Home State Code", result.result?.homeStateCode)}
//             {renderGridItem("District Code", result.result?.districtCode)}
//             {renderGridItem("RC Id", result.result?.rcId)}
//             {renderGridItem("FPS Id", result.result?.fpsId)}
//             {renderGridItem("Home State Name", result.result?.homeStateName)}
//             {renderGridItem("Home Dist Name", result.result?.homeDistName)}
//             {renderGridItem("Address", result.result?.address)}
//             {renderGridItem("Scheme Name", result.result?.schemeName)}

//             {result?.result?.memberDetailsList?.map((member, index) => (
//               <React.Fragment key={index}>
//                 {renderGridItem("Member Name", member?.memberId)}
//                 {renderGridItem("Member Id", member?.memberName)}
//                 {renderGridItem("UID", member?.uid)}
//                 {renderGridItem("Relationship Code", member?.relationship_code)}
//                 {renderGridItem("Relationship Name", member?.releationship_name)}
//               </React.Fragment>
//             ))}
//           </div>
//         );

//       case 2:
//         return (
//           <div className={styles.resultGrid}>
//             {renderGridItem("Ration No", result.result?.ration_no)}
//             {result?.result?.data?.map((data, index) => (
//               <React.Fragment key={index}>
//                 {renderGridItem("Sr No", data?.srno)}
//                 {renderGridItem("Name of Family Member LL", data?.Nameof_Family_Member_LL)}
//                 {renderGridItem("Name of Family Member EN", data?.Nameof_Family_Member_EN)}
//                 {renderGridItem("Father Name LL", data?.Father_Name_LL)}
//                 {renderGridItem("Father Name EN", data?.Father_Name_EN)}
//                 {renderGridItem("Gender", data?.Gender)}
//                 {renderGridItem("Relation", data?.RELATION)}
//                 {renderGridItem("DoB", data?.DOB)}
//                 {renderGridItem("UID No", data?.UIDNo)}
//               </React.Fragment>
//             ))}
//           </div>
//         );

//       case 3:
//         return (
//           <div className={styles.resultGrid}>
//             {renderGridItem("RC Id", result.result?.rcId)}
//             {renderGridItem("FPS Id", result.result?.fpsId)}
//             {renderGridItem("State", result.result?.state)}
//             {renderGridItem("Address", result.result?.full_address)}
//             {result.result?.pdfData && (
//               <div className={styles.pdfContainer}>
//                 <iframe src={result.result.pdfData} width="100%" height="500px" title="PDF Viewer" />
//                 <a href={result.result.pdfData} download className={styles.downloadBtn}>Download PDF</a>
//               </div>
//             )}
//           </div>
//         );

//       default:
//         return <pre>{JSON.stringify(result, null, 2)}</pre>;
//     }
//   };

//   return (
//     <div className={styles.modalBackdrop}>
//       <div className={styles.modal}>
//         <h2>{apiName}</h2>
//         <select
//           name="state"
//           id="type"
//           required
//           onChange={(e) => setType(e.target.value)}
//           className="mt-2 w-100"
//         >
//           <option value="">Select Type</option>
//           <option value="1">Yes (1)</option>
//           <option value="0">No (2)</option>
//         </select>
//         <input
//           type="text"
//           placeholder="Enter Your Ration Number"
//           value={rationNumber}
//           onChange={(e) => {
//             const val = e.target.value;
//             setRationNumber(val);
//             setError(validateRation(val) || val.length === 0 ? "" : "Invalid Ration format");
//           }}
//           maxLength={12}
//           className={styles.input}
//         />
//         {error && <p className={styles.error}>{error}</p>}

//         <div className={styles.actions}>
//           <button className={styles.accessBtn} onClick={handleSubmit} disabled={loading}>
//             {loading ? "Loading..." : "Submit"}
//           </button>
//           <button className={styles.cancelBtn} onClick={onClose}>
//             <MdClose />
//           </button>
//         </div>

//         <div className={styles.resultSection}>
//           {renderResultSection()}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SimpleModal;

// ViewComplaint.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FaChevronDown, FaChevronUp, FaUserCircle } from "react-icons/fa";
import api from "@/Utils/api";
import styles from "@/pages/APIKey/ApiKey.module.css";

const ViewLawyerOnly = ({ complaint, onClose }) => {
  const [lawyerDetails, setLawyerDetails] = useState([]);
  const [companyDetails, setCompanyDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    complainant: true,
    lawyer: true,
    company: true,
    evidence: true,
  });

  useEffect(() => {
    const fetchLawyerDetails = async () => {
      setLoading(true);
      setLawyerDetails([]);
      setCompanyDetails([]);

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Authentication token missing");
          setLoading(false);
          return;
        }

        const lawyerEndpoint = `/get-lawyer_detail?complain_id=${complaint.id}`;
        const response = await api.get(lawyerEndpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const lawyerData = Array.isArray(response.data?.data) ? response.data.data : [];
        setLawyerDetails(lawyerData);

        // Fetch company details for each lawyer
        const companyDetailsArray = await Promise.all(
          lawyerData.map(async (lawyer) => {
            if (lawyer?.cityId && lawyer?.categoryId) {
              try {
                const lawRatoResponse = await axios.post(
                  "https://lawrato.com/lrapi/getlawyers.php",
                  `city=${lawyer.cityId}&cat=${lawyer.categoryId}`,
                  {
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    timeout: 10000,
                  }
                );

                const lawyersList = Array.isArray(lawRatoResponse.data) ? lawRatoResponse.data : [];
                const targetLawyerId = String(lawyer.lawyer).trim();
                const matchedLawyer = lawyersList.find((l) => String(l.id).trim() === targetLawyerId);
                return matchedLawyer || null;
              } catch (error) {
                console.error(`Error fetching company details for lawyer ID ${lawyer.lawyer}:`, error);
                return null;
              }
            }
            return null;
          })
        );

        setCompanyDetails(companyDetailsArray);
      } catch (error) {
        console.error("Error fetching lawyer details:", error);
        toast.error("Failed to fetch lawyer details");
      } finally {
        setLoading(false);
      }
    };

    if (complaint?.id) {
      fetchLawyerDetails();
    }
  }, [complaint.id]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Submitted":
        return styles.statusSubmitted;
      case "In Progress":
        return styles.statusInProgress;
      case "Resolved":
        return styles.statusResolved;
      default:
        return "";
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className={`${styles.card} ${styles.modalContainer} sm:max-w-[700px] max-h-[85vh] overflow-y-auto p-6`}>
        <DialogHeader className={styles.modalHeader}>
          <DialogTitle className="text-black text-2xl font-semibold">Complaint Details</DialogTitle>
          <DialogDescription className="text-gray-600">
            <span className={`${styles.statusBadge} ${getStatusBadgeClass(complaint.status)}`}>{complaint.status}</span>
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className={`${styles.spinnerContainer} py-10`}>
            <div className={styles.customSpinner}></div>
            <p className="mt-4 text-gray-500">Loading details...</p>
          </div>
        ) : (
          <div className="grid gap-6 py-4">
            {/* Complainant Details */}
            {/* Add complainant details section if needed */}

            {/* Lawyer Details */}
            {/* {lawyerDetails.length > 0 ? (
              <Section
                title="Advocate Lawyers"
                isExpanded={expandedSections.lawyer}
                toggle={() => toggleSection("lawyer")}
              >
                {lawyerDetails.map((lawyer, index) => (
                  <div key={lawyer.id} className="border-b py-4 last:border-b-0">
                    <h4 className="font-semibold text-gray-800 mb-2">Lawyer {index + 1}</h4>
                    <Field label="Name" value={lawyer.name} bold />
                    <Field label="Phone" value={lawyer.phone} />
                    <Field label="Email" value={lawyer.email} />
                    <Field label="City ID" value={lawyer.cityId} />
                    <Field label="Category ID" value={lawyer.categoryId} />
                    <Field label="Lawyer ID (LawRato)" value={lawyer.lawyer} />
                  </div>
                ))}
              </Section>
            ) : (
              <div className={styles.alertBox}>
                <p className="text-yellow-800 font-medium">No lawyers assigned to this complaint.</p>
              </div>
            )} */}

            {/* Company Details */}
            {lawyerDetails.length > 0 && companyDetails.some((detail) => detail) ? (
              <Section
                title="Advocate Profiles"
                isExpanded={expandedSections.company}
                toggle={() => toggleSection("company")}
              >
                {companyDetails.map((company, index) =>
                  company ? (
                    <div key={index} style={{
                      border:"2px solid #e5e7eb",
                      borderRadius:"5px",
                      marginBottom:"5px"
                    }} className="border-b py-4 last:border-b-0">
                      <br />
                      {/* <h4 className="font-semibold text-gray-800 mb-2">Lawyer {index + 1} Profile</h4> */}
                      <div className="flex items-start gap-4">
                        <div className={styles.profileImageWrapper}>
                          {company.profileimage ? (
                            <img
                              src={company.profileimage}
                              alt={company.name}
                              className={styles.profileImage}
                            />
                          ) : (
                            <FaUserCircle className={styles.profilePlaceholder} />
                          )}
                        </div>
                        <div className="flex-1">
                          <Field label="Name" value={company.name} bold />
                          <Field label="Location" value={company.location} />
                          <Field label="City" value={company.city} />
                          <Field label="Category" value={company.category} />
                          <Field label="Experience" value={company.experience} />
                          <Field label="Ratings" value={`★ ${company.ratings}`} bold />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={index} className={styles.alertBox}>
                      <p className="text-orange-800 font-medium">
                        Lawyer assigned but not found on LawRato (ID: {lawyerDetails[index]?.lawyer}).
                      </p>
                    </div>
                  )
                )}
              </Section>
            ) : lawyerDetails.length > 0 ? (
              <div className={styles.alertBox}>
                <p className="text-orange-800 font-medium">No lawyer profiles found on LawRato.</p>
              </div>
            ) : null}

            {/* Evidence Attachments */}
            {complaint.evidenceAttachment?.length > 0 && (
              <Section
                title="Evidence Attachments"
                isExpanded={expandedSections.evidence}
                toggle={() => toggleSection("evidence")}
              >
                <div className="flex flex-wrap gap-2">
                  {complaint.evidenceAttachment.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.attachmentLink}
                    >
                      Attachment {i + 1}
                    </a>
                  ))}
                </div>
              </Section>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className={`${styles.actionBtn} ${styles.cancelButton}`}
            disabled={loading}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Section Component
const Section = ({ title, children, isExpanded, toggle }) => (
  <div className={styles.section}>
    <button
      className={styles.sectionHeader}
      onClick={toggle}
      aria-expanded={isExpanded}
      aria-controls={`section-${title.toLowerCase().replace(/\s/g, "-")}`}
    >
      <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
      {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
    </button>
    {isExpanded && (
      <div className={styles.sectionContent} id={`section-${title.toLowerCase().replace(/\s/g, "-")}`}>
        {children}
      </div>
    )}
  </div>
);

// Field Component
const Field = ({ label, value, bold }) => (
  <div className="grid grid-cols-3 gap-3 items-center py-2">
    <span className="font-medium text-gray-600">{label}:</span>
    <span className={`col-span-2 ${bold ? "font-bold text-black" : "text-gray-800"}`}>{value || "—"}</span>
  </div>
);

export default ViewLawyerOnly;
// ViewComplaint.jsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FaCheckCircle, FaTimesCircle, FaPaperclip, FaChevronDown, FaChevronUp } from "react-icons/fa";
import styles from "@/pages/APIKey/ApiKey.module.css";
import { useState } from "react";

const ViewComplaint = ({ complaint, onClose }) => {
  const [expanded, setExpanded] = useState({
    complainant: true,
    incident: true,
    police: true,
    evidence: true,
    legal: true,
  });

  const toggle = (key) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  const formatDate = (d) => new Date(d).toLocaleString("en-IN");

  if (!complaint) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <div className={styles.modalOverlay}>
        <div className={styles.modalContainer}>
          <div className={styles.modalHeader}>
            <DialogTitle className="text-2xl font-bold">
              Complaint Details - #{complaint.id}
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Complainant Section */}
            <Section title="Complainant" isOpen={expanded.complainant} onToggle={() => toggle("complainant")}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Field label="Name" value={complaint.complainantName} />
                <Field label="Email" value={complaint.complainantEmail || "—"} />
                <Field label="Phone" value={complaint.complainantPhone || "—"} />
              </div>
            </Section>

            {/* Incident Details */}
            <Section title="Incident Details" isOpen={expanded.incident} onToggle={() => toggle("incident")}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Field label="Date & Time" value={formatDate(complaint.incidentDate)} />
                <Field label="Description" value={complaint.incidentDescription} multiline />
              </div>
            </Section>

            {/* Police Report */}
            <Section title="Police Report" isOpen={expanded.police} onToggle={() => toggle("police")}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Field label="Reported to Police" value={complaint.reportedToPolice ? <Yes /> : <No />} />
                {complaint.reportedToPolice && (
                  <Field label="FIR / Report No." value={complaint.policeReportNumber || "—"} />
                )}
              </div>
            </Section>

            {/* Evidence */}
            {(complaint.evidenceDetails || complaint.evidenceAttachment?.length > 0) && (
              <Section title="Evidence" isOpen={expanded.evidence} onToggle={() => toggle("evidence")}>
                <div className="space-y-4">
                  {complaint.evidenceDetails && (
                    <Field label="Description" value={complaint.evidenceDetails} multiline />
                  )}
                  {complaint.evidenceAttachment?.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {complaint.evidenceAttachment.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.attachmentLink}
                        >
                          <FaPaperclip /> File {i + 1}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* Legal Assistance */}
            <Section title="Legal Assistance" isOpen={expanded.legal} onToggle={() => toggle("legal")}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Field label="Lawyer Required" value={complaint.lawyerRequired ? <Yes /> : <No />} />
                {complaint.lawyerRequired && (
                  <>
                    <Field label="City ID" value={complaint.cityId || "—"} />
                    <Field label="Category ID" value={complaint.categoryId || "—"} />
                  </>
                )}
              </div>
            </Section>
          </div>

          <div className="flex justify-end p-6 border-t">
            <button onClick={onClose} className={styles.cancelButton}>
              Close
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

// Reusable Collapsible Section
const Section = ({ title, isOpen, onToggle, children }) => (
  <div className={styles.section}>
    <button
      onClick={onToggle}
      className={`${styles.sectionHeader} ${isOpen ? "bg-slate-200" : ""} hover:bg-slate-200 flex justify-between items-center w-full text-left font-semibold`}
    >
      {title}
      {isOpen ? <FaChevronUp className="text-gray-600" /> : <FaChevronDown className="text-gray-600" />}
    </button>
    {isOpen && <div className={styles.sectionContent}>{children}</div>}
  </div>
);

// Field Component (4-column ready)
const Field = ({ label, value, multiline }) => (
  <div className={multiline ? "col-span-full" : ""}>
    <div className="text-sm font-medium text-gray-600 mb-1">{label}</div>
    <div className={multiline ? "whitespace-pre-wrap text-gray-800" : "text-gray-900 font-medium"}>
      {value || "—"}
    </div>
  </div>
);

const Yes = () => <FaCheckCircle className="text-green-600 inline ml-2" title="Yes" />;
const No = () => <FaTimesCircle className="text-red-600 inline ml-2" title="No" />;

export default ViewComplaint;
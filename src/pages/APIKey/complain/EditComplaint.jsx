// EditComplaint.jsx
import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";
import api from "@/Utils/api";
import modalStyles from "@/pages/APIKey/Modal.module.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import styles from "@/pages/APIKey/ApiKey.module.css";
const EditComplaint = ({ complaint, onClose, onSave }) => {
  const [form, setForm] = useState({
    complainantName: complaint.complainantName || "",
    complainantEmail: complaint.complainantEmail || "",
    complainantPhone: complaint.complainantPhone || "",
    incidentDate: complaint.incidentDate ? new Date(complaint.incidentDate).toISOString().split("T")[0] : "",
    incidentDescription: complaint.incidentDescription || "",
    reportedToPolice: complaint.reportedToPolice ? "true" : "false",
    policeReportNumber: complaint.policeReportNumber || "",
    evidenceDetails: complaint.evidenceDetails || "",
    lawyerRequired: complaint.lawyerRequired ? "true" : "false",
    cityId: complaint.cityId || "",
    categoryId: complaint.categoryId || "",
    status: complaint.status || "Submitted",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.complainantName.trim()) newErrors.complainantName = "Name is required.";
    if (!form.complainantEmail.trim()) newErrors.complainantEmail = "Email is required.";
    if (!form.complainantPhone.trim()) newErrors.complainantPhone = "Phone is required.";
    if (!form.incidentDate) newErrors.incidentDate = "Incident date is required.";
    if (!form.incidentDescription.trim()) newErrors.incidentDescription = "Description is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const updatedData = {
        ...form,
        reportedToPolice: form.reportedToPolice === "true",
        lawyerRequired: form.lawyerRequired === "true",
      };
      await api.put(`/update-complain_register/${complaint.id}`, updatedData);
      toast.success("Complaint updated successfully");
      onSave();
      onClose();
    } catch (error) {
      console.error("Error updating complaint:", error.response?.data || error.message);
      toast.error("Failed to update complaint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className={`${styles.card} sm:max-w-[600px] p-4`}>
        <DialogHeader>
          <DialogTitle className="text-black">Edit Complaint</DialogTitle>
          <DialogDescription className="text-black">
            Update the details of the complaint.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 items-center gap-4">
              <label className="font-medium text-black">Name</label>
              <Input
                name="complainantName"
                value={form.complainantName}
                onChange={handleChange}
                className="text-black"
                disabled={loading}
              />
              {errors.complainantName && <span className={modalStyles.error}>{errors.complainantName}</span>}
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <label className="font-medium text-black">Email</label>
              <Input
                name="complainantEmail"
                type="email"
                value={form.complainantEmail}
                onChange={handleChange}
                className="text-black"
                disabled={loading}
              />
              {errors.complainantEmail && <span className={modalStyles.error}>{errors.complainantEmail}</span>}
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <label className="font-medium text-black">Phone</label>
              <Input
                name="complainantPhone"
                value={form.complainantPhone}
                onChange={handleChange}
                className="text-black"
                disabled={loading}
              />
              {errors.complainantPhone && <span className={modalStyles.error}>{errors.complainantPhone}</span>}
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <label className="font-medium text-black">Incident Date</label>
              <Input
                name="incidentDate"
                type="date"
                value={form.incidentDate}
                onChange={handleChange}
                className="text-black"
                disabled={loading}
              />
              {errors.incidentDate && <span className={modalStyles.error}>{errors.incidentDate}</span>}
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <label className="font-medium text-black">Description</label>
              <Input
                name="incidentDescription"
                value={form.incidentDescription}
                onChange={handleChange}
                className="text-black"
                disabled={loading}
              />
              {errors.incidentDescription && <span className={modalStyles.error}>{errors.incidentDescription}</span>}
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <label className="font-medium text-black">Reported to Police</label>
              <select
                name="reportedToPolice"
                value={form.reportedToPolice}
                onChange={handleChange}
                className="text-black border rounded p-2"
                disabled={loading}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <label className="font-medium text-black">Police Report Number</label>
              <Input
                name="policeReportNumber"
                value={form.policeReportNumber}
                onChange={handleChange}
                className="text-black"
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <label className="font-medium text-black">Evidence Details</label>
              <Input
                name="evidenceDetails"
                value={form.evidenceDetails}
                onChange={handleChange}
                className="text-black"
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <label className="font-medium text-black">Lawyer Required</label>
              <select
                name="lawyerRequired"
                value={form.lawyerRequired}
                onChange={handleChange}
                className="text-black border rounded p-2"
                disabled={loading}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <label className="font-medium text-black">City ID</label>
              <Input
                name="cityId"
                value={form.cityId}
                onChange={handleChange}
                className="text-black"
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <label className="font-medium text-black">Category ID</label>
              <Input
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                className="text-black"
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <label className="font-medium text-black">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="text-black border rounded p-2"
                disabled={loading}
              >
                <option value="Submitted">Submitted</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            {complaint.evidenceAttachment.length > 0 && (
              <div className="grid grid-cols-2 items-center gap-4">
                <label className="font-medium text-black">Evidence Attachments</label>
                <div>
                  {complaint.evidenceAttachment.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline block"
                    >
                      View Attachment {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className={styles.actionBtn} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className={styles.actionBtn} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditComplaint;
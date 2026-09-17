import { useState, useEffect } from "react";
import styles from "./AnnounceModal.module.css";

const AnnounceModal = ({ isOpen, onClose, onSubmit, loading, initialData }) => {
  const [announcement, setAnnouncement] = useState({
    message: "",
    expiryDate: ""
  });

  useEffect(() => {
    if (isOpen && initialData) {
      setAnnouncement({
        message: initialData.announcement_text || "",
        expiryDate: initialData.expiry_date
          ? new Date(initialData.expiry_date).toISOString().slice(0, 16)
          : "",
      });
    } else if (!isOpen) {
      setAnnouncement({ message: "", expiryDate: "" });
    }
  }, [isOpen, initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAnnouncement((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!announcement.message || !announcement.expiryDate) {
      alert("Please fill all fields");
      return;
    }
    onSubmit(announcement);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>{initialData ? "Edit Announcement" : "Create Announcement"}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="message">Announcement Message</label>
            <textarea
              id="message"
              name="message"
              value={announcement.message}
              onChange={handleInputChange}
              placeholder="Enter your announcement..."
              rows={4}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="expiryDate">Expiry Date & Time</label>
            <input
              type="datetime-local"
              id="expiryDate"
              name="expiryDate"
              value={announcement.expiryDate}
              onChange={handleInputChange}
              min={new Date().toISOString().slice(0, 16)}
              required
            />
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading || !announcement.message || !announcement.expiryDate}
            >
              {loading ? "Submitting..." : initialData ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnounceModal;

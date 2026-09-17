// components/SimpleConfirmationModal/SimpleConfirmationModal.jsx
import React from "react";
import styles from "../../Components/FinalDeleteModal/DeleteConfirmModal.module.css";
import { FaTimes } from "react-icons/fa";

const SimpleConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          <FaTimes />
        </button>
        <h2>Confirm Deletion</h2>
        <p>{message}</p>
        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onClose}>
            No, Cancel
          </button>
          <button
            className={styles.confirmButton}
            onClick={onConfirm}
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleConfirmationModal;
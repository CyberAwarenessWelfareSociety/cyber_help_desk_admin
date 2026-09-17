import styles from "./DeleteConfirmation.module.css";

const DeleteConfirmation = ({ onConfirm, onCancel, message }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3 className={styles.modalTitle}>Confirm Deletion</h3>
        <p className={styles.modalMessage}>
          {message || "Are you sure you want to delete this item?"}
        </p>
        <div className={styles.modalButtons}>
          <button className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
          <button className={styles.confirmButton} onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
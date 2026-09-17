// // components/DeleteConfirmModal/DeleteConfirmModal.jsx
// import React, { useState } from "react";
// import styles from "./DeleteConfirmModal.module.css";
// import { FaTimes } from "react-icons/fa";

// const DeleteConfirmModal = ({ isOpen, onClose, onDelete, itemName = "item" }) => {
//   const [confirmText, setConfirmText] = useState("");

//   const handleInputChange = (e) => {
//     setConfirmText(e.target.value);
//   };

//   const handleDelete = () => {
//     if (confirmText === "delete") {
//       onDelete(); // Passed from parent
//       setConfirmText("");
//       onClose(); // Close after deletion
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className={styles.modalOverlay}>
//       <div className={styles.modalContent}>
//         <button className={styles.closeButton} onClick={onClose}>
//           <FaTimes />
//         </button>
//         <h2>Delete "{itemName}"?</h2>
//         <p>To confirm, type <strong>delete</strong> in the box below</p>
//         <input
//           type="text"
//           className={styles.input}
//           placeholder="Type delete"
//           value={confirmText}
//           onChange={handleInputChange}
//         />
//         <div className={styles.actions}>
//           <button className={styles.cancelButton} onClick={onClose}>
//             Cancel
//           </button>
//           <button
//             className={styles.deleteButton}
//             onClick={handleDelete}
//             disabled={confirmText !== "delete"}
//           >
//             Delete Collection
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DeleteConfirmModal;



// components/DeleteConfirmModal/DeleteConfirmModal.jsx
import React, { useState } from "react";
import styles from "./DeleteConfirmModal.module.css";
import { FaTimes } from "react-icons/fa";

const DeleteConfirmModal = ({ 
  isOpen, 
  onClose, 
  onDelete, 
  itemName = "item",
  confirmationText = "delete", // Make this configurable
  message = "" // Add a custom message prop
}) => {
  const [confirmText, setConfirmText] = useState("");

  const handleInputChange = (e) => {
    setConfirmText(e.target.value);
  };

  const handleDelete = () => {
    if (confirmText.toLowerCase() === confirmationText.toLowerCase()) {
      onDelete();
      setConfirmText("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          <FaTimes />
        </button>
        {message && <p className={styles.message}>{message}</p>}
        <h2>Delete "{itemName}"?</h2>
        <p>To confirm, type <strong>{confirmationText}</strong> in the box below</p>
        <input
          type="text"
          className={styles.input}
          placeholder={`Type ${confirmationText}`}
          value={confirmText}
          onChange={handleInputChange}
        />
        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.deleteButton}
            onClick={handleDelete}
            disabled={confirmText.toLowerCase() !== confirmationText.toLowerCase()}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
import React, { useState } from "react";
import styles from "./Ration.module.css";
import SimpleModal from "./SimpleModal";

const RationModal = ({ api }) => {
  const [showModal, setShowModal] = useState(false);
  const [rationNumber, setRationNumber] = useState("");
  const [error, setError] = useState("");

const validateAadhar = (number) => /^\d{12}$/.test(number);


  const handleSubmit = () => {
    if (!validateAadhar(rationNumber)) {
      setError("Please enter a valid Ration number.");
      return;
    }
    console.log("this runnig  ")
    setError("");
    alert(`Ration Number: ${rationNumber}\nAPI: ${api.name}`);
    setShowModal(false);
    setRationNumber("");
  };

  return (
    <>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.apiName}>API Name</span>
        </div>
        <p className={styles.apiTitle}>{api.name}</p>
        <div className={styles.cardFooter}>
          <button
            className={styles.accessBtn}
            onClick={() => setShowModal(true)}
          >
            Search
          </button>
        </div>
      </div>

      {showModal && (
        <SimpleModal 
          apiName={api.name} 
          apiId={api.id} 
          onClose={
            () => setShowModal(false)
          }>
          <input
            type="text"
            placeholder="Enter Ration Number"
            value={rationNumber}
            onChange={(e) => setRationNumber(e.target.value)}
            maxLength={12}
            className={styles.input}
          />
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.accessBtn} onClick={handleSubmit}>
            Submit
          </button>
        </SimpleModal>
      )}
    </>
  );
};

export default RationModal;

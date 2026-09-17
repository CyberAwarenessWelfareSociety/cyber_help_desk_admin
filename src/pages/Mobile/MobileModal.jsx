import React, { useState } from "react";
import styles from "./Mobile.module.css";
import SimpleModal from "./SimpleModal";

const MobileModal = ({ api }) => {
  const [showModal, setShowModal] = useState(false);
  const [panNumber, setPanNumber] = useState("");
  const [error, setError] = useState("");

const validatePAN = (number) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(number);


  const handleSubmit = () => {
    if (!validatePAN(panNumber)) {
      setError("Please enter a valid PAN number.");
      return;
    }
    console.log("this runnig  ")
    setError("");
    alert(`PAN Number: ${panNumber}\nAPI: ${api.name}`);
    setShowModal(false);
    setPanNumber("");
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
            placeholder="Enter PAN Number"
            value={panNumber}
            onChange={(e) => setPanNumber(e.target.value)}
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

export default MobileModal;

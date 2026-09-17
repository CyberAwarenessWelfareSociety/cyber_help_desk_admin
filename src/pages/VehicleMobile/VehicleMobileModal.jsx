import React, { useEffect, useState } from "react";
import styles from "./VehicleMobile.module.css";
import SimpleModal from "./SimpleModal";

const BackgroundCheckModal = ({ api }) => {
  const [showModal, setShowModal] = useState(false);
  const [inputNumber, setInputNumber] = useState("");
  const [error, setError] = useState("");

const validateAadhar = (number) => /^\d{12}$/.test(number);


  const handleSubmit = () => {
    if (!validateAadhar(inputNumber)) {
      setError("Please enter a valid number.");
      return;
    }
    console.log("this runnig  ")
    setError("");
    alert(`Entered Number: ${inputNumber}\nAPI: ${api?.name}`);
    setShowModal(false);
    setInputNumber("");
  };

  useEffect(()=>{
    console.log("Modal is open")
  },[]);

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
            placeholder="Enter Mobile Number"
            value={inputNumber}
            onChange={(e) => setInputNumber(e.target.value)}
            maxLength={10}
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

export default BackgroundCheckModal;

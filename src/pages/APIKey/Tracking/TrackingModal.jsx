import React, { useState } from "react";
import styles from "./Tracking.module.css";
import SimpleModal from "./SimpleModal";

const VehicleModal = ({ api }) => {
  const [showModal, setShowModal] = useState(false);
  
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
          apiFields={api.fields || [{ name: api.field, placeholder: api.placeholder }]}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default VehicleModal;
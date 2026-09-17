import React, { useState } from "react";

import SimpleModal from "./SimpleModal";
import styles from "./OtherVehicle.module.css";
import PanModal from "./OtherVehicleModal";

const apis = [
  { id: 1, name: "WAY BILL" },
  { id: 2, name: "CHALLAN" },
  { id: 3, name: "GST LOOKUP" },
  { id: 4, name: "BlackSpot By State" },
  { id: 5, name: "No Entry By State" },

];

const OtherVehicle = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [modalText, setModalText] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleSearch = (apiName) => {
    setModalText(apiName);
    setShowModal(true);
  };

  return (
    <div className={styles.container}>
      <h1>Other Vehicle</h1>
      <div className={styles.grid}>
        {apis.map((api) => (
          <PanModal
            key={api.id}
            api={api}
            isSelected={selectedId === api.id}
            onClick={() => setSelectedId(api.id)}
            onSearch={() => handleSearch(api.name)}
          />
        ))}
      </div>

      {showModal && (
        <SimpleModal text={modalText} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default OtherVehicle;

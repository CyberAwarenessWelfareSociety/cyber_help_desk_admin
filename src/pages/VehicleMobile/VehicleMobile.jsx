import React, { useState } from "react";
import AadharModal from "./VehicleMobileModal";
import SimpleModal from "./SimpleModal";
import styles from "./VehicleMobile.module.css";
import DigoxCheckModal from "./VehicleMobileModal";

const apis = [
  { id: 1, name: "Multiple vehicle" },
  { id: 2, name: "Multiple upi" },
  { id: 3, name: "Mobile to pan" },
  { id: 4, name: "Mobile to uan" },
  { id: 5, name: "Mobile to uan list" },
  { id: 6, name: "PAN to UAN" },
  { id: 8, name: "DIN to PAN" },
  { id: 9, name: "PAN to MSME" },
];

const BackgroundCheck = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [modalText, setModalText] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleSearch = (apiName) => {
    setModalText(apiName);
    setShowModal(true);
  };

  return (
    <div className={styles.container}>
      <h1>Multiple Vehicles</h1>
      <div className={styles.grid}>
        {apis.map((api) => (
          <DigoxCheckModal
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

export default BackgroundCheck;

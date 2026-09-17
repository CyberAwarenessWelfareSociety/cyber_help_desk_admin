import React, { useState } from "react";
import AadharModal from "./PanModal";
import SimpleModal from "./SimpleModal";
import styles from "./Pan.module.css";
import PanModal from "./PanModal";

const apis = [
  { id: 1, name: "Pan to Aadhaar" },
  { id: 2, name: "Pan Details Plus" },
  { id: 3, name: "Pan to Name" },
  { id: 4, name: "Pan Basic" },
  { id: 5, name: "Pan Details Prime" },
  { id: 6, name: "PAN to UAN" },
  { id: 7, name: "PAN to MSME" }
];

const Pan = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [modalText, setModalText] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleSearch = (apiName) => {
    setModalText(apiName);
    setShowModal(true);
  };

  return (
    <div className={styles.container}>
      <h1>PAN Card</h1>
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

export default Pan;

import React, { useState } from "react";
import AadharModal from "./DigitalFootPrintModal";
import SimpleModal from "./SimpleModal";
import styles from "./DigitalFootPrint.module.css";
import DigoxCheckModal from "./DigitalFootPrintModal";

const apis = [
  { id: 1, name: "Footprint By mail Id" },
  // { id: 2, name: "WhatsApp check" },
  { id: 3, name: "Premium mobile footprint" },
  
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
      <h1>Digital Footprint</h1>
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

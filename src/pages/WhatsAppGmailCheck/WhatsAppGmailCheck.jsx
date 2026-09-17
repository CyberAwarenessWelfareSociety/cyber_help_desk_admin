import React, { useState } from "react";
import AadharModal from "./WhatsAppGmailCheckModal";
import SimpleModal from "./SimpleModal";
import styles from "./WhatsAppGmailCheck.module.css";
import DigoxCheckModal from "./WhatsAppGmailCheckModal";

const apis = [
  { id: 1, name: "WhatsApp Photo" },
  { id: 2, name: "WhatsApp Check" },
  { id: 3, name: "WhatsApp About Check" },
  { id: 4, name: "WhatsApp Business Check" },
  { id: 5, name: "Gmail Photo" },
  { id: 6, name: "Gmail Check" },
  // { id: 7, name: "Phone Check" },
  { id: 8, name: "WhatsApp check" },
  
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
      <h1>WhatsApp Gmail Check</h1>
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

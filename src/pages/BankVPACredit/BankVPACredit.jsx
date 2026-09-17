import React, { useState } from "react";
import AadharModal from "./BankVPACreditModal";
import SimpleModal from "./SimpleModal";
import styles from "./BankVPACredit.module.css";
import DigoxCheckModal from "./BankVPACreditModal";

const apis = [
  { id: 1, name: "Credit Report without OTP" },
  { id: 2, name: "Bank Mobile to Account" },
  { id: 3, name: "VPA verification" },
  { id: 4, name: "VPA 360" },
  { id: 5, name: "VPA to Account" },
  { id: 6, name: "Bank verify without Money" },
  { id: 7, name: "Bank verify with Money Drop" },
  
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
      <h1>Bank VPA Credit</h1>
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

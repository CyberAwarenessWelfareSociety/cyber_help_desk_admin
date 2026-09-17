import React, { useState } from "react";
import AadharModal from "./MobileSuperiorModal";
import SimpleModal from "./SimpleModal";
import styles from "./MobileSuperior.module.css";
import DigoxCheckModal from "./MobileSuperiorModal";

const apis = [
  { id: 1, name: "Mobile to Name" },
  { id: 2, name: "Prefill" },
  { id: 3, name: "Mobile to Profile" },
  { id: 4, name: "Mobile to Profile Advanced" },
  { id: 5, name: "Mobile to Address" },
  { id: 6, name: "Mobile Age" },
  { id: 7, name: "Mobile Revoke Status" },
  { id: 8, name: "Mobile Revoke Details" },
  { id: 9, name: "Mobile Revoke Date" },
  { id: 10, name: "Mobile Revoke Date Plus" },
  { id: 11, name: "Mobile Revoke MDN lookup" },
  { id: 12, name: "MOBILE TO ESIC" },
  { id: 13, name: "MOBILE TO UAN" },
  { id: 14, name: "Mobile" },
  { id: 15, name: "Mobile to PAN" },
  { id: 16, name: "Mobile to UAN" },
  { id: 17, name: "Mobile to UAN list" },
  { id: 18, name: "Phone Check" },
  { id: 19, name: "Mobile to multiple and FB photo" },
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
      <h1>Mobile Superior</h1>
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

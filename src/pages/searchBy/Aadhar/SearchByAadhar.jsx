import React, { useState, useEffect } from "react";
import AadharModal from "./AadharModal";
import SimpleModal from "./SimpleModal";
import styles from "./Aadhar.module.css";
import toast from "react-hot-toast";
import api from "../../../Utils/api";
import { MdClose } from "react-icons/md";
import { ROLES } from "@/constants/Role"; // Import ROLES constant
import ErrorBoundary from "@/constants/ErrorBoundary";

const apis = [
  { id: 1, name: "aadhar to pan" },
  { id: 2, name: "aadhar to name" },
  { id: 3, name: "aadhar to phone" },
  { id: 4, name: "aadhar verify" },
  { id: 5, name: "aadharDetails" },
  { id: 6, name: "aadharToMaskPan" },
  { id: 7, name: "aadharProWithDetails" },
  { id: 8, name: "aadharToRationPdf" },
  { id: 9, name: "Aadhar" },
  { id: 10, name: "Aadhaar to UAN" },
];

const SearchByAadharModal = () => {
  const [selectedApi, setSelectedApi] = useState(null);
  const [aadharAccess, setAadharAccess] = useState(null);
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const token = localStorage.getItem("token");
  const clientId = JSON.parse(localStorage.getItem("user")).id ;
  const clientType = JSON.parse(localStorage.getItem("user"))?.client_type;

  // Check aadhar_access status on component mount
  useEffect(() => {
    const checkAadharAccess = async () => {
      try {
        const res = await api.get(
          `/aadhar-access?clientId=${clientId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAadharAccess(res.data.aadhar_access);
        // Only show toast and modal for non-admins if aadhar_access is false
        if (!res.data.aadhar_access ) {
          toast.error("Aadhar feature is disabled for your account.");
          setAccessModalOpen(true);
        }
      } catch (err) {
      
    
        // Only show modal for non-admins on error
    
              toast.error("Error checking Aadhar access.");
        setAadharAccess(false);
          setAccessModalOpen(true);
        
      }
    };
    checkAadharAccess();
  }, [clientType]);

  const handleOpenModal = (api) => {
    // Allow modal to open if aadharAccess is true or user is admin
    if (aadharAccess || clientType === ROLES.ADMIN) {
      setSelectedApi(api);
    } else {
      toast.error("Aadhar feature is disabled for your account.");
      setAccessModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setSelectedApi(null);
  };

  const handleCloseAccessModal = () => {
    setAccessModalOpen(false);
  };

  return (
    <div className={styles.container}>
      <h1>AADHAR CARD</h1>
      <div className={styles.grid}>
        {apis.map((api) => (
          <AadharModal
            key={api.id}
            api={api}
            onClick={() => handleOpenModal(api)}
            disabled={!(aadharAccess )} // Enable buttons for admins or if aadharAccess is true
          />
        ))}
      </div>
{selectedApi && (aadharAccess || clientType === ROLES.ADMIN) && (
  <ErrorBoundary>
    <SimpleModal
      apiId={selectedApi.id}
      apiName={selectedApi.name}
      onClose={handleCloseModal}
    />
  </ErrorBoundary>
)}
      {accessModalOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Access Denied</h2>
              <button className={styles.closeBtn} onClick={handleCloseAccessModal}>
                <MdClose />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.error}>
                The Aadhar feature is currently disabled for your account. Please contact support for assistance.
              </p>
              <div className={styles.actions}>
                <button
                  className={styles.accessBtn}
                  onClick={handleCloseAccessModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchByAadharModal;
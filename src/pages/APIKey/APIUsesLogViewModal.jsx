import React from "react";
import styles from "./APIUsesLogViewModal.module.css";

const ApiLogViewModal = ({ log, onClose }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatRupees = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  const shouldDisplay = (value) => {
    return value && !value.toString().includes('***');
  };

  const getStatusClass = (status) => {
    if (status >= 200 && status < 300) return styles.statusSuccess;
    if (status >= 400 && status < 500) return styles.statusWarning;
    if (status >= 500) return styles.statusError;
    return "";
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
        <h2 className={styles.title}>API Log Details</h2>
        
        <div className={styles.scrollContent}>
          <div className={styles.grid}>
            {/* Client Information */}
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <span className={styles.label}>Client Name</span>
              <input
                type="text"
                className={styles.inputReadonly}
                value={log?.Client?.name || 'N/A'}
                readOnly
              />
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Client Type</span>
              <input
                type="text"
                className={styles.inputReadonly}
                value={log?.Client?.client_type || 'N/A'}
                readOnly
              />
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Client ID</span>
              <input
                type="text"
                className={styles.inputReadonly}
                value={log?.client_id || 'N/A'}
                readOnly
              />
            </div>

            {/* API Information */}
            <div className={styles.field}>
              <span className={styles.label}>API Name</span>
              <input
                type="text"
                className={styles.inputReadonly}
                value={log?.api_name || 'N/A'}
                readOnly
              />
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Status Code</span>
              <div className={getStatusClass(log?.status)}>
                {log?.status || 'N/A'}
              </div>
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Latency (ms)</span>
              <input
                type="text"
                className={styles.inputReadonly}
                value={log?.latency_ms || 'N/A'}
                readOnly
              />
            </div>

            {/* Vendor Information */}
            {shouldDisplay(log?.vendor_name) && (
              <div className={styles.field}>
                <span className={styles.label}>Vendor Name</span>
                <input
                  type="text"
                  className={styles.inputReadonly}
                  value={log?.vendor_name}
                  readOnly
                />
              </div>
            )}

            {shouldDisplay(log?.vendor_api_name) && (
              <div className={styles.field}>
                <span className={styles.label}>Vendor API Name</span>
                <input
                  type="text"
                  className={styles.inputReadonly}
                  value={log?.vendor_api_name}
                  readOnly
                />
              </div>
            )}

            {/* Financial Information */}
            <div className={styles.field}>
              <span className={styles.label}>Cost Charged</span>
              <input
                type="text"
                className={styles.inputReadonly}
                value={formatRupees(log?.cost_charged || '0.00')}
                readOnly
              />
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Before Hit Balance</span>
              <input
                type="text"
                className={styles.inputReadonly}
                value={formatRupees(log?.before_hit_balance || '0.00')}
                readOnly
              />
            </div>

            <div className={styles.field}>
              <span className={styles.label}>After Hit Balance</span>
              <input
                type="text"
                className={styles.inputReadonly}
                value={formatRupees(log?.after_hit_balance || '0.00')}
                readOnly
              />
            </div>

            {/* Dates */}
            <div className={styles.field}>
              <span className={styles.label}>Created At</span>
              <input
                type="text"
                className={styles.inputReadonly}
                value={formatDate(log?.createdAt)}
                readOnly
              />
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Updated At</span>
              <input
                type="text"
                className={styles.inputReadonly}
                value={formatDate(log?.updatedAt)}
                readOnly
              />
            </div>

            {/* Payloads */}
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <span className={styles.label}>Request Payload</span>
              <textarea
                className={styles.textarea}
                value={JSON.stringify(log?.request_payload || {}, null, 2)}
                readOnly
              />
            </div>

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <span className={styles.label}>Response Payload</span>
              <textarea
                className={styles.textarea}
                value={typeof log?.response_payload === 'string' 
                  ? log.response_payload 
                  : JSON.stringify(log?.response_payload || {}, null, 2)}
                readOnly
              />
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.button} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiLogViewModal;
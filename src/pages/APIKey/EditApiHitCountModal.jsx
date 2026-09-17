import { useState } from 'react';
import styles from './EditApiHitCount.module.css';

const EditHitCountModal = ({ hit, onClose, onUpdate }) => {
  const [hitCount, setHitCount] = useState(hit?.hit_count || 0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdate(hit.id, hitCount);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button 
          className={styles.closeBtn} 
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
        
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Update Hit Count</h3>
        </div>
        
        <div className={styles.modalBody}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Client Name</label>
            <input
              type="text"
              className={styles.inputField}
              value={hit?.Client?.name || ''}
              readOnly
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Client Type</label>
            <input
              type="text"
              className={styles.inputField}
              value={hit?.Client?.client_type || ''}
              readOnly
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Hit Count</label>
            <input
              type="number"
              className={styles.inputField}
              value={hitCount}
              onChange={(e) => setHitCount(parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>
        </div>
        
        <div className={styles.modalFooter}>
          <button 
            type="button"
            className={styles.secondaryBtn} 
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit"
            className={`${styles.primaryBtn} ${loading ? styles.loadingBtn : ''}`} 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? '' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditHitCountModal;
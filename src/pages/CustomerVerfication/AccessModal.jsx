import React from 'react';
import styles from './AccessModal.module.css';

const accessData = [
  { vendor: 'Police', access: 'Allow' },
  { vendor: 'Police', access: 'Allow' },
  { vendor: 'User', access: 'Not Allowed' },
  { vendor: 'Police', access: 'Allow' },
  { vendor: 'User', access: 'Not Allowed' },
  { vendor: 'User', access: 'Not Allowed' },
  { vendor: 'Police', access: 'Allow' },
];

const AccessModal = ({ onClose }) => {
  return (
    <div className={styles.modal}>
      <div className={styles.header}>
        <h3>Access</h3>
        <button className={styles.close} onClick={onClose}>×</button>
      </div>
      <p className={styles.description}>Role-based access control for secure user management</p>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Vendor</th>
            <th>Access</th>
          </tr>
        </thead>
        <tbody>
          {accessData.map((row, i) => (
            <tr key={i}>
              <td>{row.vendor}</td>
              <td className={row.access === 'Allow' ? styles.allow : styles.deny}>
                {row.access}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AccessModal;

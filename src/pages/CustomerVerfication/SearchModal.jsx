import React, { useState } from 'react';
import styles from './SearchModal.module.css';

const SearchModal = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('api');

  const filters = ['api', 'collection', 'action', 'api hit'];

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>Search</h3>
          <button onClick={onClose} className={styles.close}>×</button>
        </div>
        <input
          type="text"
          placeholder="I am searching for..."
          className={styles.input}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <div className={styles.filters}>
          {filters.map(f => (
            <label
              key={f}
              className={`${styles.filter} ${selected === f ? styles.active : ''}`}
              onClick={() => setSelected(f)}
            >
              {f}
            </label>
          ))}
        </div>
        <div className={styles.history}>
          <h4>Search History</h4>
          <ul>
            <li>PAN API</li>
            <li>Transaction Logs</li>
            <li>User Balance</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;

import styles from './Dashboard.module.css';
import { FaUsers, FaShieldAlt, FaGavel, FaBuilding, FaPlus } from 'react-icons/fa';
import { MdLocalHospital } from 'react-icons/md';

export default function Dashboard() {
  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h2>Dashboard</h2>
      </div>

      <div className={styles.statsRow}>
        <StatBox icon={<FaUsers />} label="Users" value="41" percent="+36%" color="blue" />
        <StatBox icon={<FaShieldAlt />} label="Police" value="07" percent="+36%" color="purple" />
        <StatBox icon={<FaGavel />} label="Lawyer" value="00" percent="+36%" color="green" />
        <StatBox icon={<MdLocalHospital />} label="Insurance" value="02" percent="+36%" color="orange" />
        <StatBox icon={<FaBuilding />} label="Company" value="00" percent="+36%" color="pink" />
      </div>

      <div className={styles.sectionRow}>
        <SimpleBox title="APIs" labels={["API Name", "Hit (Count)"]} values={["₹ 50,000", "₹ 8,990"]} />
        <SimpleBox title="Donation" labels={["Amount", "Hit (Count)"]} values={["₹ 50,000", "₹ 8,990"]} />
        <SimpleBox title="Vendor" labels={["Payment", "Outstanding"]} values={["₹ 50,000", "₹ 8,990"]} />
      </div>

      <div className={styles.sectionRow}>
        <BlackBox title="Claims" labels={["Processed", "Approved"]} values={["00", "00"]} />
        <BlackBox title="Accounts" labels={["Income", "Expenses"]} values={["₹ 1,40,9900", "₹ 90,984"]} />
        <GreenBox title="Cashback" labels={["Paid", "Pending", "Amount"]} values={["₹ 900", "₹ 450", "₹ 1,350"]} />
      </div>
    </div>
  );
}

function StatBox({ icon, label, value, percent, color }) {
  return (
    <div className={`${styles.statBox} ${styles[color]}`}>
      <div className={styles.statHeader}>
        {icon}
        <span>{label.toUpperCase()}</span>
      </div>
      <div className={styles.statValue}>
        {value}
        <span className={styles.statPercent}>{percent} ↑</span>
      </div>
    </div>
  );
}

function SimpleBox({ title, labels, values }) {
  return (
    <div className={styles.simpleBox}>
      <h4>{title}</h4>
      <div className={styles.simpleContent}>
        {labels.map((l, i) => (
          <div key={i}>
            <span>{l}</span>
            <p>{values[i]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function BlackBox({ title, labels, values }) {
  return (
    <div className={styles.blackBox}>
      <h4>{title}</h4>
      <div className={styles.simpleContent}>
        {labels.map((l, i) => (
          <div key={i}>
            <span>{l}</span>
            <p>{values[i]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function GreenBox({ title, labels, values }) {
  return (
    <div className={styles.greenBox}>
      <h4>{title}</h4>
      <div className={styles.simpleContent}>
        {labels.map((l, i) => (
          <div key={i}>
            <span>{l}</span>
            <p>{values[i]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

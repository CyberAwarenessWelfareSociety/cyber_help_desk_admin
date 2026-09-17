import { useState } from "react";
import styles from "./ApiKey.module.css";
import {
  FaSync,
  FaArrowUp,
  FaArrowDown,
  FaEdit,
  FaTrash,
  FaPlus,
} from "react-icons/fa";
import Table from "../../components/Table/Table";
import FilterComponent from "../../components/Filter/Filter";
import AddApiKey from "./AddApiKey";
import EditApiKey from "./EditApiKey";

export default function ApiKeyAccess() {
  const [filters, setFilters] = useState({
    ruleType: "all",
    ruleStatus: "all",
  });

  const [showAdd, setShowAdd] = useState(false);
  const [editRow, setEditRow] = useState(null);

  const data = [
    [
      "ValidCreditCardNumber",
      "Candidate",
      "Successful",
      "Data rule",
      "CCN",
      "70%",
      "3%",
      "down",
    ],
    [
      "ValidCreditCard",
      "Candidate",
      "Successful",
      "Rule set",
      "CCN",
      "70%",
      "3%",
      "down",
    ],
    [
      "CreditRatingExist",
      "Candidate",
      "Successful",
      "Quality rule",
      "Email address",
      "10%",
      "4%",
      "up",
    ],
    [
      "ValidEmailAddress",
      "Candidate",
      "Successful",
      "Quality rule",
      "Credit_report",
      "7%",
      "4%",
      "up",
    ],
    [
      "ValidNameExist",
      "Candidate",
      "Successful",
      "Quality rule",
      "Name",
      "5%",
      "3%",
      "down",
    ],
    [
      "QualityRule1",
      "Candidate",
      "Successful",
      "Quality rule",
      "--",
      "5%",
      "3%",
      "up",
    ],
    [
      "QualityRule2",
      "Candidate",
      "Unsuccessful",
      "Quality rule",
      "--",
      "5%",
      "No charge",
      "none",
    ],
    [
      "QualityRule3",
      "Candidate",
      "Unsuccessful",
      "Quality rule",
      "--",
      "3%",
      "4%",
      "down",
    ],
  ];

  const columns = [
    <input type="checkbox" />,
    "Rule set",
    "Rule status",
    "Run status",
    "Rule type",
    "Bindings",
    "Failed row (%)",
    "Delta",
    "Link",
    "Actions",
  ];

  const toolbarLeft = (
    <span className={styles.toolbarLabel}>
      Quality and data rule violations
    </span>
  );

  const toolbarRight = (
    <>
      <button className={styles.iconButton}>
        <FaSync />
      </button>
    </>
  );

  const filterConfig = [
    {
      key: "ruleType",
      label: "Rule Type",
      type: "select",
      options: [
        { value: "all", label: "All" },
        { value: "data", label: "Data rule" },
        { value: "quality", label: "Quality rule" },
        { value: "set", label: "Rule set" },
      ],
    },
    {
      key: "ruleStatus",
      label: "Rule Status",
      type: "select",
      options: [
        { value: "all", label: "All" },
        { value: "candidate", label: "Candidate" },
        { value: "final", label: "Final" },
      ],
    },
  ];

  // Modal open handlers
  const handleEdit = (rowData) => setEditRow(rowData);
  const handleDelete = (rowIdx) => {
    // TODO: Add deletion logic here
    alert("Delete action on row " + rowIdx);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.topBarRow}>
          <h2 className={styles.cardTitle}>API Keys</h2>
          <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
            <FaPlus /> Add API Key
          </button>
        </div>
        <Table
          title=""
          leftSlot={toolbarLeft}
          rightSlot={toolbarRight}
          showSearch
          onSearch={(val) => console.log("Search:", val)}
          filterContent={
            <FilterComponent
              config={filterConfig}
              values={filters}
              onChange={setFilters}
            />
          }
        >
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                {columns.map((col, idx) => (
                  <th key={idx}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(
                ([rule, status, run, type, bind, failed, delta, dir], i) => {
                  const deltaClass =
                    dir === "up"
                      ? styles.deltaUp
                      : dir === "down"
                      ? styles.deltaDown
                      : styles.deltaNeutral;

                  return (
                    <tr key={i}>
                      <td>
                        <input type="checkbox" />
                      </td>
                      <td>{rule}</td>
                      <td>{status}</td>
                      <td>{run}</td>
                      <td>{type}</td>
                      <td>{bind}</td>
                      <td>{failed}</td>
                      <td className={deltaClass}>
                        {delta}
                        {dir === "up" && <FaArrowUp size={12} />}
                        {dir === "down" && <FaArrowDown size={12} />}
                      </td>
                      <td>🔗</td>
                      <td className={styles.actionsCell}>
                        <button
                          className={styles.actionBtn}
                          onClick={() =>
                            handleEdit({
                              rule,
                              status,
                              run,
                              type,
                              bind,
                              failed,
                              delta,
                              dir,
                              i,
                            })
                          }
                          aria-label="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className={styles.actionBtn}
                          onClick={() => handleDelete(i)}
                          aria-label="Delete"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </Table>
      </div>

      {/* Modals */}
      {showAdd && <AddApiKey onClose={() => setShowAdd(false)} />}
      {editRow && <EditApiKey row={editRow} onClose={() => setEditRow(null)} />}
    </div>
  );
}

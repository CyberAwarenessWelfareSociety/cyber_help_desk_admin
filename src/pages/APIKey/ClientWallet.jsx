import styles from "./ApiKey.module.css";
import {
  FaSearch,
  FaFilter,
  FaDownload,
  FaSync,
  FaChartLine,
} from "react-icons/fa";
import Table from "../../components/Table/Table";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../Utils/api";
import FilterComponent from "../../Components/Filter/Filter";

const ClientWallets = () => {
  const toolbarLeft = (
    <span className={styles.toolbarLabel}>
      Client Wallet Balances
    </span>
  );

  const [wallets, setWallets] = useState([]);
  // const filterConfig = [
  //   {
  //     label: "Client Type",
  //     type: "select",
  //     options: ["All", "ADMIN", "USER"], // Add other client types as needed
  //   },
  //   {
  //     label: "Balance Range",
  //     type: "range",
  //     min: 0,
  //     max: 1000,
  //   },
  // ];

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const response = await api.get("/get-Client_Wallet");
      console.log("Wallet data:", response.data?.data);
      setWallets(response.data?.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load wallet data");
    }
  };

  const toolbarRight = (
    <>
      {/* <button className={styles.iconButton}>
        <FaFilter />
      </button>
      <button className={styles.iconButton}>
        <FaDownload />
      </button> */}
      <button className={styles.iconButton} onClick={fetchWallets}>
        <FaSync />
      </button>
      {/* <button className={styles.chartView}>
        Chart View <FaChartLine />
      </button> */}
    </>
  );
   const filterConfig = [
    {
      key: "client_type",
      label: "Client Type",
      options: [
        { value: "", label: "All" },
        { value: "USER", label: "User" },
        { value: "POLICE", label: "Police" },
      ],
    },
    {
      key: "approved",
      label: "Approval Status",
      options: [
        { value: "", label: "All" },
        { value: "true", label: "Approved" },
        { value: "false", label: "Not Approved" },
      ],
    },
    {
      key: "billing_method",
      label: "Billing Method",
      options: [
        { value: "", label: "All" },
        { value: "PREPAID", label: "Prepaid" },
        { value: "POSTPAID", label: "Postpaid" },
      ],
    },
    {
      key: "is_active",
      label: "Active Status",
      options: [
        { value: "", label: "All" },
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
    },
  ];

  return (
    <div className={styles.container}>
     

      <div className={styles.card}>
          <div className={styles.topBarRow}>
                  <h2 className={styles.cardTitle}>wallet Overview</h2>
                  <div className={styles.topBarActions}>
                    <div className={styles.searchWrapper}>
                      {/* <FaSearch className={styles.searchIcon} /> */}
                      <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search clients..."
                        onChange={(e) => console.log("Search:", e.target.value)}
                      />
                    </div>
                    {/* <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
                      <FaPlus /> Add Clients
                    </button> */}
                  </div>
                </div>

        <Table
          title=""
          leftSlot={toolbarLeft}
          rightSlot={toolbarRight}
         
          filterContent={
            <FilterComponent
              config={filterConfig}
              onApply={() => console.log("Apply filters clicked")}
            />
          }
        >
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th>Client Name</th>
                <th>Balance</th>
                <th>Account Created</th>
              </tr>
            </thead>
            <tbody>
              {wallets?.map((wallet, i) => (
                <tr key={i}>
                  <td>{wallet?.Client?.name}</td>
                  <td className={wallet.balance === "0.00" ? styles.zeroBalance : styles.positiveBalance}>
                    ₹{wallet?.balance}
                  </td>
                  <td>{new Date(wallet?.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Table>
      </div>
    </div>
  );
};

export default ClientWallets;
// import styles from "./getClients.module.css";
// import {
//   FaSearch,
//   FaFilter,
//   FaDownload,
//   FaSync,
//   FaChartLine,
//   FaArrowUp,
//   FaArrowDown,
// } from "react-icons/fa";
// import Table from "../../components/Table/Table";
// import { useEffect, useState } from "react";
// import toast from "react-hot-toast";
// import api from "../../Utils/api";
// import FilterComponent from "../../components/Filter/Filter";

// const ClientPayment = () => {
//   const toolbarLeft = (
//     <span className={styles.toolbarLabel}>
//       Payment Transactions
//     </span>
//   );

//   const [transactions, setTransactions] = useState([]);
//   const filterConfig = [
//     {
//       label: "Payment Type",
//       type: "select",
//       options: ["All", "JOINING_BONUS", "OTHER_TYPE"],
//     },
//     {
//       label: "Status",
//       type: "radio",
//       options: ["All", "COMPLETED", "PENDING", "FAILED"],
//     },
//   ];

//   useEffect(() => {
//     getTransactions();
//   }, []);

//   const getTransactions = async () => {
//     try {
//       const response = await api.get("/get-Client_Payment"); // Adjust this endpoint as needed
//       console.log("response of transactions: ", response.data?.data);
//       setTransactions(response.data?.data);
//     } catch (error) {
//       console.error(error);
//       toast.error("Something went wrong");
//     }
//   };

//   const toolbarRight = (
//     <>
//       <button className={styles.iconButton}>
//         <FaFilter />
//       </button>
//       <button className={styles.iconButton}>
//         <FaDownload />
//       </button>
//       <button className={styles.iconButton}>
//         <FaSync onClick={getTransactions} />
//       </button>
//       <button className={styles.chartView}>
//         Chart View <FaChartLine />
//       </button>
//     </>
//   );

//   return (
//     <div className={styles.container}>
//       {/* <div className={styles.headerRow}>
//         <h1 className={styles.title}>Payment Transactions</h1>
//       </div> */}

//       <div className={styles.card}>
//         <h2 className={styles.cardTitle}>Transaction History</h2>

//         <Table
//           title=""
//           leftSlot={toolbarLeft}
//           rightSlot={toolbarRight}
//           showSearch
//           onSearch={(val) => console.log("Search:", val)}
//           filterContent={
//             <FilterComponent
//               config={filterConfig}
//               onApply={() => console.log("Apply filters clicked")}
//             />
//           }
//         >
//           <table className={styles.table}>
//             <thead>
//               <tr className={styles.tableHeader}>
//                 <th>Client Name</th>
//                 <th>Client Type</th>
//                 <th>Amount</th>
//                 <th>Payment Type</th>
//                 <th>Status</th>
//                 <th>Created At</th>
//               </tr>
//             </thead>
//             <tbody>
//               {transactions?.map((transaction, i) => (
//                 <tr key={transaction.client_id}>
//                   <td>{transaction?.Client?.name}</td>
//                   <td>{transaction?.Client?.client_type}</td>
//                   <td>₹{transaction?.amount}</td>
//                   <td>{transaction?.payment_type}</td>
//                   <td>
//                     <span className={`${styles.status} ${transaction?.status === 'COMPLETED' ? styles.completed : styles.pending}`}>
//                       {transaction?.status}
//                     </span>
//                   </td>
//                   <td>{new Date(transaction?.createdAt).toLocaleDateString()}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </Table>
//       </div>
//     </div>
//   );
// }

// export default ClientPayment;

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
import FilterComponent from "../../components/Filter/Filter";
import Pagination from "./Pagination";

const ClientPayment = () => {
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });

  const filterConfig = [
    {
      key: "payment_type",
      label: "Payment Type",
      type: "select",
      options: [
        { value: "", label: "All" },
        { value: "JOINING_BONUS", label: "Joining Bonus" },
        { value: "REFERENCE_BONUS", label: "Reference Bonus" },
        { value: "DONATION", label: "Donation" }
      ],
    },
    // {
    //   key: "client_type",
    //   label: "Client Type",
    //   type: "select",
    //   options: [
    //     { value: "", label: "All" },
    //     { value: "USER", label: "User" },
    //     { value: "POLICE", label: "Police" },
    //     { value: "ADMIN", label: "Admin" }
    //   ],
    // }


     {
    key: "status",
    label: "Transaction Status",
    type: "select",
    options: [
      { value: "", label: "All" },
      { value: "INITIATED", label: "Initiated" },
      { value: "PENDING", label: "Pending" },
      { value: "COMPLETED", label: "Completed" },
      { value: "FAILED", label: "Failed" },
      { value: "CANCELLED", label: "Cancelled" },
    ],
  }
  ];

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newSize) => {
    setPagination((prev) => ({
      ...prev,
      pageSize: newSize,
      page: 1,
    }));
  };

  useEffect(() => {
    fetchTransactions();
  }, [pagination.page, pagination.pageSize, filters]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const queryParams = {
        page: pagination.page,
        limit: pagination.pageSize,
        ...cleanFilters(filters),
      };

      const response = await api.get("/get-Client_Payment", {
        params: queryParams,
      });

      setTransactions(response.data?.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data?.total || 0,
        totalPages: Math.ceil(
          (response.data?.total || 0) / pagination.pageSize
        ),
      }));
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to clean filters before sending to API
  const cleanFilters = (filters) => {
    const cleaned = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value === "") continue; // Skip empty values
      cleaned[key] = value;
    }
    return cleaned;
  };

  const toolbarRight = (
    <>
      <button className={styles.iconButton} onClick={fetchTransactions}>
        <FaSync />
      </button>
      {/* <button className={styles.chartView}>
        Chart View <FaChartLine />
      </button> */}
    </>
  );

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.topBarRow}>
          <h2 className={styles.cardTitle}>Payment/Donation</h2>
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
          rightSlot={toolbarRight}
          
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
                <th>Client Name</th>
                <th>Client Type</th>
                <th>Amount</th>
                <th>Payment Type</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className={styles.loadingCell}>
                    <div className={styles.spinnerContainer}>
                      <div className={styles.customSpinner}></div>
                    </div>
                  </td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <tr key={transaction.client_id}>
                    <td>{transaction?.Client?.name}</td>
                    <td>{transaction?.Client?.client_type}</td>
                    <td>₹{transaction?.amount}</td>
                    <td>{transaction?.payment_type}</td>
                    <td
                      className={`${styles.status} ${
                        transaction?.status === "COMPLETED"
                          ? styles.completed
                          : transaction?.status === "PENDING"
                          ? styles.pending
                          : styles.failed
                      }`}
                    >
                      {transaction?.status}
                    </td>
                    <td>
                      {new Date(transaction?.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className={styles.noData}>
                    No payment found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            pageSize={pagination.pageSize}
            totalItems={pagination.total}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </Table>
      </div>
    </div>
  );
};

export default ClientPayment;

// import styles from "./ApiKey.module.css";
// import {
//   FaSearch,
//   FaFilter,
//   FaDownload,
//   FaSync,
//   FaChartLine,
// } from "react-icons/fa";
// import Table from "../../components/Table/Table";
// import { useEffect, useState } from "react";
// import toast from "react-hot-toast";
// import api from "../../Utils/api";
// import FilterComponent from "../../components/Filter/Filter";

// const ApiUsesLog = () => {
//   const toolbarLeft = (
//     <span className={styles.toolbarLabel}>
//       API Usage Logs
//     </span>
//   );

//   const [apiLogs, setApiLogs] = useState([]);
//   const filterConfig = [
//     {
//       label: "Client Type",
//       type: "select",
//       options: ["All", "POLICE", "USER", "ADMIN", "CORPORATE"],
//     },
//     {
//       label: "API Name",
//       type: "select",
//       options: ["All", "contactToGst", "otherApi"], // Add other API names as needed
//     },
//     {
//       label: "Status Code",
//       type: "select",
//       options: ["All", "200", "400", "500"],
//     },
//     {
//       label: "Latency Range (ms)",
//       type: "range",
//       min: 0,
//       max: 5000,
//     },
//   ];

//   useEffect(() => {
//     fetchApiLogs();
//   }, []);

//   const fetchApiLogs = async () => {
//     try {
//       const response = await api.get("/get-Api_Usage_Log"); // Adjust endpoint as needed
//       console.log("API Logs data:", response.data?.data);
//       setApiLogs(response.data?.data);
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to load API usage logs");
//     }
//   };

//   const formatRupees = (amount) => {
//     return `₹${parseFloat(amount).toFixed(2)}`;
//   };

//   const toolbarRight = (
//     <>
//       <button className={styles.iconButton}>
//         <FaFilter />
//       </button>
//       <button className={styles.iconButton}>
//         <FaDownload />
//       </button>
//       <button className={styles.iconButton} onClick={fetchApiLogs}>
//         <FaSync />
//       </button>
//       <button className={styles.chartView}>
//         Chart View <FaChartLine />
//       </button>
//     </>
//   );

//   return (
//     <div className={styles.container}>
//       <div className={styles.headerRow}>
//         <h1 className={styles.title}>API Usage Logs</h1>
//       </div>

//       <div className={styles.card}>
//         <h2 className={styles.cardTitle}>API Transaction History</h2>

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
//                 <th>API Name</th>
//                 <th>Latency (ms)</th>
//                 <th>Cost Charged</th>
//                 <th>Before Hit</th>
//                 <th>After Hit</th>
//                 <th>Last Updated</th>
//               </tr>
//             </thead>
//             <tbody>
//               {apiLogs?.map((log, i) => (
//                 <tr key={i}>
//                   <td>{log?.Client?.name}</td>
//                   <td>{log?.api_name}</td>
//                   <td className={log.latency_ms > 1000 ? styles.highLatency : styles.lowLatency}>
//                     {log?.latency_ms}
//                   </td>
//                   <td>{formatRupees(log?.cost_charged)}</td>
//                   <td>{formatRupees(log?.before_hit_balance)}</td>
//                   <td>{formatRupees(log?.after_hit_balance)}</td>
//                   <td>{new Date(log?.updatedAt).toLocaleString()}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </Table>
//       </div>
//     </div>
//   );
// };

// export default ApiUsesLog;

// ------------------------------------------------------------------------------------

// import styles from "./ApiKey.module.css";
// import {
//   FaSearch,
//   FaFilter,
//   FaDownload,
//   FaSync,
//   FaChartLine,
//   FaEye,
// } from "react-icons/fa";
// import Table from "../../components/Table/Table";
// import { useEffect, useState } from "react";
// import toast from "react-hot-toast";
// import api from "../../Utils/api";
// import FilterComponent from "../../components/Filter/Filter";
// import Pagination from "./Pagination"; // Import Pagination component
// import ApiLogViewModal from "./APIUsesLogViewModal";

// const ApiUsesLog = () => {
//   const toolbarLeft = (
//     <>
//       <span className={styles.toolbarLabel}>{/* API Usage Logs */}</span>
//     </>
//   );

//   const [apiLogs, setApiLogs] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [filters, setFilters] = useState({});
//   const [selectedLog, setSelectedLog] = useState(null);
//   const [clients, setClients] = useState([]);
//   const [pagination, setPagination] = useState({
//     page: 1,
//     pageSize: 10,
//     total: 0,
//     totalPages: 1,
//   });

//   const filterConfig = [
//     {
//       key: "api_name",
//       label: "API Name",
//       type: "select",
//       options: [
//         { value: "", label: "All" },
//         { value: "contactToGst", label: "Contact to GST" },
//         { value: "vehicleTonumber", label: "Vehicle To number" },
//         { value: "otherApi", label: "Other API" },
//       ],
//     },

//     //   {
//     //   key: "client_id",
//     //   label: "Client",
//     //   type: "select",
//     //   options: [
//     //     { value: "", label: "All Clients" },
//     //     ...clients.map(client => ({
//     //       value: client.id,
//     //       label: client.name
//     //     }))
//     //   ],
//     // },

//     // Note: Range filter would need special handling in your FilterComponent
//   ];

//   useEffect(() => {
//     const fetchClients = async () => {
//       try {
//         const response = await api.get("/get-Client");
//         console.log("Clients data ⚪⚪⚪ :", response.data.data);
//         setClients(response.data.data);
//       } catch (error) {
//         toast.error("Failed to fetch clients");
//       }
//     };

//     fetchClients();
//   }, []);

//   useEffect(() => {
//     fetchApiLogs();
//   }, [pagination.page, pagination.pageSize, filters]);

//   const fetchApiLogs = async () => {
//     setLoading(true);
//     try {
//       const queryParams = {
//         page: pagination.page,
//         limit: pagination.pageSize,
//         ...cleanFilters(filters),
//       };

//       const response = await api.get("/get-Api_Usage_Log", {
//         params: queryParams,
//       });

//       setApiLogs(response.data?.data || []);
//       setPagination((prev) => ({
//         ...prev,
//         total: response.data?.total || 0,
//         totalPages: Math.ceil(
//           (response.data?.total || 0) / pagination.pageSize
//         ),
//       }));
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to load API usage logs");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const cleanFilters = (filters) => {
//     const cleaned = {};
//     for (const [key, value] of Object.entries(filters)) {
//       if (value === "") continue;
//       cleaned[key] = value;
//     }
//     return cleaned;
//   };

//   const formatRupees = (amount) => {
//     return `₹${parseFloat(amount).toFixed(2)}`;
//   };

//   const handlePageChange = (newPage) => {
//     setPagination((prev) => ({ ...prev, page: newPage }));
//   };

//   const handlePageSizeChange = (newSize) => {
//     setPagination((prev) => ({
//       ...prev,
//       pageSize: newSize,
//       page: 1,
//     }));
//   };

//   const toolbarRight = (
//     <>
//       {/* <button className={styles.iconButton}>
//         <FaFilter />
//       </button>
//       <button className={styles.iconButton}>
//         <FaDownload />
//       </button> */}
//       <button className={styles.iconButton} onClick={fetchApiLogs}>
//         <FaSync />
//       </button>
//       {/* <button className={styles.chartView}>
//         Chart View <FaChartLine />
//       </button> */}
//     </>
//   );

//   return (
//     <div className={styles.container}>
//       {/* <div className={styles.headerRow}>
//         <h1 className={styles.title}>API Usage Logs</h1>
//       </div> */}

//       <div className={styles.card}>
//         <div className={styles.topBarRow}>
//           <h2 className={styles.cardTitle}>API Hit Log</h2>
//           <div className={styles.topBarActions}>
//             <div className={styles.searchWrapper}>
//               {/* <FaSearch className={styles.searchIcon} /> */}
//               <input
//                 type="text"
//                 className={styles.searchInput}
//                 placeholder="Search clients..."
//                 onChange={(e) => console.log("Search:", e.target.value)}
//               />
//             </div>
//             {/* <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
//                       <FaPlus /> Add Clients
//                     </button> */}
//           </div>
//         </div>

//         <Table
//           title=""
//           leftSlot={toolbarLeft}
//           rightSlot={toolbarRight}
//           filterContent={
//             <FilterComponent
//               config={filterConfig}
//               values={filters}
//               onChange={setFilters}
//             />
//           }
//         >
//           <table className={styles.table}>
//             <thead>
//               <tr className={styles.tableHeader}>
//                 <th>Client Name</th>
//                 <th>API Name</th>
//                 <th>Latency (ms)</th>
//                 <th>Cost Charged</th>
//                 <th>Before Hit</th>
//                 <th>After Hit</th>
//                 <th>vendor_name</th>
//                 <th>vendor_api_name</th>
//                 <th>vendor_before_balance</th>
//                 <th>vendor_after_balance</th>
//                 <th>Last Updated</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan="13" className={styles.loadingCell}>
//                     <div className={styles.spinnerContainer}>
//                       <div className={styles.customSpinner}></div>
//                     </div>
//                   </td>
//                 </tr>
//               ) : apiLogs.length > 0 ? (
//                 apiLogs.map((log, i) => (
//                   <tr key={i}>
//                     <td>{log?.Client?.name}</td>
//                     <td>{log?.api_name}</td>
//                     <td
//                       className={
//                         log.latency_ms > 1000
//                           ? styles.highLatency
//                           : styles.lowLatency
//                       }
//                     >
//                       {log?.latency_ms}
//                     </td>
//                     <td>{formatRupees(log?.cost_charged)}</td>
//                     <td>{formatRupees(log?.before_hit_balance)}</td>
//                     <td>{formatRupees(log?.after_hit_balance)}</td>
//                     <td> {log?.vendor_name}</td>
//                     <td> {log?.vendor_api_name}</td>
//                     <td>{log?.vendor_before_balance}</td>
//                     <td>{log?.vendor_after_balance}</td>
//                     <td>{new Date(log?.updatedAt).toLocaleString()}</td>
//                     <td className={styles.textCenter}>
//                       <FaEye
//                         onClick={() => setSelectedLog(log)}
//                         style={{ cursor: "pointer" }}
//                       />
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="13" className={styles.noData}>
//                     No API logs found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//           <Pagination
//             currentPage={pagination.page}
//             totalPages={pagination.totalPages}
//             pageSize={pagination.pageSize}
//             totalItems={pagination.total}
//             onPageChange={handlePageChange}
//             onPageSizeChange={handlePageSizeChange}
//           />
//         </Table>
//       </div>
//       {selectedLog && (
//         <ApiLogViewModal
//           log={selectedLog}
//           onClose={() => setSelectedLog(null)}
//         />
//       )}
//     </div>
//   );
// };

// export default ApiUsesLog;


// ------------------------------------------------------------------



import styles from "./ApiKey.module.css";
import {
  FaSearch,
  FaSync,
  FaEye,
} from "react-icons/fa";
import Table from "../../components/Table/Table";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../Utils/api";
import FilterComponent from "../../components/Filter/Filter";
import Pagination from "./Pagination"; 
import ApiLogViewModal from "./APIUsesLogViewModal";

const ApiUsesLog = () => {
  const toolbarLeft = (
    <>
      <span className={styles.toolbarLabel}>{/* API Usage Logs */}</span>
    </>
  );

  const [apiLogs, setApiLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [selectedLog, setSelectedLog] = useState(null);
  const [clients, setClients] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });

  const [searchTerm, setSearchTerm] = useState(""); // raw input
  const [debouncedSearch, setDebouncedSearch] = useState(""); // debounced

  const filterConfig = [
    {
      key: "api_name",
      label: "API Name",
      type: "select",
      options: [
        { value: "", label: "All" },
        { value: "contactToGst", label: "Contact to GST" },
        { value: "vehicleTonumber", label: "Vehicle To number" },
        { value: "otherApi", label: "Other API" },
      ],
    },
  ];

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await api.get("/get-Client");
        setClients(response.data.data);
      } catch (error) {
        toast.error("Failed to fetch clients");
      }
    };

    fetchClients();
  }, []);

  // Debounce search input (500ms delay)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchApiLogs();
  }, [pagination.page, pagination.pageSize, filters, debouncedSearch]);

  const fetchApiLogs = async () => {
    setLoading(true);
    try {
      const queryParams = {
        page: pagination.page,
        limit: pagination.pageSize,
        search: debouncedSearch || undefined, // ✅ send debounced search
        ...cleanFilters(filters),
      };

      const response = await api.get("/get-Api_Usage_Log", {
        params: queryParams,
      });

      console.log("response for search : 😒😒😒", response.data)

      setApiLogs(response.data?.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data?.total || 0,
        totalPages: Math.ceil((response.data?.total || 0) / pagination.pageSize),
      }));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load API usage logs");
    } finally {
      setLoading(false);
    }
  };

  const cleanFilters = (filters) => {
    const cleaned = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value === "") continue;
      cleaned[key] = value;
    }
    return cleaned;
  };

  const formatRupees = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

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

  const toolbarRight = (
    <>
      <button className={styles.iconButton} onClick={fetchApiLogs}>
        <FaSync />
      </button>
    </>
  );

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.topBarRow}>
          <h2 className={styles.cardTitle}>API Hit Log</h2>
          <div className={styles.topBarActions}>
            <div className={styles.searchWrapper}>
              {/* <FaSearch className={styles.searchIcon} /> */}
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} // ✅ debounced search
              />
            </div>
          </div>
        </div>

        <Table
          title=""
          leftSlot={toolbarLeft}
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
                <th>API Name</th>
                <th>Latency (ms)</th>
                <th>Cost Charged</th>
                <th>Before Hit</th>
                <th>After Hit</th>
                <th>vendor_name</th>
                <th>vendor_api_name</th>
                <th>vendor_before_balance</th>
                <th>vendor_after_balance</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="13" className={styles.loadingCell}>
                    <div className={styles.spinnerContainer}>
                      <div className={styles.customSpinner}></div>
                    </div>
                  </td>
                </tr>
              ) : apiLogs.length > 0 ? (
                apiLogs.map((log, i) => (
                  <tr key={i}>
                    <td>{log?.Client?.name}</td>
                    <td>{log?.api_name}</td>
                    <td
                      className={
                        log.latency_ms > 1000
                          ? styles.highLatency
                          : styles.lowLatency
                      }
                    >
                      {log?.latency_ms}
                    </td>
                    <td>{formatRupees(log?.cost_charged)}</td>
                    <td>{formatRupees(log?.before_hit_balance)}</td>
                    <td>{formatRupees(log?.after_hit_balance)}</td>
                    <td>{log?.vendor_name}</td>
                    <td>{log?.vendor_api_name}</td>
                    <td>{log?.vendor_before_balance}</td>
                    <td>{log?.vendor_after_balance}</td>
                    <td>{new Date(log?.updatedAt).toLocaleString()}</td>
                    <td className={styles.textCenter}>
                      <FaEye
                        onClick={() => setSelectedLog(log)}
                        style={{ cursor: "pointer" }}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="13" className={styles.noData}>
                    No API logs found
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
      {selectedLog && (
        <ApiLogViewModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
};

export default ApiUsesLog;

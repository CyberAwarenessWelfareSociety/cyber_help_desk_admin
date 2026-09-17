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
// import Pagination from "./Pagination";

// const ApiHitBalance = () => {
//   const toolbarLeft = (
//     <span className={styles.toolbarLabel}>API Hit Balances</span>
//   );

//   const [apiHits, setApiHits] = useState([]);
//   const filterConfig = [
//     {
//       key: "client_type",
//       label: "Client Type",
//       options: [
//         { value: "", label: "All" },
//         { value: "USER", label: "User" },
//         { value: "POLICE", label: "Police" },
//       ],
//     },
//     {
//       label: "Hit Count Range",
//       type: "range",
//       min: 0,
//       max: 100,
//     },
//   ];

//   const [loading, setLoading] = useState(false);
//   const [pagination, setPagination] = useState({
//     page: 1,
//     pageSize: 10,
//     total: 0,
//     totalPages: 1,
//   });

//   useEffect(() => {
//     fetchApiHits();
//   }, [pagination.page, pagination.pageSize]); // Add pagination to dependencies

//   const fetchApiHits = async () => {
//     setLoading(true);
//     try {
//       const response = await api.get("/get-Api_Hit", {
//         params: {
//           page: pagination.page,
//           limit: pagination.pageSize,
//         },
//       });

//       setApiHits(response.data?.data || []);
//       setPagination((prev) => ({
//         ...prev,
//         total: response.data?.total || 0,
//         totalPages: Math.ceil(
//           (response.data?.total || 0) / pagination.pageSize
//         ),
//       }));
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to load API hit data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePageChange = (newPage) => {
//     setPagination((prev) => ({ ...prev, page: newPage }));
//   };

//   const handlePageSizeChange = (newSize) => {
//     setPagination((prev) => ({
//       ...prev,
//       pageSize: newSize,
//       page: 1, // Reset to first page when page size changes
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
//       <button className={styles.iconButton} onClick={fetchApiHits}>
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
//         <h1 className={styles.title}>API Hit Balances</h1>
//       </div> */}

//       <div className={styles.card}>
//         <div className={styles.topBarRow}>
//           <h2 className={styles.cardTitle}>API Usage Overview</h2>
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
//               <FaPlus /> Add Clients
//             </button> */}
//           </div>
//         </div>

//         <Table
//           title=""
//           leftSlot={toolbarLeft}
//           rightSlot={toolbarRight}
//           // showSearch
//           // onSearch={(val) => console.log("Search:", val)}
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
//                 <th className={styles.noWrapTex}>Client Name</th>
//                 <th>Client Type</th>
//                 <th>Hit Count</th>
//                 <th>Last Updated</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan="6" className={styles.loadingCell}>
//                     <div className={styles.spinnerContainer}>
//                       <div className={styles.customSpinner}></div>
//                     </div>
//                   </td>
//                 </tr>
//               ) : apiHits.length > 0 ? (
//                 apiHits.map((hit) => (
//                   <tr key={hit.id}>
//                     <td>{hit?.Client?.name}</td>
//                     <td>{hit?.Client?.client_type}</td>
//                     <td
//                       className={
//                         hit.hit_count === 0
//                           ? styles.zeroHits
//                           : styles.activeHits
//                       }
//                     >
//                       {hit?.hit_count}
//                     </td>
//                     <td>{new Date(hit?.updatedAt).toLocaleDateString()}</td>
//                     <td>
//                       <button
//                         className={styles.viewBtn}
//                         onClick={() => console.log("View details for:", hit.id)}
//                       >
//                         Update
//                       </button>
//                     </td>
//                     {/* <input type="number" value={hit.hit_count} className={styles.hitCountInput} /> */}
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="3" className={styles.noData}>
//                     No API hits found
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
//     </div>
//   );
// };

// export default ApiHitBalance;

import styles from "./ApiKey.module.css";
import {
  FaSearch,
  FaFilter,
  FaDownload,
  FaSync,
  FaChartLine,
  FaEdit,
} from "react-icons/fa";
import Table from "../../components/Table/Table";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../Utils/api";
import FilterComponent from "../../components/Filter/Filter";
import Pagination from "./Pagination";
import EditHitCountModal from "./EditApiHitCountModal";

const ApiHitBalance = () => {
  const toolbarLeft = (
    <span className={styles.toolbarLabel}>API Hit Balances</span>
  );

  const [apiHits, setApiHits] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedHit, setSelectedHit] = useState(null);
  const [loading, setLoading] = useState(false);

  const filterConfig = [
    // {
    //   key: "client_type",
    //   label: "Client Type",
    //   options: [
    //     { value: "", label: "All" },
    //     { value: "USER", label: "User" },
    //     { value: "POLICE", label: "Police" },
    //   ],
    // },
   
  ];

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {
    fetchApiHits();
  }, [pagination.page, pagination.pageSize]);

  const fetchApiHits = async () => {
    setLoading(true);
    try {
      const response = await api.get("/get-Api_Hit", {
        params: {
          page: pagination.page,
          limit: pagination.pageSize,
        },
      });

      setApiHits(response.data?.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data?.total || 0,
        totalPages: Math.ceil(
          (response.data?.total || 0) / pagination.pageSize
        ),
      }));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load API hit data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateHitCount = async (id, hitCount) => {
    try {
      await api.put(`/update-api_hit/${id}`, { hit_count: hitCount });
      toast.success("Hit count updated successfully");
      fetchApiHits();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update hit count");
    }
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
      <button className={styles.iconButton} onClick={fetchApiHits}>
        <FaSync />
      </button>
    </>
  );

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.topBarRow}>
          <h2 className={styles.cardTitle}>API Usage Overview</h2>
          <div className={styles.topBarActions}>
            <div className={styles.searchWrapper}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search clients..."
                onChange={(e) => console.log("Search:", e.target.value)}
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
              onApply={() => console.log("Apply filters clicked")}
            />
          }
        >
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th className={styles.noWrapTex}>Client Name</th>
                <th>Client Type</th>
                <th>Hit Count</th>
                <th>Last Updated</th>
                <th>Actions</th>
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
              ) : apiHits.length > 0 ? (
                apiHits.map((hit) => (
                  <tr key={hit.id}>
                    <td>{hit?.Client?.name}</td>
                    <td>{hit?.Client?.client_type}</td>
                    <td
                      className={
                        hit.hit_count === 0
                          ? styles.zeroHits
                          : styles.activeHits
                      }
                    >
                      {hit?.hit_count}
                    </td>
                    <td>{new Date(hit?.updatedAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className={`${styles.actionBtn} ${styles.edit}`}
                        onClick={() => {
                          setSelectedHit(hit);
                          setEditModalOpen(true);
                        }}
                      >
                        <FaEdit/>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className={styles.noData}>
                    No API hits found
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

      {editModalOpen && selectedHit && (
        <EditHitCountModal
          hit={selectedHit}
          onClose={() => setEditModalOpen(false)}
          onUpdate={handleUpdateHitCount}
        />
      )}
    </div>
  );
};

export default ApiHitBalance;

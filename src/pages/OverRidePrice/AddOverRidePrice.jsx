// import modalStyles from "./AddOverRideModal.module.css";
// import { FaTimes } from "react-icons/fa";
// import { useEffect, useState } from "react";
// import api from "../../Utils/api";
// import toast from "react-hot-toast";

// export default function AddOverRidePrice({ onClose, onAdd }) {
//   const [form, setForm] = useState({
//     client_id: "",
//     api_name: "",
//     override_price: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [clients, setClients] = useState([]);
//   const [filteredClients, setFilteredClients] = useState([]);

//   //   useEffect(() => {
//   //   const fetchClients = async () => {
//   //     try {
//   //       const response = await api.get("/get-Client");
//   //       setClients(response.data.data); // Assuming response.data is an array of clients
//   //     } catch (error) {
//   //       toast.error("Failed to fetch clients");
//   //     }
//   //   };

//   //   fetchClients();
//   // }, []);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);

//         // Fetch all clients and existing override prices in parallel
//         const [clientsResponse, overridePricesResponse] = await Promise.all([
//           api.get("/get-Client"),
//           api.get("/get-Override_Price"), // adjust endpoint as needed
//         ]);

//         const allClients = clientsResponse.data.data;
//         const clientsWithPricing = overridePricesResponse.data.data.map(
//           (p) => p.client_id
//         );

//         // Filter clients who don't have pricing yet
//         const availableClients = allClients.filter(
//           (client) => !clientsWithPricing.includes(client.id)
//         );

//         setClients(allClients);
//         setFilteredClients(availableClients);
//       } catch (error) {
//         toast.error("Failed to fetch data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     // Validate price input
//     if (name === "override_price") {
//       if (value === "" || /^\d*\.?\d*$/.test(value)) {
//         setForm((f) => ({ ...f, [name]: value }));
//       }
//     } else {
//       setForm((f) => ({ ...f, [name]: value }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Simple form validation
//     if (!form.client_id) {
//       toast.error("Please select a client ");
//       return;
//     }
//     if (!form.api_name) {
//       toast.error("Please select a API name");
//       return;
//     }

//     // // Additional validation for price format
//     // if (form.override_price ){
//     //   toast.error("Please enter a valid price");
//     //   return;
//     // }
//     setLoading(true);

//     try {
//       const response = await api.post("/create-override_price", {
//         client_id: form.client_id,
//         api_name: form.api_name,
//         override_price: form.override_price,
//       });

//       toast.success("Pricing added successfully");
//       onAdd && onAdd(response.data);
//     } catch (error) {
//       //   console.error("Error adding pricing:", error);
//       const serverErrors = error.response.data.errors;
//       console.error("Error adding pricing:", serverErrors);

//       if (error.response?.data?.errors) {
//         // Handle multiple validation errors from server

//         let errorMessage = serverErrors[0]?.message;
//         toast.error(errorMessage);
//       } else {
//         toast.error(error.response?.data?.message || "Failed to add pricing");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className={modalStyles.overlay}>
//       <div
//         className={`${modalStyles.modal} ${modalStyles.wideModal}`}
//         style={{ maxWidth: "500px" }}
//       >
//         <button className={modalStyles.closeBtn} onClick={onClose}>
//           <FaTimes />
//         </button>
//         <h3 className={modalStyles.modalTitle}>Add OverRide Pricing</h3>

//         <form className={modalStyles.form} onSubmit={handleSubmit}>
//           {/* Full width client ID field */}
//           {/* <label className={modalStyles.fullWidthLabel}>
//             Client ID
//             <input
//               name="client_id"
//               type="text"
//               value={form.client_id}
//               onChange={handleChange}
//               required
//               placeholder="Enter client ID"
//               className={modalStyles.fullWidthInput}
//             />
//           </label> */}
//           <label className={modalStyles.fullWidthLabel}>
//             Client
//             <select
//               name="client_id"
//               value={form.client_id}
//               onChange={handleChange}
//               required
//               className={modalStyles.fullWidthInput}
//             >
//               <option value="">Select Client</option>
//               {filteredClients.map((client) => (
//                 <option key={client.id} value={client.id}>
//                   {client.name}
//                 </option>
//               ))}
//             </select>
//           </label>

//           {/* Two fields in one row */}
//           {/* <div className={modalStyles.row}> */}
//           <label className={modalStyles.halfWidthLabel}>
//             API Name
//             <select
//               name="api_name"
//               value={form.api_name}
//               onChange={handleChange}
//               required
//               className={modalStyles.halfWidthInput}
//             >
//               <option value="">Select API</option>
//               <option value="vehicleTonumber">Vehicle to Number</option>
//               {/* Add other API options as needed */}
//             </select>
//           </label>

//           <label className={modalStyles.halfWidthLabel}>
//             Price ($)
//             <input
//               name="override_price"
//               type="text"
//               value={form.override_price}
//               onChange={handleChange}
//               required
//               placeholder="0.00"
//               className={modalStyles.halfWidthInput}
//             />
//           </label>
//           {/* </div> */}

//           <div className={modalStyles.actions}>
//             <button type="button" onClick={onClose} disabled={loading}>
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className={modalStyles.primaryBtn}
//               disabled={loading}
//             >
//               {loading ? "Adding..." : "Add Pricing"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }


// -----------------------------------------


import React, { useEffect, useState } from "react";
import Table from "../../components/Table/Table";
// import Pagination from "../../components/Pagination/Pagination";
import api from "../../Utils/api";
import { toast } from "react-hot-toast";

export default function OverRidePrice() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/get-Override_Price", {
        params: { page, limit: pageSize },
      });

      setData(res.data.data || []);
      setTotalItems(res.data.total || 0);
    } catch (err) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize]);

  const handleSearch = async (query) => {
    try {
      const res = await api.get("/get-Override_Price", {
        params: { search: query },
      });
      setData(res.data.data || []);
      setTotalItems(res.data.total || 0);
      setPage(1);
    } catch (err) {
      toast.error("Search failed");
    }
  };

  return (
    <div className="_container">
      <div className="_card">
        <Table
          title="Override Prices"
          rightSlot={<button className="_addBtn">Add</button>}
          showSearch={true}
          onSearch={handleSearch}
          pagination={
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(totalItems / pageSize)}
              onPageChange={setPage}
            />
          }
        >
          <thead>
            <tr>
              <th>Client</th>
              <th>API Name</th>
              <th>Price ($)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  Loading...
                </td>
              </tr>
            ) : data.length > 0 ? (
              data.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.client?.name || "N/A"}</td>
                  <td>{item.api_name}</td>
                  <td>{item.override_price}</td>
                  <td>
                    <button>Edit</button>
                    <button>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import styles from "./Volunteers.module.css";
import EditVolunteerModal from "./EditVolunteerModal";
import {
  FaEye,
  FaSync,
  FaCheck,
  FaTimes,
  FaUserPlus,
  FaUserMinus,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaEdit,
  FaTrashAlt,
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8600/api";
const PAGE_SIZE_OPTIONS = [10, 20, 50];

const GetVolunteers = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingVolunteer, setEditingVolunteer] = useState(null);

  // Assign Modal States
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [isAssignLoading, setIsAssignLoading] = useState(false);
  const [approvedOptions, setApprovedOptions] = useState([]);

  // Remove Modal States
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedRemoveVolunteerId, setSelectedRemoveVolunteerId] =
    useState("");
  const [selectedRemovePermissions, setSelectedRemovePermissions] = useState(
    [],
  );
  const [isRemoveLoading, setIsRemoveLoading] = useState(false);

  // Approve/Reject/Delete Modal States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [pendingId, setPendingId] = useState(null);
  const [pendingVolunteer, setPendingVolunteer] = useState(null);

  const token = localStorage.getItem("token");

  const models = [
    { value: "Blackmail", label: "Blackmail" },
    { value: "CyberFraud", label: "Cyber Fraud" },
    { value: "AccountFreeze", label: "Account Freeze" },
    { value: "NudeImage", label: "Remove Nude Image" },
    { value: "NudeVideo", label: "Remove Nude Video" },
    { value: "HarmfulContent", label: "Remove Harmful Content / URL" },
  ];

  // Debounce search so we don't hit API on every keystroke
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Fetch Volunteer Applications (server-side pagination)
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/volunteer`, {
        params: {
          page,
          limit,
          search: debouncedSearch || undefined,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      const list = res.data.applications || [];
      const count = Number(res.data.count) || list.length;
      const pages =
        Number(res.data.totalPages) ||
        Math.max(1, Math.ceil(count / limit));

      setApplications(list);
      setTotalCount(count);
      setTotalPages(pages);

      // Keep page in range if filter reduced total pages
      if (page > pages) {
        setPage(pages);
      }
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to load volunteer applications",
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, token]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  /** Approved volunteers for assign/remove dropdowns (all pages, capped) */
  const fetchApprovedOptions = async () => {
    try {
      const res = await axios.get(`${API_URL}/volunteer`, {
        params: { page: 1, limit: 100, is_approved: true },
        headers: { Authorization: `Bearer ${token}` },
      });
      setApprovedOptions(res.data.applications || []);
    } catch (err) {
      console.error(err);
      // fallback to current page approved
      setApprovedOptions(
        applications.filter((app) => app.is_approved === true),
      );
    }
  };

  const approvedVolunteers =
    approvedOptions.length > 0
      ? approvedOptions
      : applications.filter((app) => app.is_approved === true);

  const pageNumbers = useMemo(() => {
    const maxButtons = 5;
    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  const rangeStart = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, totalCount);

  // ==================== APPROVE / REJECT / DELETE ====================
  const openConfirm = (id, type, volunteerObj = null) => {
    setPendingId(id);
    setActionType(type);
    setPendingVolunteer(volunteerObj);
    setShowConfirmModal(true);
  };

  const handleAction = async () => {
    if (!pendingId || !actionType) return;

    if (actionType === "delete") {
      try {
        await axios.delete(`${API_URL}/volunteer/${pendingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Volunteer deleted successfully!");
        fetchApplications();
        if (selectedApplication?.id === pendingId) setSelectedApplication(null);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to delete volunteer");
      } finally {
        setShowConfirmModal(false);
        setPendingId(null);
        setActionType(null);
        setPendingVolunteer(null);
      }
      return;
    }

    const payload = {
      is_approved: actionType === "approve",
      is_rejected: actionType === "reject",
    };

    try {
      await axios.put(`${API_URL}/volunteer/${pendingId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Application ${actionType}d successfully!`);
      fetchApplications();
      if (selectedApplication?.id === pendingId) setSelectedApplication(null);
    } catch (err) {
      toast.error(`Failed to ${actionType} application`);
    } finally {
      setShowConfirmModal(false);
      setPendingId(null);
      setActionType(null);
      setPendingVolunteer(null);
    }
  };

  // ==================== EDIT VOLUNTEER PROFILE ====================
  const openEditModal = (volunteer) => {
    setEditingVolunteer(volunteer);
  };

  const handleEditSuccess = (updatedVolunteer) => {
    fetchApplications();
    if (selectedApplication && selectedApplication.id === updatedVolunteer.id) {
      setSelectedApplication((prev) => ({
        ...prev,
        ...updatedVolunteer,
      }));
    }
  };

  // ==================== ASSIGN VOLUNTEER ====================
  const openAssignModal = (clientId = "") => {
    setSelectedVolunteerId(clientId);
    setSelectedPermissions([]);
    setShowAssignModal(true);
    void fetchApprovedOptions();
  };

  const handleAssign = async () => {
    if (!selectedVolunteerId) {
      toast.error("Please select a volunteer");
      return;
    }
    if (selectedPermissions.length === 0) {
      toast.error("Please select at least one model");
      return;
    }

    setIsAssignLoading(true);
    try {
      await axios.post(`${API_URL}/chat/assign`, {
        client_id: selectedVolunteerId,
        permissions: selectedPermissions,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(`Volunteer assigned successfully!`);
      setShowAssignModal(false);
      fetchApplications();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign volunteer");
    } finally {
      setIsAssignLoading(false);
    }
  };

  // ==================== REMOVE VOLUNTEER ====================
  const openRemoveModal = (clientId = "") => {
    setSelectedRemoveVolunteerId(clientId);
    setSelectedRemovePermissions([]);
    setShowRemoveModal(true);
    void fetchApprovedOptions();
  };

  const handleRemove = async () => {
    if (!selectedRemoveVolunteerId) {
      toast.error("Please select a volunteer");
      return;
    }
    if (selectedRemovePermissions.length === 0) {
      toast.error("Please select at least one model");
      return;
    }

    setIsRemoveLoading(true);
    try {
      await axios.post(`${API_URL}/chat/remove-volunteer-from-model`, {
        client_id: selectedRemoveVolunteerId,
        permissions: selectedRemovePermissions,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(`Volunteer removed successfully!`);
      setShowRemoveModal(false);
      fetchApplications();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove volunteer");
    } finally {
      setIsRemoveLoading(false);
    }
  };

  const togglePermission = (value, isAssign = true) => {
    if (isAssign) {
      setSelectedPermissions(prev =>
        prev.includes(value)
          ? prev.filter(p => p !== value)
          : [...prev, value]
      );
    } else {
      setSelectedRemovePermissions(prev =>
        prev.includes(value)
          ? prev.filter(p => p !== value)
          : [...prev, value]
      );
    }
  };

  // Format Permissions for Display
  const formatPermissions = (permissions) => {
    if (!permissions) return "No permissions assigned";
    
    let permsArray = permissions;
    if (typeof permissions === 'string') {
      try {
        permsArray = JSON.parse(permissions);
      } catch {
        return "No permissions assigned";
      }
    }

    if (Array.isArray(permsArray) && permsArray.length > 0) {
      return permsArray.join(", ");
    }
    return "No permissions assigned";
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🙋‍♂️ Volunteer Management</h1>
        <p className={styles.subtitle}>
          Review and manage volunteer applications and permissions
        </p>
      </div>

      {/* Top Bar */}
      <div className={styles.topBar}>
        <button className={styles.assignBtn} onClick={() => openAssignModal()}>
          <FaUserPlus /> Assign Volunteer
        </button>

        <button className={styles.removeBtn} onClick={() => openRemoveModal()}>
          <FaUserMinus /> Remove Volunteer
        </button>

        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by name, phone, email or volunteer ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className={styles.limitSelect}
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setPage(1);
          }}
          aria-label="Rows per page"
        >
          {PAGE_SIZE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>

        <button className={styles.refreshBtn} onClick={fetchApplications}>
          <FaSync /> Refresh
        </button>
      </div>

      <div className={styles.resultsMeta}>
        Showing <strong>{rangeStart}</strong>–<strong>{rangeEnd}</strong> of{" "}
        <strong>{totalCount}</strong> volunteers
        {debouncedSearch ? (
          <span className={styles.searchHint}>
            {" "}
            · filtered by “{debouncedSearch}”
          </span>
        ) : null}
      </div>

      {/* Table */}
      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Profile</th>
                <th>Full Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Volunteer ID</th>
                <th>Gender</th>
                <th>Location</th>
                <th>Status</th>
                <th className={styles.actionHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className={styles.loadingRow}>
                    Loading volunteer applications...
                  </td>
                </tr>
              ) : applications.length > 0 ? (
                applications.map((app) => (
                  <tr key={app.id} className={styles.tableRow}>
                    <td>
                      {app.profile_image ? (
                        <img
                          src={app.profile_image}
                          alt="profile"
                          className={styles.thumbnail}
                          onClick={() => setSelectedImage(app.profile_image)}
                        />
                      ) : (
                        <div className={styles.noImage}>No Photo</div>
                      )}
                    </td>
                    <td className={styles.nameCell}>{app.full_name}</td>
                    <td>{app.Applicant?.phone || app.phone}</td>
                    <td>{app.email}</td>
                    <td>{app.volunteer_id}</td>
                    <td>{app.gender}</td>
                    <td>
                      {app.city_town}, {app.state}
                    </td>
                    <td>
                      <span className={styles.statusBadge}>
                        {app.is_approved
                          ? "Approved"
                          : app.is_rejected
                            ? "Rejected"
                            : "Pending"}
                      </span>
                    </td>
                    <td className={styles.actions}>
                      <button
                        className={styles.viewBtn}
                        onClick={() => setSelectedApplication(app)}
                      >
                        👁️ View
                      </button>

                      <button
                        className={styles.editBtn}
                        onClick={() => openEditModal(app)}
                        title="Edit Volunteer Profile"
                      >
                        <FaEdit /> Edit
                      </button>

                      {!app.is_approved && !app.is_rejected && (
                        <>
                          <button
                            className={styles.approveBtn}
                            onClick={() => openConfirm(app.id, "approve", app)}
                          >
                            <FaCheck /> Approve
                          </button>
                          <button
                            className={styles.rejectBtn}
                            onClick={() => openConfirm(app.id, "reject", app)}
                          >
                            <FaTimes /> Reject
                          </button>
                        </>
                      )}

                      <button
                        className={styles.deleteBtn}
                        onClick={() => openConfirm(app.id, "delete", app)}
                        title="Delete Volunteer"
                      >
                        <FaTrashAlt /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className={styles.noData}>
                    No volunteer applications found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination — always visible */}
      <div className={styles.pagination}>
        <button
          className={styles.pageBtn}
          disabled={page <= 1 || loading}
          onClick={() => setPage(1)}
          title="First page"
        >
          «
        </button>
        <button
          className={styles.pageBtn}
          disabled={page <= 1 || loading}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          <FaChevronLeft /> Previous
        </button>

        <div className={styles.pageNumbers}>
          {pageNumbers.map((n) => (
            <button
              key={n}
              className={`${styles.pageNumBtn} ${
                n === page ? styles.pageNumActive : ""
              }`}
              disabled={loading}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          ))}
        </div>

        <span className={styles.pageInfo}>
          Page <strong>{page}</strong> of <strong>{totalPages}</strong>
        </span>

        <button
          className={styles.pageBtn}
          disabled={page >= totalPages || loading}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next <FaChevronRight />
        </button>
        <button
          className={styles.pageBtn}
          disabled={page >= totalPages || loading}
          onClick={() => setPage(totalPages)}
          title="Last page"
        >
          »
        </button>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className={styles.modalOverlay} onClick={() => setSelectedImage(null)}>
          <div className={styles.imageModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedImage(null)}>✕</button>
            <img src={selectedImage} alt="Profile" />
          </div>
        </div>
      )}

      {/* Volunteer Details Modal */}
      {selectedApplication && (
        <div className={styles.modalOverlay} onClick={() => setSelectedApplication(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>🙋‍♂️ Volunteer Details</h2>
              <button className={styles.closeBtn} onClick={() => setSelectedApplication(null)}>✕</button>
            </div>

            <div className={styles.detailsGrid}>
              <div className={styles.infoSection}>
                <h4>Personal Information</h4>
                <p><strong>Name:</strong> {selectedApplication.full_name}</p>
                <p><strong>Gender:</strong> {selectedApplication.gender || "N/A"}</p>
                <p><strong>Phone:</strong> {selectedApplication.Applicant?.phone || selectedApplication.phone || "N/A"}</p>
                <p><strong>Email:</strong> {selectedApplication.email || "N/A"}</p>
                <p><strong>DOB:</strong> {selectedApplication.date_of_birth ? new Date(selectedApplication.date_of_birth).toLocaleDateString('en-IN') : "N/A"}</p>
              </div>

              <div className={styles.infoSection}>
                <h4>Volunteer & System Info</h4>
                <p><strong>Volunteer ID:</strong> {selectedApplication.volunteer_id || "N/A"}</p>
                <p><strong>Role:</strong> {selectedApplication.volunteer_role || "Volunteer"}</p>
                <p><strong>Status:</strong> 
                  {selectedApplication.is_approved ? " ✅ Approved" : 
                   selectedApplication.is_rejected ? " ❌ Rejected" : " ⏳ Pending Review"}
                </p>
                <p><strong>Remarks:</strong> {selectedApplication.remarks || "None"}</p>
              </div>

              <div className={styles.infoSection}>
                <h4>Location</h4>
                <p><strong>City:</strong> {selectedApplication.city_town || "N/A"}</p>
                <p><strong>District:</strong> {selectedApplication.district || "N/A"}</p>
                <p><strong>State:</strong> {selectedApplication.state || "N/A"}</p>
                <p><strong>Address:</strong> {selectedApplication.address || "N/A"}</p>
              </div>

              <div className={styles.infoSection}>
                <h4>Current Permissions</h4>
                <p className={styles.permissionsText}>
                  {formatPermissions(selectedApplication.permissions)}
                </p>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button 
                className={styles.editBtn} 
                onClick={() => openEditModal(selectedApplication)}
              >
                <FaEdit /> Edit Profile
              </button>
              {selectedApplication.is_approved && (
                <>
                  <button 
                    className={styles.assignBtn} 
                    onClick={() => openAssignModal(selectedApplication.client_id)}
                  >
                    <FaUserPlus /> Assign
                  </button>
                  <button 
                    className={styles.removeBtn} 
                    onClick={() => openRemoveModal(selectedApplication.client_id)}
                  >
                    <FaUserMinus /> Remove
                  </button>
                </>
              )}
              <button 
                className={styles.deleteBtn} 
                onClick={() => openConfirm(selectedApplication.id, "delete", selectedApplication)}
              >
                <FaTrashAlt /> Delete Volunteer
              </button>
              <button className={styles.closeModalBtn} onClick={() => setSelectedApplication(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAssignModal(false)}>
          <div className={styles.assignModal} onClick={(e) => e.stopPropagation()}>
            <h3>Assign Volunteer to Cases</h3>

            <div className={styles.formGroup}>
              <label>Select Volunteer</label>
              <select
                value={selectedVolunteerId}
                onChange={(e) => setSelectedVolunteerId(e.target.value)}
                className={styles.selectInput}
                disabled={isAssignLoading}
              >
                <option value="">-- Choose Approved Volunteer --</option>
                {approvedVolunteers.map((app) => (
                  <option key={app.id} value={app.client_id}>
                    {app.full_name} — {app.phone}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Select Models (Multiple allowed)</label>
              <div className={styles.checkboxGroup}>
                {models.map(model => (
                  <label key={model.value} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(model.value)}
                      onChange={() => togglePermission(model.value, true)}
                      disabled={isAssignLoading}
                    />
                    {model.label}
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.amountActions}>
              <button 
                className={styles.cancelBtn} 
                onClick={() => setShowAssignModal(false)}
                disabled={isAssignLoading}
              >
                Cancel
              </button>
              <button 
                className={styles.confirmApproveBtn} 
                onClick={handleAssign}
                disabled={isAssignLoading}
              >
                {isAssignLoading ? (
                  <>
                    <FaSpinner className="spin" /> Assigning...
                  </>
                ) : (
                  "Assign Volunteer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Modal */}
      {showRemoveModal && (
        <div className={styles.modalOverlay} onClick={() => setShowRemoveModal(false)}>
          <div className={styles.assignModal} onClick={(e) => e.stopPropagation()}>
            <h3>Remove Volunteer from Cases</h3>

            <div className={styles.formGroup}>
              <label>Select Volunteer</label>
              <select
                value={selectedRemoveVolunteerId}
                onChange={(e) => setSelectedRemoveVolunteerId(e.target.value)}
                className={styles.selectInput}
                disabled={isRemoveLoading}
              >
                <option value="">-- Choose Volunteer --</option>
                {approvedVolunteers.map((app) => (
                  <option key={app.id} value={app.client_id}>
                    {app.full_name} — {app.phone}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Select Models to Remove</label>
              <div className={styles.checkboxGroup}>
                {models.map(model => (
                  <label key={model.value} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={selectedRemovePermissions.includes(model.value)}
                      onChange={() => togglePermission(model.value, false)}
                      disabled={isRemoveLoading}
                    />
                    {model.label}
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.amountActions}>
              <button 
                className={styles.cancelBtn} 
                onClick={() => setShowRemoveModal(false)}
                disabled={isRemoveLoading}
              >
                Cancel
              </button>
              <button 
                className={styles.rejectBtn} 
                onClick={handleRemove}
                disabled={isRemoveLoading}
              >
                {isRemoveLoading ? (
                  <>
                    <FaSpinner className="spin" /> Removing...
                  </>
                ) : (
                  "Remove Volunteer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className={styles.modalOverlay} onClick={() => setShowConfirmModal(false)}>
          <div className={styles.amountModal} onClick={(e) => e.stopPropagation()}>
            <h3>
              {actionType === "approve"
                ? "Approve Application?"
                : actionType === "reject"
                  ? "Reject Application?"
                  : "Delete Volunteer?"}
            </h3>
            <p>
              {actionType === "delete"
                ? `Are you sure you want to permanently delete ${
                    pendingVolunteer?.full_name ? `"${pendingVolunteer.full_name}"` : "this volunteer"
                  }? This action cannot be undone.`
                : `Are you sure you want to ${actionType} this volunteer?`}
            </p>
            <div className={styles.amountActions}>
              <button className={styles.cancelBtn} onClick={() => setShowConfirmModal(false)}>
                Cancel
              </button>
              <button
                className={
                  actionType === "approve"
                    ? styles.approveBtn
                    : actionType === "reject"
                      ? styles.rejectBtn
                      : styles.deleteBtn
                }
                onClick={handleAction}
              >
                Yes, {actionType === "delete" ? "Delete" : actionType}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Volunteer Profile Modal */}
      {editingVolunteer && (
        <EditVolunteerModal
          volunteer={editingVolunteer}
          models={models}
          onClose={() => setEditingVolunteer(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default GetVolunteers;
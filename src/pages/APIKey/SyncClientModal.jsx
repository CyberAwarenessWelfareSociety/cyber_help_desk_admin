import React, { useState, useEffect } from "react";
import styles from "./SyncClientModal.module.css";
import {
  FaTimes,
  FaSync,
  FaPhoneAlt,
  FaEnvelope,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUserShield,
  FaLink,
  FaUnlink,
  FaUser,
  FaShieldAlt,
  FaIdCard,
} from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../../Utils/api";

export default function SyncClientModal({ client, onClose, handleRefresh }) {
  const [phone, setPhone] = useState(client?.phone || "");
  const [email, setEmail] = useState(client?.email || "");
  const [updateEmail, setUpdateEmail] = useState(Boolean(!client?.email));
  const [unlinkConflicts, setUnlinkConflicts] = useState(true);
  const [isPhoneLinked, setIsPhoneLinked] = useState(true);
  const [loading, setLoading] = useState(false);
  const [unsyncLoading, setUnsyncLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !loading && !unsyncLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [loading, unsyncLoading, onClose]);

  if (!client) return null;

  const currentIsSynced = Boolean(client.is_phone_linked && client.phone);
  const cleanDigits = phone.replace(/\D/g, "");

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(val);
    setErrorMsg("");
  };

  const handleClearPhone = () => {
    setPhone("");
    setErrorMsg("");
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setErrorMsg("");
  };

  const handleSyncSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone && !client.phone) {
      setErrorMsg("Please enter a valid 10-digit mobile phone number.");
      return;
    }

    if (cleanPhone && cleanPhone.length !== 10) {
      setErrorMsg("Mobile number must be exactly 10 digits.");
      return;
    }

    if (updateEmail && email.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email.trim())) {
        setErrorMsg("Please enter a valid email address format.");
        return;
      }
    }

    try {
      setLoading(true);
      const payload = {
        clientId: client.id,
        phone: cleanPhone || client.phone,
        update_email: updateEmail,
        email: updateEmail ? email.trim() : client.email,
        unlink_conflicts: unlinkConflicts,
        is_phone_linked: isPhoneLinked,
      };

      const res = await api.post(`/clients/${client.id}/sync`, payload);

      if (res.data?.success) {
        toast.success(res.data.message || "Client synced successfully!");
        if (handleRefresh) handleRefresh();
        onClose();
      } else {
        toast.error(res.data?.message || "Failed to sync client");
      }
    } catch (err) {
      console.error("Sync error:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "An error occurred while syncing client account.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsync = async () => {
    if (
      !window.confirm(
        `Are you sure you want to unbind and unsync phone for ${client.name || "this client"}?`
      )
    ) {
      return;
    }

    try {
      setUnsyncLoading(true);
      const res = await api.post(`/clients/${client.id}/sync`, {
        clientId: client.id,
        action: "unsync",
        is_phone_linked: false,
      });

      if (res.data?.success) {
        toast.success("Client account unlinked successfully!");
        if (handleRefresh) handleRefresh();
        onClose();
      } else {
        toast.error(res.data?.message || "Failed to unsync client");
      }
    } catch (err) {
      console.error("Unsync error:", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to unsync client."
      );
    } finally {
      setUnsyncLoading(false);
    }
  };

  // Close when clicking outside modal
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading && !unsyncLoading) {
      onClose();
    }
  };

  // Get client initial for avatar
  const clientInitial = (client.name || "C").trim().charAt(0).toUpperCase();

  // Role badge styling
  const clientType = String(client.client_type || client.role || "USER").toUpperCase();
  const getRoleBadgeStyle = (type) => {
    switch (type) {
      case "POLICE":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "VOLUNTEER":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "NGO":
        return "bg-teal-100 text-teal-800 border-teal-200";
      case "GUEST":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "ADMIN":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div
        className={styles.modalContainer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sync-modal-title"
      >
        {/* Modal Header */}
        <div className={styles.header}>
          <div className="flex items-center gap-3">
            <div className={styles.headerIconBox}>
              <FaSync className={loading ? "animate-spin" : ""} />
            </div>
            <div>
              <h2
                id="sync-modal-title"
                className="text-base sm:text-lg font-bold text-slate-900 leading-tight"
              >
                Sync Client Account
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Link verified phone & credentials for direct account synchronization.
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            disabled={loading || unsyncLoading}
            aria-label="Close modal"
          >
            <FaTimes />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className={styles.body}>
          {/* Client Overview Card */}
          <div className={styles.overviewCard}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                  {clientInitial}
                </div>
                <div className="truncate">
                  <span className="font-bold text-sm text-slate-900 block truncate">
                    {client.name || "Client Account"}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    ID: {client.id ? String(client.id).slice(0, 14) : "—"}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border tracking-wider shrink-0 ${getRoleBadgeStyle(
                    clientType
                  )}`}
                >
                  {clientType}
                </span>
              </div>

              <div className="shrink-0">
                {currentIsSynced ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
                    <FaCheckCircle className="text-emerald-600 text-xs" /> Synced
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 shadow-xs">
                    <FaExclamationTriangle className="text-amber-600 text-xs" /> Not Synced
                  </span>
                )}
              </div>
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/80 text-xs">
              <div className="flex items-start gap-2">
                <div className="p-1 rounded bg-slate-200/60 text-slate-500 mt-0.5">
                  <FaPhoneAlt className="text-[10px]" />
                </div>
                <div className="min-w-0">
                  <span className="text-slate-400 block text-[11px]">Current Phone</span>
                  <span className="font-medium text-slate-700 font-mono block truncate">
                    {client.phone ? `+91 ${client.phone}` : "No phone linked"}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="p-1 rounded bg-slate-200/60 text-slate-500 mt-0.5">
                  <FaEnvelope className="text-[10px]" />
                </div>
                <div className="min-w-0">
                  <span className="text-slate-400 block text-[11px]">Current Email</span>
                  <span className="font-medium text-slate-700 block truncate" title={client.email}>
                    {client.email || "No email on record"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message Box */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-fadeIn">
              <FaExclamationTriangle className="shrink-0 text-rose-500 text-sm" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {/* Sync Form */}
          <form id="sync-client-form" onSubmit={handleSyncSubmit} className="space-y-4">
            {/* Phone Number Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Phone Number to Sync</span>
                  <span className="text-rose-500">*</span>
                </label>
                {/* Real-time digit counter badge */}
                <div>
                  {cleanDigits.length === 10 ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <FaCheckCircle className="text-[10px]" /> 10 / 10 digits
                    </span>
                  ) : cleanDigits.length > 0 ? (
                    <span className="text-[11px] font-medium text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                      {cleanDigits.length} / 10 digits
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">10 digits required</span>
                  )}
                </div>
              </div>

              <div className={styles.phoneInputGroup}>
                <span className={styles.phonePrefix}>
                  <span>🇮🇳</span>
                  <span>+91</span>
                </span>
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={phone}
                  onChange={handlePhoneChange}
                  className={styles.phoneInput}
                  maxLength={10}
                  required
                  autoFocus
                />
                {phone && (
                  <button
                    type="button"
                    onClick={handleClearPhone}
                    className="px-3 text-slate-400 hover:text-slate-600 text-sm transition-colors cursor-pointer"
                    title="Clear input"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Primary contact number for authentication, lookup, and system communications.
              </p>
            </div>

            {/* Email Synchronization Option */}
            <div
              className={`rounded-xl border p-3.5 transition-all space-y-2.5 ${
                updateEmail
                  ? "border-emerald-200 bg-emerald-50/30"
                  : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
              }`}
            >
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={updateEmail}
                  onChange={(e) => setUpdateEmail(e.target.checked)}
                  className={styles.checkboxInput}
                />
                <div className="flex-1">
                  <span className="text-xs font-bold text-slate-800 block">
                    Update Email Address during sync
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Link or overwrite the verified email address for this client record.
                  </span>
                </div>
              </label>

              {updateEmail && (
                <div className="pt-2 pl-7 space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-700">
                    Email Address
                  </label>
                  <div className="flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 shadow-xs focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
                    <FaEnvelope className="text-slate-400 mr-2 text-xs shrink-0" />
                    <input
                      type="email"
                      placeholder="client@organization.com"
                      value={email}
                      onChange={handleEmailChange}
                      className="w-full text-xs sm:text-sm focus:outline-none bg-transparent text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    This email will be linked directly to this account for notifications.
                  </p>
                </div>
              )}
            </div>

            {/* Advanced Sync Options */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-3 shadow-xs">
              <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100 text-xs font-bold text-slate-700">
                <FaShieldAlt className="text-emerald-600 text-xs" />
                <span>Sync Configuration & Integrity</span>
              </div>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={unlinkConflicts}
                  onChange={(e) => setUnlinkConflicts(e.target.checked)}
                  className={styles.checkboxInput}
                />
                <div className="flex-1">
                  <span className="text-xs font-semibold text-slate-800 block">
                    Resolve duplicate phone conflicts
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Unlinks this number if already tied to an older guest or unverified record to avoid unique index collisions.
                  </span>
                </div>
              </label>

              <label className={`${styles.checkboxLabel} pt-1 border-t border-slate-100`}>
                <input
                  type="checkbox"
                  checked={isPhoneLinked}
                  onChange={(e) => setIsPhoneLinked(e.target.checked)}
                  className={styles.checkboxInput}
                />
                <div className="flex-1">
                  <span className="text-xs font-semibold text-slate-800 block">
                    Mark status as verified (is_phone_linked = true)
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Marks the account as successfully verified and linked across all clients and reports.
                  </span>
                </div>
              </label>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className={styles.footer}>
          <div>
            {currentIsSynced ? (
              <button
                type="button"
                onClick={handleUnsync}
                disabled={unsyncLoading || loading}
                className={styles.unsyncBtn}
                title="Unlink phone and mark unsynced"
              >
                <FaUnlink className="text-xs" />
                <span>{unsyncLoading ? "Unlinking..." : "Unsync Account"}</span>
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
                <FaUserShield className="text-slate-400 text-xs" />
                <span>Verified Sync</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading || unsyncLoading}
              className={styles.cancelBtn}
            >
              Cancel
            </button>

            {/* Submit Button with VISIBLE GREEN BG */}
            <button
              type="submit"
              form="sync-client-form"
              disabled={loading || unsyncLoading}
              className={styles.submitBtn}
              style={{
                backgroundColor: loading ? "#15803d" : "#16a34a",
                color: "#ffffff",
              }}
              title="Submit sync client request"
            >
              <FaSync className={`text-xs ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Syncing Account..." : "Sync Client Account"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

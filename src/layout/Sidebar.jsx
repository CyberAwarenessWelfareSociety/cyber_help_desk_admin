import { useContext, useEffect, useState } from "react";
import { UserContext } from "../Context/contextAPI";
import { PERMISSIONS } from "../constants/permissions";
import styles from "./DashboardLayout.module.css";
import {
  MdSpaceDashboard,
  MdOutlineKey,
  MdOutlineApi,
  MdReceiptLong,
  MdCardGiftcard,
  MdPerson,
  MdAttachMoney,
  MdLogout,
  MdAnnouncement,
  MdChevronLeft,
  MdChevronRight,
  MdWallet,
  MdOutlineContactSupport,
  MdOutlineRecordVoiceOver,
  MdOutlineReportGmailerrorred,
  MdOutlineLockPerson,
  MdVolunteerActivism,
  MdOutlineForum,
  MdOutlineShield,
  MdOutlineFaceRetouchingNatural,
} from "react-icons/md";
import { NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../Utils/api";
import { ROLES } from "@/constants/Role";
import { Car, File, GalleryHorizontal, Phone } from "lucide-react";
import { FaMobile } from "react-icons/fa";

export function Sidebar({ collapsed, setCollapsed }) {
  const { user } = useContext(UserContext);
  const allowedPaths = PERMISSIONS[user?.client_type] || [];
  const [aadharAccess, setAadharAccess] = useState(null);
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const token = localStorage.getItem("token");
  const role = JSON.parse(localStorage.getItem("user"))?.client_type;
  const clientId = JSON.parse(localStorage.getItem("user")).id;
  console.log("role from sidebar:", role);
  // Check aadhar_access status on component mount
  useEffect(() => {
    const checkAadharAccess = async () => {
      try {
        const res = await api.get(`/aadhar-access?clientId=${clientId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAadharAccess(res.data.aadhar_access);
      } catch (err) {
        if (clientId !== ROLES.ADMIN) {
          // toast.error("Error checking Aadhar access.");
        }
        console.error("Error fetching Aadhar access:", err);
        setAadharAccess(false);
      }
    };
    checkAadharAccess();
  }, []);

  const handleAadharClick = (e, path) => {
    if (path === "/aadhar" && aadharAccess === false && role !== ROLES.ADMIN) {
      e.preventDefault(); // Prevent navigation
      toast.error("Aadhar feature is disabled for your account.");
      setAccessModalOpen(true);
    }
  };

  const handleCloseAccessModal = () => {
    setAccessModalOpen(false);
  };

  const sections = [
    {
      title: null,
      items: [
        { icon: <MdSpaceDashboard />, label: "Dashboard", path: "/dashboard" },
      ],
    },
    {
      title: "Client",
      items: [
        { icon: <MdPerson />, label: "insurance", path: "/insurance" },
        { icon: <MdPerson />, label: "Clients", path: "/get-all-clients" },
        { icon: <MdPerson />, label: "Bulk Check", path: "/bulkcheck" },
         { icon: <MdPerson />, label: "Bulk Check LOGS", path: "/bulkcheck-logs" },
        {
          icon: <MdOutlineKey />,
          label: "Client Payment",
          path: "/client-payment",
        },
        {
          icon: <GalleryHorizontal />,
          label: "Gallery",
          path: "/gallery",
        },
        {
          icon: <MdOutlineKey />,
          label: "Client Wallet",
          path: "/client-wallet",
        },
      ],
    },
    {
      title: "APIs",
      items: [
        {
          icon: <MdOutlineKey />,
          label: "Api Keys & Access",
          path: "/api-keys",
        },
        { icon: <MdOutlineKey />, label: "Api logs", path: "/api-logs" },
        {
          icon: <MdOutlineApi />,
          label: "API Hit Logs",
          path: "/api-hit-logs",
        },
        {
          icon: <MdReceiptLong />,
          label: "Override Price",
          path: "/override-price",
        },
        {
          icon: <MdReceiptLong />,
          label: "Client API Key Access",
          path: "/client-api-key-access",
        },
      ],
    },
    {
      title: "Course Management", // ← NEW SECTION
      items: [
        {
          icon: <MdOutlineRecordVoiceOver />,
          label: "Course",
          path: "/course",
        },
        { icon: <MdPerson />, label: "Class", path: "/class" },
        { icon: <MdReceiptLong />, label: "Enrollment", path: "/enrollment" },
        { icon: <File />, label: "Set Questions", path: "/set-question" },
        { icon: <File />, label: "Class Materials", path: "/class-materials" },
      ],
    },
    {
      title: "Community Help",
      items: [
        {
          icon: <MdOutlineRecordVoiceOver />,
          label: "Cyber Fraud",
          path: "/cyberfraud",
        },
        {
          icon: <MdOutlineReportGmailerrorred />,
          label: "Blackmail",
          path: "/blackmail",
        },
        {
          icon: <MdOutlineLockPerson />,
          label: "Account Freeze",
          path: "/accountfreeze",
        },
        {
          icon: <MdOutlineShield />,
          label: "Content Takedown",
          path: "/content-takedown",
        },
        {
          icon: <MdOutlineFaceRetouchingNatural />,
          label: "Face Matching",
          path: "/face-matching",
        },
        {
          icon: <MdVolunteerActivism />,
          label: "Volunteer",
          path: "/volunteer",
        },
        {
          icon: <MdOutlineForum />,
          label: "Assign Role Chat",
          path: "/assign-role-chat",
        },
      ],
    },
    {
      title: "Approval of Missing reports", // ← NEW SECTION
      items: [
        {
          icon: <FaMobile />,

          label: "mobile",
          path: "/mobile-missing-report",
        },
        {
          icon: <MdPerson />,
          label: "Dead Body Reports",
          path: "/dead-body-reports",
        },
        {
          icon: <MdReceiptLong />,
          label: "missing person",
          path: "/missing-person",
        },
        { icon: <Car />, label: "missing vehicle", path: "/missing-vehicle" },
        {
          icon: <Car />,
          label: "UnClaimed vehicle",
          path: "/unclaimed-vehicle",
        },
        { icon: <Car />, label: "Accident vehicle", path: "/accident-vehicle" },
      ],
    },
    {
      title: "Banner/Announcement",
      items: [
        { icon: <MdReceiptLong />, label: "Banner", path: "/banners" },
        {
          icon: <MdAnnouncement />,
          label: "Announcement",
          path: "/announcement",
        },
      ],
    },
    {
      title: "Manage Notifications",
      items: [
        {
          icon: <MdAnnouncement />,
          label: "Send Notification",
          path: "/send-notification",
        },
      ],
    },
    {
      title: "Manage App Versions",
      items: [
        {
          icon: <MdAnnouncement />,
          label: "Manage App Versions",
          path: "/app-version",
        },
      ],
    },
    {
      title: "Payments/Donation",
      items: [
        { icon: <MdCardGiftcard />, label: "Payments", path: "/payments" },
        {
          icon: <MdWallet />,
          label: "Wallet Balance",
          path: "/wallet-balance",
        },
        {
          icon: <MdAttachMoney />,
          label: "Vendor Payment",
          path: "/vandor-payment",
        },
      ],
    },
    {
      title: "Help",
      items: [
        {
          icon: <MdOutlineContactSupport />, // You can change icon as needed
          label: "Raise Complaint",
          path: "/complain",
        },
        {
          icon: <MdOutlineRecordVoiceOver />, // or use <MdGavel /> for lawyer
          label: "ground verification",
          path: "/ground-verification",
        },
      ],
    },
    {
      title: "Categories",
      items: [
        { icon: <MdPerson />, label: "Aadhar", path: "/aadhar" },
        { icon: <MdPerson />, label: "PAN", path: "/pan" },
        { icon: <MdPerson />, label: "Ration", path: "/ration" },
        { icon: <MdPerson />, label: "Other", path: "/other" },
        {
          icon: <MdReceiptLong />,
          label: "Digital Footprint",
          path: "/digital-footprint",
        },
        { icon: <MdReceiptLong />, label: "Vehicle", path: "/tracking" },
        {
          icon: <MdReceiptLong />,
          label: "Other Vehicle",
          path: "/other-vehicle",
        },
        {
          icon: <MdReceiptLong />,
          label: "Background Check",
          path: "/background-check",
        },
        {
          icon: <MdReceiptLong />,
          label: "Mobile Superior",
          path: "/mobile-superior",
        },
        { icon: <MdReceiptLong />, label: "Mobile", path: "/mobile" },
        {
          icon: <MdReceiptLong />,
          label: "Bank VPA Credit",
          path: "/bankVpa-credit",
        },
        { icon: <MdReceiptLong />, label: "UAN", path: "/uan" },
        {
          icon: <MdReceiptLong />,
          label: "WhatsApp & Gmail Check",
          path: "/whatsapp-gmail-check",
        },
        {
          icon: <MdReceiptLong />,
          label: "Multiple Vehicles",
          path: "/multiple-vehicle",
        },
        {
          icon: <MdReceiptLong />,
          label: "Company Background ",
          path: "/company-background-check",
        },
      ],
    },

    {
      title: "Search By",
      items: [
        {
          icon: <MdCardGiftcard />,
          label: "Aadhar",
          path: "/search-by-aadhar",
        },
        { icon: <MdCardGiftcard />, label: "Pan", path: "/search-by-pan" },
        { icon: <Phone />, label: "Mobile", path: "/search-by-mobile" },
        { icon: <Car />, label: "Vehicle", path: "/search-by-vehicle" },
      ],
    },
    {
      title: "User",
      items: [{ icon: <MdPerson />, label: "Profile", path: "/profile" }],
    },
  ];
  const bottomItems = [
    { icon: <MdLogout />, label: "Logout", path: "/logout" },
  ];
  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      {/* Header */}
      <div className={styles.sidebarHeader}>
        <span className={styles.logo}>{!collapsed && "Cyber Help Desk"}</span>
        <button
          className={styles.collapseBtn}
          onClick={() => setCollapsed((c) => !c)}
          aria-label="Collapse sidebar"
        >
          {collapsed ? <MdChevronRight /> : <MdChevronLeft />}
        </button>
      </div>

      {/* Menu */}
      <div className={styles.menu}>
        {sections.map((section, sIdx) => {
          const visibleItems = section.items.filter(
            (i) =>
              (!i.path || allowedPaths.includes(i.path)) && // Check permissions
              (i.path !== "/aadhar" || aadharAccess === true), // Show Aadhar if aadharAccess is true or user is ADMIN
          );
          if (visibleItems.length === 0) return null; // Hide section if no items

          return (
            <div key={sIdx}>
              {section.title && !collapsed && (
                <div className={styles.sectionTitle}>{section.title}</div>
              )}
              {visibleItems.map((item, idx) => (
                <NavLink
                  to={item.path}
                  key={idx}
                  className={({ isActive }) =>
                    `${styles.menuItem} ${isActive ? styles.active : ""}`
                  }
                  onClick={(e) => handleAadharClick(e, item.path)} // Handle Aadhar click
                >
                  {item.icon}
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          );
        })}
      </div>

      {/* Bottom Menu */}
      <div className={styles.menuBottom}>
        {bottomItems
          .filter((i) => allowedPaths.includes(i.path))
          .map((item, idx) => (
            <NavLink
              to={item.path}
              key={idx}
              className={({ isActive }) =>
                `${styles.menuItem} ${isActive ? styles.active : ""}`
              }
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
      </div>

      {/* Access Denied Modal */}
      {accessModalOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Access Denied</h2>
              <button
                className={styles.closeBtn}
                onClick={handleCloseAccessModal}
              >
                <MdClose />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.error}>
                The Aadhar feature is currently disabled for your account.
                Please contact support for assistance.
              </p>
              <div className={styles.actions}>
                <button
                  className={styles.accessBtn}
                  onClick={handleCloseAccessModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

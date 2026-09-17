// import styles from './DashboardLayout.module.css';
// import {
//   MdSpaceDashboard, MdOutlineKey, MdOutlineApi,
//   MdReceiptLong, MdCardGiftcard, MdCampaign,
//   MdPerson, MdAttachMoney, MdLogout,
//   MdAnnouncement, MdChevronLeft, MdChevronRight,
//   MdWallet, MdFavoriteBorder
// } from 'react-icons/md';

// export function Sidebar({ collapsed, setCollapsed }) {
//   const items = [
//     { icon: <MdSpaceDashboard />, label: "Dashboard" },
//     { section: "APIs" },
//     { icon: <MdOutlineKey />, label: "API Key Access" },
//     { icon: <MdOutlineApi />, label: "API Usage Log" },
//     { icon: <MdCampaign />, label: "API Hit" },
//     { section: "Banner" },
//     { icon: <MdReceiptLong />, label: "Banner" },
//     { section: "Announcement" },
//     { icon: <MdAnnouncement />, label: "Announcement" },
//     { section: "Client" },
//     { icon: <MdPerson />, label: "Client API keys" },
//     { icon: <MdAttachMoney />, label: "Client Payment" },
//     { icon: <MdWallet />, label: "Client Wallet" },
//     { icon: <MdCardGiftcard />, label: "Donation" },
//     { icon: <MdFavoriteBorder />, label: "Wallet" },
//     { icon: <MdLogout />, label: "Logout", bottom: true },
//   ];

//   return (
//     <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
//       <div className={styles.sidebarHeader}>
//         <span className={styles.logo}>{!collapsed && "Logo here"}</span>
//         <button
//           className={styles.collapseBtn}
//           onClick={() => setCollapsed(c => !c)}
//           aria-label="Collapse sidebar"
//         >
//           {collapsed ? <MdChevronRight /> : <MdChevronLeft />}
//         </button>
//       </div>

//       <div className={styles.menu}>
//         {items.filter(i => !i.bottom).map((item, idx) => (
//           item.section ? (
//             !collapsed && <div key={idx} className={styles.sectionTitle}>{item.section}</div>
//           ) : (
//             <div className={styles.menuItem} key={idx}>
//               {item.icon}
//               {!collapsed && <span>{item.label}</span>}
//             </div>
//           )
//         ))}
//       </div>

//       <div className={styles.menuBottom}>
//         {items.filter(i => i.bottom).map((item, idx) => (
//           <div className={styles.menuItem} key={idx}>
//             {item.icon}
//             {!collapsed && <span>{item.label}</span>}
//           </div>
//         ))}
//       </div>
//     </aside>
//   );
// }

import { FaAsterisk, FaSignOutAlt, FaUsers } from "react-icons/fa";
import styles from "../DashboardLayout.module.css";
import {
  MdSpaceDashboard,
  MdOutlineKey,
  MdOutlineApi,
  MdReceiptLong,
  MdCardGiftcard,
  MdCampaign,
  MdPerson,
  MdAttachMoney,
  MdLogout,
  MdAnnouncement,
  MdChevronLeft,
  MdChevronRight,
  MdWallet,
  MdFavoriteBorder,
  MdKey,
  MdListAlt,
  MdSettings,
  MdSearch,
} from "react-icons/md";

import { NavLink } from "react-router-dom";

export function Sidebar({ collapsed, setCollapsed }) {
  const items = [
    { icon: <MdSpaceDashboard />, label: "Dashboard", path: "/dashboard" },

    { section: "APIs" },
    { icon: <MdKey />, label: "API Key Access", path: "/api-key-access" },
    { icon: <MdListAlt />, label: "API Usage Log", path: "/api-usage-log" },
    { icon: <MdSearch />, label: "API Hit", path: "/api-hit" },

    { section: "Categories" },
    { icon: <FaAsterisk />, label: "GST", path: "/gst" },
    { icon: <FaAsterisk />, label: "Aadhar", path: "/aadhar" },
    { icon: <FaAsterisk />, label: "Pan", path: "/pan" },

    { section: "Users (Details)" },
    { icon: <FaUsers />, label: "Users", path: "/users" },
    { icon: <FaUsers />, label: "User API keys", path: "/user-api-keys" },

    { section: "Donation/Bonus" },
    {
      icon: <MdCardGiftcard />,
      label: "Donation/Bonus",
      path: "/donation-bonus",
    },
    { icon: <MdSettings />, label: "Settings", path: "/settings" },
    { icon: <FaSignOutAlt />, label: "Logout", path: "/logout" },
  ];

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <div className={styles.sidebarHeader}>
        <span className={styles.logo}>{!collapsed && "QIK Admin "}</span>
        <button
          className={styles.collapseBtn}
          onClick={() => setCollapsed((c) => !c)}
          aria-label="Collapse sidebar"
        >
          {collapsed ? <MdChevronRight /> : <MdChevronLeft />}
        </button>
      </div>

      <div className={styles.menu}>
        {items
          .filter((i) => !i.bottom)
          .map((item, idx) =>
            item.section ? (
              !collapsed && (
                <div key={idx} className={styles.sectionTitle}>
                  {item.section}
                </div>
              )
            ) : (
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
            ),
          )}
      </div>

      <div className={styles.menuBottom}>
        {items
          .filter((i) => i.bottom)
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
    </aside>
  );
}

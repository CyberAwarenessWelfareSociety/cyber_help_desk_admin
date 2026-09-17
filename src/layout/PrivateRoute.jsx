// import { useContext } from "react";
// import { Navigate } from "react-router-dom";
// import { UserContext } from "../Context/contextAPI";

// export default function PrivateRoute({ children, roles }) {
//   const { isAuthenticated, hasRole } = useContext(UserContext);

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   if (roles && !hasRole(roles)) {
//     return <Navigate to="/unauthorized" replace />;
//   }

//   return children;
// }

// src/components/PrivateRoute.js
import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { UserContext } from "../context/contextAPI";
import styles from "../Utils/globaleSpinner.module.css";
import toast from "react-hot-toast";

export default function PrivateRoute({ allowedRoles, isPublic = false }) {
  const { isAuthenticated, user, authChecked } = useContext(UserContext);


  // Wait until auth check is done
  if (!authChecked) {
    return (
      <div>
        <div className={styles.spinnerOverlay}>
          <div className={styles.spinnerContainer}>
            <div className={styles.spinner}></div>
          </div>
        </div>
      </div>
    ); // or a spinner
  }


    // Handle public routes (like login/signup ...)
  if (isPublic) {
    // If authenticated and trying to access public route, redirect to dashboard
    if (isAuthenticated) {
      return <Navigate to="/dashboard" replace />;
    }
    // If not authenticated, allow access to public route
    return <Outlet />;
  }


 // Below is the original private route logic

   if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  
  if (allowedRoles && !allowedRoles.includes(user.client_type)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

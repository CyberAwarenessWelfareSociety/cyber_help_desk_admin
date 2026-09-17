// import { createContext, useState, useEffect } from "react";


// export const UserContext = createContext();

// const ContextAPI = (props) => {
//   const [user, setUser] = useState({});

//   useEffect(() => {
//     const storedUser = localStorage.getItem("user");
//     console.log(storedUser);
//     if (storedUser) {
//       setUser(JSON.parse(storedUser));
//     }
//   }, []);

//   return (
//     <UserContext.Provider
//       value={{
//         user,
//         setUser,
//       }}
//     >
//       {props.children}
//     </UserContext.Provider>
//   );
// };

// export default ContextAPI;







import { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { ROLES } from "../constants/Role";

export const UserContext = createContext();

const UserProvider = ({ children }) => {
  // Initialize state as null initially
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Check for existing auth data in storage
    const checkAuth = () => {
      const storedToken = Cookies.get("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
      setAuthChecked(true);
    };

    checkAuth();
  }, []);

  const isAuthenticated = !!user && !!token;

  const hasRole = (roles) => {
    if (!user?.client_type) return false;
    return roles.includes(user?.client_type);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    Cookies.remove("token");
    Cookies.remove("apiKeys");
  };

  // Update storage whenever user or token changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      Cookies.set("token", token, { expires: 7 });
    }
  }, [token]);

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        setUser,
        setToken,
        isAuthenticated,
        hasRole,
        logout,
        authChecked
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
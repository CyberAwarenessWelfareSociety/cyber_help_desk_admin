import { useState, useContext } from "react";
import styles from "./Signup.module.css";
import api from "../../Utils/api";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { UserContext } from "../../Context/contextAPI";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
  const [step, setStep] = useState(1); // 1 = Password, 2 = OTP

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [clientId, setClientId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const { setUser, setToken } = useContext(UserContext);
  const navigate = useNavigate();

  let toastId;

  // ==================== STEP 1: Send OTP ====================
  const handleStep1 = async (e) => {
    e.preventDefault();

    if (!mobile || mobile.length !== 10) {
      if (toastId) toast.dismiss(toastId);
      toastId = toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    if (!password) {
      if (toastId) toast.dismiss(toastId);
      toastId = toast.error("Please enter your password");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/login/step1", {
        phone_no: mobile,
        password,
      });

      if (response.status === 200) {
        setClientId(response.data.client_id);
        setStep(2);
        setOtp(""); // Clear OTP field
        toast.success("OTP sent successfully!");
      }
    } catch (error) {
      const errorMsg = error?.response?.data?.message || "Invalid credentials";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ==================== STEP 2: Verify OTP ====================
  const handleStep2 = async (e) => {
    e.preventDefault();

    if (otp.length !== 4) {
      toast.error("Please enter 4-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/login/step2", {
        client_id: clientId,
        phone_no: mobile,
        otp,
        // expo_token: expoToken,   // Add if using Expo/React Native
      });

  if (response.status === 200) {
    console.log(response?.data)
      const token = response.data?.token;
      const apiKeys = response.data?.apiKeys[0];

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("apiKeys", JSON.stringify(apiKeys));
        Cookies.set("token", token, { expires: 7 });
        Cookies.set("apiKeys", apiKeys, { expires: 7 });
      }

      setUser(response.data?.client);
      setToken(token);
      localStorage.setItem("user", JSON.stringify(response.data?.client));

      if (toastId) toast.dismiss(toastId);
      toastId = toast.success("Login successful");

      navigate("/dashboard", { replace: true });

      setMobile("");
      setPassword("");
    }
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message || "Invalid or expired OTP";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setOtp("");
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.leftPane}>
          <h1>Cyber Help Desk! 👋</h1>
          <p>
            Welcome! This Cyber Awareness Welfare Society Help Desk Portal provides your organization with secure, authorized, and transparent digital communication services. By logging in here, you can access all approved services...
          </p>
          <footer>© 2026 Cyber Awareness Welfare Society. All rights reserved.</footer>
        </div>

        <div className={styles.rightPane}>
          {step === 1 ? (
            /* ==================== PASSWORD STEP ==================== */
            <form className={styles.form} onSubmit={handleStep1} noValidate>
              <h2>Login</h2>

              <label htmlFor="mobileNumber">Mobile Number</label>
              <input
                id="mobileNumber"
                type="tel"
                required
                placeholder="Enter 10-digit Mobile Number"
                value={mobile}
                maxLength={10}
                onChange={(e) =>
                  setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
              />

              <label htmlFor="password">Password</label>
              <div className={styles.passwordWrapper}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span
                  className={styles.eyeIcon}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              <button
                type="submit"
                className={styles.btnGreen}
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>

              <div className={styles.links}>
                <Link to="/signup">Don't have an account? Sign Up</Link>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className={styles.forgotBtn}
                >
                  Forgot password?
                </button>
              </div>
            </form>
          ) : (
            /* ==================== OTP STEP (4-DIGIT) ==================== */
            <form className={styles.form} onSubmit={handleStep2} noValidate>
              <h2>Enter OTP</h2>
              <p style={{ textAlign: "center", color: "#555", marginBottom: "20px" }}>
                We have sent a 4-digit OTP to <strong>+91 {mobile}</strong>
              </p>

              <label htmlFor="otp">4-Digit OTP</label>
              <input
                id="otp"
                type="text"
                maxLength={4}
                placeholder="Enter 4-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className={styles.otpInput}
                autoFocus
              />

              <button
                type="submit"
                className={styles.btnGreen}
                disabled={loading || otp.length !== 4}
              >
                {loading ? "Verifying..." : "Verify OTP & Login"}
              </button>

              <div style={{ textAlign: "center", marginTop: "15px" }}>
                <button
                  type="button"
                  onClick={handleBack}
                  style={{
                    color: "#3a773a",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "15px",
                  }}
                >
                  ← Back
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
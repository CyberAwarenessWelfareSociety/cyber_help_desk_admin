// import { useRef, useState } from "react";
// import styles from "./ForgetPassword.module.css"; // reuse existing green theme CSS
// import toast from "react-hot-toast";
// import api from "../../Utils/api";
// import { useNavigate } from "react-router-dom";

// export default function ForgotPassword() {
//   // ❶  Hard-coded (or prop-driven) mobile number fetched earlier
//   const [mobile] = useState("7350606974");

//   // ❷  Local state just for form inputs
//   const [otp, setOtp] = useState(["", "", "", ""]);
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const otpRefs = useRef([]);
//   const navigate = useNavigate();

//   /* --- helpers ---------------------------------------------------------- */
//   const handleOtpChange = (idx, val) => {
//     const digit = val.replace(/\D/, "").slice(0, 1);
//     const newOtp = [...otp];
//     newOtp[idx] = digit;
//     setOtp(newOtp);

//     if (digit && idx < otp.length - 1) {
//       otpRefs.current[idx + 1]?.focus();
//     }
//   };

//   const handleOtpKeyDown = (e, idx) => {
//     if (e.key === "Backspace" && !otp[idx] && idx > 0) {
//       otpRefs.current[idx - 1]?.focus();
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (otp.some((d) => d === "")) {
//       toast.error("Please enter complete OTP");
//       return;
//     }

//     if (password.length && confirmPassword.length < 6) {
//       toast.error("Password must be at least 6 characters");
//       return;
//     }

//     if (!password || !confirmPassword) {
//       toast.error("Please fill all password fields");
//       return;
//     }

//     if (password !== confirmPassword) {
//       toast.error("Passwords do not match");
//       return;
//     }

//     const payload = {
//       phone_no: mobile,
//       otp: otp.join(""),
//       newPassword: password,
//     };

//     try {
//       const response = await api.post("/forgot-password", payload);

//       if (response.status === 200) {
//         toast.success("Password reset successful!");
//         // Reset form fields
//         setOtp(["", "", "", ""]);
//         setPassword("");
//         setConfirmPassword("");
//         navigate("/dashboard");
//       }
//     } catch (error) {
//       console.error("Error occurs : ", error);
//       const errorMessage =
//         error?.response?.data?.message ||
//         error?.response?.data?.error ||
//         "Something went wrong. Please try again later.";

//       toast.error(errorMessage);
//     }
//   };

//   /* --- UI ---------------------------------------------------------------- */
//   return (
//     <div className={styles.container}>
//       <div className={styles.card} >
//         <div className={styles.leftPane}>
//           <h3>Reset Your Password</h3>
//           <p>
//             Enter the OTP sent to your number and create a new password to
//             access your account securely.
//           </p>
//         </div>
//         <div className={styles.rightPane} style={{ padding: "48px 36px" }}>
//           <form className={styles.form} onSubmit={handleSubmit} noValidate>
//             {/* <h2>Reset Password</h2> */}

//             {/* Static mobile number & message */}
//             <label>Mobile Number</label>
//             <input
//               type="text"
//               value={mobile}
//               readOnly
//               disabled
//               className={styles.disabledInput}
//             />
//             <p style={{ margin: "4px 0 16px", fontSize: 13, color: "#3a603a" }}>
//               OTP sent to this number
//             </p>

//             {/* OTP boxes */}
//             <label>Enter OTP</label>
//             <div
//               style={{
//                 display: "flex",
//                 gap: 8,
//                 marginBottom: 20,
//                 justifyContent: "center",
//               }}
//             >
//               {otp.map((digit, i) => (
//                 <input
//                   key={i}
//                   ref={(el) => (otpRefs.current[i] = el)}
//                   type="text"
//                   maxLength={1}
//                   className={styles.otpInput}
//                   value={digit}
//                   onChange={(e) => handleOtpChange(i, e.target.value)}
//                   onKeyDown={(e) => handleOtpKeyDown(e, i)}
//                   inputMode="numeric"
//                   pattern="[0-9]"
//                   required
//                   autoComplete="one-time-code"
//                 />
//               ))}
//             </div>

//             {/* New password fields */}
//             <label htmlFor="newPassword">New Password</label>
//             <input
//               id="newPassword"
//               type="password"
//               required
//               minLength={8}
//               placeholder="Enter new password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               autoComplete="new-password"
//             />

//             <label htmlFor="confirmPassword">Confirm Password</label>
//             <input
//               id="confirmPassword"
//               type="password"
//               required
//               minLength={8}
//               placeholder="Confirm new password"
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               autoComplete="new-password"
//             />

//             <button
//               type="submit"
//               className={styles.btnGreen}
//               style={{ marginTop: 18 }}
//             >
//               Submit
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }






// -----------------------------------------------------------------


import { useRef, useState } from "react";
import styles from "./ForgetPassword.module.css"; // reuse existing green theme CSS
import toast from "react-hot-toast";
import api from "../../Utils/api";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // step 1: phone, step 2: otp+password
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const otpRefs = useRef([]);
  const navigate = useNavigate();

  /* --- OTP handlers ------------------------------------------------------ */
  const handleOtpChange = (idx, val) => {
    const digit = val.replace(/\D/, "").slice(0, 1);
    const newOtp = [...otp];
    newOtp[idx] = digit;
    setOtp(newOtp);

    if (digit && idx < otp.length - 1) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  /* --- Step 1: Send OTP -------------------------------------------------- */
  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!/^\d{10}$/.test(mobile)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      console.log("Sending OTP running ")
      const response = await api.post("/send-otp", { phone_no: mobile });
      console.log("OTP response:", response);
      if (response.status === 200) {
        toast.success("OTP sent successfully!");
        setStep(2);
      }
    } catch (error) {
      console.error("OTP send error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to send OTP. Please try again.";
      toast.error(errorMessage);
    }
  };

  /* --- Step 2: Reset password ------------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (otp.some((d) => d === "")) {
      toast.error("Please enter complete OTP");
      return;
    }

    if (!password || !confirmPassword) {
      toast.error("Please fill all password fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const payload = {
      phone_no: mobile,
      otp: otp.join(""),
      newPassword: password,
    };

    try {
      const response = await api.post("/forgot-password", payload);

      if (response.status === 200) {
        toast.success("Password reset successful!");
        setOtp(["", "", "", ""]);
        setPassword("");
        setConfirmPassword("");
        navigate("/");
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Something went wrong. Please try again later.";
      toast.error(errorMessage);
    }
  };

  /* --- UI --------------------------------------------------------------- */
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.leftPane}>
          <h3>Reset Your Password</h3>
          <p>
            {step === 1
              ? "Enter your registered mobile number to receive OTP."
              : "Enter the OTP sent to your number and create a new password."}
          </p>
        </div>

        <div className={styles.rightPane} style={{ padding: "48px 36px" }}>
          {step === 1 ? (
            /* Step 1: Enter Mobile */
            <form className={styles.form} onSubmit={handleSendOtp} noValidate>
              <label htmlFor="mobile">Mobile Number</label>
              <input
                id="mobile"
                type="text"
                maxLength={10}
                placeholder="Enter 10-digit mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/, ""))}
                className={styles.input}
                required
              />
              <button
                type="submit"
                className={styles.btnGreen}
                style={{ marginTop: 18 }}
              >
                Send OTP
              </button>
            </form>
          ) : (
            /* Step 2: OTP + Password */
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <label>Mobile Number</label>
              <input
                type="text"
                value={mobile}
                readOnly
                disabled
                className={styles.disabledInput}
              />
              <p style={{ margin: "4px 0 16px", fontSize: 13, color: "#3a603a" }}>
                OTP sent to this number
              </p>

              <label>Enter OTP</label>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 20,
                  justifyContent: "center",
                }}
              >
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="text"
                    maxLength={1}
                    className={styles.otpInput}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                    inputMode="numeric"
                    pattern="[0-9]"
                    required
                    autoComplete="one-time-code"
                  />
                ))}
              </div>

              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                required
                minLength={6}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />

              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                required
                minLength={6}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />

              <button
                type="submit"
                className={styles.btnGreen}
                style={{ marginTop: 18 }}
              >
                Submit
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

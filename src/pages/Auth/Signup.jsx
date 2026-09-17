import { useEffect, useState } from "react";
import styles from "./Signup.module.css";
import api from "../../Utils/api";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Signup() {
  // Steps: 'mobile', 'otp', 'fullform'
  const [step, setStep] = useState("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    clientType: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    document: null, // ✅ bucket url
    referenceNumber: "",
    referenceName: "",
    city: "",
    state: "",
    policeStation: "",
  });

  const updateForm = (flds) => setForm((prev) => ({ ...prev, ...flds }));

  // ✅ reset police-only fields when clientType changes
  useEffect(() => {
    setImage(null);

    setForm((prev) => ({
      ...prev,
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      document: null,
      referenceNumber: "",
      referenceName: "",
      city: "",
      state: "",
      policeStation: "",
    }));
  }, [form.clientType]);

  // ✅ upload response normalizer
  const extractUploadedUrl = (data) => {
    if (!data) return null;

    // A) { files: [{ url }] }
    if (Array.isArray(data?.files) && data.files[0]?.url) return data.files[0].url;

    // B) { file: { url } }
    if (data?.file?.url) return data.file.url;

    // C) { url: "..." }
    if (typeof data?.url === "string") return data.url;

    // D) [{ url: "..." }]
    if (Array.isArray(data) && data[0]?.url) return data[0].url;

    return null;
  };

  const uploadToBucket = async (file) => {
    if (!file) return null;

    // ✅ only POLICE needs doc upload
    if (form.clientType !== "POLICE") return null;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      // ✅ use axios for absolute URL uploads (avoid baseURL issues)
      const response = await axios.post(
        "https://bucket.cyberawareness.ngo/bucket/upload/cybercrime",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const url = extractUploadedUrl(response?.data);

      if (!url) {
        console.log("Bucket upload response:", response?.data);
        throw new Error("Failed to get uploaded file URL");
      }

      updateForm({ document: url });
      return url;
    } catch (error) {
      console.error("Upload error:", error);
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error.message ||
        "Upload failed";
      toast.error(message);
      updateForm({ document: null });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);

    // ✅ upload immediately
    await uploadToBucket(file);
  };

  // Handle OTP input update (allows clearing)
  const handleOtpChange = (i, val) => {
    const sanitized = val.replace(/\D/g, "").slice(0, 1);

    const updatedOtp = [...otp];
    updatedOtp[i] = sanitized; // ✅ allow empty
    setOtp(updatedOtp);

    // focus next only if digit entered
    if (sanitized) {
      const nextInput = document.getElementById(`otp-input-${i + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Step 2: Verify OTP (UI-only here)
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.some((d) => d === "")) {
      toast.error("Please enter complete OTP");
      return;
    }
    setStep("fullform");
    // Verify OTP logic here (API call)
  };

  // Final submit
  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!form.clientType || !form.name || !form.email) {
      toast.error("Please fill all the required fields");
      return;
    }

    if (form.clientType === "POLICE") {
      // ✅ ensure upload finished + url exists
      if (loading) {
        toast.error("Please wait, document is still uploading...");
        return;
      }

      if (!form.document || !form.policeStation || !form.city || !form.state) {
        toast.error("Please fill all the required fields");
        return;
      }
    }

    const payload = {
      name: form.name,
      phone: mobile,
      password: form.password,
      email: form.email,
      client_type: form.clientType,
      otp: otp.join(""),
    };

    if (form.referenceName.trim() !== "") {
      payload.reference_person_name = form.referenceName;
    }

    if (form.referenceNumber.trim() !== "") {
      payload.reference_person_phone_no = form.referenceNumber;
    }

    if (form.clientType === "POLICE") {
      payload.attachment = form.document; // ✅ hosted url
      payload.police_station_name = form.policeStation;
      payload.city = form.city;
      payload.state = form.state;
    }

    try {
      console.log("Before submitting:", payload);

      const response = await api.post(
        "/clients",
        payload
      );

      console.log("After submitting:", response);

      if (response.status === 200 || response.status === 201) {
        toast.success("Form submitted successfully");
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("Submission error:", error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Something went wrong. Please try again later.";

      toast.error(errorMessage);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!mobile || mobile.length < 10) {
      toast.error("Please enter a valid 10 digit mobile number");
      return;
    }

    try {
      const response = await api.post("/send-pre-registration-otp", {
        phone_no: mobile,
      });

      if (response.status === 200) {
        toast.success("OTP sent successfully");
        setStep("otp");
      }
    } catch (error) {
      console.error("OTP send error:", error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Something went wrong. Please try again later.";

      toast.error(errorMessage);
    }
  };

  return (
    <div className={styles.container}>
      {(step === "mobile" || step === "otp") && (
        <div className={styles.card}>
          <div className={styles.leftPane}>
            <h1>Cyber Help Desk! 👋</h1>
            <p>
              Welcome! This Cyber Awareness Welfare Society Help Desk Portal
              provides your organization with secure, authorized, and transparent
              digital communication services. By logging in here, you can access
              all approved services. Our objective is to ensure that every
              message reaches the right person, at the right time, and in
              compliance with regulatory standards. Through this portal, you can
              identify online fraud, report suspicious activities, and get
              assistance in tracking cybercriminals. Please keep your login
              credentials secure and use them only for authorized purposes.
              <br />
              Get highly productive through automation and save tons of time!
            </p>
            <footer>
              © 2025 Cyber Awareness Welfare Society. All rights reserved.
            </footer>
          </div>

          <div className={styles.rightPane}>
            {step === "mobile" && (
              <form
                className={`${styles.form} ${styles.centeredForm}`}
                onSubmit={handleSendOtp}
                noValidate
              >
                <h2>Verify Mobile Number</h2>
                <label htmlFor="mobileNumber">Mobile Number</label>
                <input
                  id="mobileNumber"
                  name="mobileNumber"
                  type="tel"
                  required
                  placeholder="Enter 10-digit Mobile Number"
                  value={mobile}
                  maxLength={10}
                  autoComplete="tel"
                  onChange={(e) =>
                    setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                />
                <span>
                  <Link to="/">Already have an Account? login</Link>
                </span>
                <button type="submit" className={styles.btnGreen}>
                  Send OTP
                </button>
              </form>
            )}

            {step === "otp" && (
              <form
                className={`${styles.form} ${styles.centeredForm}`}
                onSubmit={handleVerifyOtp}
                noValidate
              >
                <h2>Enter OTP</h2>
                <label htmlFor="mobileReadonly">Mobile Number</label>
                <input
                  id="mobileReadonly"
                  type="text"
                  value={mobile}
                  readOnly
                  disabled
                  className={styles.disabledInput}
                />

                <label>Enter OTP</label>
                <div className={styles.otpGroup}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-input-${i}`}
                      required
                      type="text"
                      maxLength={1}
                      className={styles.otpInput}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace") {
                          e.preventDefault();
                          const updatedOtp = [...otp];

                          if (updatedOtp[i]) {
                            updatedOtp[i] = "";
                            setOtp(updatedOtp);
                          } else if (i > 0) {
                            updatedOtp[i - 1] = "";
                            setOtp(updatedOtp);
                            const prevInput = document.getElementById(
                              `otp-input-${i - 1}`
                            );
                            if (prevInput) prevInput.focus();
                          }
                        }
                      }}
                      inputMode="numeric"
                      pattern="[0-9]"
                      autoComplete="one-time-code"
                    />
                  ))}
                </div>
                <button type="submit" className={styles.btnGreen}>
                  Continue
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {step === "fullform" && (
        <div className={`${styles.card} ${styles.singleFormCard}`}>
          <form className={styles.fullForm} onSubmit={handleFinalSubmit} noValidate>
            <h2>Complete Your Signup</h2>

            <div className={styles.grid}>
              <div className={styles.col}>
                <label htmlFor="clientType">Client Type</label>
                <select
                  id="clientType"
                  required
                  value={form.clientType}
                  onChange={(e) => updateForm({ clientType: e.target.value })}
                  aria-required="true"
                >
                  <option value="">Select</option>
                  <option value="USER">User</option>
                  <option value="POLICE">Police</option>
                </select>

                <label htmlFor="password">Create Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => updateForm({ password: e.target.value })}
                  placeholder="Min 6 characters"
                  minLength={6}
                  autoComplete="new-password"
                />

                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => updateForm({ email: e.target.value })}
                  placeholder="example@mail.com"
                  autoComplete="email"
                />

                <label htmlFor="document">Upload Document</label>
                <input
                  id="document"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleImageChange}
                  disabled={form.clientType !== "POLICE" || loading}
                  required={form.clientType === "POLICE"}
                />
                {form.clientType === "POLICE" && (
                  <small style={{ opacity: 0.75 }}>
                    {loading
                      ? "Uploading document..."
                      : form.document
                      ? "Document uploaded ✅"
                      : "Upload is required for Police"}
                  </small>
                )}
              </div>

              <div className={styles.col}>
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => updateForm({ name: e.target.value })}
                  placeholder="Full Name"
                />

                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={form.confirmPassword}
                  onChange={(e) => updateForm({ confirmPassword: e.target.value })}
                  placeholder="Re-enter password"
                  minLength={6}
                  autoComplete="new-password"
                />

                <label htmlFor="referenceNumber">Reference Number</label>
                <input
                  id="referenceNumber"
                  type="text"
                  value={form.referenceNumber}
                  maxLength={10}
                  onChange={(e) => updateForm({ referenceNumber: e.target.value })}
                />

                <label htmlFor="referenceName">Reference Name</label>
                <input
                  id="referenceName"
                  type="text"
                  value={form.referenceName}
                  onChange={(e) => updateForm({ referenceName: e.target.value })}
                />

                <label htmlFor="state">State</label>
                <select
                  id="state"
                  required={form.clientType === "POLICE"}
                  value={form.state}
                  onChange={(e) => updateForm({ state: e.target.value })}
                  disabled={form.clientType !== "POLICE"}
                >
                  <option value="">Select State</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                  <option value="Assam">Assam</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Chhattisgarh">Chhattisgarh</option>
                  <option value="Goa">Goa</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Himachal Pradesh">Himachal Pradesh</option>
                  <option value="Jharkhand">Jharkhand</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Manipur">Manipur</option>
                  <option value="Meghalaya">Meghalaya</option>
                  <option value="Mizoram">Mizoram</option>
                  <option value="Nagaland">Nagaland</option>
                  <option value="Odisha">Odisha</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Sikkim">Sikkim</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Tripura">Tripura</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Uttarakhand">Uttarakhand</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Andaman and Nicobar Islands">
                    Andaman and Nicobar Islands
                  </option>
                  <option value="Chandigarh">Chandigarh</option>
                  <option value="Dadra and Nagar Haveli and Daman and Diu">
                    Dadra and Nagar Haveli and Daman and Diu
                  </option>
                  <option value="Delhi">Delhi</option>
                  <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                  <option value="Ladakh">Ladakh</option>
                  <option value="Lakshadweep">Lakshadweep</option>
                  <option value="Puducherry">Puducherry</option>
                </select>

                <label htmlFor="city">City</label>
                <input
                  id="city"
                  type="text"
                  required={form.clientType === "POLICE"}
                  value={form.city}
                  onChange={(e) => updateForm({ city: e.target.value })}
                  disabled={form.clientType !== "POLICE"}
                />

                <label htmlFor="policeStation">Police Station</label>
                <input
                  id="policeStation"
                  type="text"
                  required={form.clientType === "POLICE"}
                  value={form.policeStation}
                  onChange={(e) => updateForm({ policeStation: e.target.value })}
                  disabled={form.clientType !== "POLICE"}
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className={styles.btnGreen}
              style={{
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Uploading..." : "Submit"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

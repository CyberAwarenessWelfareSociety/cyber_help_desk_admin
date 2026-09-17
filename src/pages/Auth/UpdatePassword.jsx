import { useContext, useState } from 'react';
import styles from './UpdatePassword.module.css';
import api from '../../Utils/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function UpdatePassword() {
  const mobile = '7350606974'; // Hardcoded for now
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error('Please enter both passwords.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    const payload = {
      phone_no: mobile,
      newPassword: password,
    }

    try {
      const response = await api.post('/update-password', payload);

      if (response.status === 200) {
        toast.success('Password updated successfully!');
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error("submission error : ", error);
      
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Something went wrong. Please try again later.";

      toast.error(errorMessage);
    }
  };


  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* <div className={styles.leftPane}>
          <h1>Cyber Help Desk! 👋</h1>
          <p>
            Skip repetitive and manual sales-marketing tasks.
            <br />
            Get highly productive through automation and save tons of time!
          </p>
          <footer>© 2025 QIK Tracking Solution. All rights reserved.</footer>
        </div> */}


        <div className={styles.rightPane}>
          <form className={`${styles.form} ${styles.centeredForm}`} onSubmit={handleSubmit} noValidate>
            <h2>Update Password</h2>

            {/* <label htmlFor="mobileNumber">Mobile Number</label>
            <input
              id="mobileNumber"
              type='text'
              value={mobile}
              disabled
            /> */}

            <label htmlFor="password">New Password</label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <div style={{ margin: '8px 0' }}>
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              <label htmlFor="showPassword" style={{ marginLeft: '8px' }}>Show Password</label>
            </div>

            <button type="submit" className={styles.btnGreen}>
              Update Password
            </button>

            <div style={{ marginTop: '12px', textAlign: 'right' }}>
              <button
                type="button"
                className={styles.forgotbtn}
                onClick={() =>
                  navigate('/forgot-password')
                }
              >
                Forgot password?
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

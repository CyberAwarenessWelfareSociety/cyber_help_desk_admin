import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/Utils/api";
import toast from "react-hot-toast";
import styles from "./ClassQuizStats.module.css";
import { FaArrowLeft } from "react-icons/fa";

const ClassQuizStats = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, [id]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/answers/classes/${id}/quiz-stats`
      );
      setStats(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load quiz stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loader}>Loading quiz stats...</div>;
  }

  if (!stats?.success) {
    return <div className={styles.error}>No data available</div>;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft /> Back
        </button>

        <h2>Class Quiz Results</h2>
      </div>

      {/* Summary */}
      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <span>Total Questions</span>
          <strong>{stats.totalQuestions}</strong>
        </div>
        <div className={styles.summaryCard}>
          <span>Attempted Students</span>
          <strong>{stats.attemptedClients}</strong>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Student</th>
              <th>Email</th>
              <th>Correct</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {stats.results.length > 0 ? (
              stats.results.map((row, index) => (
                <tr key={row.client.id}>
                  <td>{index + 1}</td>
                  <td>{row.client.name}</td>
                  <td>{row.client.email}</td>
                  <td>
                    {row.correct}/{row.totalQuestions}
                  </td>
                  <td>
                    <span
                      className={`${styles.scoreBadge} ${
                        parseInt(row.score) >= 50
                          ? styles.pass
                          : styles.fail
                      }`}
                    >
                      {row.score}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className={styles.noData}>
                  No students attempted this quiz
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClassQuizStats;

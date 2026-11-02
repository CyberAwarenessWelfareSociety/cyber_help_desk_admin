import { useCallback, useEffect, useState } from "react";
import api from "../../Utils/api";
import styles from "./GpsStatus.module.css";

const formatDate = (value) => value ? new Date(value).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) : "—";

export default function GpsStatus() {
  const [view, setView] = useState("users");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [data, setData] = useState({ rows: [], counts: { on: 0, off: 0, unknown: 0, totalUsers: 0 }, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const url = view === "history" ? "/safety/gps-status/history" : "/safety/gps-status";
      const response = await api.get(url, { params: { page, limit: 20, ...(view === "users" && search ? { search } : {}) } });
      setData(previous => ({ ...response.data.data, counts: response.data.data.counts || previous.counts }));
    } catch (err) {
      setError(err.response?.data?.message || "Could not load GPS status.");
    } finally {
      setLoading(false);
    }
  }, [view, page, search]);

  useEffect(() => { void load(); }, [load]);
  const changeView = (next) => { setView(next); setPage(1); };
  const totalPages = Math.max(1, Math.ceil((data.total || 0) / 20));

  return <main className={styles.page}>
    <div className={styles.heading}>
      <div><h1>GPS status</h1><p>App users who have reported their location services and permission status. Reports older than 5 minutes show as Unknown.</p></div>
      <button type="button" onClick={load}>Refresh</button>
    </div>
    <div className={styles.counts}>
      <div><strong>{data.counts?.on ?? "—"}</strong><span>On</span></div>
      <div><strong>{data.counts?.off ?? "—"}</strong><span>Off</span></div>
      <div><strong>{data.counts?.unknown ?? "—"}</strong><span>Unknown</span></div>
      <div><strong>{data.counts?.totalUsers ?? "—"}</strong><span>Total users</span></div>
    </div>
    <div className={styles.toolbar}>
      <div className={styles.tabs}>
        <button type="button" aria-pressed={view === "users"} onClick={() => changeView("users")}>Current status</button>
        <button type="button" aria-pressed={view === "history"} onClick={() => changeView("history")}>On/off history</button>
      </div>
      {view === "users" && <input aria-label="Search users" placeholder="Search name, phone or email" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />}
    </div>
    {error && <p role="alert" className={styles.error}>{error}</p>}
    <div className={styles.tableWrap}><table><thead><tr><th>User name</th><th>Phone</th><th>Email ID</th><th>GPS</th><th>{view === "history" ? "Changed at" : "Status since"}</th>{view === "users" && <th>Last reported</th>}</tr></thead>
      <tbody>{loading ? <tr><td colSpan={view === "users" ? 6 : 5}>Loading…</td></tr> : data.rows?.length ? data.rows.map((row) => <tr key={view === "history" ? row.id : row.clientId}>
        <td>{row.name || "—"}</td><td>{row.phone || "—"}</td><td>{row.email || "—"}</td><td><span className={`${styles.badge} ${styles[row.status?.toLowerCase()]}`}>{row.status}</span></td><td>{formatDate(row.changedAt)}</td>{view === "users" && <td>{formatDate(row.lastCheckedAt)}</td>}
      </tr>) : <tr><td colSpan={view === "users" ? 6 : 5}>{view === "history" ? "No GPS changes yet." : "No users found."}</td></tr>}</tbody></table></div>
    <div className={styles.pagination}><span>{data.total || 0} records · Page {page} of {totalPages}</span><div><button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><button type="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button></div></div>
  </main>;
}

import { useMemo, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import styles from "./FaceMatching.module.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8600/api";

function getUserRole() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return "";
    return String(JSON.parse(raw)?.client_type || "").toUpperCase();
  } catch {
    return "";
  }
}

function guidanceFromMatch(match) {
  if (!match) return null;
  const status = String(match.status || "").toLowerCase();
  const risks = (match.warnings || [])
    .map((w) => String(w.risk || "").toUpperCase())
    .filter(Boolean);

  if (risks.includes("NO_FACE_DETECTED")) {
    return {
      tone: "retry",
      color: "#d97706",
      title: "No face detected",
      body: "Ensure a single clear, front-facing face in each photo and try again.",
    };
  }
  if (risks.includes("NO_REFERENCE_IMAGE")) {
    return {
      tone: "retry",
      color: "#d97706",
      title: "Could not score faces",
      body: "No usable face in the probe image. Re-capture with better lighting.",
    };
  }
  if (risks.includes("MULTIPLE_FACES_DETECTED") && status !== "approved") {
    return {
      tone: "retry",
      color: "#d97706",
      title: "Multiple faces detected",
      body: "Prefer photos with one face each. Best match is still shown if available.",
    };
  }
  if (risks.includes("LOW_FACE_MATCH_SIMILARITY") || status === "declined") {
    return {
      tone: "decline",
      color: "#dc2626",
      title: "Faces do not match",
      body: "Similarity is below the approve threshold. Do not approve identity from this alone.",
    };
  }
  if (status === "approved") {
    return {
      tone: "ok",
      color: "#059669",
      title: "Faces similar (Approved)",
      body: "Score is at or above the threshold. Investigation support only — not a legal identity decision.",
    };
  }
  return {
    tone: "review",
    color: "#475569",
    title: match.status || "Result",
    body: "Inspect score and warnings for investigation support.",
  };
}

function statusColor(status) {
  switch (String(status || "").toLowerCase()) {
    case "approved":
      return "#059669";
    case "declined":
      return "#dc2626";
    case "in review":
      return "#d97706";
    default:
      return "#64748b";
  }
}

export default function FaceMatching() {
  const role = getUserRole();
  const allowed = role === "POLICE" || role === "ADMIN";

  const [probeFile, setProbeFile] = useState(null);
  const [targetFile, setTargetFile] = useState(null);
  const [probePreview, setProbePreview] = useState(null);
  const [targetPreview, setTargetPreview] = useState(null);
  const [threshold, setThreshold] = useState(70);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [result, setResult] = useState(null);

  const probeInputRef = useRef(null);
  const targetInputRef = useRef(null);

  const match = result?.face_match || null;
  const guidance = useMemo(() => guidanceFromMatch(match), [match]);
  const score =
    match?.score != null && !Number.isNaN(Number(match.score))
      ? Number(match.score)
      : null;

  const onPick = (which, file) => {
    if (!file) return;
    if (!file.type?.startsWith("image/")) {
      toast.error("Please select an image file (JPEG/PNG/WebP/TIFF)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be 10 MB or smaller");
      return;
    }
    const url = URL.createObjectURL(file);
    if (which === "probe") {
      if (probePreview) URL.revokeObjectURL(probePreview);
      setProbeFile(file);
      setProbePreview(url);
    } else {
      if (targetPreview) URL.revokeObjectURL(targetPreview);
      setTargetFile(file);
      setTargetPreview(url);
    }
    setResult(null);
    setErrorMsg(null);
  };

  const clearImage = (which) => {
    if (which === "probe") {
      if (probePreview) URL.revokeObjectURL(probePreview);
      setProbeFile(null);
      setProbePreview(null);
      if (probeInputRef.current) probeInputRef.current.value = "";
    } else {
      if (targetPreview) URL.revokeObjectURL(targetPreview);
      setTargetFile(null);
      setTargetPreview(null);
      if (targetInputRef.current) targetInputRef.current.value = "";
    }
    setResult(null);
    setErrorMsg(null);
  };

  const clearAll = () => {
    clearImage("probe");
    clearImage("target");
  };

  const runMatch = async () => {
    if (!probeFile || !targetFile) {
      toast.error("Select both probe (reference) and target images");
      return;
    }
    const t = Number(threshold);
    if (Number.isNaN(t) || t < 0 || t > 100) {
      toast.error("Threshold must be between 0 and 100");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Not signed in. Please log in again.");
      }

      const form = new FormData();
      form.append("ref_image", probeFile);
      form.append("user_image", targetFile);
      form.append("similarity_threshold", String(t));
      form.append("approve_threshold", String(t));
      form.append("face_match_score_decline_threshold", String(t));

      const res = await axios.post(`${API_URL}/face-match`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Let browser set multipart boundary
        },
        timeout: 90_000,
      });

      setResult(res.data);
      toast.success(
        res.data?.face_match?.status
          ? `Result: ${res.data.face_match.status}`
          : "Face match complete",
      );
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Face match failed";
      console.error("[FaceMatching]", err);
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!allowed) {
    return (
      <div className={styles.denied}>
        <h2>Police / Admin access only</h2>
        <p>Face Matching is restricted to POLICE and ADMIN accounts.</p>
      </div>
    );
  }

  const color = statusColor(match?.status);
  const refFace = match?.ref_image?.entities?.[0];
  const userFace = match?.user_image?.entities?.[0];
  const warnings = match?.warnings || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Face Matching</h1>
        <p className={styles.subtitle}>
          Compare a probe (known) face with a target (CCTV / candidate) face
          using Amazon Rekognition CompareFaces. Investigation support only.
        </p>
      </div>

      <div className={styles.hero}>
        <span className={styles.heroBadge}>AWS Rekognition</span>
        <h2 className={styles.heroTitle}>Forensic Face Matching</h2>
        <p className={styles.heroText}>
          Source (probe) vs Target · similarity 0–100 · Approved if score ≥
          threshold (default 70%). Credentials stay on the server — never in
          the browser.
        </p>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>1. Probe face (source / reference)</div>
          <div className={styles.dropWrap}>
            <div
              className={styles.dropZone}
              onClick={() => probeInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") probeInputRef.current?.click();
              }}
            >
              {probePreview ? (
                <img src={probePreview} alt="Probe" className={styles.preview} />
              ) : (
                <>
                  <span className={styles.placeholderIcon}>🖼️</span>
                  <span className={styles.placeholderText}>Select probe image</span>
                  <span className={styles.placeholderHint}>
                    ID portrait or known photo
                  </span>
                </>
              )}
            </div>
            {probeFile ? (
              <button
                type="button"
                className={styles.clearOverlay}
                title="Clear probe image"
                onClick={(e) => {
                  e.stopPropagation();
                  clearImage("probe");
                }}
              >
                ×
              </button>
            ) : null}
          </div>
          <input
            ref={probeInputRef}
            type="file"
            accept="image/*"
            className={styles.hiddenInput}
            onChange={(e) => onPick("probe", e.target.files?.[0])}
          />
          {probeFile ? (
            <div className={styles.imageActions}>
              <button
                type="button"
                className={styles.changeBtn}
                onClick={() => probeInputRef.current?.click()}
              >
                Change image
              </button>
              <button
                type="button"
                className={styles.clearBtn}
                onClick={() => clearImage("probe")}
              >
                Clear
              </button>
            </div>
          ) : null}
        </div>

        <div className={styles.card}>
          <div className={styles.cardLabel}>2. Target face (candidate)</div>
          <div className={styles.dropWrap}>
            <div
              className={styles.dropZone}
              onClick={() => targetInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") targetInputRef.current?.click();
              }}
            >
              {targetPreview ? (
                <img src={targetPreview} alt="Target" className={styles.preview} />
              ) : (
                <>
                  <span className={styles.placeholderIcon}>📷</span>
                  <span className={styles.placeholderText}>Select target image</span>
                  <span className={styles.placeholderHint}>
                    CCTV still or selfie
                  </span>
                </>
              )}
            </div>
            {targetFile ? (
              <button
                type="button"
                className={styles.clearOverlay}
                title="Clear target image"
                onClick={(e) => {
                  e.stopPropagation();
                  clearImage("target");
                }}
              >
                ×
              </button>
            ) : null}
          </div>
          <input
            ref={targetInputRef}
            type="file"
            accept="image/*"
            className={styles.hiddenInput}
            onChange={(e) => onPick("target", e.target.files?.[0])}
          />
          {targetFile ? (
            <div className={styles.imageActions}>
              <button
                type="button"
                className={styles.changeBtn}
                onClick={() => targetInputRef.current?.click()}
              >
                Change image
              </button>
              <button
                type="button"
                className={styles.clearBtn}
                onClick={() => clearImage("target")}
              >
                Clear
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.field}>
          <label htmlFor="threshold">Similarity threshold (%)</label>
          <input
            id="threshold"
            type="number"
            min={0}
            max={100}
            step={1}
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
          />
        </div>
        <button
          type="button"
          className={styles.matchBtn}
          onClick={runMatch}
          disabled={loading || !probeFile || !targetFile}
        >
          {loading ? "Comparing…" : "Run face match (AWS)"}
        </button>
        {probeFile || targetFile || match || errorMsg ? (
          <button
            type="button"
            className={styles.clearAllBtn}
            onClick={clearAll}
            disabled={loading}
          >
            Clear all images
          </button>
        ) : null}
      </div>

      {errorMsg ? (
        <div className={styles.errorBox}>
          <strong>Error:</strong> {errorMsg}
        </div>
      ) : null}

      {match ? (
        <div className={styles.resultCard} style={{ borderColor: color }}>
          <div className={styles.resultStatus} style={{ color }}>
            {match.status || "—"}
          </div>
          <div className={styles.resultScore}>
            {score != null ? `${score.toFixed(2)}%` : "—"}
          </div>
          <div className={styles.resultScoreLabel}>Similarity score</div>
          {result?.request_id ? (
            <div className={styles.requestId}>
              Request ID: {result.request_id}
              {result.provider ? ` · ${result.provider}` : ""}
            </div>
          ) : null}

          {guidance ? (
            <div
              className={styles.guidance}
              style={{ borderColor: guidance.color + "55" }}
            >
              <div
                className={styles.guidanceTitle}
                style={{ color: guidance.color }}
              >
                {guidance.title}
              </div>
              <div className={styles.guidanceBody}>{guidance.body}</div>
            </div>
          ) : null}

          <div className={styles.metaRow}>
            <div className={styles.metaBox}>
              <div className={styles.metaTitle}>Probe (source)</div>
              <div className={styles.metaText}>
                Conf:{" "}
                {refFace?.confidence != null
                  ? (refFace.confidence * 100).toFixed(1) + "%"
                  : "—"}
              </div>
              <div className={styles.metaText}>
                Matched faces: {match.matched_faces_count ?? "—"}
              </div>
              <div className={styles.metaText}>
                Threshold: {match.approve_threshold ?? threshold}%
              </div>
            </div>
            <div className={styles.metaBox}>
              <div className={styles.metaTitle}>Target (candidate)</div>
              <div className={styles.metaText}>
                Conf:{" "}
                {userFace?.confidence != null
                  ? (userFace.confidence * 100).toFixed(1) + "%"
                  : "—"}
              </div>
              <div className={styles.metaText}>
                Unmatched faces: {match.unmatched_faces_count ?? "—"}
              </div>
              <div className={styles.metaText}>
                Provider:{" "}
                {result?.provider === "aws_rekognition"
                  ? "AWS Rekognition"
                  : result?.provider || "—"}
              </div>
            </div>
          </div>

          {warnings.length > 0 ? (
            <div className={styles.warnBox}>
              <div className={styles.warnTitle}>Warnings</div>
              {warnings.map((w, i) => (
                <div key={i} className={styles.warnItem}>
                  <div className={styles.warnRisk}>{w.risk || "WARNING"}</div>
                  <div className={styles.warnShort}>
                    {w.short_description || w.long_description || "—"}
                  </div>
                  {w.long_description &&
                  w.long_description !== w.short_description ? (
                    <div className={styles.warnLong}>{w.long_description}</div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.cleanNote}>
              No warnings · clean comparison
            </div>
          )}
        </div>
      ) : null}

      <p className={styles.note}>
        Restricted to POLICE / ADMIN. Uses Amazon Rekognition CompareFaces via
        secure server proxy. Scores are for investigation support only — not a
        sole basis for legal identity decisions.
      </p>
    </div>
  );
}

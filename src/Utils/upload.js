// src/Utils/upload.js
import axios from "axios";

const BUCKET_UPLOAD_URL =
  "https://bucket.cyberawareness.ngo/bucket/upload/cybercrime";

// ✅ supports: {files:[{url}]}, {file:{url}}, {url}, {data:{url}}, [{url}]
function extractUploadedUrl(data) {
  if (!data) return null;

  // A) { files: [{ url }] }
  if (Array.isArray(data?.files) && data.files[0]?.url) return data.files[0].url;

  // B) { file: { url } }
  if (data?.file?.url) return data.file.url;

  // C) { url: "..." }
  if (typeof data?.url === "string") return data.url;

  // D) { data: { url: "..." } }
  if (data?.data?.url) return data.data.url;

  // E) [{ url: "..." }]
  if (Array.isArray(data) && data[0]?.url) return data[0].url;

  return null;
}

export async function uploadToBucket({ file, project = "cybercrime" } = {}) {
  if (!file) throw new Error("No file provided");

  const formData = new FormData();
  formData.append("file", file);

  // If your backend uses project name from URL path only, keep URL fixed.
  // If you later add dynamic project: `${BASE_URL}/bucket/upload/${project}`
  const url = BUCKET_UPLOAD_URL;

  try {
    const res = await axios.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const uploadedUrl = extractUploadedUrl(res?.data);

    if (!uploadedUrl) {
      // helpful debug for your console
      console.log("Bucket upload raw response:", res?.data);
      throw new Error("Upload succeeded but no URL returned by server");
    }

    return uploadedUrl;
  } catch (err) {
    const msg =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      "Upload failed";
    throw new Error(msg);
  }
}

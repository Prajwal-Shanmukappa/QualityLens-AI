// ==========================================
// API CONFIGURATION
// ==========================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://qualitylens-ai.onrender.com";

// ==========================================
// API HELPER
// ==========================================

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
    },
  });

  const responseText = await response.text();

  let data = {};

  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    data = {
      message: responseText,
    };
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
      data.error ||
      `Server error: ${response.status}`
    );
  }

  return data;
}

// ==========================================
// AUTHENTICATION
// ==========================================

export const signupUser = (userData) => {
  return apiRequest("/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
};

export const loginUser = (credentials) => {
  return apiRequest("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });
};

// ==========================================
// COA ANALYSIS
// ==========================================

export const analyzeCoA = (file) => {
  const formData = new FormData();

  formData.append("file", file);

  return apiRequest("/api/coa/analyze", {
    method: "POST",
    body: formData,
  });
};

// ==========================================
// CROSS DOCUMENT VERIFICATION
// ==========================================

export const crossVerifyDocuments = (coaFile, purchaseOrderFile) => {
  const formData = new FormData();

  formData.append("coaFile", coaFile);
  formData.append("purchaseOrderFile", purchaseOrderFile);

  return apiRequest("/api/coa/cross-verify", {
    method: "POST",
    body: formData,
  });
};

// ==========================================
// EXPORT API URL
// ==========================================

export default API_BASE_URL;
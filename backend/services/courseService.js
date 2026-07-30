import axios from "axios";

/**
 * Check whether a phone has purchased the course by calling the Course Service.
 * Returns the parsed JSON response from the service (expected { exists, status }).
 * Throws an error with code 'SERVICE_UNAVAILABLE' when the upstream service
 * times out or returns 5xx.
 */
export async function checkPurchase(phone) {
  if (!process.env.COURSE_SERVICE_URL || !process.env.INTERNAL_SECRET) {
    throw new Error("COURSE_SERVICE_NOT_CONFIGURED");
  }

  const base = process.env.COURSE_SERVICE_URL.replace(/\/$/, "");

  try {
    const res = await axios.get(`${base}/internal/check-purchase`, {
      params: { phone },
      headers: { "x-internal-secret": process.env.INTERNAL_SECRET },
      timeout: 5000,
    });

    return res.data;
  } catch (err) {
    // Treat timeouts and 5xx as service unavailable so callers can return a 503
    if (err.code === "ECONNABORTED" || (err.response && err.response.status >= 500)) {
      const e = new Error("SERVICE_UNAVAILABLE");
      e.code = "SERVICE_UNAVAILABLE";
      throw e;
    }

    // Propagate other errors (4xx etc.) so the caller can decide
    throw err;
  }
}

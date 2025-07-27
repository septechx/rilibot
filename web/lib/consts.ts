export const url =
  process.env.NODE_ENV === "production"
    ? process.env.SERVICE_DASHBOARD_FQDN!
    : "http://localhost:3001";

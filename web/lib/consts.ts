export const url =
  process.env.NODE_ENV === "production"
    ? process.env.COOLIFY_FQDN!
    : "http://localhost:3001";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto";

export function encryptToken(token: string, secret: string) {
  const iv = randomBytes(16);
  const cipher = createCipheriv(
    "aes-256-cbc",
    createHash("sha256").update(secret).digest(),
    iv,
  );

  let encrypted = cipher.update(token, "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    encryptedToken: encrypted,
    iv: iv.toString("hex"),
  };
}

export function decryptToken(
  encryptedToken: string,
  iv: string,
  secret: string,
) {
  const decipher = createDecipheriv(
    "aes-256-cbc",
    createHash("sha256").update(secret).digest(),
    Buffer.from(iv, "hex"),
  );

  let decrypted = decipher.update(encryptedToken, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

export function validateToken(
  encryptedToken: string,
  iv: string,
  token: string,
): boolean {
  const apiSecret = process.env.API_SECRET!;
  const decryptedToken = decryptToken(encryptedToken, iv, apiSecret);

  return token === decryptedToken;
}

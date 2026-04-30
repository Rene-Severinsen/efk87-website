import crypto from "crypto";

/**
 * Utility for crypto operations like token generation and hashing.
 */
export const cryptoUtils = {
  /**
   * Generates a random, high-entropy token.
   */
  generateRandomToken(): string {
    return crypto.randomBytes(32).toString("hex");
  },

  /**
   * Hashes a token using SHA-256 for secure storage.
   */
  hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  },
};

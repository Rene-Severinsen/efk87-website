import bcrypt from "bcryptjs";

/**
 * Utility for password hashing and verification.
 */
export const passwordUtils = {
  /**
   * Hashes a password using bcrypt.
   */
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  },

  /**
   * Compares a plaintext password with a hash.
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },

  /**
   * Simple password strength validation.
   * Minimum 8 characters.
   */
  validatePassword(password: string): { isValid: boolean; error?: string } {
    if (password.length < 8) {
      return {
        isValid: false,
        error: "Adgangskoden skal være på mindst 8 tegn.",
      };
    }
    return { isValid: true };
  },
};

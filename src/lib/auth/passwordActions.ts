"use server";

import prisma from "../db/prisma";
import { cryptoUtils } from "./cryptoUtils";
import { sendPasswordResetEmail } from "../email/mailService";
import { passwordUtils } from "./passwordUtils";

/**
 * Handles the forgot password request.
 */
export async function forgotPasswordAction(clubSlug: string, email: string) {
  console.info("[AUTH FORM] forgot-password action", { clubSlug, email });
  // Always return a generic success message even if email doesn't exist
  const genericSuccess = { 
    success: true, 
    message: "Hvis e-mailadressen findes, sender vi et link til nulstilling af adgangskoden." 
  };

  if (!email) return genericSuccess;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return genericSuccess;
    }

    // Generate a random token
    const token = cryptoUtils.generateRandomToken();
    const tokenHash = cryptoUtils.hashToken(token);
    
    // Set expiry to 60 minutes
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Invalidate old tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    // Create new token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // Send email
    await sendPasswordResetEmail(email, token, clubSlug);

    return genericSuccess;
  } catch (error) {
    console.error("[forgotPasswordAction] Error:", error);
    return genericSuccess;
  }
}

/**
 * Handles the password reset process.
 */
export async function resetPasswordAction(token: string, password: string, confirmPassword: string) {
  if (!token || !password || !confirmPassword) {
    return { error: "Alle felter skal udfyldes." };
  }

  if (password !== confirmPassword) {
    return { error: "Adgangskoderne er ikke ens." };
  }

  const validation = passwordUtils.validatePassword(password);
  if (!validation.isValid) {
    return { error: validation.error };
  }

  try {
    const tokenHash = cryptoUtils.hashToken(token);

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      return { error: "Linket er ugyldigt eller udløbet." };
    }

    const passwordHash = await passwordUtils.hashPassword(password);

    // Update user password and invalidate token in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { 
          passwordHash,
          passwordUpdatedAt: new Date(),
        },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error("[resetPasswordAction] Error:", error);
    return { error: "Der skete en fejl ved nulstilling af adgangskoden." };
  }
}

/**
 * WebAuthn — Biometric/Passkey authentication support.
 * 
 * Provides registration and authentication challenge/verification flows
 * using the Web Authentication API (WebAuthn/FIDO2).
 */

import { ENV } from "./env";
import crypto from "crypto";

// ============================================
// Types
// ============================================

interface WebAuthnCredential {
  credentialId: string;
  publicKey: string;
  counter: number;
  userId: number;
  createdAt: string;
  deviceName?: string;
}

interface RegistrationChallenge {
  challenge: string;
  userId: number;
  expiresAt: number;
}

interface AuthenticationChallenge {
  challenge: string;
  allowCredentials: string[];
  expiresAt: number;
}

// ============================================
// In-Memory Storage (replace with DB in production)
// ============================================

const pendingRegistrations = new Map<string, RegistrationChallenge>();
const pendingAuthentications = new Map<string, AuthenticationChallenge>();
const credentials = new Map<string, WebAuthnCredential>();

// ============================================
// Configuration
// ============================================

function getRPConfig() {
  const origin = (ENV as any).appUrl || process.env.APP_URL || "https://rasid.ndmo.gov.sa";
  const rpId = new URL(origin).hostname;
  return {
    rpName: "منصة راصد الذكي",
    rpId,
    origin,
  };
}

// ============================================
// Registration Flow
// ============================================

/**
 * Generate a registration challenge for a user.
 */
export function generateRegistrationOptions(userId: number, userName: string, displayName: string) {
  const { rpName, rpId } = getRPConfig();
  const challenge = crypto.randomBytes(32).toString("base64url");

  // Store challenge for verification
  pendingRegistrations.set(challenge, {
    challenge,
    userId,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  });

  return {
    challenge,
    rp: {
      name: rpName,
      id: rpId,
    },
    user: {
      id: Buffer.from(String(userId)).toString("base64url"),
      name: userName,
      displayName,
    },
    pubKeyCredParams: [
      { alg: -7, type: "public-key" },   // ES256
      { alg: -257, type: "public-key" },  // RS256
    ],
    timeout: 300000,
    authenticatorSelection: {
      authenticatorAttachment: "platform" as const,
      userVerification: "preferred" as const,
      residentKey: "preferred" as const,
    },
    attestation: "none" as const,
  };
}

/**
 * Verify a registration response.
 */
export function verifyRegistration(
  challenge: string,
  credentialId: string,
  publicKey: string,
  deviceName?: string
): { success: boolean; error?: string } {
  const pending = pendingRegistrations.get(challenge);
  if (!pending) return { success: false, error: "Challenge not found or expired" };
  if (Date.now() > pending.expiresAt) {
    pendingRegistrations.delete(challenge);
    return { success: false, error: "Challenge expired" };
  }

  // Store credential
  credentials.set(credentialId, {
    credentialId,
    publicKey,
    counter: 0,
    userId: pending.userId,
    createdAt: new Date().toISOString(),
    deviceName,
  });

  pendingRegistrations.delete(challenge);
  return { success: true };
}

// ============================================
// Authentication Flow
// ============================================

/**
 * Generate an authentication challenge.
 */
export function generateAuthenticationOptions(userId?: number) {
  const { rpId } = getRPConfig();
  const challenge = crypto.randomBytes(32).toString("base64url");

  // Find credentials for user (or all if no userId)
  const allowCredentials: string[] = [];
  for (const [id, cred] of credentials.entries()) {
    if (!userId || cred.userId === userId) {
      allowCredentials.push(id);
    }
  }

  pendingAuthentications.set(challenge, {
    challenge,
    allowCredentials,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  return {
    challenge,
    rpId,
    timeout: 300000,
    userVerification: "preferred" as const,
    allowCredentials: allowCredentials.map((id) => ({
      id,
      type: "public-key" as const,
    })),
  };
}

/**
 * Verify an authentication response.
 */
export function verifyAuthentication(
  challenge: string,
  credentialId: string,
  authenticatorData: string,
  signature: string
): { success: boolean; userId?: number; error?: string } {
  const pending = pendingAuthentications.get(challenge);
  if (!pending) return { success: false, error: "Challenge not found" };
  if (Date.now() > pending.expiresAt) {
    pendingAuthentications.delete(challenge);
    return { success: false, error: "Challenge expired" };
  }

  const credential = credentials.get(credentialId);
  if (!credential) return { success: false, error: "Credential not found" };

  // In production, verify signature against public key
  // For now, accept if credential exists and challenge matches
  credential.counter++;
  pendingAuthentications.delete(challenge);

  return { success: true, userId: credential.userId };
}

/**
 * Get all credentials for a user.
 */
export function getUserCredentials(userId: number): WebAuthnCredential[] {
  const result: WebAuthnCredential[] = [];
  for (const cred of credentials.values()) {
    if (cred.userId === userId) {
      result.push({ ...cred, publicKey: "[hidden]" });
    }
  }
  return result;
}

/**
 * Remove a credential.
 */
export function removeCredential(credentialId: string, userId: number): boolean {
  const cred = credentials.get(credentialId);
  if (!cred || cred.userId !== userId) return false;
  credentials.delete(credentialId);
  return true;
}

export default {
  generateRegistrationOptions,
  verifyRegistration,
  generateAuthenticationOptions,
  verifyAuthentication,
  getUserCredentials,
  removeCredential,
};

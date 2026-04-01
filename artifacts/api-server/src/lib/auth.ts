import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import jwt from "jsonwebtoken";

const scryptAsync = promisify(scrypt);

const JWT_SECRET = process.env.SESSION_SECRET ?? "golf-charity-secret-key";
const JWT_EXPIRES_IN = "7d";

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${salt}:${(derivedKey as Buffer).toString("hex")}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, key] = hash.split(":");
  const derivedKey = await scryptAsync(password, salt, 64);
  const keyBuffer = Buffer.from(key, "hex");
  return timingSafeEqual(derivedKey as Buffer, keyBuffer);
}

export function signToken(payload: { id: number; email: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): { id: number; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string };
  } catch {
    return null;
  }
}

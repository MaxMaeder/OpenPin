import axios from "axios";
import { AuthProvider } from "./AuthProvider";
import { User } from "./types";
import admin from "firebase-admin";

const REST = "https://identitytoolkit.googleapis.com/v1";
const WEB_API_KEY =
  process.env.FIREBASE_WEB_API_KEY ??
  (() => {
    throw new Error("FIREBASE_WEB_API_KEY env var missing");
  })();

const SESSION_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export class FirebaseAuthProvider implements AuthProvider {
  private async idTokenToSessionCookie(idToken: string): Promise<string> {
    return admin.auth().createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_MS });
  }

  private makeUser(data: { localId: string; email: string; displayName?: string | null }): User {
    return { uid: data.localId, email: data.email, displayName: data.displayName ?? null };
  }

  async login(email: string, password: string) {
    const { data } = await axios.post(`${REST}/accounts:signInWithPassword?key=${WEB_API_KEY}`, {
      email,
      password,
      returnSecureToken: true,
    });

    const token = await this.idTokenToSessionCookie(data.idToken);
    return { token, user: this.makeUser(data) };
  }

  async signup(email: string, password: string) {
    const { data } = await axios.post(`${REST}/accounts:signUp?key=${WEB_API_KEY}`, {
      email,
      password,
      returnSecureToken: true,
    });

    const token = await this.idTokenToSessionCookie(data.idToken);
    return { token, user: this.makeUser(data) };
  }

  async resetPassword(email: string) {
    await axios.post(`${REST}/accounts:sendOobCode?key=${WEB_API_KEY}`, {
      requestType: "PASSWORD_RESET",
      email,
    });
  }

  async verify(token: string) {
    const decoded = await admin.auth().verifySessionCookie(token, true);
    return {
      uid: decoded.uid,
      email: decoded.email!,
      displayName: decoded.name ?? null,
      customClaims: decoded,
    };
  }
}

import { User } from "./types";

export interface AuthProvider {
  /**
   * Verify supplied credentials; on success return token + user.
   */
  login(email: string, password: string): Promise<{ token: string; user: User }>;

  /**
   * Create account if supported, otherwise throw `SIGNUP_NOT_SUPPORTED`.
   */
  signup(email: string, password: string): Promise<{ token: string; user: User }>;

  /**
   * Initiate a password‑reset e‑mail if supported, otherwise throw `RESET_NOT_SUPPORTED`.
   */
  resetPassword(email: string): Promise<void>;

  /**
   * Verify the session cookie or JWT coming from the client and return its claims.
   */
  verify(token: string): Promise<User>;
}

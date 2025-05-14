export interface User {
  uid: string;
  email: string;
  displayName?: string | null;
  customClaims?: Record<string, unknown>;
}

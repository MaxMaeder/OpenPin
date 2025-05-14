import { AuthProvider } from "./AuthProvider";
import { User } from "./types";
import fs from "fs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";

interface StaticUserRecord {
  uid: string;
  email: string;
  passwordHash: string;
}

const JWT_SECRET =
  process.env.JWT_SECRET ??
  (() => {
    throw new Error("JWT_SECRET env var missing");
  })();
const TWO_WEEKS = "14d"; // jsonwebtoken expiry format

export class StaticAuthProvider implements AuthProvider {
  private users: StaticUserRecord[] = [];

  constructor(filePath = "./users.json") {
    const resolved = path.resolve(filePath);
    if (!fs.existsSync(resolved)) throw new Error(`Static users file not found: ${resolved}`);
    this.users = JSON.parse(fs.readFileSync(resolved, "utf8"));
  }

  private issueJwt(user: StaticUserRecord): string {
    return jwt.sign({ uid: user.uid, email: user.email }, JWT_SECRET, { expiresIn: TWO_WEEKS });
  }

  async login(email: string, password: string) {
    const user = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      throw new Error("INVALID_CREDENTIALS");
    return { token: this.issueJwt(user), user: this.makeUser(user) };
  }

  async signup(): Promise<any> {
    throw new Error("SIGNUP_NOT_SUPPORTED");
  }
  async resetPassword(): Promise<any> {
    throw new Error("RESET_NOT_SUPPORTED");
  }

  async verify(token: string): Promise<User> {
    const decoded = jwt.verify(token, JWT_SECRET) as { uid: string; email: string };
    return { uid: decoded.uid, email: decoded.email };
  }

  private makeUser(u: StaticUserRecord): User {
    return { uid: u.uid, email: u.email };
  }
}

import { FirebaseAuthProvider } from "./FirebaseAuthProvider";
import { StaticAuthProvider } from "./StaticAuthProvider";
import { composeAuthService, AuthService } from "./composeAuthService";

const selectProvider = (): AuthService => {
  switch ((process.env.AUTH_PROVIDER ?? "firebase") as "firebase" | "static") {
    case "static":
      return composeAuthService(new StaticAuthProvider(process.env.STATIC_USERS_FILE));
    case "firebase":
    default:
      return composeAuthService(new FirebaseAuthProvider());
  }
};

export const auth: AuthService = selectProvider();
export default auth;

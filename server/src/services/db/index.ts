import { makeFirestoreRepos } from "./providers/firestore";
import { makeRelationalRepos } from "./providers/relational";
import type { UserRepo } from "./repositories/user";

export type Repositories = { user: UserRepo /*, captures, … */ };

function selectProvider(): Repositories {
  switch (process.env.DB_BACKEND ?? "firestore") {
    case "firestore":
      return makeFirestoreRepos();
    case "postgres":
      return makeRelationalRepos();
    default:
      throw new Error(
        `Unsupported DB_BACKEND '${process.env.DB_BACKEND}'. Use 'firestore' or 'postgres'.`
      );
  }
}

export const db: Repositories = selectProvider();

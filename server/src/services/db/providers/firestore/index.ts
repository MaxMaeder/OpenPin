import { Repositories } from "../..";
import { userRepoFirestore } from "./user";

export function makeFirestoreRepos(): Repositories {
  return {
    user: userRepoFirestore,
  };
}

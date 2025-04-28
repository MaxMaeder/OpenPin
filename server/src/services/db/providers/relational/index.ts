import { Repositories } from "../..";
import { userRepoSql } from "./user";

export function makeRelationalRepos(): Repositories {
  return {
    user: userRepoSql,
  };
}

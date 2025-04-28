import { Repositories } from "../..";
import { capturesRepoSql } from "./device/captures";
import { msgsRepoSql } from "./device/messages";
import { notesRepoSql } from "./device/notes";
import { userRepoSql } from "./user";

export function makeRelationalRepos(): Repositories {
  return {
    user: userRepoSql,
    device: {
      captures: capturesRepoSql,
      notes: notesRepoSql,
      msgs: msgsRepoSql,
    },
  };
}

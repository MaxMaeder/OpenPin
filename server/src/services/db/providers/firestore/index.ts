import { Repositories } from "../..";
import { capturesRepoFs } from "./device/captures";
import { msgsRepoFs } from "./device/messages";
import { notesRepoFs } from "./device/notes";
import { userRepoFs } from "./user";

export function makeFirestoreRepos(): Repositories {
  return {
    user: userRepoFs,
    device: {
      captures: capturesRepoFs,
      notes: notesRepoFs,
      msgs: msgsRepoFs,
    },
  };
}

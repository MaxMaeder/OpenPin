import { Repositories } from "../..";
import { capturesRepoFs } from "./device/captures";
import { dataRepoFs } from "./device/data";
import { listRepoFs } from "./device/list";
import { msgsRepoFs } from "./device/messages";
import { notesRepoFs } from "./device/notes";
import { settingsRepoFs } from "./device/setttings";
import { pairCodeRepoFs } from "./pairCode";
import { userRepoFs } from "./user";

export const makeFirestoreRepos = (): Repositories => {
  return {
    user: userRepoFs,
    pairCode: pairCodeRepoFs,
    device: {
      data: dataRepoFs,
      list: listRepoFs,
      settings: settingsRepoFs,
      captures: capturesRepoFs,
      notes: notesRepoFs,
      msgs: msgsRepoFs,
    },
  };
};

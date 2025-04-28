import { Repositories } from "../..";
import { capturesRepoSql } from "./device/captures";
import { dataRepoSql } from "./device/data";
import { listRepoSql } from "./device/list";
import { msgsRepoSql } from "./device/messages";
import { notesRepoSql } from "./device/notes";
import { settingsRepoSql } from "./device/settings";
import { pairCodeRepoSql } from "./pairCode";
import { userRepoSql } from "./user";

export const makeRelationalRepos = (): Repositories => {
  return {
    user: userRepoSql,
    pairCode: pairCodeRepoSql,
    device: {
      data: dataRepoSql,
      list: listRepoSql,
      settings: settingsRepoSql,
      captures: capturesRepoSql,
      notes: notesRepoSql,
      msgs: msgsRepoSql,
    },
  };
};

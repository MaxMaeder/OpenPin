import { mkSqlContentStore } from "./contentBase";
import { composeContentRepo } from "src/services/db/repositories/device/content";
import { DeviceNote } from "src/services/db";

const store = mkSqlContentStore<DeviceNote>("deviceNote");

export const notesRepoSql = composeContentRepo(store);

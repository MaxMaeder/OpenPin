import { mkSqlContentStore } from "./contentBase";
import { composeContentRepo } from "src/services/db/repositories/device/content";
import { DEV_NOTES_COL } from "src/config";
import { DeviceNote } from "src/services/db";

const store = mkSqlContentStore<DeviceNote>(DEV_NOTES_COL);

export const notesRepoSql = composeContentRepo(store);

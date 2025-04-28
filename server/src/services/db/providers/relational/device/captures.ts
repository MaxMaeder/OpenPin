import { mkSqlContentStore } from "./contentBase";
import { composeContentRepo } from "src/services/db/repositories/device/content";
import { DeviceCapture } from "src/services/db";
import { DEV_CAPTURES_COL } from "src/config";

const store = mkSqlContentStore<DeviceCapture>(DEV_CAPTURES_COL);

export const capturesRepoSql = composeContentRepo(store);

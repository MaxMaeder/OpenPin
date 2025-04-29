import { mkSqlContentStore } from "./contentBase";
import { composeContentRepo } from "src/services/db/repositories/device/content";
import { DeviceCapture } from "src/services/db";

const store = mkSqlContentStore<DeviceCapture>("deviceCapture");

export const capturesRepoSql = composeContentRepo(store);

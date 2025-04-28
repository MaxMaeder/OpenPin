import { DeviceMessage } from "src/services/db";
import { mkSqlContentStore } from "./contentBase";
import { composeContentRepo } from "src/services/db/repositories/device/content";
import { DEV_MSGS_COL } from "src/config";

const store = mkSqlContentStore<DeviceMessage>(DEV_MSGS_COL);

export const msgsRepoSql = composeContentRepo(store);

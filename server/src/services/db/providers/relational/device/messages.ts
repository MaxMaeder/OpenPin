import { DeviceMessage } from "src/services/db";
import { mkSqlContentStore } from "./contentBase";
import { composeContentRepo } from "src/services/db/repositories/device/content";

const store = mkSqlContentStore<DeviceMessage>("deviceMessage");

export const msgsRepoSql = composeContentRepo(store);

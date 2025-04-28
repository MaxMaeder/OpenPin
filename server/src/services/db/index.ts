import { makeFirestoreRepos } from "./providers/firestore";
import { makeRelationalRepos } from "./providers/relational";
import { DeviceId } from "./repositories/device";
import { DeviceCapture } from "./repositories/device/captures";
import { ContentRepo } from "./repositories/device/content";
import { DeviceMessage } from "./repositories/device/messages";
import { DeviceNote } from "./repositories/device/notes";
import { DataRepo, DeviceData } from "./repositories/device/data";
import { DeviceSettings, SettingsRepo } from "./repositories/device/settings";
import type { UserId, UserData, UserRepo } from "./repositories/user";
import type { PairCodeRepo } from "./repositories/pairCode";
import { ListRepo } from "./repositories/device/list";

export {
  UserId,
  DeviceId,
  UserData,
  DeviceData,
  DeviceSettings,
  DeviceCapture,
  DeviceNote,
  DeviceMessage,
};

export type Repositories = {
  user: UserRepo;
  pairCode: PairCodeRepo;
  device: {
    data: DataRepo;
    list: ListRepo;
    settings: SettingsRepo;
    captures: ContentRepo<DeviceCapture>;
    notes: ContentRepo<DeviceNote>;
    msgs: ContentRepo<DeviceMessage>;
  };
};

const selectProvider = (): Repositories => {
  switch (process.env.DB_BACKEND ?? "firestore") {
    case "firestore":
      return makeFirestoreRepos();
    case "postgres":
      return makeRelationalRepos();
    default:
      throw new Error(
        `Unsupported DB_BACKEND '${process.env.DB_BACKEND}'. Use 'firestore' or 'postgres'.`
      );
  }
};

export const db: Repositories = selectProvider();

import { makeFirestoreRepos } from "./providers/firestore";
import { makeRelationalRepos } from "./providers/relational";
import { DeviceCapture } from "./repositories/device/captures";
import { ContentRepo } from "./repositories/device/content";
import { DeviceMessage } from "./repositories/device/messages";
import { DeviceNote } from "./repositories/device/notes";
import type { UserData, UserRepo } from "./repositories/user";

export { UserData, DeviceCapture, DeviceNote, DeviceMessage };

export type Repositories = {
  user: UserRepo;
  device: {
    captures: ContentRepo<DeviceCapture>;
    notes: ContentRepo<DeviceNote>;
    msgs: ContentRepo<DeviceMessage>;
  };
};

function selectProvider(): Repositories {
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
}

export const db: Repositories = selectProvider();

import { castDraft } from "immer"
import {
  createSlice,
  createEntityAdapter,
  EntityState,
  PayloadAction,
} from '@reduxjs/toolkit';

export interface DeviceContent {
  id: string;
  date: Date;
}

// A helper type that represents T with its date serialized.
type Serialized<T extends DeviceContent> = Omit<T, 'date'> & { date: string };

export interface DeviceContentState<T extends DeviceContent> {
  // The adapter stores entries in serialized form.
  entries: EntityState<Serialized<T>, string>;
  // Pagination cursor stored as ISO string.
  // Will be null if no more entries
  nextStartAfter?: string | null;
}

// The overall state maps device IDs to their content state.
export type DeviceContentMapState<T extends DeviceContent> = {
  [deviceId: string]: DeviceContentState<T>;
};

// The payload coming from the server
export interface PaginatedData<T extends DeviceContent> {
  id: string; // Device ID.
  entries: T[];
  nextStartAfter?: Date | null;
}

export function createContentSlice<T extends DeviceContent>(
  sliceName: string
) {
  // Create an adapter for the serialized entries.
  const adapter = createEntityAdapter<Serialized<T>, string>({
    selectId: (entry) => entry.id,
    // Compare by date (stored as ISO strings works correctly for ordering).
    sortComparer: (a, b) => b.date.localeCompare(a.date),
  });

  const initialState: DeviceContentMapState<T> = {};

  const slice = createSlice({
    name: sliceName,
    initialState,
    reducers: {
      upsertContentForDevice(state, action: PayloadAction<PaginatedData<T>>) {
        const { id: deviceId, entries, nextStartAfter } = action.payload;
        if (!state[deviceId]) {
          state[deviceId] = {
            // Use castDraft so Immer accepts the initial state.
            entries: castDraft(adapter.getInitialState()),
            nextStartAfter: undefined,
          };
        }

        // Transform each entry: serialize the date.
        const serializedEntries = entries.map((entry) => ({
          ...entry,
          date: entry.date.toISOString(),
        })) as Serialized<T>[];

        // As opposed to data/settings slices, we create a seperate state per device, then that state holds our
        // captures/notes/messages entries, managed using createEntityAdapter
        // With data/settings slices, each device was an 'Entity' and we had one state
        state[deviceId].entries = adapter.upsertMany(state[deviceId].entries, serializedEntries);

        // Only update nextStartAfter if specified in payload (so is Date or null).
        if (nextStartAfter !== undefined) {
          state[deviceId].nextStartAfter = nextStartAfter
          ? nextStartAfter.toISOString()
          : null
        }
      },
      removeContentForDevice(
        state,
        action: PayloadAction<{ deviceId: string; entryId: string }>
      ) {
        const { deviceId, entryId } = action.payload;
        if (state[deviceId]) {
          adapter.removeOne(state[deviceId].entries, entryId);
        }
      },
      clearContentForDevice(state, action: PayloadAction<{ deviceId: string }>) {
        const { deviceId } = action.payload;
        if (state[deviceId]) {
          state[deviceId] = {
            entries: castDraft(adapter.getInitialState()),
            nextStartAfter: undefined,
          };
        }
      },
    },
  });

  // Create selectors that convert stored serialized dates back into Date objects.
  const selectors = {
    selectAllForDevice: (state: { [key: string]: any }, deviceId: string): T[] => {
      if (!state[sliceName] || !state[sliceName][deviceId]) return [];
      const allSerialized = adapter
        .getSelectors()
        .selectAll(state[sliceName][deviceId].entries);
      return allSerialized.map((entry) => ({
        ...entry,
        date: new Date(entry.date),
      })) as T[];
    },
    selectNextStartAfterForDevice: (
      state: { [key: string]: any },
      deviceId: string
    ): Date | undefined => {
      if (!state[sliceName] || !state[sliceName][deviceId]) return undefined;
      const next = state[sliceName][deviceId].nextStartAfter;
      return next ? new Date(next) : undefined;
    },
    selectHasMoreForDevice: (
      state: { [key: string]: any },
      deviceId: string
    ): boolean => {
      if (!state[sliceName] || !state[sliceName][deviceId]) return false;
      return state[sliceName][deviceId].nextStartAfter;
    },
  };

  return {
    slice,
    actions: slice.actions,
    selectors,
  };
}

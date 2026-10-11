import { configureStore, createSelector, createSlice } from "@reduxjs/toolkit";

export const STORAGE_KEY = "employees";

export function normalizeEmployee(value) {
  if (!value || typeof value !== "object") return null;
  const fields = ["name", "email", "title", "department"];
  if (fields.some((key) => typeof value[key] !== "string")) return null;
  const record = Object.fromEntries(
    fields.map((key) => [key, value[key].trim()]),
  );
  if (
    fields.some(
      (key) =>
        !record[key] || record[key].length > (key === "email" ? 254 : 100),
    )
  )
    return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email)) return null;
  const id = String(value.id ?? "");
  if (!id || id.length > 128) return null;
  return { ...record, id };
}

export function loadEmployees(storage = window.localStorage) {
  try {
    const saved = storage.getItem(STORAGE_KEY);
    if (!saved) return { records: [], warning: "" };
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) throw new Error("Invalid stored records");
    const ids = new Set();
    const records = parsed.map(normalizeEmployee).filter((record) => {
      if (!record || ids.has(record.id)) return false;
      ids.add(record.id);
      return true;
    });
    return {
      records,
      warning:
        records.length === parsed.length
          ? ""
          : "Some saved records could not be read. Use sample information only.",
    };
  } catch {
    return {
      records: [],
      warning:
        "Saved records could not be read. You can continue with a new list.",
    };
  }
}

const employeesSlice = createSlice({
  name: "employees",
  initialState: { records: [], removed: null, notice: "" },
  reducers: {
    employeeAdded(state, action) {
      const employee = normalizeEmployee(action.payload);
      if (
        !employee ||
        state.records.some((record) => record.id === employee.id)
      )
        return;
      state.records.push(employee);
      state.notice = `${employee.name} added.`;
    },
    employeeUpdated(state, action) {
      const employee = normalizeEmployee(action.payload);
      const index = state.records.findIndex(
        (record) => record.id === employee?.id,
      );
      if (!employee || index < 0) return;
      state.records[index] = employee;
      state.notice = `${employee.name} updated.`;
    },
    employeeRemoved(state, action) {
      const index = state.records.findIndex(
        (record) => record.id === action.payload,
      );
      if (index < 0) return;
      state.removed = { record: state.records[index], index };
      state.notice = `${state.records[index].name} removed. You can undo this removal.`;
      state.records.splice(index, 1);
    },
    removalUndone(state) {
      if (!state.removed) return;
      const { record, index } = state.removed;
      if (!state.records.some((employee) => employee.id === record.id))
        state.records.splice(Math.min(index, state.records.length), 0, record);
      state.notice = `${record.name} restored.`;
      state.removed = null;
    },
    samplesLoaded(state, action) {
      if (state.records.length) return;
      state.records = action.payload.map(normalizeEmployee).filter(Boolean);
      state.notice = "Eight fictional sample employees loaded.";
    },
  },
});

const filtersSlice = createSlice({
  name: "filters",
  initialState: { query: "", department: "all", sort: "name-asc" },
  reducers: {
    queryChanged(state, action) {
      state.query = action.payload;
    },
    departmentChanged(state, action) {
      state.department = action.payload;
    },
    sortChanged(state, action) {
      state.sort = action.payload;
    },
    filtersCleared() {
      return { query: "", department: "all", sort: "name-asc" };
    },
  },
});

const storageSlice = createSlice({
  name: "storage",
  initialState: { error: "", warning: "" },
  reducers: {
    storageFailed(state) {
      state.error =
        "Changes are available in this session, but could not be saved in this browser.";
    },
    storageSaved(state) {
      state.error = "";
      state.warning = "";
    },
  },
});

export const {
  employeeAdded,
  employeeUpdated,
  employeeRemoved,
  removalUndone,
  samplesLoaded,
} = employeesSlice.actions;
export const { queryChanged, departmentChanged, sortChanged, filtersCleared } =
  filtersSlice.actions;
export const { storageFailed, storageSaved } = storageSlice.actions;

export function createEmployeeStore(snapshot = { records: [], warning: "" }) {
  return configureStore({
    reducer: {
      employees: employeesSlice.reducer,
      filters: filtersSlice.reducer,
      storage: storageSlice.reducer,
    },
    preloadedState: {
      employees: { records: snapshot.records, removed: null, notice: "" },
      storage: { error: "", warning: snapshot.warning },
    },
  });
}

// Storage is a side effect outside reducers. Opening unreadable data alone never overwrites it.
export function subscribePersistence(store, storage = window.localStorage) {
  let previousRecords = store.getState().employees.records;
  return store.subscribe(() => {
    const records = store.getState().employees.records;
    if (records === previousRecords) return;
    previousRecords = records;
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(records));
      store.dispatch(storageSaved());
    } catch {
      store.dispatch(storageFailed());
    }
  });
}

export const selectRecords = (state) => state.employees.records;
export const selectDepartments = createSelector([selectRecords], (records) =>
  [...new Set(records.map((record) => record.department))].sort((a, b) =>
    a.localeCompare(b),
  ),
);
export const selectVisibleEmployees = createSelector(
  [selectRecords, (state) => state.filters],
  (records, { query, department, sort }) => {
    const text = query.trim().toLowerCase();
    const departmentExists = records.some(
      (record) => record.department === department,
    );
    const visible = records.filter(
      (record) =>
        (department === "all" ||
          !departmentExists ||
          record.department === department) &&
        [record.name, record.email, record.title, record.department].some(
          (value) => value.toLowerCase().includes(text),
        ),
    );
    const field = sort === "department" ? "department" : "name";
    const direction = sort === "name-desc" ? -1 : 1;
    return visible.sort(
      (a, b) =>
        direction *
        (a[field].localeCompare(b[field]) || a.name.localeCompare(b.name)),
    );
  },
);
export const selectDepartmentCounts = createSelector(
  [selectRecords],
  (records) =>
    Object.entries(
      records.reduce((counts, record) => {
        counts[record.department] = (counts[record.department] || 0) + 1;
        return counts;
      }, Object.create(null)),
    ).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
);

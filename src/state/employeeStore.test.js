import {
  createEmployeeStore,
  employeeAdded,
  employeeUpdated,
  employeeRemoved,
  removalUndone,
  loadEmployees,
} from "./employeeStore";

const employee = {
  id: "one",
  name: "Ada Lovelace",
  email: "ada@example.com",
  title: "Analyst",
  department: "Engineering",
};

test("Redux changes produce new state while preserving earlier snapshots", () => {
  const store = createEmployeeStore();
  const empty = store.getState();
  store.dispatch(employeeAdded(employee));
  const beforeEdit = store.getState();
  store.dispatch(employeeUpdated({ ...employee, title: "Engineer" }));
  expect(empty.employees.records).toEqual([]);
  expect(beforeEdit.employees.records[0].title).toBe("Analyst");
  expect(store.getState().employees.records[0].title).toBe("Engineer");
});

test("replaying the same actions yields the same employee state", () => {
  const first = createEmployeeStore();
  const second = createEmployeeStore();
  const actions = [
    employeeAdded(employee),
    employeeUpdated({ ...employee, title: "Engineer" }),
    employeeRemoved("one"),
    removalUndone(),
  ];
  actions.forEach((action) => {
    first.dispatch(action);
    second.dispatch(action);
  });
  expect(first.getState()).toEqual(second.getState());
});

test("rejects invalid records and duplicate employee IDs in saved data", () => {
  const storage = {
    getItem: () =>
      JSON.stringify([employee, employee, { id: "bad", name: null }]),
  };
  const snapshot = loadEmployees(storage);
  expect(snapshot.records).toEqual([employee]);
  expect(snapshot.warning).toMatch(/Some saved records/);
});

import { fireEvent, render, screen, within } from "@testing-library/react";
import App from "./App";

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, "", "/");
});

function addEmployee() {
  fireEvent.change(screen.getByLabelText("Name"), {
    target: { value: "Ada Lovelace" },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "ada@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Job Title"), {
    target: { value: "Analyst" },
  });
  fireEvent.change(screen.getByLabelText("Department"), {
    target: { value: "Engineering" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Add Employee" }));
}

test("saves an employee and restores the list after remounting", () => {
  const view = render(<App />);
  addEmployee();
  expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem("employees"))).toMatchObject([
    { name: "Ada Lovelace", title: "Analyst" },
  ]);

  view.unmount();
  render(<App />);
  expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
});

test("saves edits and removals to local storage", () => {
  render(<App />);
  addEmployee();
  fireEvent.click(screen.getByRole("button", { name: "Edit Ada Lovelace" }));
  fireEvent.change(
    within(screen.getByRole("listitem")).getByLabelText("Job Title"),
    {
      target: { value: "Engineer" },
    },
  );
  fireEvent.click(screen.getByRole("button", { name: "Save" }));
  expect(JSON.parse(localStorage.getItem("employees"))[0].title).toBe(
    "Engineer",
  );

  fireEvent.click(screen.getByRole("button", { name: "Remove Ada Lovelace" }));
  expect(JSON.parse(localStorage.getItem("employees"))).toEqual([]);
});

test("loads optional samples and combines live search with department filtering", () => {
  render(<App />);
  fireEvent.click(
    screen.getByRole("button", { name: "Load sample employees" }),
  );
  expect(screen.getByText("Showing 8 of 8 employees")).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Department filter"), {
    target: { value: "Engineering" },
  });
  expect(screen.getByText("Showing 3 of 8 employees")).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Search employees"), {
    target: { value: "  MAYA  " },
  });
  expect(screen.getByText("Showing 1 of 8 employees")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Maya Patel" })).toBeInTheDocument();
  expect(
    screen.queryByRole("link", { name: "Ethan Brooks" }),
  ).not.toBeInTheDocument();
});

test("retains directory filters when navigating between views", () => {
  render(<App />);
  fireEvent.click(
    screen.getByRole("button", { name: "Load sample employees" }),
  );
  fireEvent.change(screen.getByLabelText("Search employees"), {
    target: { value: "Ava" },
  });
  fireEvent.click(screen.getByRole("link", { name: "Dashboard" }));
  expect(screen.getByText("08")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("link", { name: "Directory" }));
  expect(screen.getByLabelText("Search employees")).toHaveValue("Ava");
  expect(screen.getByText("Showing 1 of 8 employees")).toBeInTheDocument();
});

test("sorts the displayed list without rearranging the saved employee collection", () => {
  render(<App />);
  fireEvent.click(
    screen.getByRole("button", { name: "Load sample employees" }),
  );
  const saved = localStorage.getItem("employees");
  fireEvent.change(screen.getByLabelText("Sort employees"), {
    target: { value: "name-desc" },
  });
  const list = screen.getAllByRole("listitem");
  expect(
    within(list[0]).getByRole("link", { name: "Sofia Rivera" }),
  ).toBeInTheDocument();
  expect(localStorage.getItem("employees")).toBe(saved);
});

test("updates dashboard totals after removal and restores the record with undo", () => {
  render(<App />);
  fireEvent.click(
    screen.getByRole("button", { name: "Load sample employees" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Remove Maya Patel" }));
  expect(JSON.parse(localStorage.getItem("employees"))).toHaveLength(7);
  fireEvent.click(screen.getByRole("link", { name: "Dashboard" }));
  expect(screen.getByText("07")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("link", { name: "Directory" }));
  fireEvent.click(screen.getByRole("button", { name: "Undo removal" }));
  expect(screen.getByRole("link", { name: "Maya Patel" })).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem("employees"))).toHaveLength(8);
});

test("changes theme through Context without changing employee data", () => {
  const { container } = render(<App />);
  addEmployee();
  const saved = localStorage.getItem("employees");
  fireEvent.click(screen.getByRole("button", { name: "Dark mode" }));
  expect(container.querySelector(".app-shell")).toHaveAttribute(
    "data-theme",
    "dark",
  );
  expect(screen.getByRole("button", { name: "Light mode" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(localStorage.getItem("employees")).toBe(saved);
});

test("reports corrupted saved data without overwriting it on page load", () => {
  localStorage.setItem("employees", "broken-json");
  render(<App />);
  expect(screen.getByRole("alert")).toHaveTextContent(
    "Saved records could not be read",
  );
  expect(localStorage.getItem("employees")).toBe("broken-json");
});

test("keeps an added record available when browser storage cannot be written", () => {
  const save = jest
    .spyOn(Storage.prototype, "setItem")
    .mockImplementation(() => {
      throw new Error("Storage denied");
    });
  try {
    render(<App />);
    addEmployee();
    expect(
      screen.getByRole("link", { name: "Ada Lovelace" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("could not be saved");
  } finally {
    save.mockRestore();
  }
});

test("opens the matching detail page and returns to the employee list", () => {
  render(<App />);
  addEmployee();
  const saved = JSON.parse(localStorage.getItem("employees"))[0];
  const link = screen.getByRole("link", { name: "Ada Lovelace" });
  expect(link).toHaveAttribute("href", `/employees/${saved.id}`);
  fireEvent.click(link);
  expect(
    screen.getByRole("heading", { name: "Employee Details" }),
  ).toBeInTheDocument();
  expect(screen.getByText("ada@example.com")).toBeInTheDocument();
  expect(screen.getByText(saved.id)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("link", { name: "Back to Employee List" }));
  expect(
    screen.getByRole("heading", { name: "Employee List" }),
  ).toBeInTheDocument();
});

test("restores a saved employee directly on the detail route", () => {
  localStorage.setItem(
    "employees",
    JSON.stringify([
      {
        id: "employee-42",
        name: "Jordan Lee",
        email: "jordan@example.com",
        title: "Developer",
        department: "IT",
      },
    ]),
  );
  window.history.replaceState({}, "", "/employees/employee-42");
  render(<App />);
  expect(
    screen.getByRole("heading", { name: "Employee Details" }),
  ).toBeInTheDocument();
  expect(screen.getByText("jordan@example.com")).toBeInTheDocument();
});

test("handles a missing employee without showing an empty detail record", () => {
  window.history.replaceState({}, "", "/employees/missing");
  render(<App />);
  expect(
    screen.getByRole("heading", { name: "Employee Not Found" }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("link", { name: "Back to Employee List" }));
  expect(screen.getByText("No employees added yet.")).toBeInTheDocument();
});

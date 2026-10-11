import { useRef, useState } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import {
  employeeRemoved,
  employeeUpdated,
  queryChanged,
  departmentChanged,
  sortChanged,
  filtersCleared,
  selectVisibleEmployees,
  selectDepartments,
  normalizeEmployee,
} from "../state/employeeStore";

export function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
function EmployeeList({
  employees,
  total,
  departments,
  filters,
  updateEmployee,
  removeEmployee,
  setQuery,
  setDepartment,
  setSort,
  clearFilters,
}) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [formError, setFormError] = useState("");
  const listHeading = useRef(null);
  const editButtons = useRef({});
  const activeDepartment = departments.includes(filters.department)
    ? filters.department
    : "all";
  function startEditing(employee) {
    setEditingId(employee.id);
    setDraft({ ...employee });
    setFormError("");
  }
  function handleChange(event) {
    setDraft((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
    setFormError("");
  }
  function finishEditing() {
    const id = editingId;
    setEditingId(null);
    setTimeout(
      () => (editButtons.current[id] || listHeading.current)?.focus(),
      0,
    );
  }
  function handleSave(event) {
    event.preventDefault();
    const valid = normalizeEmployee(draft);
    if (!valid) {
      setFormError("Enter complete fields and a valid email address.");
      return;
    }
    updateEmployee(valid);
    finishEditing();
  }
  return (
    <section className="employee-list" aria-labelledby="employee-list-heading">
      <div className="section-heading">
        <div>
          <h2 id="employee-list-heading" tabIndex={-1} ref={listHeading}>
            Employee List
          </h2>
          <p aria-live="polite">
            Showing {employees.length} of {total} employees
          </p>
        </div>
        <span className="count-badge">{total} PEOPLE</span>
      </div>
      <div className="directory-toolbar">
        <div className="search-field">
          <label htmlFor="search">Search employees</label>
          <input
            id="search"
            type="search"
            placeholder="Name, role, department..."
            value={filters.query}
            onChange={(event) => setQuery(event.target.value)}
            maxLength={100}
          />
        </div>
        <div>
          <label htmlFor="department-filter">Department filter</label>
          <select
            id="department-filter"
            value={activeDepartment}
            onChange={(event) => setDepartment(event.target.value)}
          >
            <option value="all">All departments</option>
            {departments.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sort">Sort employees</label>
          <select
            id="sort"
            value={filters.sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="name-asc">Name A–Z</option>
            <option value="name-desc">Name Z–A</option>
            <option value="department">Department</option>
          </select>
        </div>
      </div>
      {employees.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">
            ◎
          </span>
          <h3>{total ? "No matching employees" : "Your team starts here."}</h3>
          <p>
            {total
              ? "Try a different search or department."
              : "No employees added yet."}
          </p>
          {total > 0 && (
            <button
              type="button"
              className="secondary-button"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <ul className="people-grid">
          {employees.map((employee) => (
            <li className="person-card" key={employee.id}>
              {editingId === employee.id ? (
                <form
                  className="edit-form"
                  onSubmit={handleSave}
                  aria-label={"Edit " + employee.name}
                >
                  <h3>Edit employee</h3>
                  {[
                    ["name", "Name"],
                    ["email", "Email"],
                    ["title", "Job Title"],
                    ["department", "Department"],
                  ].map(([key, label]) => (
                    <label key={key}>
                      {label}
                      <input
                        name={key}
                        type={key === "email" ? "email" : "text"}
                        value={draft[key]}
                        onChange={handleChange}
                        required
                        maxLength={key === "email" ? 254 : 100}
                        autoFocus={key === "name"}
                      />
                    </label>
                  ))}
                  {formError && <p role="alert">{formError}</p>}
                  <div className="employee-actions">
                    <button type="submit" className="primary-button">
                      Save
                    </button>
                    <button type="button" onClick={finishEditing}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="person-topline">
                    <span className="avatar" aria-hidden="true">
                      {initials(employee.name)}
                    </span>
                    <span className="department-tag">
                      {employee.department}
                    </span>
                  </div>
                  <h3>
                    <Link
                      className="employee-name"
                      to={"/employees/" + encodeURIComponent(employee.id)}
                    >
                      {employee.name}
                    </Link>
                  </h3>
                  <p className="person-title">{employee.title}</p>
                  <p className="person-email">{employee.email}</p>
                  <div className="employee-actions">
                    <button
                      type="button"
                      aria-label={"Edit " + employee.name}
                      ref={(node) => {
                        editButtons.current[employee.id] = node;
                      }}
                      onClick={() => startEditing(employee)}
                    >
                      Edit
                    </button>
                    <button
                      className="remove-button"
                      type="button"
                      aria-label={"Remove " + employee.name}
                      onClick={() => {
                        removeEmployee(employee.id);
                        listHeading.current?.focus();
                      }}
                    >
                      Remove
                    </button>
                    <Link
                      className="view-link"
                      to={"/employees/" + encodeURIComponent(employee.id)}
                      aria-label={"View " + employee.name + " details"}
                    >
                      View <span aria-hidden="true">↗</span>
                    </Link>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
export function mapStateToProps(state) {
  return {
    employees: selectVisibleEmployees(state),
    total: state.employees.records.length,
    departments: selectDepartments(state),
    filters: state.filters,
  };
}
export function mapDispatchToProps(dispatch) {
  return {
    updateEmployee: (employee) => dispatch(employeeUpdated(employee)),
    removeEmployee: (id) => dispatch(employeeRemoved(id)),
    setQuery: (query) => dispatch(queryChanged(query)),
    setDepartment: (department) => dispatch(departmentChanged(department)),
    setSort: (sort) => dispatch(sortChanged(sort)),
    clearFilters: () => dispatch(filtersCleared()),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(EmployeeList);

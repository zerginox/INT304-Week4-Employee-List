import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectRecords, selectDepartmentCounts } from "../state/employeeStore";
import { initials } from "./EmployeeList";

function Dashboard() {
  const records = useSelector(selectRecords);
  const departments = useSelector(selectDepartmentCounts);
  const largest = departments[0];
  return (
    <>
      <div className="page-intro">
        <div>
          <p className="eyebrow">THE BIG PICTURE</p>
          <h1>Your team at a glance.</h1>
          <p>One shared directory. A clearer view of the people in it.</p>
        </div>
        <Link className="secondary-button" to="/">
          Open directory <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <div className="stats-grid">
        <article className="stat-card">
          <span>Total employees</span>
          <strong>{records.length.toString().padStart(2, "0")}</strong>
          <p>Across the entire directory</p>
        </article>
        <article className="stat-card">
          <span>Departments</span>
          <strong>{departments.length.toString().padStart(2, "0")}</strong>
          <p>Represented in your team</p>
        </article>
        <article className="stat-card highlight">
          <span>Largest department</span>
          <strong className="department-name">
            {largest?.[0] || "No records yet"}
          </strong>
          <p>
            {largest
              ? `${largest[1]} ${largest[1] === 1 ? "employee" : "employees"} · ${Math.round((largest[1] / records.length) * 100)}% of the team`
              : "Add people to get started"}
          </p>
        </article>
      </div>
      <div className="dashboard-grid">
        <section className="dashboard-card" aria-labelledby="breakdown-title">
          <p className="eyebrow">TEAM COMPOSITION</p>
          <h2 id="breakdown-title">People by department</h2>
          <p className="muted">Counts update as employee records change.</p>
          {departments.length ? (
            <ul className="department-bars">
              {departments.map(([name, count]) => (
                <li key={name}>
                  <div>
                    <span>{name}</span>
                    <strong>
                      {count} {count === 1 ? "person" : "people"}
                    </strong>
                  </div>
                  <div className="bar-track" aria-hidden="true">
                    <div
                      className="bar-fill"
                      style={{ width: `${(count / records.length) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              Add employees or load the sample directory to see your department
              breakdown.
            </p>
          )}
        </section>
        <section className="dashboard-card" aria-labelledby="recent-title">
          <p className="eyebrow">LATEST ADDITIONS</p>
          <h2 id="recent-title">Recently added</h2>
          <p className="muted">The newest records in this directory.</p>
          <ul className="recent-people">
            {records
              .slice(-4)
              .reverse()
              .map((employee) => (
                <li key={employee.id}>
                  <span className="avatar small" aria-hidden="true">
                    {initials(employee.name)}
                  </span>
                  <div>
                    <Link
                      className="employee-name"
                      to={`/employees/${encodeURIComponent(employee.id)}`}
                    >
                      {employee.name}
                    </Link>
                    <p>{employee.title}</p>
                  </div>
                  <span className="recent-department">
                    {employee.department}
                  </span>
                </li>
              ))}
          </ul>
          {!records.length && <p>Your recent employees will appear here.</p>}
        </section>
      </div>
    </>
  );
}
export default Dashboard;

import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectRecords } from "../state/employeeStore";
import { initials } from "./EmployeeList";
function EmployeeDetail() {
  const { id } = useParams();
  const employee = useSelector(selectRecords).find(
    (record) => String(record.id) === id,
  );
  if (!employee)
    return (
      <section className="info-page">
        <p className="eyebrow">EMPLOYEE DIRECTORY</p>
        <h1>Employee Not Found</h1>
        <p>
          This employee is not in the saved list. The record may have been
          removed.
        </p>
        <Link className="back-link" to="/">
          Back to Employee List
        </Link>
      </section>
    );
  return (
    <section className="detail-page">
      <Link className="breadcrumb" to="/" aria-label="Back to Employee List">
        <span aria-hidden="true">← </span>Back to Employee List
      </Link>
      <div className="profile-card">
        <div className="profile-cover" />
        <div className="profile-content">
          <span className="avatar profile-avatar" aria-hidden="true">
            {initials(employee.name)}
          </span>
          <p className="eyebrow">EMPLOYEE PROFILE</p>
          <h1>{employee.name}</h1>
          <p className="profile-role">{employee.title}</p>
          <span className="department-tag">{employee.department}</span>
          <h2>Employee Details</h2>
          <dl className="employee-details">
            {[
              ["Email", employee.email],
              ["Job Title", employee.title],
              ["Department", employee.department],
              ["Employee ID", employee.id],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <p className="profile-note">
            This record is shared with the directory and dashboard.
          </p>
        </div>
      </div>
    </section>
  );
}
export default EmployeeDetail;

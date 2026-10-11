import React from "react";
import { normalizeEmployee } from "../state/employeeStore";

class EmployeeForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: "",
      email: "",
      title: "",
      department: "",
      submitted: false,
      error: "",
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    const { name, value } = event.target;
    this.setState({
      [name]: value,
      submitted: false,
      error: "",
    });
  }

  handleSubmit(event) {
    event.preventDefault();

    const employee = {
      name: this.state.name.trim(),
      email: this.state.email.trim(),
      title: this.state.title.trim(),
      department: this.state.department.trim(),
    };

    if (!normalizeEmployee({ ...employee, id: "validation" })) {
      this.setState({
        error: "Enter complete fields and a valid email address.",
        submitted: false,
      });
      return;
    }
    this.props.onAddEmployee(employee);

    this.setState({
      name: "",
      email: "",
      title: "",
      department: "",
      submitted: true,
      error: "",
    });
  }

  render() {
    const heading = this.props.heading || "Add Employee";
    const submitLabel = this.props.submitLabel || "Add Employee";

    return (
      <section
        className="employee-card"
        aria-labelledby="employee-form-heading"
      >
        <p className="eyebrow">GROW YOUR DIRECTORY</p>
        <h2 id="employee-form-heading">{heading}</h2>
        <p className="form-intro">
          Enter the new employee information below. All fields are required.
        </p>

        <form className="employee-form" onSubmit={this.handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={this.state.name}
              onChange={this.handleChange}
              autoComplete="name"
              maxLength={100}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={this.state.email}
              onChange={this.handleChange}
              autoComplete="email"
              maxLength={254}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="title">Job Title</label>
            <input
              id="title"
              name="title"
              type="text"
              value={this.state.title}
              onChange={this.handleChange}
              autoComplete="organization-title"
              maxLength={100}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="department">Department</label>
            <input
              id="department"
              name="department"
              type="text"
              maxLength={100}
              value={this.state.department}
              onChange={this.handleChange}
              required
            />
          </div>

          {this.state.error && (
            <p className="form-error" role="alert">
              {this.state.error}
            </p>
          )}
          <button className="primary-button" type="submit">
            {submitLabel} <span aria-hidden="true">+</span>
          </button>
        </form>

        <p className="form-status" aria-live="polite">
          {this.state.submitted
            ? "Employee added to the list. The form is ready for another entry."
            : ""}
        </p>
      </section>
    );
  }
}

export default EmployeeForm;

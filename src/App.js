import { useEffect, useRef, useState } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
  useLocation,
} from "react-router-dom";
import EmployeeForm from "./components/EmployeeForm";
import EmployeeList from "./components/EmployeeList";
import EmployeeDetail from "./components/EmployeeDetail";
import Dashboard from "./components/Dashboard";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import {
  createEmployeeStore,
  loadEmployees,
  subscribePersistence,
  employeeAdded,
  removalUndone,
  samplesLoaded,
} from "./state/employeeStore";
import sampleEmployees from "./data/sampleEmployees";
import "./App.css";

function Header() {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="site-header">
      <Link to="/" className="brand" aria-label="Teamspace home">
        <span className="brand-mark" aria-hidden="true">
          t.
        </span>
        <span>
          teamspace<span className="brand-subtitle">EMPLOYEE DIRECTORY</span>
        </span>
      </Link>
      <nav aria-label="Primary navigation">
        <NavLink to="/" end>
          Directory
        </NavLink>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/about">About</NavLink>
      </nav>
      <button
        className="theme-toggle"
        type="button"
        onClick={toggleTheme}
        aria-pressed={theme === "dark"}
      >
        {theme === "light" ? "Dark mode" : "Light mode"}
      </button>
    </header>
  );
}
function Status() {
  const { notice, removed } = useSelector((state) => state.employees);
  const { error, warning } = useSelector((state) => state.storage);
  const dispatch = useDispatch();
  return (
    <>
      <div className="notice-bar" role="status" aria-live="polite">
        <span>{notice || "Your directory is ready."}</span>
        {removed && (
          <button type="button" onClick={() => dispatch(removalUndone())}>
            Undo removal
          </button>
        )}
      </div>
      {(error || warning) && (
        <p className="storage-error" role="alert">
          {error || warning}
        </p>
      )}
    </>
  );
}
function Home() {
  const records = useSelector((state) => state.employees.records);
  const dispatch = useDispatch();
  function addEmployee(employee) {
    const id =
      window.crypto?.randomUUID?.() ??
      Date.now() + "-" + Math.random().toString(36).slice(2);
    dispatch(employeeAdded({ ...employee, id }));
  }
  return (
    <>
      <div className="page-intro">
        <div>
          <p className="eyebrow">PEOPLE & CONNECTIONS</p>
          <h1>Meet your team.</h1>
          <p>Find the right person. Keep every detail in one place.</p>
        </div>
        <div className="intro-badge">
          <span className="status-dot" /> Course demonstration
        </div>
      </div>
      <Status />
      <div className="directory-layout">
        <aside>
          <EmployeeForm
            heading="Add Employee"
            submitLabel="Add Employee"
            onAddEmployee={addEmployee}
          />
          <div className="privacy-card">
            <strong>Keep it fictional.</strong>
            <p>
              Use sample information only. Records are stored in this browser;
              this demo has no account security.
            </p>
            {records.length === 0 && (
              <button
                type="button"
                className="secondary-button"
                onClick={() => dispatch(samplesLoaded(sampleEmployees))}
              >
                Load sample employees
              </button>
            )}
          </div>
        </aside>
        <EmployeeList />
      </div>
    </>
  );
}
function About() {
  return (
    <section className="info-page">
      <p className="eyebrow">INT304 FINAL PROJECT</p>
      <h1>A directory that stays in sync.</h1>
      <p>
        Teamspace builds on the Week 4 Employee Management System. The
        directory, employee detail routes, and department dashboard all use one
        shared employee collection.
      </p>
      <div className="feature-grid">
        <article>
          <h2>Live views</h2>
          <p>
            Search, filter, sort, and update employees without reloading the
            page. Dashboard totals change immediately.
          </p>
        </article>
        <article>
          <h2>Recoverable changes</h2>
          <p>
            Undo the most recent removal. Saved records return when this browser
            reloads.
          </p>
        </article>
        <article>
          <h2>Accessible controls</h2>
          <p>
            Use labeled fields, keyboard navigation, visible focus, and
            announcements of completed actions. Choose a light or dark theme.
          </p>
        </article>
        <article>
          <h2>Responsible scope</h2>
          <p>
            This local course demonstration is intended for fictional data. Real
            employee records require authenticated access, server validation,
            and protected storage.
          </p>
        </article>
      </div>
      <h2>How the application works</h2>
      <p>
        React Router handles navigation, Hooks manage local interaction and
        subscription cleanup, Context shares the theme, and Redux Toolkit stores
        employee records and directory filters. The directory uses React Redux's
        connect API to demonstrate the state and dispatch mappings covered in
        the textbook; the dashboard and details use Redux Hooks.
      </p>
      <Link className="back-link" to="/">
        Back to Employee List
      </Link>
    </section>
  );
}
function PageRoutes() {
  const location = useLocation();
  const mainRef = useRef(null);
  const firstRoute = useRef(true);
  useEffect(() => {
    if (firstRoute.current) {
      firstRoute.current = false;
      return;
    }
    mainRef.current?.focus();
  }, [location.pathname]);
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Header />
      <main
        id="main-content"
        className="main-content"
        tabIndex={-1}
        ref={mainRef}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employees/:id" element={<EmployeeDetail />} />
          <Route path="/about" element={<About />} />
          <Route
            path="*"
            element={
              <section className="info-page">
                <h1>Page Not Found</h1>
                <Link to="/">Back to Employee List</Link>
              </section>
            }
          />
        </Routes>
      </main>
      <footer className="site-footer">
        <span>teamspace / INT304 FINAL PROJECT</span>
        <span>Fictional data only · Saved in this browser</span>
      </footer>
    </>
  );
}
function App({ initialStore }) {
  const [store] = useState(
    () => initialStore || createEmployeeStore(loadEmployees()),
  );
  useEffect(() => subscribePersistence(store), [store]);
  return (
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <PageRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}
export default App;

# Teamspace — INT304 Week 5 Final Project

Teamspace develops the Week 4 Employee Management System into an interactive employee directory. A shared Redux store keeps the directory, employee profiles, and department dashboard synchronized.

## Start the project

Install Node.js and npm, open this folder in VS Code, then run:

~~~bash
npm ci
npm start
~~~

Open http://localhost:3000. If Windows PowerShell blocks npm.ps1, use a Command Prompt terminal or run npm.cmd ci and npm.cmd start.

## A three-minute demonstration

1. Select **Load sample employees** on the empty directory. Eight fictional employees are added. Existing Week 4 employee records are preserved; samples are offered only when the collection is empty.
2. Set **Department filter** to Engineering. The list immediately changes from eight employees to three.
3. Type Maya into **Search employees**. Open her profile and return to the directory. Search and filter choices survive navigation during the session.
4. Clear the search, edit Maya's job title, and save. The profile uses the same updated record.
5. Remove Maya, then open **Dashboard**. The employee total and department counts reflect the change.
6. Return to Directory and select **Undo removal**. The record and dashboard counts are restored.
7. Switch between light and dark modes, resize the browser, and refresh. Employee records persist; transient search settings, theme, and the undo slot reset on a full reload.

## React concepts in the final project

| Concept | Implementation |
| --- | --- |
| React Router | Directory, /dashboard, /employees/:id, About, and missing-page routes |
| React Hooks | Local editing state, route focus, selectors, dispatch, and subscription cleanup |
| Context | Shared light/dark theme |
| Redux Toolkit | One store with employees, filters, and storage status slices |
| Provider | Supplies the store to connected components and Redux Hooks |
| connect HOC | Wraps EmployeeList with mapStateToProps and mapDispatchToProps |
| Memoized selectors | Derive search results, department options, and dashboard counts |
| Immutable updates | Toolkit uses Immer drafts; previous state snapshots remain unchanged |
| CSS3 | Responsive Grid/Flexbox, custom properties, transitions, focus states, reduced-motion support |

The directory intentionally demonstrates the connect API required by the textbook. React Redux 9.3 marks connect as deprecated while retaining support; the dashboard, profiles, and status use the recommended Hooks APIs. Form drafts remain local state because other views do not need unfinished input.

## Responsibility and accessibility

Use fictional information only. This course demonstration stores records in localStorage on the current browser origin and supplies no authentication, authorization, server-side validation, or confidential-data protection. Client validation improves input quality; it does not create a security boundary.

The UI renders names as text, avoids raw HTML injection, validates field lengths and email structure, and reports unreadable storage or failed writes. Opening corrupted storage does not overwrite it. Labels, named controls, keyboard focus, a skip link, live status announcements, and reduced-motion support improve access. The latest removal is recoverable during the session.

## Verify

~~~bash
npm test -- --watchAll=false --runInBand
npm run build
~~~

Fifteen automated tests cover add/edit/remove, persistence, routing, missing records, live search, combined filters, sorting, dashboard synchronization, undo, theme isolation, storage failures, immutable snapshots, reproducible actions, and invalid saved records. Production-browser checks cover desktop interactions, direct-route reloads, and layouts at 320, 390, and 768 pixels.

Deploy the build with a host that rewrites unknown paths to index.html so direct profile URLs work. The project retains the existing course Create React App scaffold. No backend or external employee service is required.

import { Link, NavLink, Outlet } from "react-router-dom";

export function InternalToolsLayout() {
  return (
    <div className="internal-tools-shell">
      <header className="internal-tools-header">
        <div className="internal-tools-header-main">
          <Link className="internal-tools-brand" to="/generate-email">
            <div>
              <p className="internal-tools-brand-title">Tsa Kasi Logistics</p>
              <p className="internal-tools-brand-subtitle">
                Internal Document Tools
              </p>
            </div>
          </Link>

          <div className="internal-tools-route-links">
            <NavLink
              end
              className={({ isActive }) =>
                `internal-tools-link${isActive ? " internal-tools-link-active" : ""}`
              }
              to="/generate-email"
            >
              Email
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `internal-tools-link${isActive ? " internal-tools-link-active" : ""}`
              }
              to="/generate-pdf"
            >
              PDF
            </NavLink>
          </div>
        </div>

        <div className="internal-tools-header-actions">
          <Link className="button button-ghost" to="/">
            Back to Site
          </Link>
        </div>
      </header>

      <main className="internal-tools-frame">
        <Outlet />
      </main>
    </div>
  );
}

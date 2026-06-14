import { useState } from "react";
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";

import { navLinks } from "@/data/site";

export function Shell() {
  const [menuState, setMenuState] = useState({
    open: false,
    path: "",
  });
  const location = useLocation();
  const menuOpen =
    menuState.open && menuState.path === location.pathname;

  function toggleMenu() {
    setMenuState((current) =>
      current.open && current.path === location.pathname
        ? { open: false, path: location.pathname }
        : { open: true, path: location.pathname },
    );
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <Link className="brand" to="/">
          <div>
            <p className="brand-title">Tsa Kasi Logistics</p>
            <p className="brand-subtitle">
              Regional Clean Logistics Infrastructure
            </p>
          </div>
        </Link>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={toggleMenu}
        >
          <span />
          <span />
          <span />
        </button>

        <div
          id="site-menu"
          className={`header-menu${menuOpen ? " header-menu-open" : ""}`}
        >
          <nav className="site-nav">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `nav-link${isActive ? " nav-link-active" : ""}`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `nav-link${isActive ? " nav-link-active" : ""}`
              }
            >
              Admin
            </NavLink>
          </nav>

          <div className="header-actions">
            <Link className="button button-ghost" to="/partners">
              Discuss Last-Mile Partnership
            </Link>
          </div>
        </div>
      </header>

      <main className="page-frame">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div>
          <p className="eyebrow">Waterberg Market Development</p>
          <h2 className="footer-title">
            Tsa Kasi is building commercial proof around a lower-cost movement
            layer for regional commerce in Waterberg.
          </h2>
        </div>
        <div className="footer-actions">
          <Link
            className="button button-primary"
            to="/pilot"
            state={{ scrollToForm: true }}
          >
            Register Business Pilot
          </Link>
        </div>
      </footer>
    </div>
  );
}

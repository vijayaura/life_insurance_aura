import { NavLink, Outlet, useLocation } from "react-router-dom";
import { AppFooter } from "./AppFooter.jsx";

/** New quote application — full-width page without distributor sidebar. */
function showDistributorSidebar(pathname) {
  const p = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  return p !== "/distributor/quote";
}

function IconDashboard() {
  return (
    <svg className="uw-nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg className="uw-nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10 17H5V7h5M14 17l5-5-5-5M19 12H9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3l7 3v6c0 5-3 9-7 11-4-2-7-6-7-11V6l7-3z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Authenticated distributor shell: same rail pattern as market admin, minimal nav (dashboard + log out).
 */
export function DistributorSidebarLayout({ onLogout }) {
  const { pathname } = useLocation();
  const showSidebar = showDistributorSidebar(pathname);

  const mainColumn = (
    <div className="uw-portal-main">
      <div className="uw-portal-main-body">
        <Outlet />
        <AppFooter />
      </div>
    </div>
  );

  if (!showSidebar) {
    return <div className="uw-portal-shell uw-portal-shell--solo uw-portal-shell--quote">{mainColumn}</div>;
  }

  return (
    <div className="uw-portal-shell">
      <aside className="uw-sidebar" aria-label="Distributor navigation">
        <div className="uw-sidebar-top">
          <div className="uw-sidebar-brand">
            <div className="uw-sidebar-brand-mark">
              <IconShield />
            </div>
            <div className="uw-sidebar-brand-text">
              <div className="uw-sidebar-brand-title">Salama Insurance</div>
              <div className="uw-sidebar-brand-sub">Distributor Portal</div>
            </div>
          </div>

          <div className="uw-sidebar-user">
            <strong>Distributor</strong>
            <span>Distributor workspace</span>
          </div>

          <p className="uw-sidebar-section-label">Main navigation</p>
          <nav className="uw-sidebar-nav">
            <NavLink
              to="/distributor"
              end
              className={({ isActive }) => `uw-nav-link${isActive ? " is-active" : ""}`}
            >
              <IconDashboard />
              <span className="uw-nav-label">Dashboard</span>
            </NavLink>
          </nav>
        </div>

        <div className="uw-sidebar-footer">
          <button type="button" className="uw-nav-link uw-nav-link-subtle uw-nav-button" onClick={onLogout}>
            <IconLogout />
            <span className="uw-nav-label">Log out</span>
          </button>
        </div>
      </aside>
      {mainColumn}
    </div>
  );
}

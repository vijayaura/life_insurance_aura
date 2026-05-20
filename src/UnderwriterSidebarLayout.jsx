import { NavLink, Outlet, useLocation } from "react-router-dom";
import { AppFooter } from "./AppFooter.jsx";

const PRODUCT_STUDIO_PATH = "/underwriter/product-studio";

/**
 * Product Studio catalogue + new product use the rail; a specific product (and nested editors) is full-width.
 */
function showMarketAdminSidebar(pathname) {
  const p = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  if (!p.startsWith(PRODUCT_STUDIO_PATH)) {
    return true;
  }
  if (p === PRODUCT_STUDIO_PATH) {
    return true;
  }
  const rest = p.slice(PRODUCT_STUDIO_PATH.length + 1);
  if (rest === "new" || rest.startsWith("new/")) {
    return true;
  }
  return false;
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

function IconCube() {
  return (
    <svg className="uw-nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2l8 4.5v9L12 20l-8-4.5v-9L12 2z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M12 2v9l8 4.5M12 11L4 6.5" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg className="uw-nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 20V9.5L9 7v13M9 20V6l7-2v16M4 20h16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPeople() {
  return (
    <svg className="uw-nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15.5 8.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM3 20v-1a5 5 0 0 1 5-5h3M21 20v-1a5 5 0 0 0-4-4.9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconChart() {
  return (
    <svg className="uw-nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 19V5M8 19v-6M12 19V9M16 19v-3M20 19v-8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconPulse() {
  return (
    <svg className="uw-nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 12h3l2-6 4 12 2-6h5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
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

const mainNav = [
  { to: "/underwriter", label: "Dashboard", icon: IconDashboard, end: true },
  { to: "/underwriter/product-studio", label: "Product Studio", icon: IconCube, end: false },
  { to: "/underwriter/underwriter-management", label: "Underwriter Management", icon: IconBuilding, end: true },
  { to: "/underwriter/distributor-management", label: "Distributor Management", icon: IconPeople, end: true },
  { to: "/underwriter/analytics-reporting", label: "Analytics & Reporting", icon: IconChart, end: true },
  { to: "/underwriter/audit-logs", label: "Audit Logs", icon: IconPulse, end: true },
];

/**
 * Authenticated underwriter shell: light “Product Studio” style rail + main column.
 */
export function UnderwriterSidebarLayout({ onLogout }) {
  const { pathname } = useLocation();
  const showSidebar = showMarketAdminSidebar(pathname);

  const mainColumn = (
    <div className="uw-portal-main">
      <div className="uw-portal-main-body">
        <Outlet />
        <AppFooter />
      </div>
    </div>
  );

  if (!showSidebar) {
    return <div className="uw-portal-shell uw-portal-shell--solo">{mainColumn}</div>;
  }

  return (
    <div className="uw-portal-shell">
      <aside className="uw-sidebar" aria-label="Market admin navigation">
        <div className="uw-sidebar-top">
          <div className="uw-sidebar-brand">
            <div className="uw-sidebar-brand-mark">
              <IconShield />
            </div>
            <div className="uw-sidebar-brand-text">
              <div className="uw-sidebar-brand-title">Salama Insurance</div>
              <div className="uw-sidebar-brand-sub">Market Admin Portal</div>
            </div>
          </div>

          <div className="uw-sidebar-user">
            <strong>Market Admin</strong>
            <span>Market Admin</span>
          </div>

          <p className="uw-sidebar-section-label">Main navigation</p>
          <nav className="uw-sidebar-nav">
            {mainNav.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => `uw-nav-link${isActive ? " is-active" : ""}`}>
                <Icon />
                <span className="uw-nav-label">{label}</span>
              </NavLink>
            ))}
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

export function UnderwriterSectionPlaceholder({ title }) {
  return (
    <main className="portal uw-section-placeholder">
      <h1 className="uw-section-placeholder-title">{title}</h1>
      <p className="uw-section-placeholder-lead">This area is not connected to live data yet.</p>
    </main>
  );
}

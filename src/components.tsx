import { ArrowRight, Menu, X } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { setAuthenticated } from "./store";
import type { Status } from "./types";
import easephLogo from "./assets/easeph-logo-transparent.png";
import govTrackLogo from "./assets/govtrack-logo-transparent.png";

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link to="/" className={`logo ${inverse ? "logo-inverse" : ""}`}>
      <img className="govtrack-logo" src={govTrackLogo} alt="GovTrack" />
      <span className="logo-by">by</span>
      <img className="easeph-logo" src={easephLogo} alt="EasePH" />
    </Link>
  );
}

export function Header({ agency = false }: { agency?: boolean }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const logOut = () => {
    setAuthenticated(false);
    navigate("/agency/login");
  };

  return (
    <header className="site-header home-header">
      <div className="container header-inner">
        {agency
          ? (
            <div className="agency-brand">
              <Logo />
              <span>Agency Workspace</span>
            </div>
          )
          : <Logo />}
        <nav className={open ? "nav-open" : ""}>
          {agency
            ? (
              <>
                <NavLink to="/agency/dashboard" onClick={() => setOpen(false)}>
                  Dashboard
                </NavLink>
                <button className="header-cta" type="button" onClick={logOut}>
                  Log out <ArrowRight />
                </button>
              </>
            )
            : <NavLink to="/" onClick={() => setOpen(false)}>Home</NavLink>}
        </nav>
        <button
          className="menu-button"
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-label="Toggle agency navigation"
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer>
      <div className="container footer-grid">
        <div>
          <Logo inverse />
          <p>
            A modern platform making government business processes easier to
            understand and track.
          </p>
        </div>
        <div>
          <strong>Public services</strong>
          <Link to="/status">Track a service</Link>
        </div>
        <div>
          <strong>For agencies</strong>
          <Link to="/agency/login">Agency portal</Link>
          <span>support@govtrack.gov.ph</span>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>GovTrack · Government processes, made easy</span>
        <span>Clearer public services for everyone</span>
      </div>
    </footer>
  );
}

export function Layout({
  children,
  agency = false,
  showHeader = false,
  home = false,
  hideHeader = false,
  hideFooter = false,
}: {
  children: ReactNode;
  agency?: boolean;
  agencyNav?: boolean;
  showHeader?: boolean;
  home?: boolean;
  hideHeader?: boolean;
  hideFooter?: boolean;
}) {
  return (
    <div className="site-layout">
      {(agency || showHeader) && !hideHeader && <Header agency={agency} />}
      {children}
      {!home && !hideFooter && <Footer />}
    </div>
  );
}

export function PageIntro({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <section className="page-intro">
      <div className="container narrow">
        <h1>{title}</h1>
        <p>{text}</p>
        {children}
      </div>
    </section>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`status status-${status.toLowerCase()}`}>
      <i />
      {status}
    </span>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="empty-state">{children}</div>;
}

export function SectionHeading({
  title,
  text,
  action,
}: {
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        {text && <p>{text}</p>}
      </div>
      {action}
    </div>
  );
}

export function ArrowLink({
  to,
  children,
}: {
  to: string;
  children: ReactNode;
}) {
  return (
    <Link to={to} className="arrow-link">
      {children}
      <ArrowRight size={17} />
    </Link>
  );
}

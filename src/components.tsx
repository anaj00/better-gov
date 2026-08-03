import { ArrowRight, Menu, RotateCcw, ShieldCheck, X } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { isAuthenticated, resetRequests, setAuthenticated } from "./store";
import type { Status } from "./types";
import easephLogo from "./assets/easeph-logo.png";

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link to="/" className={`logo ${inverse ? "logo-inverse" : ""}`}>
      <img src={easephLogo} alt="EasePH" />
      <span className="tagline">Government Processes, Made Easy</span>
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header home-header">
      <div className="container header-inner">
        <Logo />
        <nav className={open ? "nav-open" : ""}>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/dashboard">Stats</NavLink>
          <NavLink to="/status">Track</NavLink>
          <Link to="/request" className="header-cta">
            Request a Process <ArrowRight />
          </Link>
        </nav>
        <button
          className="menu-button"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
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
            request and track.
          </p>
        </div>
        <div>
          <strong>Public services</strong>
          <Link to="/request">Start a request</Link>
          <Link to="/status">Check status</Link>
          <Link to="/dashboard">Statistics</Link>
        </div>
        <div>
          <strong>For agencies</strong>
          <Link to="/agency">Agency portal</Link>
          <span>support@easeph.org</span>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>EasePH · Government processes, made easy</span>
        <span>Clearer public services for everyone</span>
      </div>
    </footer>
  );
}

export function Layout(
  { children, agency = false, home = false, hideFooter = false }: {
    children: ReactNode;
    agency?: boolean;
    home?: boolean;
    hideFooter?: boolean;
  },
) {
  return (
    <>
      <Header />
      {agency && <AgencyBar />}
      {children}
      {!home && !hideFooter && <Footer />}
    </>
  );
}

function AgencyBar() {
  const navigate = useNavigate();
  if (!isAuthenticated()) return null;
  return (
    <div className="agency-bar">
      <div className="container">
        <span>
          <ShieldCheck size={16} /> Agency workspace
        </span>
        <div>
          <button
            onClick={() => {
              resetRequests();
              location.reload();
            }}
          >
            <RotateCcw size={14} /> Reset data
          </button>
          <button
            onClick={() => {
              setAuthenticated(false);
              navigate("/agency");
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

export function PageIntro(
  { eyebrow, title, text, children }: {
    eyebrow: string;
    title: string;
    text: string;
    children?: ReactNode;
  },
) {
  return (
    <section className="page-intro">
      <div className="container narrow">
        <span className="eyebrow">{eyebrow}</span>
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

export function SectionHeading(
  { eyebrow, title, text, action }: {
    eyebrow?: string;
    title: string;
    text?: string;
    action?: ReactNode;
  },
) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {text && <p>{text}</p>}
      </div>
      {action}
    </div>
  );
}

export function ArrowLink(
  { to, children }: { to: string; children: ReactNode },
) {
  return (
    <Link to={to} className="arrow-link">
      {children}
      <ArrowRight size={17} />
    </Link>
  );
}

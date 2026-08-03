import { ArrowRight } from "lucide-react";
import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Status } from "./types";
import easephLogo from "./assets/easeph-logo-transparent.png";

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link to="/" className={`logo ${inverse ? "logo-inverse" : ""}`}>
      <img src={easephLogo} alt="EasePH" />
      <span className="tagline">Government Processes, Made Easy</span>
    </Link>
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

export function Layout({
  children,
  home = false,
  hideFooter = false,
}: {
  children: ReactNode;
  agency?: boolean;
  agencyNav?: boolean;
  home?: boolean;
  hideHeader?: boolean;
  hideFooter?: boolean;
}) {
  return (
    <div className="site-layout">
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

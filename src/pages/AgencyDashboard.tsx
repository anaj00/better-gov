import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Search,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState, Layout, StatusBadge } from "../components";
import { formatDate, getRequests } from "../store";
import type { Status } from "../types";

export default function AgencyDashboard() {
  const [requests, setRequests] = useState(getRequests());
  const [query, setQuery] = useState("");
  const [process, setProcess] = useState("");
  const [status, setStatus] = useState<Status | "">("");

  useEffect(() => {
    const sync = () => setRequests(getRequests());
    window.addEventListener("easeph-requests-changed", sync);
    return () => window.removeEventListener("easeph-requests-changed", sync);
  }, []);

  const visible = useMemo(
    () =>
      requests.filter((request) =>
        (!query ||
          `${request.serialCode} ${request.businessName}`.toLowerCase()
            .includes(query.toLowerCase())) &&
        (!process || request.processId === process) &&
        (!status || request.status === status)
      ),
    [requests, query, process, status],
  );

  return (
    <Layout agency>
      <main className="agency-page">
        <div className="container">
          <div className="agency-heading">
            <div>
              <h1>Dashboard</h1>
              <p>Review and update requests submitted through EasePH.</p>
            </div>
            <span className="agency-date">
              Updated {formatDate(new Date().toISOString())}
            </span>
          </div>
          <div className="agency-summary">
            <div>
              <span className="summary-icon new">
                <Clock3 />
              </span>
              <span>
                <small>New requests</small>
                <strong>
                  {requests.filter((request) => request.status === "New")
                    .length}
                </strong>
              </span>
            </div>
            <div>
              <span className="summary-icon completed">
                <CheckCircle2 />
              </span>
              <span>
                <small>Completed requests</small>
                <strong>
                  {requests.filter((request) => request.status === "Completed")
                    .length}
                </strong>
              </span>
            </div>
          </div>
          <section className="requests-panel">
            <div className="panel-heading">
              <div>
                <h2>All requests</h2>
                <p>
                  {visible.length} request{visible.length !== 1 ? "s" : ""}{" "}
                  shown
                </p>
              </div>
              <div className="request-filters">
                <label className="search-box">
                  <Search />
                  <input
                    placeholder="Search code or business"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </label>
                <select
                  value={process}
                  onChange={(event) => setProcess(event.target.value)}
                >
                  <option value="">All processes</option>
                  <option value="bir-registration">BIR Registration</option>
                  <option value="business-permit">New Business Permit</option>
                </select>
                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as Status | "")}
                >
                  <option value="">All statuses</option>
                  <option>New</option>
                  <option>Completed</option>
                </select>
              </div>
            </div>
            {visible.length
              ? (
                <div className="request-card-grid">
                  {visible.map((request, index) => (
                    <Link
                      className="agency-request-card"
                      key={`${request.serialCode}-${index}`}
                      to={`/agency/dashboard/${request.serialCode}`}
                    >
                      <div className="agency-request-card-head">
                        <b>{request.serialCode}</b>
                        <StatusBadge status={request.status} />
                      </div>
                      <div className="agency-request-process">
                        <span>{request.processName}</span>
                        <small>{request.agency}</small>
                      </div>
                      <h3>{request.businessName}</h3>
                      <div className="agency-request-meta">
                        <span>
                          <UserRound /> {request.applicantName}
                        </span>
                        <span>
                          <CalendarDays /> Submitted{" "}
                          {formatDate(request.dateSubmitted, "short")}
                        </span>
                        {request.approvalDate && (
                          <span>
                            <CheckCircle2 /> Approved{" "}
                            {formatDate(request.approvalDate, "short")}
                          </span>
                        )}
                      </div>
                      <div className="agency-request-open">
                        View request <ArrowRight />
                      </div>
                    </Link>
                  ))}
                </div>
              )
              : (
                <EmptyState>
                  <Search />
                  <h3>No requests match</h3>
                  <p>Change or clear your filters to see more results.</p>
                </EmptyState>
              )}
          </section>
        </div>
      </main>
    </Layout>
  );
}

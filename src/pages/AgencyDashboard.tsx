import { ArrowRight, CheckCircle2, Clock3, Search } from "lucide-react";
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
              <h1>Requests</h1>
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
                  {requests.filter((r) => r.status === "New").length}
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
                  {requests.filter((r) => r.status === "Completed").length}
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
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                <select
                  value={process}
                  onChange={(e) => setProcess(e.target.value)}
                >
                  <option value="">All processes</option>
                  <option value="bir-registration">BIR Registration</option>
                  <option value="business-permit">New Business Permit</option>
                </select>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Status | "")}
                >
                  <option value="">All statuses</option>
                  <option>New</option>
                  <option>Completed</option>
                </select>
              </div>
            </div>
            {visible.length
              ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Request</th>
                        <th>Process</th>
                        <th>Business</th>
                        <th>Submitted</th>
                        <th>Status</th>
                        <th>Approval</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((request) => (
                        <tr key={request.serialCode}>
                          <td>
                            <b>{request.serialCode}</b>
                          </td>
                          <td>
                            <span>{request.processName}</span>
                            <small>{request.agency}</small>
                          </td>
                          <td>{request.businessName}</td>
                          <td>{formatDate(request.dateSubmitted, "short")}</td>
                          <td>
                            <StatusBadge status={request.status} />
                          </td>
                          <td>
                            {request.approvalDate
                              ? formatDate(request.approvalDate, "short")
                              : "—"}
                          </td>
                          <td>
                            <Link
                              to={`/agency/requests/${request.serialCode}`}
                              aria-label="Open request"
                            >
                              <ArrowRight />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

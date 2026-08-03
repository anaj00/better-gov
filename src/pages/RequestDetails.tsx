import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  History,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Layout, StatusBadge } from "../components";
import { formatDate, getRequests, updateRequest } from "../store";

export default function RequestDetails() {
  const { serial } = useParams();
  const original = getRequests().find((item) => item.serialCode === serial);
  const [approvalDate, setApprovalDate] = useState(
    original?.approvalDate || "",
  );
  const [note, setNote] = useState(original?.requesterNote || "");
  const [saved, setSaved] = useState(false);
  const [completed, setCompleted] = useState(original?.status === "Completed");
  if (!original) return <Navigate to="/agency/requests" />;
  const save = (e: FormEvent) => {
    e.preventDefault();
    updateRequest(original.serialCode, {
      approvalDate,
      requesterNote: note,
      status: completed ? "Completed" : "New",
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };
  return (
    <Layout agency>
      <main className="detail-page">
        <div className="container">
          <Link to="/agency/requests" className="back-link">
            <ArrowLeft /> Back to requests
          </Link>
          <div className="detail-heading">
            <div>
              <h1>{original.serialCode}</h1>
              <p>
                Submitted {formatDate(original.dateSubmitted)} · Last updated
                {" "}
                {formatDate(original.lastUpdated)}
              </p>
            </div>
            <StatusBadge status={completed ? "Completed" : "New"} />
          </div>
          <div className="detail-grid">
            <div className="detail-main">
              <section className="detail-card">
                <h2>Request overview</h2>
                <div className="overview-list">
                  <Info
                    icon={<Building2 />}
                    label="Process"
                    value={original.processName}
                    sub={original.agency}
                  />
                  <Info
                    icon={<UserRound />}
                    label="Business and applicant"
                    value={original.businessName}
                    sub={original.applicantName}
                  />
                  <Info
                    icon={<Mail />}
                    label="Email notifications"
                    value={original.email || "Not enabled"}
                  />
                  <Info
                    icon={<Phone />}
                    label="Contact number"
                    value={original.contactNumber}
                  />
                  <Info
                    icon={<MapPin />}
                    label="Business address"
                    value={original.address}
                    sub={`${original.barangay}, ${original.city}, ${original.region}`}
                  />
                  <Info
                    icon={<Calendar />}
                    label="Date submitted"
                    value={formatDate(original.dateSubmitted)}
                  />
                </div>
              </section>
              <section className="detail-card">
                <h2>Request information</h2>
                <dl className="request-info">
                  <div>
                    <dt>Business type</dt>
                    <dd>{original.businessType}</dd>
                  </div>
                  {original.registrationType && (
                    <div>
                      <dt>Registration type</dt>
                      <dd>{original.registrationType}</dd>
                    </div>
                  )}
                  {original.taxpayerType && (
                    <div>
                      <dt>Taxpayer type</dt>
                      <dd>{original.taxpayerType}</dd>
                    </div>
                  )}
                  {original.lineOfBusiness && (
                    <div>
                      <dt>Line of business</dt>
                      <dd>{original.lineOfBusiness}</dd>
                    </div>
                  )}
                  <div className="full">
                    <dt>Request notes</dt>
                    <dd>
                      {original.internalNotes || "No notes were provided."}
                    </dd>
                  </div>
                </dl>
              </section>
              <section className="detail-card">
                <h2>
                  <History /> Request history
                </h2>
                <div className="history-list">
                  {completed && (
                    <div>
                      <i>
                        <CheckCircle2 />
                      </i>
                      <span>
                        <b>Request completed</b>
                        <small>
                          {approvalDate
                            ? formatDate(approvalDate)
                            : "Approval recorded"}
                        </small>
                      </span>
                    </div>
                  )}
                  <div>
                    <i />
                    <span>
                      <b>Request submitted</b>
                      <small>{formatDate(original.dateSubmitted)}</small>
                    </span>
                  </div>
                </div>
              </section>
            </div>
            <aside>
              <form className="action-card" onSubmit={save}>
                <h2>Update request</h2>
                <p>Changes here are visible in the public status lookup.</p>
                <label className="field">
                  <span>Approval date</span>
                  <input
                    type="date"
                    required={completed}
                    value={approvalDate}
                    onChange={(e) => setApprovalDate(e.target.value)}
                  />
                </label>
                <label className="field">
                  <span>Requester-facing note</span>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={5}
                  />
                </label>
                <label className="complete-toggle">
                  <input
                    type="checkbox"
                    checked={completed}
                    onChange={(e) => setCompleted(e.target.checked)}
                  />
                  <span>
                    <b>Mark as completed</b>
                    <small>Sets public status to Completed</small>
                  </span>
                </label>
                <button className="button button-primary">Save changes</button>
                {saved && (
                  <p className="saved-message">
                    <CheckCircle2 /> Changes saved
                  </p>
                )}
              </form>
            </aside>
          </div>
        </div>
      </main>
    </Layout>
  );
}
function Info(
  { icon, label, value, sub }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    sub?: string;
  },
) {
  return (
    <div className="info-item">
      <span>{icon}</span>
      <div>
        <small>{label}</small>
        <b>{value}</b>
        {sub && <em>{sub}</em>}
      </div>
    </div>
  );
}

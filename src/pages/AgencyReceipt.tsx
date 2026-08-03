import {
  Check,
  Copy,
  Download,
  Mail,
  NotebookPen,
  TriangleAlert,
} from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Layout } from "../components";
import { activeProcesses } from "../data";
import { createTrackingQr, downloadReceipt } from "../receiptPdf";
import { formatDate, getRequests, updateRequest } from "../store";
import govTrackLogo from "../assets/govtrack-logo-transparent.png";

export default function AgencyReceipt() {
  const { serial } = useParams();
  const navigate = useNavigate();
  const request = getRequests().find((item) => item.serialCode === serial);
  const [email, setEmail] = useState(request?.email || "");
  const [internalNotes, setInternalNotes] = useState(
    request?.internalNotes || "",
  );
  const [copied, setCopied] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!request) return;
    createTrackingQr(request)
      .then(setQrCode)
      .catch(() => setError("The tracking QR code could not be prepared."));
  }, [request]);

  if (!request) return <Navigate to="/agency/dashboard" replace />;

  const confirmReceipt = (event: FormEvent) => {
    event.preventDefault();
    updateRequest(request.serialCode, {
      email: email.trim() || undefined,
      internalNotes: internalNotes.trim() || undefined,
    });
    navigate("/agency/dashboard");
  };

  const handleDownload = async () => {
    setDownloading(true);
    setError("");
    try {
      await downloadReceipt(request);
    } catch {
      setError("The PDF could not be generated. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Layout agency hideFooter>
      <main className="agency-receipt-page">
        <div className="receipt-workspace">
          <h1 className="receipt-success-heading">
            <span>
              <Check />
            </span>
            Receipt generated
          </h1>
          <section className="receipt-preview-column">
            <article className="receipt-sheet">
              <header className="receipt-sheet-head">
                <div>
                  <img src={govTrackLogo} alt="GovTrack" />
                  <small>Government processes, made easy.</small>
                </div>
                <div>
                  <strong>SERVICE RECEIPT</strong>
                  <small>{request.serialCode}</small>
                </div>
              </header>
              <div className="receipt-red-rule" />
              <div className="receipt-sheet-body">
                <div className="receipt-intro">
                  <h2>Government Service Record</h2>
                  <p>
                    Keep this receipt and scan the QR code to track this
                    service.
                  </p>
                </div>
                <div className="receipt-code-panel">
                  <div>
                    <span>SERIAL CODE</span>
                    <strong>{request.serialCode}</strong>
                    <small>Generated {formatDate(request.dateSubmitted)}</small>
                    <button
                      type="button"
                      onClick={async () => {
                        await navigator.clipboard.writeText(request.serialCode);
                        setCopied(true);
                        window.setTimeout(() => setCopied(false), 1600);
                      }}
                    >
                      {copied ? <Check /> : <Copy />}{" "}
                      {copied ? "Copied" : "Copy code"}
                    </button>
                  </div>
                  {qrCode && (
                    <img
                      src={qrCode}
                      alt="QR code for public status tracking"
                    />
                  )}
                </div>
                <dl className="receipt-fields">
                  <div>
                    <dt>Service</dt>
                    <dd>{request.processName}</dd>
                  </div>
                  <div>
                    <dt>Assigned agency</dt>
                    <dd>{request.agency}</dd>
                  </div>
                  <div>
                    <dt>Current status</dt>
                    <dd>{request.status}</dd>
                  </div>
                  <div>
                    <dt>Estimated processing</dt>
                    <dd>{activeProcesses[request.processId].estimate}</dd>
                  </div>
                </dl>
              </div>
              <footer className="receipt-sheet-footer">
                <span>Government processes, made easy.</span>
                <b>Scan the QR code to view the latest status.</b>
              </footer>
            </article>
          </section>

          <aside className="receipt-control-column">
            <form className="receipt-control-form" onSubmit={confirmReceipt}>
              <section className="receipt-control-field">
                <div className="receipt-control-label">
                  <Mail />
                  <div>
                    <strong>
                      Enter email to receive notifications
                    </strong>
                  </div>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="requester@email.com"
                  aria-label="Notification email"
                />
              </section>

              <section className="receipt-control-field">
                <div className="receipt-control-label">
                  <NotebookPen />
                  <div>
                    <strong>Internal notes</strong>
                  </div>
                </div>
                <textarea
                  value={internalNotes}
                  onChange={(event) => setInternalNotes(event.target.value)}
                  placeholder="Add context or handling instructions..."
                  aria-label="Internal notes"
                  rows={7}
                />
              </section>

              <div className="receipt-control-actions">
                <button
                  className="button button-outline receipt-download"
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading}
                >
                  <Download />{" "}
                  {downloading ? "Preparing PDF..." : "Download receipt"}
                </button>
                <button
                  className="button button-primary receipt-confirm"
                  type="submit"
                >
                  <Check /> Confirm
                </button>
              </div>
            </form>
            {error && (
              <p className="receipt-error">
                <TriangleAlert /> {error}
              </p>
            )}
          </aside>
        </div>
      </main>
    </Layout>
  );
}

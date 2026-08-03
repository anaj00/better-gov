import { Check, Copy, Download, Mail, Plus, TriangleAlert } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Layout } from "../components";
import { activeProcesses } from "../data";
import { createTrackingQr, downloadReceipt } from "../receiptPdf";
import { formatDate, getRequests, updateRequest } from "../store";
import easephLogo from "../assets/easeph-logo-transparent.png";

export default function AgencyReceipt() {
  const { serial } = useParams();
  const request = getRequests().find((item) => item.serialCode === serial);
  const [email, setEmail] = useState(request?.email || "");
  const [saved, setSaved] = useState(Boolean(request?.email));
  const [copied, setCopied] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!request) return;
    createTrackingQr(request).then(setQrCode).catch(() =>
      setError("The tracking QR code could not be prepared."),
    );
  }, [request]);

  if (!request) return <Navigate to="/agency/dashboard" replace />;

  const saveEmail = (event: FormEvent) => {
    event.preventDefault();
    updateRequest(request.serialCode, { email: email.trim() });
    setSaved(true);
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
    <Layout agency>
      <main className="agency-receipt-page">
        <div className="container receipt-page-wrap">
          <div className="receipt-page-heading">
            <div>
              <h1>Receipt generated</h1>
            </div>
            <Link className="button button-outline" to="/agency/dashboard">
              <Plus /> Generate another
            </Link>
          </div>

          <article className="receipt-sheet">
            <header className="receipt-sheet-head">
              <div>
                <img src={easephLogo} alt="EasePH" />
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
                <p>Keep this receipt and scan the QR code to track this service.</p>
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
                    {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy code"}
                  </button>
                </div>
                {qrCode && <img src={qrCode} alt="QR code for public status tracking" />}
              </div>
              <dl className="receipt-fields">
                <div><dt>Service</dt><dd>{request.processName}</dd></div>
                <div><dt>Assigned agency</dt><dd>{request.agency}</dd></div>
                <div><dt>Current status</dt><dd><span className="receipt-status">{request.status}</span></dd></div>
                <div><dt>Estimated processing</dt><dd>{activeProcesses[request.processId].estimate}</dd></div>
              </dl>
            </div>
            <footer className="receipt-sheet-footer">
              <span>Government processes, made easy.</span>
              <b>Scan the QR code to view the latest status.</b>
            </footer>
          </article>

          <section className="receipt-tools">
            <form className="receipt-email" onSubmit={saveEmail}>
              <Mail />
              <div>
                <strong>Enter your email to receive email notifications</strong>
                <div>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => { setEmail(event.target.value); setSaved(false); }}
                    placeholder="requester@email.com"
                    aria-label="Notification email"
                  />
                  <button className="button button-subtle" type="submit">
                    {saved ? "Email saved" : "Save email"}
                  </button>
                </div>
              </div>
            </form>
            <button className="button button-primary receipt-download" onClick={handleDownload} disabled={downloading}>
              <Download /> {downloading ? "Preparing PDF..." : "Download receipt"}
            </button>
          </section>
          {error && <p className="receipt-error"><TriangleAlert /> {error}</p>}
        </div>
      </main>
    </Layout>
  );
}

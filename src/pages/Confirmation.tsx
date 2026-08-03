import { Check, CheckCircle2, Download, Mail, Search } from "lucide-react";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { type FormEvent, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Layout, StatusBadge } from "../components";
import { activeProcesses } from "../data";
import { formatDate, getRequests, updateRequest } from "../store";
import easephLogo from "../assets/easeph-logo-transparent.png";

const imageDataUrl = async (url: string) => {
  const blob = await fetch(url).then((response) => response.blob());
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const whiteImageDataUrl = async (url: string) => {
  const source = await imageDataUrl(url);
  return await new Promise<string>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d");
      if (!context) return reject(new Error("Unable to prepare logo"));
      context.drawImage(image, 0, 0);
      context.globalCompositeOperation = "source-in";
      context.fillStyle = "#FFFFFF";
      context.fillRect(0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = reject;
    image.src = source;
  });
};

export default function Confirmation() {
  const { serial } = useParams();
  const request = getRequests().find((item) => item.serialCode === serial);
  const [notifications, setNotifications] = useState(Boolean(request?.email));
  const [email, setEmail] = useState(request?.email || "");
  const [saved, setSaved] = useState(Boolean(request?.email));
  if (!request) return <Navigate to="/request" />;
  const saveNotifications = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    updateRequest(request.serialCode, { email: email.trim() });
    setSaved(true);
  };
  const download = async () => {
    const statusUrl = `${window.location.origin}/status?serial=${
      encodeURIComponent(request.serialCode)
    }`;
    const [logo, qrCode] = await Promise.all([
      whiteImageDataUrl(easephLogo),
      QRCode.toDataURL(statusUrl, {
        width: 480,
        margin: 1,
        color: { dark: "#0B2E8A", light: "#FFFFFF" },
      }),
    ]);
    const pdf = new jsPDF();
    pdf.setFillColor(11, 46, 138);
    pdf.rect(0, 0, 210, 43, "F");
    pdf.setFillColor(214, 31, 58);
    pdf.rect(0, 43, 210, 2.5, "F");
    pdf.addImage(logo, "PNG", 16, 9, 45, 23);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(15);
    pdf.text("REQUEST RECEIPT", 194, 19, { align: "right" });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text(request.serialCode, 194, 27, { align: "right" });

    pdf.setTextColor(11, 46, 138);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text("Government Service Request", 16, 61);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(88, 105, 148);
    pdf.text(
      "Keep this receipt and scan the QR code to track your request.",
      16,
      68,
    );

    pdf.setFillColor(246, 248, 252);
    pdf.roundedRect(15, 77, 180, 54, 3, 3, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(11, 46, 138);
    pdf.setFontSize(8);
    pdf.text("SERIAL CODE", 23, 89);
    pdf.setFontSize(20);
    pdf.text(request.serialCode, 23, 101);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(88, 105, 148);
    pdf.text(`Submitted ${formatDate(request.dateSubmitted)}`, 23, 109);

    pdf.addImage(qrCode, "PNG", 143, 81, 45, 45);
    const entries = [
      ["Process", request.processName],
      ["Business", request.businessName],
      ["Applicant", request.applicantName],
      ["Assigned agency", request.agency],
      ["Current status", request.status],
      ["Estimated time", activeProcesses[request.processId].estimate],
    ];
    let y = 147;
    entries.forEach(([label, value]) => {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(88, 105, 148);
      pdf.text(label.toUpperCase(), 17, y);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(15, 31, 85);
      pdf.text(value, 17, y + 7, { maxWidth: 176 });
      y += value.length > 70 ? 24 : 19;
    });

    pdf.setDrawColor(223, 229, 241);
    pdf.line(16, 272, 194, 272);
    pdf.setFontSize(8);
    pdf.setTextColor(97, 112, 154);
    pdf.text("Government processes, made easy.", 16, 280);
    pdf.setTextColor(214, 31, 58);
    pdf.text("Scan the QR code above to view the latest status.", 194, 280, {
      align: "right",
    });
    pdf.save(`${request.serialCode}-receipt.pdf`);
  };
  return (
    <Layout>
      <main className="confirmation-page">
        <div className="container confirmation-wrap">
          <div className="success-icon">
            <Check />
          </div>
          <h1>Your request is on its way.</h1>
          <p>Keep your serial code safe. You will use it to track progress.</p>
          <div className="serial-card">
            <span>YOUR SERIAL CODE</span>
            <strong>{request.serialCode}</strong>
            <small>Submitted {formatDate(request.dateSubmitted)}</small>
          </div>
          <div className="confirmation-card">
            <div className="confirmation-title">
              <div>
                <h2>{request.processName}</h2>
                <p>{request.businessName}</p>
              </div>
              <StatusBadge status={request.status} />
            </div>
            <dl>
              <div>
                <dt>Assigned agency</dt>
                <dd>{request.agency}</dd>
              </div>
              <div>
                <dt>Estimated processing</dt>
                <dd>{activeProcesses[request.processId].estimate}</dd>
              </div>
              <div>
                <dt>Applicant</dt>
                <dd>{request.applicantName}</dd>
              </div>
              <div>
                <dt>Date submitted</dt>
                <dd>{formatDate(request.dateSubmitted)}</dd>
              </div>
            </dl>
            <div className="notification-setup">
              <label className="notification-toggle">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(event) => {
                    setNotifications(event.target.checked);
                    setSaved(false);
                  }}
                />
                <Mail />
                <span>
                  <b>Turn on email notifications</b>
                  <small>
                    Receive updates when your request status changes.
                  </small>
                </span>
              </label>
              {notifications && (
                <form
                  className="notification-form"
                  onSubmit={saveNotifications}
                >
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setSaved(false);
                    }}
                    placeholder="Enter your email address"
                    aria-label="Email address for request notifications"
                  />
                  <button className="button button-primary" type="submit">
                    {saved ? "Notifications on" : "Save email"}
                  </button>
                </form>
              )}
            </div>
          </div>
          <div className="confirmation-actions">
            <button className="button button-primary" onClick={download}>
              <Download /> Download receipt
            </button>
            <Link
              className="button button-subtle"
              to={`/status?serial=${request.serialCode}`}
            >
              <Search /> Check status
            </Link>
          </div>
          <p className="next-note">
            <CheckCircle2 />{" "}
            You may close this page. Your request is saved in this browser.
          </p>
        </div>
      </main>
    </Layout>
  );
}

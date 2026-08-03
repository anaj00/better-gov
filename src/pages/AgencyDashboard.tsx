import { CheckCircle2, Mail, Search, TicketCheck, X } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout, StatusBadge } from "../components";
import { birServices, type AgencyService } from "../data";
import {
  addRequest,
  formatDate,
  generateSerial,
  getRequests,
  updateRequest,
} from "../store";
import type { RequestRecord, Status } from "../types";

export default function AgencyDashboard() {
  const navigate = useNavigate();
  const manageButtonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [ticket, setTicket] = useState<RequestRecord | null>(null);
  const [lookupError, setLookupError] = useState("");
  const [nextStatus, setNextStatus] = useState<"Completed" | "Rejected" | "">("");
  const [toast, setToast] = useState("");

  const closeModal = () => {
    setModalOpen(false);
    setTrackingNumber("");
    setTicket(null);
    setLookupError("");
    setNextStatus("");
    window.setTimeout(() => manageButtonRef.current?.focus(), 0);
  };

  useEffect(() => {
    if (!modalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    searchInputRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalOpen]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 4000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const generateReceipt = (service: AgencyService) => {
    const now = new Date().toISOString();
    const request: RequestRecord = {
      serialCode: generateSerial(),
      processId: service.id,
      processName: service.name,
      agency: service.agency,
      dateSubmitted: now,
      status: "New",
      lastUpdated: now,
    };
    addRequest(request);
    navigate(`/agency/receipt/${request.serialCode}`);
  };

  const findTicket = (event: FormEvent) => {
    event.preventDefault();
    const normalized = trackingNumber.trim().toUpperCase();
    const match = getRequests().find(
      (request) => request.serialCode.toUpperCase() === normalized,
    );
    if (!match) {
      setTicket(null);
      setLookupError("No ticket was found with that tracking number.");
      return;
    }
    setTicket(match);
    setLookupError("");
    setNextStatus("");
  };

  const submitStatus = (event: FormEvent) => {
    event.preventDefault();
    if (!ticket || !nextStatus || ticket.status === nextStatus) return;
    updateRequest(ticket.serialCode, { status: nextStatus as Status });
    const message = `Ticket updated to ${nextStatus}. The requester will be notified via email.`;
    closeModal();
    setToast(message);
  };

  return (
    <Layout agency>
      <main className="agency-page service-dashboard">
        <div className="container">
          <div className="agency-heading service-heading">
            <div>
              <h1>Generate a service receipt</h1>
            </div>
          </div>

          <section className="service-catalog" aria-label="BIR services">
            <div className="service-card-grid">
              {birServices.map((service) => (
                <button
                  type="button"
                  className="agency-service-card"
                  key={service.id}
                  onClick={() => generateReceipt(service)}
                >
                  <span className="service-card-copy">
                    <strong>{service.name}</strong>
                  </span>
                </button>
              ))}
            </div>
          </section>
          <button
            ref={manageButtonRef}
            type="button"
            className="manage-ticket-button"
            onClick={() => setModalOpen(true)}
          >
            <TicketCheck />
            <span>
              <strong>Manage Ticket</strong>
              <small>Find a tracking number and update its status</small>
            </span>
          </button>
        </div>
      </main>

      {modalOpen && (
        <div
          className="ticket-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            className="ticket-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ticket-modal-title"
          >
            <header className="ticket-modal-header">
              <div>
                <span>Agency tools</span>
                <h2 id="ticket-modal-title">Manage Ticket</h2>
              </div>
              <button type="button" onClick={closeModal} aria-label="Close modal">
                <X />
              </button>
            </header>

            {!ticket ? (
              <form className="ticket-lookup-form" onSubmit={findTicket}>
                <label htmlFor="tracking-number">Tracking number</label>
                <p>Enter the serial code printed on the service receipt.</p>
                <div className="ticket-search-field">
                  <Search />
                  <input
                    ref={searchInputRef}
                    id="tracking-number"
                    value={trackingNumber}
                    onChange={(event) => {
                      setTrackingNumber(event.target.value);
                      setLookupError("");
                    }}
                    placeholder="EASE-2026-XXXXXXX"
                    autoComplete="off"
                    required
                  />
                </div>
                {lookupError && <p className="ticket-lookup-error">{lookupError}</p>}
                <button className="button button-primary ticket-modal-submit" type="submit">
                  Find Ticket
                </button>
              </form>
            ) : (
              <form className="ticket-update-form" onSubmit={submitStatus}>
                <div className="ticket-found">
                  <div className="ticket-found-head">
                    <div>
                      <span>Tracking number</span>
                      <strong>{ticket.serialCode}</strong>
                    </div>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <dl>
                    <div><dt>Service</dt><dd>{ticket.processName}</dd></div>
                    <div><dt>Date generated</dt><dd>{formatDate(ticket.dateSubmitted)}</dd></div>
                    {ticket.email && (
                      <div><dt>Notification email</dt><dd><Mail /> {ticket.email}</dd></div>
                    )}
                  </dl>
                </div>
                <fieldset className="ticket-status-options">
                  <legend>Update status</legend>
                  {(["Completed", "Rejected"] as const).map((status) => (
                    <label className={`ticket-status-choice ${status.toLowerCase()}`} key={status}>
                      <input
                        type="radio"
                        name="ticket-status"
                        value={status}
                        checked={nextStatus === status}
                        disabled={ticket.status === status}
                        onChange={() => setNextStatus(status)}
                      />
                      <span>
                        <b>{status}</b>
                        <small>
                          {status === "Completed"
                            ? "Mark this service as completed"
                            : "Mark this service as rejected"}
                        </small>
                      </span>
                    </label>
                  ))}
                </fieldset>
                <div className="ticket-modal-actions">
                  <button type="button" className="button button-outline" onClick={() => setTicket(null)}>
                    Back
                  </button>
                  <button className="button button-primary" type="submit" disabled={!nextStatus}>
                    Update Status
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}

      {toast && (
        <div className="ticket-toast" role="status" aria-live="polite">
          <CheckCircle2 />
          <p>{toast}</p>
          <button type="button" onClick={() => setToast("")} aria-label="Dismiss notification">
            <X />
          </button>
        </div>
      )}
    </Layout>
  );
}

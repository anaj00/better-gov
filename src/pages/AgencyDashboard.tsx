import {
  CheckCircle2,
  Mail,
  Pencil,
  Save,
  Search,
  TicketCheck,
  X,
} from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components";
import { type AgencyService, birServices } from "../data";
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
  const [internalNotes, setInternalNotes] = useState("");
  const [editingNotes, setEditingNotes] = useState(false);
  const [toast, setToast] = useState("");

  const closeModal = () => {
    setModalOpen(false);
    setTrackingNumber("");
    setTicket(null);
    setLookupError("");
    setInternalNotes("");
    setEditingNotes(false);
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
    setInternalNotes(match.internalNotes || "");
    setEditingNotes(false);
    setLookupError("");
  };

  const submitStatus = (status: Extract<Status, "Completed" | "Rejected">) => {
    if (!ticket || ticket.status === status) return;
    updateRequest(ticket.serialCode, {
      status,
      internalNotes: internalNotes.trim() || undefined,
    });
    const message =
      `Ticket updated to ${status}. The requester will be notified via email.`;
    closeModal();
    setToast(message);
  };

  const saveInternalNotes = () => {
    if (!ticket) return;
    updateRequest(ticket.serialCode, {
      internalNotes: internalNotes.trim() || undefined,
    });
    setTicket({
      ...ticket,
      internalNotes: internalNotes.trim() || undefined,
    });
    setEditingNotes(false);
    setToast("Internal note saved.");
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
          <section className="manage-ticket-section">
            <h2>Manage a ticket</h2>
            <button
              ref={manageButtonRef}
              type="button"
              className="manage-ticket-button"
              onClick={() => setModalOpen(true)}
            >
              <TicketCheck />
              <span>
                <strong>Manage Ticket</strong>
              </span>
            </button>
          </section>
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
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close modal"
              >
                <X />
              </button>
            </header>

            {!ticket
              ? (
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
                      placeholder="GOVTRACK-2026-XXXXXXX"
                      autoComplete="off"
                      required
                    />
                  </div>
                  {lookupError && (
                    <p className="ticket-lookup-error">{lookupError}</p>
                  )}
                  <button
                    className="button button-primary ticket-modal-submit"
                    type="submit"
                  >
                    Find Ticket
                  </button>
                </form>
              )
              : (
                <div className="ticket-update-form">
                  <div className="ticket-found">
                    <div className="ticket-found-head">
                      <div>
                        <span>Tracking number</span>
                        <strong>{ticket.serialCode}</strong>
                      </div>
                    </div>
                    <dl>
                      <div>
                        <dt>Service</dt>
                        <dd>{ticket.processName}</dd>
                      </div>
                      <div>
                        <dt>Date generated</dt>
                        <dd>{formatDate(ticket.dateSubmitted)}</dd>
                      </div>
                      {ticket.email && (
                        <div>
                          <dt>Notification email</dt>
                          <dd>
                            <Mail /> {ticket.email}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                  <div className="ticket-internal-notes">
                    <div className="ticket-notes-heading">
                      <label htmlFor="ticket-internal-notes">
                        Internal notes
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          if (editingNotes) saveInternalNotes();
                          else setEditingNotes(true);
                        }}
                        aria-label={editingNotes
                          ? "Save internal note"
                          : "Edit internal note"}
                        title={editingNotes ? "Save note" : "Edit note"}
                      >
                        {editingNotes ? <Save /> : <Pencil />}
                      </button>
                    </div>
                    <textarea
                      id="ticket-internal-notes"
                      value={internalNotes}
                      onChange={(event) => setInternalNotes(event.target.value)}
                      placeholder="Add context or handling instructions..."
                      rows={4}
                      readOnly={!editingNotes}
                      className={editingNotes ? "is-editing" : ""}
                    />
                  </div>
                  <div className="ticket-modal-actions">
                    <button
                      type="button"
                      className="ticket-action-button cancel"
                      onClick={closeModal}
                    >
                      <X /> Cancel
                    </button>
                    <button
                      type="button"
                      className="ticket-action-button rejected"
                      disabled={ticket.status === "Rejected"}
                      onClick={() => submitStatus("Rejected")}
                    >
                      <X /> Rejected
                    </button>
                    <button
                      type="button"
                      className="ticket-action-button completed"
                      disabled={ticket.status === "Completed"}
                      onClick={() => submitStatus("Completed")}
                    >
                      <CheckCircle2 /> Completed
                    </button>
                  </div>
                </div>
              )}
          </section>
        </div>
      )}

      {toast && (
        <div className="ticket-toast" role="status" aria-live="polite">
          <CheckCircle2 />
          <p>{toast}</p>
          <button
            type="button"
            onClick={() => setToast("")}
            aria-label="Dismiss notification"
          >
            <X />
          </button>
        </div>
      )}
    </Layout>
  );
}

import { AlertCircle, Check, Clock3, Search } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout, PageIntro, StatusBadge } from "../components";
import { formatDate, getRequests } from "../store";
import type { RequestRecord } from "../types";

export default function StatusLookup() {
  const [params] = useSearchParams();
  const initialSerial = params.get("serial") || "";
  const initialResult = initialSerial
    ? getRequests().find((request) =>
      request.serialCode.toUpperCase() === initialSerial.toUpperCase()
    ) || null
    : null;
  const [serial, setSerial] = useState(initialSerial);
  const [result, setResult] = useState<RequestRecord | null>(initialResult);
  const [searched, setSearched] = useState(Boolean(initialSerial));
  const search = (e?: FormEvent) => {
    e?.preventDefault();
    setResult(
      getRequests().find((request) =>
        request.serialCode.toUpperCase() === serial.trim().toUpperCase()
      ) || null,
    );
    setSearched(true);
  };
  return (
    <Layout>
      <main>
        <PageIntro
          eyebrow="Request tracking"
          title="Check your request status"
          text="Enter your serial code to see the latest update from the responsible agency."
        />
        <section className="lookup-section">
          <div className="container narrow">
            <form className="lookup-form" onSubmit={search}>
              <label>
                <span>Serial code</span>
                <div>
                  <Search />
                  <input
                    value={serial}
                    onChange={(e) => setSerial(e.target.value)}
                    placeholder="EASE-2026-XXXXXX"
                    required
                  />
                  <button className="button button-primary">
                    Check status
                  </button>
                </div>
              </label>
              <small>
                Try this reference code{" "}
                <button
                  type="button"
                  onClick={() => setSerial("EASE-2026-7K9M2Q")}
                >
                  EASE-2026-7K9M2Q
                </button>
              </small>
            </form>
            {searched && !result && (
              <div className="lookup-error">
                <AlertCircle />
                <div>
                  <h3>Request not found</h3>
                  <p>
                    Check the serial code and try again. Codes are not
                    case-sensitive.
                  </p>
                </div>
              </div>
            )}
            {result && (
              <div className="status-result">
                <div className="status-result-head">
                  <div>
                    <span className="eyebrow">Request found</span>
                    <h2>{result.processName}</h2>
                    <p>{result.serialCode}</p>
                  </div>
                  <StatusBadge status={result.status} />
                </div>
                <div className="public-details">
                  <div>
                    <span>Responsible agency</span>
                    <b>{result.agency}</b>
                  </div>
                  <div>
                    <span>Date submitted</span>
                    <b>{formatDate(result.dateSubmitted)}</b>
                  </div>
                  <div>
                    <span>Last updated</span>
                    <b>{formatDate(result.lastUpdated)}</b>
                  </div>
                  {result.approvalDate && (
                    <div>
                      <span>Approval date</span>
                      <b>{formatDate(result.approvalDate)}</b>
                    </div>
                  )}
                </div>
                <div className="public-note">
                  <Clock3 />
                  <div>
                    <span>Latest agency note</span>
                    <p>{result.requesterNote}</p>
                  </div>
                </div>
                <div className="status-timeline">
                  <div className="timeline-heading">
                    <h3>Request progress</h3>
                    <span>
                      {result.status === "Completed"
                        ? "2 of 2 complete"
                        : "1 of 2 complete"}
                    </span>
                  </div>
                  <div className="two-step">
                    <div className="step-done">
                      <i>
                        <Check />
                      </i>
                      <span>
                        <b>New</b>
                        <small>
                          Submitted {formatDate(result.dateSubmitted, "short")}
                        </small>
                      </span>
                    </div>
                    <em
                      className={result.status === "Completed" ? "done" : ""}
                    />
                    <div
                      className={result.status === "Completed"
                        ? "step-done"
                        : ""}
                    >
                      <i>{result.status === "Completed" ? <Check /> : 2}</i>
                      <span>
                        <b>Completed</b>
                        <small>
                          {result.approvalDate
                            ? `Approved ${
                              formatDate(result.approvalDate, "short")
                            }`
                            : "Awaiting agency action"}
                        </small>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </Layout>
  );
}

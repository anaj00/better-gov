import { AlertCircle, Check, ChevronDown, Search } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout, PageIntro } from "../components";
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
    <Layout showHeader>
      <main>
        <PageIntro
          title="Track your service"
          text="Enter the serial code on your receipt to see the latest update from the responsible agency."
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
                    placeholder="TRACK-XXXXXXXXXXXX"
                    required
                  />
                  <button className="button button-primary">
                    Track service
                  </button>
                </div>
              </label>
            </form>
            {searched && !result && (
              <div className="lookup-error">
                <AlertCircle />
                <div>
                  <h3>Service record not found</h3>
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
                    <h2>{result.processName}</h2>
                    <p>{result.serialCode}</p>
                  </div>
                </div>
                <div className="status-timeline">
                  <div className="timeline-heading">
                    <h3>Service progress</h3>
                    <span>
                      {result.status === "New"
                        ? "1 of 2 complete"
                        : "2 of 2 closed"}
                    </span>
                  </div>
                  <div className="two-step">
                    <div className="step-done">
                      <i>
                        <Check />
                      </i>
                      <span>
                        <b>Submitted</b>
                        <small>
                          Recorded {formatDate(result.dateSubmitted, "short")}
                        </small>
                      </span>
                    </div>
                    <em
                      className={result.status !== "New" ? "done" : ""}
                    />
                    <div
                      className={result.status === "Completed"
                        ? "step-done"
                        : result.status === "Rejected"
                        ? "step-rejected"
                        : ""}
                    >
                      <i>
                        {result.status === "Completed"
                          ? <Check />
                          : result.status === "Rejected"
                          ? "×"
                          : 2}
                      </i>
                      <span>
                        <b>
                          {result.status === "Rejected"
                            ? "Rejected"
                            : "Completed"}
                        </b>
                        <small>
                          {result.status === "Rejected"
                            ? "Service was not approved"
                            : result.status === "Completed"
                            ? "Request approved"
                            : "Awaiting agency action"}
                        </small>
                      </span>
                    </div>
                  </div>
                </div>
                <details className="request-details-collapse">
                  <summary>
                    Service details
                    <ChevronDown />
                  </summary>
                  <div className="public-details">
                    <div>
                      <span>Service</span>
                      <b>{result.processName}</b>
                    </div>
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
                  </div>
                </details>
              </div>
            )}
          </div>
        </section>
      </main>
    </Layout>
  );
}

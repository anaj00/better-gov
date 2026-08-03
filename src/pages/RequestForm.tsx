import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Landmark,
  MapPin,
  Search,
  UserRound,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Layout } from "../components";
import { activeProcesses, processCatalog } from "../data";
import { addRequest, generateSerial } from "../store";
import type { ProcessId, RequestRecord } from "../types";

const initial = {
  businessName: "Dela Cruz General Merchandise",
  applicantName: "Juan Dela Cruz",
  contactNumber: "+63 917 123 4567",
  region: "National Capital Region",
  city: "Quezon City",
  barangay: "Greater Lagro",
  address: "123 Commonwealth Avenue",
  registrationType: "New registration",
  taxpayerType: "Individual",
  businessType: "Sole proprietorship",
  lineOfBusiness: "Retail and general merchandise",
  registrationNumber: "DTI-2026-0012345",
  notes: "",
};
const stepLabels = ["Business information", "Request details", "Review"];

export default function RequestForm() {
  const params = useParams();
  const navigate = useNavigate();
  const validParam = params.processId && params.processId in activeProcesses
    ? params.processId as ProcessId
    : undefined;
  const [processId, setProcessId] = useState<ProcessId | "">(validParam || "");
  const [search, setSearch] = useState("");
  const [step, setStep] = useState(validParam ? 1 : 0);
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const process = processId ? activeProcesses[processId] : null;
  const query = search.trim().toLowerCase();
  const availableChoices = (Object.entries(activeProcesses) as [
    ProcessId,
    typeof activeProcesses[ProcessId],
  ][]).filter(([, item]) =>
    !query || `${item.name} ${item.agency}`.toLowerCase().includes(query)
  );
  const dummyChoices = processCatalog
    .filter((item) => !item.isRequestable)
    .filter((item) =>
      !query || `${item.name} ${item.agencyName}`.toLowerCase().includes(query)
    );
  const update = (name: string, value: string) =>
    setForm((current) => ({ ...current, [name]: value }));
  const fieldsForStep = step === 1
    ? [
      "businessName",
      "applicantName",
      "contactNumber",
      "region",
      "city",
      "barangay",
      "address",
    ]
    : step === 2
    ? processId === "bir-registration"
      ? ["registrationType", "taxpayerType", "businessType"]
      : ["businessType", "lineOfBusiness", "registrationNumber"]
    : [];
  const next = (event: FormEvent) => {
    event.preventDefault();
    if (fieldsForStep.some((key) => !form[key as keyof typeof form].trim())) {
      setError("Please complete all required fields before continuing.");
      return;
    }
    setError("");
    setStep((current) => current + 1);
    window.scrollTo(0, 0);
  };
  const submit = () => {
    if (!process || !processId) return;
    const now = new Date().toISOString();
    const serialCode = generateSerial();
    const request: RequestRecord = {
      serialCode,
      processId,
      processName: process.name,
      agency: process.agency,
      businessName: form.businessName,
      applicantName: form.applicantName,
      contactNumber: form.contactNumber,
      region: form.region,
      city: form.city,
      barangay: form.barangay,
      address: form.address,
      dateSubmitted: now,
      status: "New",
      approvalDate: "",
      requesterNote:
        "Your request has been received and is awaiting agency review.",
      internalNotes: form.notes,
      lastUpdated: now,
      registrationType: form.registrationType,
      taxpayerType: form.taxpayerType,
      businessType: form.businessType,
      lineOfBusiness: form.lineOfBusiness,
      registrationNumber: form.registrationNumber,
    };
    addRequest(request);
    navigate(`/confirmation/${serialCode}`);
  };
  return (
    <Layout hideFooter>
      <main className="form-page">
        <div className="container form-container">
          <Link
            to={step > 0 ? "#" : "/"}
            onClick={(e) => {
              if (step > 0) {
                e.preventDefault();
                setStep(step - 1);
              }
            }}
            className="back-link"
          >
            <ArrowLeft /> {step > 0 ? "Previous step" : "Back to home"}
          </Link>
          <div className="form-heading">
            <h1>{process ? process.name : "Request a service"}</h1>
            {process && <p>Submit your request to {process.agency}.</p>}
          </div>
          {step === 0
            ? (
              <div className="process-picker">
                <label className="process-search">
                  <Search />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search services or agencies"
                    aria-label="Search government services"
                  />
                </label>
                <div className="choice-grid">
                  {availableChoices.map(([id, item]) => (
                    <button
                      key={id}
                      className="choice-card"
                      onClick={() => {
                        setProcessId(id);
                        setStep(1);
                        navigate(`/request/${id}`, { replace: true });
                      }}
                    >
                      <span>
                        <span className="choice-title">
                          <b>{item.name}</b>
                        </span>
                        <small>{item.agency}</small>
                      </span>
                      <ArrowRight />
                    </button>
                  ))}
                  {dummyChoices.map((item) => (
                    <div
                      className="choice-card choice-card-disabled"
                      key={item.id}
                      aria-disabled="true"
                    >
                      <span>
                        <span className="choice-title">
                          <b>{item.name}</b>
                        </span>
                        <small>{item.agencyName}</small>
                      </span>
                      <ArrowRight />
                    </div>
                  ))}
                  {availableChoices.length + dummyChoices.length === 0 && (
                    <div className="process-empty">
                      No services match “{search}”.
                    </div>
                  )}
                </div>
              </div>
            )
            : (
              <div className="form-shell">
                <div className="stepper">
                  {stepLabels.map((label, index) => (
                    <div
                      className={index + 1 < step
                        ? "complete"
                        : index + 1 === step
                        ? "current"
                        : ""}
                      key={label}
                    >
                      <span>{index + 1 < step ? <Check /> : index + 1}</span>
                      <small>{label}</small>
                    </div>
                  ))}
                </div>
                <form
                  onSubmit={step < 3 ? next : (e) => {
                    e.preventDefault();
                    submit();
                  }}
                >
                  {step === 1 && (
                    <>
                      <FormSection
                        icon={<UserRound />}
                        title="Tell us about the business"
                        text="Use the details associated with this request."
                      >
                        <div className="field-grid">
                          <Field
                            label="Business name"
                            name="businessName"
                            value={form.businessName}
                            update={update}
                          />
                          <Field
                            label="Applicant name"
                            name="applicantName"
                            value={form.applicantName}
                            update={update}
                          />
                          <Field
                            label="Contact number"
                            name="contactNumber"
                            type="tel"
                            value={form.contactNumber}
                            update={update}
                            placeholder="+63 917 123 4567"
                          />
                        </div>
                      </FormSection>
                      <FormSection
                        icon={<MapPin />}
                        title="Where is the business located?"
                        text="Location helps route the request correctly."
                      >
                        <div className="field-grid">
                          <Select
                            label="Region"
                            name="region"
                            value={form.region}
                            update={update}
                            options={[
                              "National Capital Region",
                              "Central Luzon",
                              "CALABARZON",
                            ]}
                          />
                          <Select
                            label="City"
                            name="city"
                            value={form.city}
                            update={update}
                            options={["Quezon City", "Manila", "Makati City"]}
                          />
                          <Select
                            label="Barangay"
                            name="barangay"
                            value={form.barangay}
                            update={update}
                            options={[
                              "Greater Lagro",
                              "Commonwealth",
                              "Batasan Hills",
                            ]}
                          />
                          <Field
                            label="Business address"
                            name="address"
                            value={form.address}
                            update={update}
                            placeholder="Street, building, unit"
                          />
                        </div>
                      </FormSection>
                    </>
                  )}
                  {step === 2 && (
                    <FormSection
                      icon={<FileText />}
                      title="Request details"
                      text={`Information specific to ${process?.name}.`}
                    >
                      <div className="field-grid">
                        {processId === "bir-registration"
                          ? (
                            <>
                              <Select
                                label="Registration type"
                                name="registrationType"
                                value={form.registrationType}
                                update={update}
                                options={[
                                  "New registration",
                                  "Branch registration",
                                  "Registration update",
                                ]}
                                prompt
                              />
                              <Select
                                label="Taxpayer type"
                                name="taxpayerType"
                                value={form.taxpayerType}
                                update={update}
                                options={["Individual", "Non-individual"]}
                                prompt
                              />
                              <Select
                                label="Business type"
                                name="businessType"
                                value={form.businessType}
                                update={update}
                                options={[
                                  "Sole proprietorship",
                                  "Partnership",
                                  "Corporation",
                                ]}
                                prompt
                              />
                            </>
                          )
                          : (
                            <>
                              <Select
                                label="Business type"
                                name="businessType"
                                value={form.businessType}
                                update={update}
                                options={[
                                  "Sole proprietorship",
                                  "Partnership",
                                  "Corporation",
                                ]}
                                prompt
                              />
                              <Field
                                label="Line of business"
                                name="lineOfBusiness"
                                value={form.lineOfBusiness}
                                update={update}
                                placeholder="e.g. Food retail"
                              />
                              <Field
                                label="DTI or SEC registration no."
                                name="registrationNumber"
                                value={form.registrationNumber}
                                update={update}
                              />
                            </>
                          )}
                        <label className="field full">
                          <span>
                            Notes <small>Optional</small>
                          </span>
                          <textarea
                            value={form.notes}
                            onChange={(e) => update("notes", e.target.value)}
                            placeholder="Add any helpful context for the agency"
                          />
                        </label>
                      </div>
                    </FormSection>
                  )}
                  {step === 3 && (
                    <FormSection
                      icon={<Landmark />}
                      title="Review your request"
                      text="Check these details before submitting."
                    >
                      <div className="review-block">
                        <Review
                          title="Process"
                          rows={[[process?.name || "", process?.agency || ""]]}
                        />
                        <Review
                          title="Business details"
                          rows={[[form.businessName, form.applicantName], [
                            form.contactNumber,
                          ]]}
                        />
                        <Review
                          title="Location"
                          rows={[[
                            `${form.barangay}, ${form.city}`,
                            form.region,
                          ], [form.address, ""]]}
                        />
                        <Review
                          title="Request details"
                          rows={[[
                            form.businessType,
                            form.registrationType || form.lineOfBusiness,
                          ], [
                            form.taxpayerType || form.registrationNumber,
                            form.notes,
                          ]]}
                        />
                      </div>
                      <label className="confirm-check">
                        <input required type="checkbox" />{" "}
                        <span>
                          I confirm that the information provided is accurate
                          for this request.
                        </span>
                      </label>
                    </FormSection>
                  )}
                  {error && <p className="form-error">{error}</p>}
                  <div className="form-actions">
                    <button
                      type="button"
                      className="button button-subtle"
                      onClick={() => setStep(step - 1)}
                    >
                      Back
                    </button>
                    <button className="button button-primary" type="submit">
                      {step === 3 ? "Submit request" : "Continue"}{" "}
                      <ArrowRight />
                    </button>
                  </div>
                </form>
              </div>
            )}
        </div>
      </main>
    </Layout>
  );
}

function FormSection(
  { icon, title, text, children }: {
    icon: React.ReactNode;
    title: string;
    text: string;
    children: React.ReactNode;
  },
) {
  return (
    <section className="form-section">
      <div className="form-section-title">
        <span>{icon}</span>
        <div>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
function Field(
  { label, name, value, update, type = "text", placeholder = "" }: {
    label: string;
    name: string;
    value: string;
    update: (n: string, v: string) => void;
    type?: string;
    placeholder?: string;
  },
) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        required
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={(e) => update(name, e.target.value)}
      />
    </label>
  );
}
function Select(
  { label, name, value, update, options, prompt = false }: {
    label: string;
    name: string;
    value: string;
    update: (n: string, v: string) => void;
    options: string[];
    prompt?: boolean;
  },
) {
  return (
    <label className="field">
      <span>{label}</span>
      <select
        required
        name={name}
        value={value}
        onChange={(e) => update(name, e.target.value)}
      >
        {prompt && <option value="">Select an option</option>}
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}
function Review({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <div className="review-section">
      <h3>{title}</h3>
      {rows.map((row, index) => (
        <div key={index}>
          {row.filter(Boolean).map((value) => <span key={value}>{value}</span>)}
        </div>
      ))}
    </div>
  );
}

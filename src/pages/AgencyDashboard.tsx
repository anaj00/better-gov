import { useNavigate } from "react-router-dom";
import { Layout } from "../components";
import { birServices, type AgencyService } from "../data";
import { addRequest, generateSerial } from "../store";
import type { RequestRecord } from "../types";

export default function AgencyDashboard() {
  const navigate = useNavigate();

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
        </div>
      </main>
    </Layout>
  );
}

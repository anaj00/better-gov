import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileStack,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { Layout } from "../components";
import PhilippineMap from "../components/PhilippineMap";
import {
  barangaysForCity,
  citiesForRegion,
  drillLevelLabel,
  drillStats,
  medianDaysFor,
  processCatalog,
  regionNames,
  shortRegionName,
  statisticsByRegion,
} from "../data";
import type { DrillLocation, TimeWindow } from "../types";

const number = new Intl.NumberFormat("en-PH");
export default function PublicDashboard() {
  const [drill, setDrill] = useState<DrillLocation>({});
  const [window, setWindow] = useState<TimeWindow>("all");
  const [agency, setAgency] = useState("");
  const [processId, setProcessId] = useState("");
  const agencies = [...new Set(processCatalog.map((p) => p.agencyName))];
  const filteredCatalog = processCatalog.filter(
    (p) =>
      (!agency || p.agencyName === agency) &&
      (!processId || p.id === processId),
  );
  const processIds = filteredCatalog.map((p) => p.id);
  const regionStats = statisticsByRegion(processIds);
  const active = drillStats(drill, processIds, window);
  const median = medianDaysFor(drill, processIds, window);
  const children = drill.barangay
    ? []
    : drill.city
      ? barangaysForCity(drill.city)
      : drill.region
        ? citiesForRegion(drill.region)
        : regionNames;
  const childMedian = (child: string) =>
    drill.region
      ? drill.city
        ? medianDaysFor(
            { region: drill.region, city: drill.city, barangay: child },
            processIds,
            window,
          )
        : medianDaysFor(
            { region: drill.region, city: child },
            processIds,
            window,
          )
      : medianDaysFor({ region: child }, processIds, window);
  const childMedians = children.map((child) => childMedian(child));
  const maxMedian = Math.max(...childMedians, 0.1);
  const drillInto = (child: string) =>
    setDrill((current) =>
      current.region
        ? current.city
          ? { region: current.region, city: current.city, barangay: child }
          : { region: current.region, city: child }
        : { region: child },
    );
  const selectOnMap = (region: string) =>
    setDrill((current) => (current.region === region ? {} : { region }));
  const listTitle = drill.barangay
    ? "Barangay"
    : drill.city
      ? `${drill.city} · barangays`
      : drill.region
        ? `${shortRegionName(drill.region)} · cities`
        : "Regions";
  const hint = drill.barangay
    ? `${drill.barangay} · click a region on the map to switch`
    : drill.city
      ? "Pick a barangay to see its median"
      : drill.region
        ? "Pick a city to see its median"
        : "Click a region to drill down";
  return (
    <Layout>
      <main className="dashboard-page">
        <section className="dashboard-content">
          <div className="dashboard-main">
            <aside className="dashboard-side">
              <div className="side-heading">
                <h3>Requests by region</h3>
                <p>{hint}</p>
              </div>
              <div className="filter-bar">
                <label>
                  <span>Agency</span>
                  <select
                    value={agency}
                    onChange={(e) => {
                      setAgency(e.target.value);
                      setProcessId("");
                    }}
                  >
                    <option value="">All agencies</option>
                    {agencies.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Process</span>
                  <select
                    value={processId}
                    onChange={(e) => setProcessId(e.target.value)}
                  >
                    <option value="">All 50 processes</option>
                    {processCatalog
                      .filter((p) => !agency || p.agencyName === agency)
                      .map((item) => (
                        <option value={item.id} key={item.id}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                </label>
              </div>
              <div className="drill-breadcrumb">
                <button
                  className={drill.region ? "" : "active"}
                  onClick={() => setDrill({})}
                >
                  Philippines
                </button>
                {drill.region && (
                  <>
                    <span>/</span>
                    <button
                      className={drill.city ? "" : "active"}
                      onClick={() => setDrill({ region: drill.region })}
                    >
                      {shortRegionName(drill.region)}
                    </button>
                  </>
                )}
                {drill.city && (
                  <>
                    <span>/</span>
                    <button
                      className={drill.barangay ? "" : "active"}
                      onClick={() =>
                        setDrill({ region: drill.region, city: drill.city })
                      }
                    >
                      {drill.city}
                    </button>
                  </>
                )}
                {drill.barangay && (
                  <>
                    <span>/</span>
                    <button
                      className="active"
                      onClick={() =>
                        setDrill({ region: drill.region, city: drill.city })
                      }
                    >
                      {drill.barangay}
                    </button>
                  </>
                )}
              </div>
              <div className="time-toggle">
                <button
                  className={window === "all" ? "active" : ""}
                  onClick={() => setWindow("all")}
                >
                  All time
                </button>
                <button
                  className={window === "30d" ? "active" : ""}
                  onClick={() => setWindow("30d")}
                >
                  Last 30 days
                </button>
              </div>
              <div className="median-card">
                <small>Median processing time</small>
                <strong>{median.toFixed(1)} days</strong>
                <p>
                  {drillLevelLabel(drill)} ·{" "}
                  {window === "all" ? "all time" : "last 30 days"}
                </p>
              </div>
              <div className="drill-list">
                <h4>{listTitle}</h4>
                {children.map((child, index) => (
                  <button
                    key={child}
                    className="drill-row"
                    onClick={() => drillInto(child)}
                  >
                    <span className="drill-name">
                      {drill.region ? child : shortRegionName(child)}
                    </span>
                    <span className="drill-track">
                      <i
                        style={{
                          width: `${Math.round(
                            (childMedians[index] / maxMedian) * 100,
                          )}%`,
                        }}
                      />
                    </span>
                    <span className="drill-median">
                      {childMedians[index].toFixed(1)}d
                    </span>
                  </button>
                ))}
              </div>
              <div className="metric-grid">
                <Metric
                  icon={<FileStack />}
                  label="Total requests"
                  value={number.format(active.total)}
                />
                <Metric
                  icon={<Clock3 />}
                  label="New requests"
                  value={number.format(active.newRequests)}
                  tone="blue"
                />
                <Metric
                  icon={<CheckCircle2 />}
                  label="Completed"
                  value={number.format(active.completed)}
                  tone="green"
                />
                <Metric
                  icon={<TrendingUp />}
                  label="Avg. processing"
                  value={`${active.avgDays.toFixed(1)} days`}
                  tone="violet"
                />
                <Metric
                  icon={<CheckCircle2 />}
                  label="Completed on time"
                  value={`${Math.round(active.onTimePct)}%`}
                  tone="green"
                />
                <Metric
                  icon={<AlertTriangle />}
                  label="Overdue"
                  value={number.format(active.overdue)}
                  tone="orange"
                />
              </div>
            </aside>
            <div className="map-stage">
              <PhilippineMap
                stats={regionStats}
                selected={drill.region ?? null}
                onSelect={selectOnMap}
              />
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
function Metric({
  icon,
  label,
  value,
  tone = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className={`metric ${tone}`}>
      <span>{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

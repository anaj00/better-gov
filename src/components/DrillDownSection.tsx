import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileStack,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import {
  barangaysForCity,
  citiesForRegion,
  drillLevelLabel,
  drillStats,
  medianDaysFor,
  onTimePctFor,
  processCatalog,
  processMedianDays,
  processOnTime,
  regionNames,
  shortRegionName,
} from "../data";
import type { DrillLocation, TimeWindow } from "../types";

const number = new Intl.NumberFormat("en-PH");

export default function DrillDownSection() {
  const [drill, setDrill] = useState<DrillLocation>({});
  const [window, setWindow] = useState<TimeWindow>("all");
  const [agency, setAgency] = useState("");
  const [processId, setProcessId] = useState("");
  const [view, setView] = useState<"agency" | "area" | "process">("agency");
  const [sortKey, setSortKey] = useState<"median" | "onTime">("median");
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const agencies = [...new Set(processCatalog.map((p) => p.agencyName))];
  const filteredCatalog = processCatalog.filter(
    (p) =>
      (!agency || p.agencyName === agency) &&
      (!processId || p.id === processId),
  );
  const processIds = filteredCatalog.map((p) => p.id);
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
  const childLocation = (child: string): DrillLocation =>
    drill.region
      ? drill.city
        ? { region: drill.region, city: drill.city, barangay: child }
        : { region: drill.region, city: child }
      : { region: child };
  const childMedians = children.map((child) => childMedian(child));
  const drillInto = (child: string) =>
    setDrill((current) =>
      current.region
        ? current.city
          ? { region: current.region, city: current.city, barangay: child }
          : { region: current.region, city: child }
        : { region: child },
    );
  const drillBack = () =>
    setDrill((current) =>
      current.barangay
        ? { region: current.region, city: current.city }
        : current.city
          ? { region: current.region }
          : {},
    );
  const agencyRows = agencies
    .map((name) => {
      const ids = processCatalog
        .filter((p) => p.agencyName === name)
        .map((p) => p.id);
      return {
        id: name,
        name,
        processes: ids.length,
        median: medianDaysFor(drill, ids, window),
        onTime: onTimePctFor(drill, ids, window),
      };
    })
    .sort((a, b) => a.median - b.median);
  const areaRows = children
    .map((child, index) => ({
      id: child,
      name: child,
      median: childMedians[index],
      onTime: onTimePctFor(childLocation(child), processIds, window),
    }))
    .sort((a, b) => a.median - b.median);
  const processRows = processCatalog
    .filter(
      (p) =>
        (!agency || p.agencyName === agency) &&
        (!processId || p.id === processId),
    )
    .map((p) => ({
      id: p.id,
      name: p.name,
      sub: agency ? undefined : p.agencyName,
      median: processMedianDays(p.id, drill, window),
      onTime: processOnTime(p.id, drill, window),
    }))
    .sort((a, b) => a.median - b.median);
  type LeaderboardRow = {
    id: string;
    name: string;
    sub?: string;
    median: number;
    onTime: number;
  };
  const boardRows: LeaderboardRow[] =
    view === "agency"
      ? agencyRows
      : view === "process"
        ? processRows
        : areaRows;
  const toggleSort = (key: "median" | "onTime") => {
    if (sortKey === key) {
      setSortDir((d) => (d === 1 ? -1 : 1));
    } else {
      setSortKey(key);
      setSortDir(1);
    }
  };
  const sortedRows = [...boardRows].sort((a, b) =>
    sortKey === "median"
      ? (a.median - b.median) * sortDir
      : (a.onTime - b.onTime) * sortDir,
  );
  const onRowClick = (name: string) => {
    if (view === "agency") {
      setAgency(name);
      setProcessId("");
      setView("process");
    } else if (view === "area") {
      drillInto(name);
    }
  };
  const listTitle =
    view === "agency"
      ? "Agencies"
      : view === "process"
        ? agency
          ? `${agency} · processes`
          : "All processes"
        : drill.barangay
          ? "Barangay"
          : drill.city
            ? `${drill.city} · barangays`
            : drill.region
              ? `${shortRegionName(drill.region)} · cities`
              : "Regions";
  const hint =
    view === "process"
      ? "Processes ranked by turnaround time"
      : view === "agency"
        ? drill.barangay
          ? `Fastest agencies in ${drill.barangay}`
          : drill.city
            ? `Fastest agencies in ${drill.city}`
            : drill.region
              ? `Fastest agencies in ${shortRegionName(drill.region)}`
              : "Agencies with the shortest turnaround time lead the board"
        : drill.barangay
          ? `Viewing ${drill.barangay}`
          : drill.city
            ? "Pick a barangay to see its median"
            : drill.region
              ? "Pick a city to see its median"
              : "Pick a region to drill down";
  return (
    <section className="drill-section" id="requests-by-region">
      <div className="container">
        <div className="drill-section-head">
          <h2>Track government agency performance</h2>
          <p>{hint}</p>
        </div>
        <div className="drill-panel">
          <div className="visualization-tabs">
            <div className="leaderboard-tabs">
              <button
                className={view === "agency" ? "active" : ""}
                onClick={() => setView("agency")}
              >
                By agency
              </button>
              <button
                className={view === "area" ? "active" : ""}
                onClick={() => setView("area")}
              >
                By area
              </button>
              <button
                className={view === "process" ? "active" : ""}
                onClick={() => setView("process")}
              >
                By process
              </button>
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
          </div>
          <div className="drill-panel-tools">
            {view !== "agency" && (
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
                    <option value="">All agency processes</option>
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
            )}
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
          <div className="median-card">
            <small>Median processing time</small>
            <strong>{median.toFixed(1)} days</strong>
            <p>
              {drillLevelLabel(drill)} ·{" "}
              {window === "all" ? "all time" : "last 30 days"}
            </p>
          </div>
          <div className="drill-list leaderboard">
            <div className="drill-list-head">
              <h4>{listTitle}</h4>
              {view === "area" && drill.region && (
                <button className="drill-back" onClick={drillBack}>
                  <ArrowLeft size={12} />
                  Back
                </button>
              )}
            </div>
            <div className="lead-table-wrap">
              <table className="lead-table">
                <thead>
                  <tr>
                    <th className="lead-th-rank">#</th>
                    <th>Name</th>
                    <th>
                      <button
                        className={`lead-sort${sortKey === "median" ? " active" : ""}`}
                        onClick={() => toggleSort("median")}
                      >
                        Speed
                        <SortArrow dir={sortKey === "median" ? sortDir : 0} />
                      </button>
                    </th>
                    <th>
                      <button
                        className={`lead-sort${sortKey === "onTime" ? " active" : ""}`}
                        onClick={() => toggleSort("onTime")}
                      >
                        On time
                        <SortArrow dir={sortKey === "onTime" ? sortDir : 0} />
                      </button>
                    </th>
                    {view !== "process" && <th aria-hidden="true" />}
                  </tr>
                </thead>
                <tbody>
                  {sortedRows.map((row, index) => (
                    <tr
                      key={row.id}
                      className={`lead-row${view === "process" ? " lead-row-disabled" : ""}`}
                      onClick={() => onRowClick(row.name)}
                      aria-disabled={view === "process"}
                    >
                      <td className="lead-td-rank">
                        <span className={`lead-rank rank-${index + 1}`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="lead-td-name">
                        <span className="lead-name">
                          {row.name}
                          {row.sub && (
                            <small className="lead-sub">{row.sub}</small>
                          )}
                        </span>
                      </td>
                      <td className="lead-td-median">
                        <span className="drill-median">
                          {row.median.toFixed(1)}d
                        </span>
                      </td>
                      <td className="lead-td-ontime">
                        <span
                          className={`lead-ontime${row.onTime < 70 ? " low" : ""}`}
                        >
                          {row.onTime}%
                        </span>
                      </td>
                      {view !== "process" && (
                        <td className="lead-td-button">
                          <ChevronRight className="drill-row-button" />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
        </div>
      </div>
    </section>
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

function SortArrow({ dir }: { dir: 1 | -1 | 0 }) {
  return (
    <span className="lead-sort-arrow" aria-hidden="true">
      {dir === 0 ? "↕" : dir === 1 ? "↑" : "↓"}
    </span>
  );
}

import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  FileStack,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Layout, PageIntro } from "../components";
import { geographies, processCatalog, statisticsFor } from "../data";
import type { Geography } from "../types";

const number = new Intl.NumberFormat("en-PH");
export default function PublicDashboard() {
  const [geo, setGeo] = useState<Geography>("Philippines");
  const [agency, setAgency] = useState("");
  const [processId, setProcessId] = useState("");
  const agencies = [...new Set(processCatalog.map((p) => p.agencyName))];
  const filteredCatalog = processCatalog.filter((p) =>
    (!agency || p.agencyName === agency) && (!processId || p.id === processId)
  );
  const stats = statisticsFor(geo, filteredCatalog.map((p) => p.id));
  const totals = stats.reduce((sum, row) => ({
    total: sum.total + row.total,
    completed: sum.completed + row.completed,
    newRequests: sum.newRequests + row.newRequests,
    overdue: sum.overdue + row.overdue,
    weightedDays: sum.weightedDays + row.avgDays * row.total,
    weightedOnTime: sum.weightedOnTime + row.onTime * row.completed,
  }), {
    total: 0,
    completed: 0,
    newRequests: 0,
    overdue: 0,
    weightedDays: 0,
    weightedOnTime: 0,
  });
  const monthly = ["Mar", "Apr", "May", "Jun", "Jul", "Aug"].map((
    month,
    i,
  ) => ({
    month,
    new: stats.reduce((n, row) => n + row.monthly[i].new, 0),
    completed: stats.reduce((n, row) => n + row.monthly[i].completed, 0),
  }));
  const top = [...stats].sort((a, b) => b.total - a.total).slice(0, 10).map((
    row,
  ) => ({
    name: row.process.name.length > 28
      ? `${row.process.name.slice(0, 27)}…`
      : row.process.name,
    Requests: row.total,
  }));
  return (
    <Layout>
      <main className="dashboard-page">
        <PageIntro
          eyebrow="Public service data"
          title="How government services are performing"
          text="Explore fictional demonstration data across 50 business-facing processes and four geographic levels."
        >
          <div className="demo-pill">
            <BarChart3 /> Demonstration data · Not official statistics
          </div>
        </PageIntro>
        <section className="dashboard-content">
          <div className="container">
            <div className="geo-nav">
              <span>
                <MapPin /> Geographic view
              </span>
              {geographies.map((item, index) => (
                <button
                  className={geo === item ? "active" : ""}
                  onClick={() => setGeo(item)}
                  key={item}
                >
                  <small>
                    {index === 0
                      ? "National"
                      : index === 1
                      ? "Regional"
                      : index === 2
                      ? "City"
                      : "Barangay"}
                  </small>
                  {item}
                </button>
              ))}
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
                  {agencies.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label>
                <span>Process</span>
                <select
                  value={processId}
                  onChange={(e) => setProcessId(e.target.value)}
                >
                  <option value="">All 50 processes</option>
                  {processCatalog.filter((p) =>
                    !agency || p.agencyName === agency
                  ).map((item) => (
                    <option value={item.id} key={item.id}>{item.name}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="metric-grid">
              <Metric
                icon={<FileStack />}
                label="Total requests"
                value={number.format(totals.total)}
              />
              <Metric
                icon={<Clock3 />}
                label="New requests"
                value={number.format(totals.newRequests)}
                tone="blue"
              />
              <Metric
                icon={<CheckCircle2 />}
                label="Completed"
                value={number.format(totals.completed)}
                tone="green"
              />
              <Metric
                icon={<TrendingUp />}
                label="Avg. processing"
                value={`${
                  totals.total
                    ? (totals.weightedDays / totals.total).toFixed(1)
                    : 0
                } days`}
                tone="violet"
              />
              <Metric
                icon={<CheckCircle2 />}
                label="Completed on time"
                value={`${
                  totals.completed
                    ? Math.round(totals.weightedOnTime / totals.completed)
                    : 0
                }%`}
                tone="green"
              />
              <Metric
                icon={<AlertTriangle />}
                label="Overdue"
                value={number.format(totals.overdue)}
                tone="orange"
              />
            </div>
            <div className="chart-grid">
              <ChartCard
                title="Requests over time"
                subtitle="Monthly new and completed requests"
                wide
              >
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={monthly}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                    <Tooltip formatter={(v) => number.format(Number(v))} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="new"
                      name="New"
                  stroke="#D61F3A"
                      strokeWidth={3}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      name="Completed"
                  stroke="#1749C6"
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
              <ChartCard
                title="New vs. completed"
                subtitle={`Current totals for ${geo}`}
              >
                <div className="completion-visual">
                  <div
                    className="big-donut"
                    style={{
                      "--percent": `${
                        totals.total ? totals.completed / totals.total * 360 : 0
                      }deg`,
                    } as React.CSSProperties}
                  >
                    <span>
                      {totals.total
                        ? Math.round(totals.completed / totals.total * 100)
                        : 0}%<small>completed</small>
                    </span>
                  </div>
                  <div>
                    <p>
                      <i className="green" /> Completed{" "}
                      <b>{number.format(totals.completed)}</b>
                    </p>
                    <p>
                      <i className="blue" /> New{" "}
                      <b>{number.format(totals.newRequests)}</b>
                    </p>
                  </div>
                </div>
              </ChartCard>
              <ChartCard
                title="Top 10 processes"
                subtitle="Ranked by request volume"
                full
              >
                <ResponsiveContainer width="100%" height={390}>
                  <BarChart data={top} layout="vertical" margin={{ left: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                      type="number"
                      tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={180}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip formatter={(v) => number.format(Number(v))} />
                    <Bar
                      dataKey="Requests"
                  fill="#1749C6"
                      radius={[0, 5, 5, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
            <p className="dashboard-footnote">
              All figures are generated for demonstration and presentation
              purposes. They do not represent real government performance.
            </p>
          </div>
        </section>
      </main>
    </Layout>
  );
}
function Metric(
  { icon, label, value, tone = "" }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    tone?: string;
  },
) {
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
function ChartCard(
  { title, subtitle, children, wide, full }: {
    title: string;
    subtitle: string;
    children: React.ReactNode;
    wide?: boolean;
    full?: boolean;
  },
) {
  return (
    <div className={`chart-card ${wide ? "wide" : ""} ${full ? "full" : ""}`}>
      <h3>{title}</h3>
      <p>{subtitle}</p>
      {children}
    </div>
  );
}

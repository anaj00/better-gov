import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock3,
  Target,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Layout } from "../components";

const stats = [
  {
    icon: Building2,
    value: "12,842",
    label: "Total Requests",
    change: "12.6%",
    note: "vs last 30 days",
    tone: "blue",
    down: false,
  },
  {
    icon: CheckCircle2,
    value: "9,532",
    label: "Completed",
    change: "15.3%",
    note: "vs last 30 days",
    tone: "blue",
    down: false,
  },
  {
    icon: Clock3,
    value: "6.4 days",
    label: "Avg. Processing Time",
    change: "8.7%",
    note: "vs last 30 days",
    tone: "red",
    down: true,
  },
  {
    icon: Target,
    value: "92.1%",
    label: "On-Time Rate",
    change: "4.2%",
    note: "vs last 30 days",
    tone: "red",
    down: false,
  },
];

function AnimatedValue(
  { value, down = false }: { value: string; down?: boolean },
) {
  const [display, setDisplay] = useState("0");
  const [changing, setChanging] = useState(false);
  const [previousDigit, setPreviousDigit] = useState("0");
  useEffect(() => {
    const match = value.match(/^([\d,.]+)(.*)$/);
    if (
      !match || window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const reducedFrame = requestAnimationFrame(() => setDisplay(value));
      return () => cancelAnimationFrame(reducedFrame);
    }
    const target = Number(match[1].replaceAll(",", ""));
    const decimals = match[1].includes(".") ? match[1].split(".")[1].length : 0;
    const suffix = match[2];
    const initial = target * (down ? 1.12 : .86);
    const start = performance.now();
    let frame = 0;
    let interval = 0;
    let highlightTimer = 0;
    const format = (number: number) =>
      `${
        number.toLocaleString("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      }${suffix}`;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / 1100, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(format(initial + (target - initial) * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        let current = target;
        let currentText = format(target);
        const step = target >= 1000
          ? Math.max(1, Math.round(target * .0002))
          : .1;
        interval = window.setInterval(() => {
          const oldDigit = [...currentText].reverse().find((character) =>
            /\d/.test(character)
          ) || "0";
          current += down ? -step : step;
          if (suffix.includes("%")) {
            current = Math.min(current, 99.9);
          }
          if (down) {
            current = Math.max(current, .1);
          }
          currentText = format(current);
          setPreviousDigit(oldDigit);
          setDisplay(currentText);
          setChanging(true);
          clearTimeout(highlightTimer);
          highlightTimer = window.setTimeout(() =>
            setChanging(false), 650);
        }, 2500);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      clearInterval(interval);
      clearTimeout(highlightTimer);
    };
  }, [value, down]);
  let finalDigitIndex = -1;
  [...display].forEach((character, index) => {
    if (/\d/.test(character)) finalDigitIndex = index;
  });
  return (
    <span className="stat-number" aria-live="polite">
      {[...display].map((character, index) =>
        changing && index === finalDigitIndex
          ? (
            <span className="odometer-window" key={`${display}-${index}`}>
              <span className="odometer-track">
                <span>{previousDigit}</span>
                <span>{character}</span>
              </span>
            </span>
          )
          : <span key={`${index}-${character}`}>{character}</span>
      )}
    </span>
  );
}

export default function Home() {
  return (
    <Layout>
      <main className="brand-home">
        <section className="brand-hero">
          <div className="container brand-hero-grid">
            <div className="brand-hero-copy">
              <h1>
                Government<br />processes,<br />made <em>easier.</em>
              </h1>
              <p>
                Track government processes and stay informed
                in<br className="desktop-break" /> just a few simple steps.
              </p>
              <div className="brand-hero-actions">
                <Link
                  className="brand-button brand-button-primary"
                  to="/status"
                >
                  Track a Service <ArrowRight />
                </Link>
                <Link
                  className="brand-button brand-button-secondary"
                  to="/dashboard"
                >
                  View National Stats <BarChart3 />
                </Link>
              </div>
            </div>
            <div className="civic-visual" aria-hidden="true" />
          </div>
        </section>
        <section
          className="stats-wrap container"
          aria-label="National process statistics"
        >
          <div className="brand-stats">
            {stats.map((
              { icon: Icon, value, label, change, note, tone, down },
            ) => (
              <article className={`brand-stat ${tone}`} key={label}>
                <div className="stat-main">
                  <span className="stat-icon">
                    <Icon />
                  </span>
                  <div>
                    <strong>
                      <AnimatedValue value={value} down={down} />
                    </strong>
                    <p>{label}</p>
                  </div>
                </div>
                <div className="stat-change">
                  {down ? <ArrowDown /> : <ArrowUp />}
                  <b>{change}</b>
                  <small>{note}</small>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}

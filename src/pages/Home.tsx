import { ArrowDown, ArrowRight, BarChart3, Building2, Check, CheckCircle2, Clock3, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Layout } from '../components'
import civicHero from '../assets/easeph-civic-hero.png'

const stats = [
  { icon: Building2, value: '12,842', label: 'Total Requests', change: '12.6%', note: 'vs last 30 days', tone: 'blue', down: false },
  { icon: CheckCircle2, value: '9,532', label: 'Completed', change: '15.3%', note: 'vs last 30 days', tone: 'blue', down: false },
  { icon: Clock3, value: '6.4 days', label: 'Avg. Processing Time', change: '8.7%', note: 'vs last 30 days', tone: 'red', down: true },
  { icon: Target, value: '92.1%', label: 'On-Time Rate', change: '4.2%', note: 'vs last 30 days', tone: 'red', down: false },
]

export default function Home() {
  return <Layout home><main className="brand-home">
    <section className="brand-hero">
      <div className="container brand-hero-grid">
        <div className="brand-hero-copy">
          <h1>Government<br />processes,<br />made <em>easier.</em></h1>
          <p>Request, track, and complete processes in<br className="desktop-break" /> just a few simple steps.</p>
          <div className="brand-hero-actions">
            <Link className="brand-button brand-button-primary" to="/request">Request a Process <ArrowRight /></Link>
            <Link className="brand-button brand-button-secondary" to="/dashboard">View National Stats <BarChart3 /></Link>
          </div>
        </div>
        <div className="civic-visual">
          <div className="civic-glow" />
          <img src={civicHero} alt="A Philippine government building with the national flag and a city skyline" />
          <div className="status-preview">
            <div className="status-preview-head"><span><Check /></span><div><strong>Request Submitted</strong><small>Your request is now being processed.</small></div></div>
            <div className="status-progress"><span className="complete"><Check /></span><i /><span><Check /></span><i /><span><Check /></span></div>
            <div className="status-labels"><b>Submitted</b><b>In Review</b><b>Completed</b></div>
          </div>
        </div>
      </div>
    </section>
    <section className="stats-wrap container" aria-label="National process statistics">
      <div className="brand-stats">{stats.map(({ icon: Icon, value, label, change, note, tone, down }) =>
        <article className={`brand-stat ${tone}`} key={label}>
          <div className="stat-main"><span className="stat-icon"><Icon /></span><div><strong>{value}</strong><p>{label}</p></div></div>
          <div className="stat-change">{down ? <ArrowDown /> : <span className="up-arrow">↑</span>}<b>{change}</b><small>{note}</small></div>
        </article>)}
      </div>
    </section>
  </main></Layout>
}

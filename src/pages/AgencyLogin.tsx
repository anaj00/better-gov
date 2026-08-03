import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Layout } from '../components'
import { isAuthenticated, setAuthenticated } from '../store'

export default function AgencyLogin() {
  const navigate = useNavigate(); const [email, setEmail] = useState('demo@easeph.org'); const [password, setPassword] = useState('demo123'); const [show, setShow] = useState(false); const [error, setError] = useState('')
  if (isAuthenticated()) return <Navigate to="/agency/requests" replace />
  const submit = (e: FormEvent) => { e.preventDefault(); if (email === 'demo@easeph.org' && password === 'demo123') { setAuthenticated(true); navigate('/agency/requests') } else setError('Incorrect email or password. Use the demo credentials shown below.') }
  return <Layout><main className="login-page"><div className="login-side"><div><span className="eyebrow light">Agency workspace</span><h1>Manage requests with clarity.</h1><p>Review submitted business requests, record approvals, and keep the public informed.</p><ul><li><ShieldCheck /> One secure demonstration account</li><li><LockKeyhole /> Browser-only data, no real credentials</li></ul></div></div><div className="login-form-wrap"><form className="login-card" onSubmit={submit}><span className="login-icon"><ShieldCheck /></span><h2>Agency sign in</h2><p>Access the EasePH demonstration workspace.</p><label className="field"><span>Email address</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label><label className="field"><span>Password</span><div className="password-field"><input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} /><button type="button" onClick={() => setShow(!show)} aria-label="Show password">{show ? <EyeOff /> : <Eye />}</button></div></label>{error && <p className="form-error">{error}</p>}<button className="button button-primary login-button">Sign in <ArrowRight /></button><div className="demo-credentials"><span>DEMO CREDENTIALS</span><p><b>Email</b> demo@easeph.org</p><p><b>Password</b> demo123</p></div></form></div></main></Layout>
}

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROLES } from '../constants/roles'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const [form, setForm]     = useState({ name: '', email: '', password: '', role: 'user' })
  const [loading, setLoading] = useState(false)
  const [err, setErr]       = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) { setErr('Password must be at least 6 characters.'); return }
    setErr('')
    setLoading(true)
    try {
      const data = await register(form)
      toast.success(`Account created! Welcome, ${data.user.name}!`)
      navigate('/dashboard')
    } catch (error) {
      setErr(error.response?.data?.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-panel-left">
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '5rem', marginBottom: 24, filter: 'drop-shadow(0 0 40px rgba(232,255,71,0.3))' }}>🗂</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', marginBottom: 12 }}>
            Join <span style={{ color: 'var(--accent)' }}>SurveyVault</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 300, lineHeight: 1.7 }}>
            Start managing your survey records today. Free to get started.
          </p>
        </div>
      </div>

      <div className="auth-panel-right">
        <div className="auth-form-box fade-up">
          <div className="auth-logo">Survey<span>Vault</span></div>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-sub">Fill in the details to get started</p>

          {err && (
            <div style={{
              background: 'var(--red-dim)', border: '1px solid rgba(255,92,92,0.2)',
              borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: 16,
              color: 'var(--red)', fontSize: '0.875rem'
            }}>{err}</div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field">
              <label>Full name</label>
              <input className="field-input" value={form.name} onChange={set('name')} placeholder="John Doe" required autoFocus />
            </div>
            <div className="field">
              <label>Email address</label>
              <input type="email" className="field-input" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" className="field-input" value={form.password} onChange={set('password')} placeholder="Min. 6 characters" required />
            </div>
            <div className="field">
              <label>Account type</label>
              <select className="field-input" value={form.role} onChange={set('role')}>
                {ROLES.map((role) => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 24px', marginTop: 4 }} disabled={loading}>
              {loading ? <><span className="spinner" /> Creating account…</> : 'Create Account'}
            </button>
          </form>

          <div className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [err, setErr]       = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      const data = await login(form)
      toast.success(`Welcome back, ${data.user.name}!`)
      navigate('/dashboard')
    } catch (error) {
      setErr(error.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-panel-left">
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            fontSize: '5rem', marginBottom: 24,
            filter: 'drop-shadow(0 0 40px rgba(232,255,71,0.3))'
          }}>📋</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', marginBottom: 12 }}>
            Survey<span style={{ color: 'var(--accent)' }}>Vault</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 300, lineHeight: 1.7 }}>
            Manage, track, and analyze your field surveys with precision and clarity.
          </p>
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['Role-based access control', 'Real-time status tracking', 'Admin export to CSV & Excel'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>✓</span> {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-panel-right">
        <div className="auth-form-box fade-up">
          <div className="auth-logo">Survey<span>Vault</span></div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-sub">Sign in to your account to continue</p>

          {err && (
            <div style={{
              background: 'var(--red-dim)', border: '1px solid rgba(255,92,92,0.2)',
              borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: 16,
              color: 'var(--red)', fontSize: '0.875rem'
            }}>{err}</div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field">
              <label>Email address</label>
              <input type="email" className="field-input" value={form.email} onChange={set('email')} placeholder="you@example.com" required autoFocus />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" className="field-input" value={form.password} onChange={set('password')} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 24px', marginTop: 4 }} disabled={loading}>
              {loading ? <><span className="spinner" /> Signing in…</> : 'Sign In'}
            </button>
          </form>

          <div className="auth-switch">
            Don't have an account? <Link to="/register">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

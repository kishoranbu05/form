import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const NAV_USER = [
  { to: '/dashboard', icon: 'D', label: 'Dashboard' },
  { to: '/surveys', icon: 'S', label: 'My Surveys' },
]
const NAV_ADMIN = [
  { to: '/admin', icon: 'A', label: 'Admin Overview' },
  { to: '/admin/surveys', icon: 'R', label: 'All Surveys' },
]

export default function Sidebar() {
  const { user, isAdmin, logout, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Signed out successfully')
    navigate('/login')
  }

  const openProfile = () => {
    setName(user?.name || '')
    setProfileOpen(true)
  }

  const closeProfile = () => {
    if (saving) return
    setProfileOpen(false)
  }

  const handleProfileSave = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error('Name is required')
      return
    }

    setSaving(true)
    try {
      await updateProfile({ name: trimmed })
      toast.success('Profile updated')
      setProfileOpen(false)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Profile update failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">SV</div>
        Survey<span>Vault</span>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Menu</div>
        <nav className="sidebar-nav">
          {NAV_USER.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      {isAdmin && (
        <div className="sidebar-section">
          <div className="sidebar-section-label">Admin</div>
          <nav className="sidebar-nav">
            {NAV_ADMIN.map(({ to, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{icon}</span>
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      <div className="sidebar-bottom">
        <div style={{ padding: '10px 10px 12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <div style={{ color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 2 }}>{user?.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{
              display: 'inline-block',
              padding: '1px 7px',
              background: 'var(--accent-dim)',
              color: 'var(--accent)',
              borderRadius: 99,
              fontSize: '0.68rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em'
            }}>
              {user?.role}
            </span>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 10, width: '100%' }} onClick={openProfile}>
            Edit Profile
          </button>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <span className="nav-icon">X</span>
          Sign Out
        </button>
      </div>

      {profileOpen && (
        <div className="modal-overlay" onClick={closeProfile}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Profile</h3>
              <button className="modal-close" onClick={closeProfile}>x</button>
            </div>
            <div className="field">
              <label>Name</label>
              <input
                className="field-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                maxLength={100}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
              <button className="btn btn-ghost" onClick={closeProfile} disabled={saving}>Cancel</button>
              <button className="btn btn-primary" onClick={handleProfileSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

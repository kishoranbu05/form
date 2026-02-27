import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { surveyApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { StatusBadge } from '../components/UI'
import { format } from 'date-fns'

export default function DashboardPage() {
  const { user } = useAuth()
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 })

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await surveyApi.getAll({ limit: 100 })
        const all = data.data
        setSurveys(all.slice(0, 5))
        setStats({
          total: all.length,
          pending: all.filter((s) => s.status === 'Pending').length,
          approved: all.filter((s) => s.status === 'Approved').length,
          rejected: all.filter((s) => s.status === 'Rejected').length,
        })
      } catch {
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div>
      <div className="page-header fade-up">
        <div className="page-header-left">
          <h1>Good {getGreeting()}, {user?.name?.split(' ')[0]}</h1>
          <p>Here is an overview of your HSE activity</p>
        </div>
        <Link to="/surveys" className="btn btn-primary">+ New Record</Link>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total Records', value: stats.total, color: 'accent', icon: 'T' },
          { label: 'Pending', value: stats.pending, color: 'orange', icon: 'P' },
          { label: 'Approved', value: stats.approved, color: 'green', icon: 'A' },
          { label: 'Rejected', value: stats.rejected, color: 'red', icon: 'R' },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className={`stat-card ${color} fade-up`}>
            <div className="stat-icon">{icon}</div>
            <div>
              <div className="stat-label">{label}</div>
              <div className="stat-value">{loading ? '-' : value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card fade-up">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: '1rem' }}>Recent Records</h2>
          <Link to="/surveys" style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600 }}>View all</Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 44 }} />)}
          </div>
        ) : surveys.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">Records</div>
            <h3>No records yet</h3>
            <p>Create your first HSE record to get started</p>
            <Link to="/surveys" className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>+ Create Record</Link>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Form Type</th>
                <th>Title</th>
                <th>Location</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {surveys.map((s) => (
                <tr key={s._id}>
                  <td>{s.formType || '-'}</td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{s.title}</td>
                  <td>{s.location || '-'}</td>
                  <td>{s.surveyDate ? format(new Date(s.surveyDate), 'MMM d, yyyy') : '-'}</td>
                  <td><StatusBadge status={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

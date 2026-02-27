import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../services/api'
import { StatusBadge } from '../components/UI'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'

const STATUS_COLORS = {
  Pending: '#ff9c3d',
  Approved: '#3ddc84',
  Rejected: '#ff5c5c',
}

export default function AdminPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoad] = useState(true)
  const [updatingStatusId, setUpdatingStatusId] = useState('')

  const loadStats = useCallback(() => {
    setLoad(true)
    adminApi.getStats()
      .then(({ data }) => setStats(data.data))
      .catch(() => {
        toast.error('Failed to load admin stats')
      })
      .finally(() => setLoad(false))
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const handleQuickStatus = async (id, status) => {
    setUpdatingStatusId(id)
    try {
      if (status === 'Approved') {
        await adminApi.approve(id)
      } else {
        await adminApi.reject(id)
      }
      toast.success(`Marked as ${status}`)
      loadStats()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Status update failed')
    } finally {
      setUpdatingStatusId('')
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 140 }} />)}
      </div>
    )
  }

  const pieData = stats ? [
    { name: 'Pending', value: stats.statusBreakdown.Pending },
    { name: 'Approved', value: stats.statusBreakdown.Approved },
    { name: 'Rejected', value: stats.statusBreakdown.Rejected },
  ] : []

  const barData = [
    { name: 'Pending', count: stats?.statusBreakdown.Pending || 0 },
    { name: 'Approved', count: stats?.statusBreakdown.Approved || 0 },
    { name: 'Rejected', count: stats?.statusBreakdown.Rejected || 0 },
  ]

  return (
    <div>
      <div className="page-header fade-up">
        <div className="page-header-left">
          <h1>Admin Overview</h1>
          <p>Platform-wide HSE statistics and recent activity</p>
        </div>
        <Link to="/admin/surveys" className="btn btn-primary">Manage Records</Link>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total Records', value: stats?.totalSurveys ?? '-', color: 'accent', icon: 'T' },
          { label: 'Total Users', value: stats?.totalUsers ?? '-', color: 'blue', icon: 'U' },
          { label: 'Approved', value: stats?.statusBreakdown.Approved ?? '-', color: 'green', icon: 'A' },
          { label: 'Pending', value: stats?.statusBreakdown.Pending ?? '-', color: 'orange', icon: 'P' },
          { label: 'Rejected', value: stats?.statusBreakdown.Rejected ?? '-', color: 'red', icon: 'R' },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className={`stat-card ${color} fade-up`}>
            <div className="stat-icon">{icon}</div>
            <div>
              <div className="stat-label">{label}</div>
              <div className="stat-value">{value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="card fade-up">
          <h2 style={{ fontSize: '1rem', marginBottom: 16 }}>Status Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={4} strokeWidth={0}>
                {pieData.map(({ name }) => <Cell key={name} fill={STATUS_COLORS[name]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.85rem' }} itemStyle={{ color: 'var(--text-primary)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card fade-up">
          <h2 style={{ fontSize: '1rem', marginBottom: 16 }}>Records by Status</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'var(--bg-hover)' }} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.85rem' }} itemStyle={{ color: 'var(--text-primary)' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {barData.map(({ name }) => <Cell key={name} fill={STATUS_COLORS[name]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card fade-up">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: '1rem' }}>Recent Records</h2>
          <Link to="/admin/surveys" style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600 }}>View all</Link>
        </div>
        {!stats?.recentSurveys?.length ? (
          <div className="empty-state"><div className="empty-state-icon">Records</div><h3>No records yet</h3></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Form Type</th><th>Title</th><th>Created By</th><th>Status</th><th>Created</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {stats.recentSurveys.map((s) => (
                <tr key={s._id}>
                  <td>{s.formType || '-'}</td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{s.title}</td>
                  <td>{s.createdBy?.name || '-'}<div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.createdBy?.email}</div></td>
                  <td><StatusBadge status={s.status} /></td>
                  <td>{format(new Date(s.createdAt), 'MMM d, yyyy')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {s.status !== 'Approved' && (
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{ background: 'var(--green-dim)', color: 'var(--green)', fontSize: '0.72rem' }}
                          onClick={() => handleQuickStatus(s._id, 'Approved')}
                          disabled={updatingStatusId === s._id}
                        >
                          Approve
                        </button>
                      )}
                      {s.status !== 'Rejected' && (
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{ background: 'var(--red-dim)', color: 'var(--red)', fontSize: '0.72rem' }}
                          onClick={() => handleQuickStatus(s._id, 'Rejected')}
                          disabled={updatingStatusId === s._id}
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

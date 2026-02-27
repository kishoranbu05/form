import { useState, useEffect, useCallback } from 'react'
import { surveyApi, adminApi } from '../services/api'
import { StatusBadge, Pagination } from '../components/UI'
import SurveyModal from '../components/SurveyModal'
import ConfirmModal from '../components/ConfirmModal'
import { FORM_TYPES } from '../constants/hseForms'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function SurveysPage() {
  const { isAdmin } = useAuth()
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotal] = useState(1)
  const [statusFilter, setStatus] = useState('')
  const [formTypeFilter, setFormTypeFilter] = useState('')

  const [modal, setModal] = useState({ open: false, record: null })
  const [delModal, setDelModal] = useState({ open: false, id: null })
  const [deleting, setDeleting] = useState(false)
  const [updatingStatusId, setUpdatingStatusId] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (statusFilter) params.status = statusFilter
      if (formTypeFilter) params.formType = formTypeFilter
      const { data } = await surveyApi.getAll(params)
      setSurveys(data.data)
      setTotal(data.totalPages)
    } catch {
      toast.error('Failed to load records')
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, formTypeFilter])

  useEffect(() => {
    load()
  }, [load])

  const handleSave = async (form) => {
    try {
      if (modal.record) {
        await surveyApi.update(modal.record._id, form)
        toast.success('Record updated')
      } else {
        await surveyApi.create(form)
        toast.success('Record created')
      }
      load()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed')
      throw e
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await surveyApi.delete(delModal.id)
      toast.success('Record deleted')
      setDelModal({ open: false, id: null })
      load()
    } catch {
      toast.error('Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  const clearFilters = () => {
    setStatus('')
    setFormTypeFilter('')
    setPage(1)
  }

  const handleQuickStatus = async (id, status) => {
    if (!isAdmin) {
      toast.error('Only admin can approve or reject records')
      return
    }

    setUpdatingStatusId(id)
    try {
      if (status === 'Approved') {
        await adminApi.approve(id)
      } else {
        await adminApi.reject(id)
      }
      toast.success(`Marked as ${status}`)
      load()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Status update failed')
    } finally {
      setUpdatingStatusId('')
    }
  }

  return (
    <div>
      <div className="page-header fade-up">
        <div className="page-header-left">
          <h1>My HSE Records</h1>
          <p>Create and manage your safety records</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ open: true, record: null })}>
          + New Record
        </button>
      </div>

      <div className="filters-bar fade-up">
        <div className="field">
          <label>Form type</label>
          <select className="field-input" value={formTypeFilter} onChange={(e) => { setFormTypeFilter(e.target.value); setPage(1) }}>
            <option value="">All</option>
            {FORM_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>

        <div className="field">
          <label>Status</label>
          <select className="field-input" value={statusFilter} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {(statusFilter || formTypeFilter) && (
          <button className="btn btn-ghost btn-sm" onClick={clearFilters} style={{ alignSelf: 'flex-end' }}>
            Clear
          </button>
        )}
      </div>

      <div className="card fade-up">
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton" style={{ height: 50 }} />)}
          </div>
        ) : surveys.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">Records</div>
            <h3>No records found</h3>
            <p>{(statusFilter || formTypeFilter) ? 'No records match the selected filters.' : 'Create your first HSE record.'}</p>
            {!statusFilter && !formTypeFilter && (
              <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={() => setModal({ open: true, record: null })}>
                + Create Record
              </button>
            )}
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Form Type</th>
                  <th>Title</th>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {surveys.map((s) => (
                  <tr key={s._id}>
                    <td>{s.formType || '-'}</td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500, maxWidth: 240 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</div>
                    </td>
                    <td>{s.location || '-'}</td>
                    <td>{s.surveyDate ? format(new Date(s.surveyDate), 'MMM d, yyyy') : '-'}</td>
                    <td><StatusBadge status={s.status} /></td>
                    <td>{format(new Date(s.createdAt), 'MMM d, yyyy')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        {isAdmin && s.status !== 'Approved' && (
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
                        {isAdmin && s.status !== 'Rejected' && (
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
                        <button className="btn btn-ghost btn-sm" onClick={() => setModal({ open: true, record: s })}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDelModal({ open: true, id: s._id })}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </div>

      <SurveyModal
        open={modal.open}
        onClose={() => setModal({ open: false, record: null })}
        onSave={handleSave}
        initial={modal.record}
      />
      <ConfirmModal
        open={delModal.open}
        onClose={() => setDelModal({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={deleting}
        message="Are you sure you want to delete this HSE record? This cannot be undone."
      />
    </div>
  )
}

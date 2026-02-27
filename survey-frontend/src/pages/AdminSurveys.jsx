import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '../services/api'
import { StatusBadge, Pagination } from '../components/UI'
import SurveyModal from '../components/SurveyModal'
import ConfirmModal from '../components/ConfirmModal'
import { FORM_TYPES } from '../constants/hseForms'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function AdminSurveys() {
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotal] = useState(1)
  const [totalRec, setTotalRec] = useState(0)

  const [filters, setFilters] = useState({ status: '', formType: '', userId: '', startDate: '', endDate: '' })
  const [modal, setModal] = useState({ open: false, record: null })
  const [delModal, setDel] = useState({ open: false, id: null })
  const [deleting, setDeleting] = useState(false)
  const [exporting, setExporting] = useState('')
  const [updatingStatusId, setUpdatingStatusId] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) }
      const { data } = await adminApi.getAll(params)
      setSurveys(data.data)
      setTotal(data.totalPages)
      setTotalRec(data.totalRecords)
    } catch {
      toast.error('Failed to load records')
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => {
    load()
  }, [load])

  const setFilter = (k) => (e) => {
    setFilters((f) => ({ ...f, [k]: e.target.value }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({ status: '', formType: '', userId: '', startDate: '', endDate: '' })
    setPage(1)
  }

  const handleSave = async (form) => {
    try {
      await adminApi.update(modal.record._id, form)
      toast.success('Record updated')
      load()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed')
      throw e
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await adminApi.delete(delModal.id)
      toast.success('Record deleted')
      setDel({ open: false, id: null })
      load()
    } catch {
      toast.error('Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  const handleQuickStatus = async (id, status) => {
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

  const handleExport = async (type) => {
    setExporting(type)
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
      if (type === 'csv') await adminApi.exportCSV(params)
      if (type === 'excel') await adminApi.exportExcel(params)
      toast.success(`${type.toUpperCase()} downloaded`)
    } catch {
      toast.error('Export failed')
    } finally {
      setExporting('')
    }
  }

  const activeFilters = Object.values(filters).some(Boolean)
  const mediaUrl = (value) => {
    if (!value || typeof value !== 'string') return ''
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:image/') || value.startsWith('/uploads/')) return value
    if (value.startsWith('uploads/')) return `/${value}`
    return ''
  }

  return (
    <div>
      <div className="page-header fade-up">
        <div className="page-header-left">
          <h1>All HSE Records</h1>
          <p>{totalRec} total records{activeFilters ? ' (filtered)' : ''}</p>
        </div>
      </div>

      <div className="export-bar fade-up">
        <span className="export-label">Export</span>
        <button className="btn btn-ghost btn-sm" onClick={() => handleExport('csv')} disabled={!!exporting}>
          {exporting === 'csv' ? 'Exporting...' : 'CSV'}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => handleExport('excel')} disabled={!!exporting}>
          {exporting === 'excel' ? 'Exporting...' : 'Excel'}
        </button>
      </div>

      <div className="filters-bar fade-up">
        <div className="field">
          <label>Form Type</label>
          <select className="field-input" value={filters.formType} onChange={setFilter('formType')}>
            <option value="">All</option>
            {FORM_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Status</label>
          <select className="field-input" value={filters.status} onChange={setFilter('status')}>
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <div className="field">
          <label>User ID</label>
          <input className="field-input" placeholder="User ID" value={filters.userId} onChange={setFilter('userId')} />
        </div>
        <div className="field">
          <label>From Date</label>
          <input type="date" className="field-input" value={filters.startDate} onChange={setFilter('startDate')} />
        </div>
        <div className="field">
          <label>To Date</label>
          <input type="date" className="field-input" value={filters.endDate} onChange={setFilter('endDate')} />
        </div>
        {activeFilters && (
          <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-end' }} onClick={clearFilters}>
            Clear
          </button>
        )}
      </div>

      <div className="card fade-up">
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton" style={{ height: 54 }} />)}
          </div>
        ) : surveys.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">Search</div>
            <h3>No records found</h3>
            <p>{activeFilters ? 'Try adjusting your filters.' : 'No records have been created yet.'}</p>
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
                  <th>Media</th>
                  <th>Created By</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {surveys.map((s) => (
                  <tr key={s._id}>
                    <td>{s.formType || '-'}</td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500, maxWidth: 200 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</div>
                    </td>
                    <td>{s.location || '-'}</td>
                    <td>{s.surveyDate ? format(new Date(s.surveyDate), 'MMM d, yyyy') : '-'}</td>
                    <td><StatusBadge status={s.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {mediaUrl(s.formData?.photo || s.formData?.photoUpload) && (
                          <a className="btn btn-ghost btn-sm" href={mediaUrl(s.formData?.photo || s.formData?.photoUpload)} target="_blank" rel="noreferrer">Photo</a>
                        )}
                        {mediaUrl(s.formData?.signature || s.formData?.inspectorSignature || s.formData?.supervisorSignature) && (
                          <a className="btn btn-ghost btn-sm" href={mediaUrl(s.formData?.signature || s.formData?.inspectorSignature || s.formData?.supervisorSignature)} target="_blank" rel="noreferrer">Signature</a>
                        )}
                        {!mediaUrl(s.formData?.photo || s.formData?.photoUpload) && !mediaUrl(s.formData?.signature || s.formData?.inspectorSignature || s.formData?.supervisorSignature) && '-'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{s.createdBy?.name || '-'}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.createdBy?.email}</div>
                    </td>
                    <td>{format(new Date(s.createdAt), 'MMM d, yyyy')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
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
                        <button className="btn btn-ghost btn-sm" onClick={() => setModal({ open: true, record: s })}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDel({ open: true, id: s._id })}>Del</button>
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
        isAdmin={true}
      />
      <ConfirmModal
        open={delModal.open}
        onClose={() => setDel({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={deleting}
        message="Delete this HSE record permanently?"
      />
    </div>
  )
}

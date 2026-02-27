import { useState, useEffect, useMemo } from 'react'
import { FORM_TYPES, HSE_FORM_SCHEMAS } from '../constants/hseForms'

const EMPTY = { formType: FORM_TYPES[0], formData: {}, status: 'Pending' }

export default function SurveyModal({ open, onClose, onSave, initial = null, isAdmin = false }) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!open) return

    setForm(
      initial
        ? {
            formType: initial.formType || FORM_TYPES[0],
            formData: initial.formData || {},
            status: initial.status || 'Pending',
          }
        : EMPTY
    )
    setErrors({})
  }, [open, initial])

  const fields = useMemo(() => HSE_FORM_SCHEMAS[form.formType] || [], [form.formType])

  if (!open) return null

  const setFormType = (value) => {
    setForm((f) => ({ ...f, formType: value, formData: {} }))
  }

  const setField = (key, type = 'text') => (e) => {
    const raw = e.target.value
    const value = type === 'list'
      ? raw.split(',').map((v) => v.trim()).filter(Boolean)
      : raw

    setForm((f) => ({
      ...f,
      formData: {
        ...f.formData,
        [key]: value,
      },
    }))
  }

  const setStatus = (e) => setForm((f) => ({ ...f, status: e.target.value }))

  const validate = () => {
    const next = {}
    if (!form.formType) next.formType = 'Form type is required'
    return next
  }

  const handleSubmit = async () => {
    const nextErrors = validate()
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const readValue = (key, type) => {
    const value = form.formData?.[key]
    if (type === 'list') return Array.isArray(value) ? value.join(', ') : ''
    return value ?? ''
  }

  const resolveMediaUrl = (value) => {
    if (!value || typeof value !== 'string') return ''
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:image/')) return value
    if (value.startsWith('/uploads/')) return value
    if (value.startsWith('uploads/')) return `/${value}`
    return ''
  }

  const photoUrl = resolveMediaUrl(
    form.formData?.photo || form.formData?.photoUpload
  )
  const signatureUrl = resolveMediaUrl(
    form.formData?.signature || form.formData?.inspectorSignature || form.formData?.supervisorSignature
  )

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 860, maxHeight: '88vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2 className="modal-title">{initial ? 'Edit HSE Record' : 'New HSE Record'}</h2>
          <button className="modal-close" onClick={onClose}>x</button>
        </div>

        <div className="flex-col">
          <div className="grid-2">
            <div className="field">
              <label>Form Type *</label>
              <select
                className={`field-input ${errors.formType ? 'error' : ''}`}
                value={form.formType}
                onChange={(e) => setFormType(e.target.value)}
              >
                {FORM_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
              {errors.formType && <span style={{ color: 'var(--red)', fontSize: '0.78rem' }}>{errors.formType}</span>}
            </div>

            {isAdmin && (
              <div className="field">
                <label>Status</label>
                <select className="field-input" value={form.status} onChange={setStatus}>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            )}
          </div>

          <div className="grid-2">
            {fields.map((field) => (
              <div className="field" key={field.key} style={field.type === 'textarea' ? { gridColumn: '1 / -1' } : {}}>
                <label>{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    className="field-input"
                    rows={3}
                    value={readValue(field.key, field.type)}
                    onChange={setField(field.key, field.type)}
                    style={{ resize: 'vertical' }}
                  />
                ) : field.type === 'select' ? (
                  <select className="field-input" value={readValue(field.key, field.type)} onChange={setField(field.key, field.type)}>
                    <option value="">Select</option>
                    {(field.options || []).map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                ) : (
                  <input
                    type={field.type === 'list' ? 'text' : field.type}
                    className="field-input"
                    value={readValue(field.key, field.type)}
                    onChange={setField(field.key, field.type)}
                  />
                )}
              </div>
            ))}
          </div>

          {(photoUrl || signatureUrl) && (
            <div className="grid-2">
              {photoUrl && (
                <div className="field">
                  <label>Uploaded Photo Preview</label>
                  <a href={photoUrl} target="_blank" rel="noreferrer">
                    <img src={photoUrl} alt="Uploaded photo" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                  </a>
                </div>
              )}
              {signatureUrl && (
                <div className="field">
                  <label>Uploaded Signature Preview</label>
                  <a href={signatureUrl} target="_blank" rel="noreferrer">
                    <img src={signatureUrl} alt="Uploaded signature" style={{ width: '100%', maxHeight: 220, objectFit: 'contain', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-input)' }} />
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="flex-row mt-4" style={{ justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : initial ? 'Save Changes' : 'Create Record'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

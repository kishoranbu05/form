import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuth } from '../context/AuthContext'

const PAGE_TITLES = {
  '/dashboard':     'Dashboard',
  '/surveys':       'My Surveys',
  '/admin':         'Admin Overview',
  '/admin/surveys': 'All Survey Records',
}

export default function AppLayout() {
  const location = useLocation()
  const { user } = useAuth()
  const title = PAGE_TITLES[location.pathname] || 'SurveyVault'

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <header className="topbar">
          <span className="topbar-title">{title}</span>
          <div className="topbar-user">
            <span>{user?.email}</span>
            <div className="topbar-avatar">{user?.name?.[0] ?? '?'}</div>
          </div>
        </header>
        <div className="page-body">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Stories from './pages/Stories'
import Riddles from './pages/Riddles'
import Quiz from './pages/Quiz'
import Account from './pages/Account'
import AdminPanel from './pages/AdminPanel'
import ParentDashboard from './pages/ParentDashboard'
import Progress from './pages/Progress'
import Games from './pages/Games'
import Songs from './pages/Songs'

function ProtectedRoute({ children, roles }) {
    const { user, loading } = useAuth()
    if (loading) return <div className="flex items-center justify-center h-screen bg-kids-bg"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-kids-purple"></div></div>
    if (!user) return <Navigate to="/login" replace />
    if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
    return children
}

function PublicRoute({ children }) {
    const { user, loading } = useAuth()
    if (loading) return null
    if (user) return <Navigate to="/dashboard" replace />
    return children
}

export default function App() {
    const { user } = useAuth()
    return (
        <BrowserRouter>
            {user && <Navbar />}
            <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/stories" element={<ProtectedRoute><Stories /></ProtectedRoute>} />
                <Route path="/riddles" element={<ProtectedRoute><Riddles /></ProtectedRoute>} />
                <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
                <Route path="/games" element={<ProtectedRoute><Games /></ProtectedRoute>} />
                <Route path="/songs" element={<ProtectedRoute><Songs /></ProtectedRoute>} />
                <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
                <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                <Route path="/parent" element={<ProtectedRoute roles={['parent', 'admin']}><ParentDashboard /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminPanel /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

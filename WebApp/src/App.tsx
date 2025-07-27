import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Standards from './pages/Standards'
import StandardView from './pages/StandardView'
import SubjectView from './pages/SubjectView'
import ChapterView from './pages/ChapterView'
import ChapterResourcesView from './pages/ChapterResourcesView'
import Login from './pages/Login'
import AdminDashboard from './pages/admin/Dashboard'
import AdminStandards from './pages/admin/Standards'
import AdminSubjects from './pages/admin/Subjects'
import AdminChapters from './pages/admin/Chapters'
import ChapterResources from './pages/admin/ChapterResources'
import ProtectedRoute from './components/ProtectedRoute'


function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/standards" element={<Standards />} />
            <Route path="/standard/:id" element={<StandardView />} />
            <Route path="/subject/:id" element={<SubjectView />} />
            <Route path="/chapter/:id" element={<ChapterView />} />
            <Route path="/chapter/:id/resources" element={<ChapterResourcesView />} />
            <Route path="/login" element={<Login />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/standards" element={
              <ProtectedRoute>
                <AdminStandards />
              </ProtectedRoute>
            } />
            <Route path="/admin/subjects/:id?" element={
              <ProtectedRoute>
                <AdminSubjects />
              </ProtectedRoute>
            } />
            <Route path="/admin/chapters/:id?" element={
              <ProtectedRoute>
                <AdminChapters />
              </ProtectedRoute>
            } />
            <Route path="/admin/chapter/:chapterId/resources" element={
              <ProtectedRoute>
                <ChapterResources />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    </AuthProvider>
  )
}

export default App

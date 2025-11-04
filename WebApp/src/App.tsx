import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { AnalyticsService } from './services/analytics'
import Navbar from './components/Navbar'
import WhatsAppJoinButton, { fetchActiveLink } from './components/WhatsAppJoinButton'
import Home from './pages/Home'
import Standards from './pages/Standards'
import StandardView from './pages/StandardView'
import SubjectView from './pages/SubjectView'
import ChapterView from './pages/ChapterView'
import ChapterResourcesView from './pages/ChapterResourcesView'
import Login from './pages/Login'
import AboutUs from './pages/AboutUs'
import ContactUs from './pages/ContactUs'
import PrivacyPolicy from './pages/PrivacyPolicy'
import AdminDashboard from './pages/admin/Dashboard'
import AdminStandards from './pages/admin/Standards'
import AdminSubjects from './pages/admin/Subjects'
import AdminChapters from './pages/admin/Chapters'
import ChapterResources from './pages/admin/ChapterResources'
import WhatsAppManagement from './pages/admin/WhatsAppManagement'
import Analytics from './pages/admin/Analytics'
import ProtectedRoute from './components/ProtectedRoute'
// No import needed for app-ads.txt from public folder

function AppContent() {
  // Initialize on app start
  useEffect(() => {
    // Track website open
    AnalyticsService.trackWebsiteOpen();
    
    // Fetch WhatsApp link
    fetchActiveLink();
  }, []);

  return (
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
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
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
          <Route path="/admin/whatsapp" element={
            <ProtectedRoute>
              <WhatsAppManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } />
        </Routes>
      </main>

      {/* Floating WhatsApp Button */}
      <WhatsAppJoinButton variant="floating" />

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
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App

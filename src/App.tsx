import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop'
import HomePage from './pages/HomePage'
import ClassPage from './pages/ClassPage'
import SubjectBrowsePage from './pages/SubjectBrowsePage'
import CategoryPage from './pages/CategoryPage'
import SubjectPage from './pages/SubjectPage'
import ResourcePage from './pages/ResourcePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import SearchPage from './pages/SearchPage'
import LegalPage from './pages/LegalPage'
import AdminFunnel from './pages/AdminFunnel'

// Disable browser scroll restoration
if (typeof window !== 'undefined') {
  window.history.scrollRestoration = 'manual'
}

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="class/:classId" element={<ClassPage />} />
            <Route path="class/:classId/subject/:subject" element={<SubjectBrowsePage />} />
            <Route path="class/:classId/:category" element={<CategoryPage />} />
            <Route path="class/:classId/:category/:subject" element={<SubjectPage />} />
            <Route path="resource/:resourceId" element={<ResourcePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="privacy" element={<LegalPage />} />
            <Route path="terms" element={<LegalPage />} />
            <Route path="refund" element={<LegalPage />} />
            <Route path="content-policy" element={<LegalPage />} />
            <Route path="admin/funnel" element={<AdminFunnel />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}

export default App

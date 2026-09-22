import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { PrefsProvider } from './context/PrefsContext'
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
import PlansPage from './pages/PlansPage'
import PayProPage from './pages/PayProPage'
import TopperPage from './pages/TopperPage'
import TopperSubjectPage from './pages/TopperSubjectPage'
import ConditionalWizard from './components/ConditionalWizard'

// Disable browser scroll restoration
if (typeof window !== 'undefined') {
  window.history.scrollRestoration = 'manual'
}

function App() {
  return (
    <AuthProvider>
      <PrefsProvider>
        <HashRouter>
          <ScrollToTop />
          <ConditionalWizard />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="class/:classId" element={<ClassPage />} />
              <Route path="class/:classId/topper" element={<TopperPage />} />
              <Route path="class/:classId/topper/:boxId" element={<TopperSubjectPage />} />
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
              <Route path="plans" element={<PlansPage />} />
              <Route path="pay/pro" element={<PayProPage />} />
            </Route>
          </Routes>
        </HashRouter>
      </PrefsProvider>
    </AuthProvider>
  )
}

export default App

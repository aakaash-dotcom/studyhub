import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ClassPage from './pages/ClassPage'
import CategoryPage from './pages/CategoryPage'
import SubjectPage from './pages/SubjectPage'
import ResourcePage from './pages/ResourcePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import SearchPage from './pages/SearchPage'
import LegalPage from './pages/LegalPage'

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="class/:classId" element={<ClassPage />} />
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
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}

export default App

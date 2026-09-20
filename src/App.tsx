import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import SchoolPage from './pages/SchoolPage'
import SchoolClassPage from './pages/SchoolClassPage'
import ExamsPage, { ExamCategoryPage } from './pages/ExamsPage'
import GovtExamsPage, { GovtExamCategoryPage } from './pages/GovtExamsPage'
import ResourcePage from './pages/ResourcePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import SearchPage from './pages/SearchPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="school" element={<SchoolPage />} />
            <Route path="school/:classId" element={<SchoolClassPage />} />
            <Route path="exams" element={<ExamsPage />} />
            <Route path="exams/:categoryId" element={<ExamCategoryPage />} />
            <Route path="govt-exams" element={<GovtExamsPage />} />
            <Route path="govt-exams/:categoryId" element={<GovtExamCategoryPage />} />
            <Route path="resource/:resourceId" element={<ResourcePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="search" element={<SearchPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

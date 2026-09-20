import { HashRouter, Routes, Route, Link } from 'react-router-dom'

function HomePage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1 style={{ color: '#17528C' }}>🏠 Ravi's Tuition - Home</h1>
      <p style={{ color: '#595959' }}>If you see this, routing is working!</p>
      <nav style={{ marginTop: '20px' }}>
        <Link to="/class/10" style={{ color: '#17528C', marginRight: '16px' }}>10th Class</Link>
        <Link to="/login" style={{ color: '#17528C' }}>Login</Link>
      </nav>
    </div>
  )
}

function ClassPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1 style={{ color: '#17528C' }}>📚 Class Page</h1>
      <p style={{ color: '#595959' }}>This is a class page</p>
      <Link to="/" style={{ color: '#17528C' }}>← Back to Home</Link>
    </div>
  )
}

function LoginPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1 style={{ color: '#17528C' }}>🔐 Login Page</h1>
      <p style={{ color: '#595959' }}>This is the login page</p>
      <Link to="/" style={{ color: '#17528C' }}>← Back to Home</Link>
    </div>
  )
}

function App() {
  console.log('📱 App component rendering...')
  
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/class/:classId" element={<ClassPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </HashRouter>
  )
}

export default App

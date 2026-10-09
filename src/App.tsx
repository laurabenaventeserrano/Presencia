import { Navigate, Route, Routes } from 'react-router-dom'
import { Hoy } from './components/Hoy'
import './components/controls.css'

function App() {
  return (
    <main className="app">
      <Routes>
        <Route path="/" element={<Hoy />} />
        <Route path="/app" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  )
}

export default App

import { Navigate, Route, Routes } from 'react-router-dom'
import { Ajustes } from './components/Ajustes'
import { Dias } from './components/Dias'
import { Inicio } from './components/Inicio'
import './components/controls.css'
import './components/screens.css'

function App() {
  return (
    <main className="app">
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/dias" element={<Dias />} />
        <Route path="/ajustes" element={<Ajustes />} />
        <Route path="/app" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  )
}

export default App

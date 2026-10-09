import { Navigate, Route, Routes } from 'react-router-dom'
import { Inicio } from './components/Inicio'
import { Seccion } from './components/Seccion'
import './components/controls.css'
import './components/screens.css'

function App() {
  return (
    <main className="app">
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/dias" element={<Seccion title="Días"><p className="pantalla__texto">Muy pronto.</p></Seccion>} />
        <Route path="/ajustes" element={<Seccion title="Ajustes"><p className="pantalla__texto">Muy pronto.</p></Seccion>} />
        <Route path="/app" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  )
}

export default App

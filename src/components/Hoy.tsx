import { Link } from 'react-router-dom'
import { Orb } from './Orb'
import './Hoy.css'

export function Hoy() {
  return (
    <section className="hoy" aria-label="Hoy">
      <div className="caja-orbe caja-orbe--hoy">
        <Orb state="reposo" size="hoy" />
      </div>
      <h1 className="hoy__titulo">¿Qué necesitas hacer hoy?</h1>
      <nav className="vistas" aria-label="Secciones">
        <Link className="enlace" to="/dias">Días</Link>
        <Link className="enlace" to="/ajustes">Ajustes</Link>
      </nav>
    </section>
  )
}

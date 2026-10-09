import { ReactNode } from 'react'
import { Link } from 'react-router-dom'

// Esqueleto de Días y Ajustes: volver a Hoy, título y contenido.
export function Seccion({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="pantalla pantalla--columna" aria-labelledby="seccion-titulo">
      <Link className="texto-control pantalla__volver" to="/">Hoy</Link>
      <h1 id="seccion-titulo" className="pantalla__titulo" tabIndex={-1}>{title}</h1>
      {children}
    </section>
  )
}

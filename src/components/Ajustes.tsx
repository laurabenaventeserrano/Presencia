import { useState } from 'react'
import { actions } from '../actions'
import type { Settings } from '../state/types'
import { useAppStore } from '../store'
import { notificationsSupported, requestNotifications } from '../ui/notify'
import { Seccion } from './Seccion'

type SwitchProps = { label: string; help: string; checked: boolean; onChange: (value: boolean) => void }

// Un interruptor accesible: un botón con role="switch" y su estado en texto.
function Interruptor({ label, help, checked, onChange }: SwitchProps) {
  return (
    <div className="ajuste">
      <div className="ajuste__texto">
        <p className="ajuste__nombre">{label}</p>
        <p className="ajuste__ayuda">{help}</p>
      </div>
      <button className="boton" type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}>
        {checked ? 'Activado' : 'Desactivado'}
      </button>
    </div>
  )
}

export function Ajustes() {
  const settings = useAppStore((state) => state.settings)
  const [note, setNote] = useState('')
  const set = (key: keyof Settings) => (value: boolean) => actions.setSetting(key, value)

  const toggleNotifications = async (value: boolean) => {
    setNote('')
    if (!value) { actions.setSetting('notifications', false); return }
    if (!notificationsSupported()) { setNote('Este navegador no permite avisos.'); return }
    const granted = await requestNotifications()
    actions.setSetting('notifications', granted)
    if (!granted) setNote('El navegador no ha dado permiso para avisar.')
  }

  return (
    <Seccion title="Ajustes">
      <div className="tarjeta">
        <Interruptor label="Sonido al terminar" help="Un tono suave cuando un bloque llega a cero." checked={settings.sound} onChange={set('sound')} />
        <hr className="separador" />
        <Interruptor label="Avisos del navegador" help="Te avisa al terminar un bloque o cuando toca uno aplazado, si estás en otra pestaña." checked={settings.notifications} onChange={(value) => void toggleNotifications(value)} />
        <p className="ajuste__ayuda" aria-live="polite">{note}</p>
        <hr className="separador" />
        <Interruptor label="Ver lo que hace la IA" help="Bajo Tu día, qué herramienta llamó la IA y con qué." checked={settings.aiTrace} onChange={set('aiTrace')} />
      </div>
      <p className="pantalla__texto">El tema claro u oscuro sigue al de tu sistema.</p>
    </Seccion>
  )
}

import { useEffect, useState } from 'react'

// Vuelve a pintar cada 250 ms solo mientras haga falta (un bloque corriendo).
// El tiempo restante se calcula con endsAt en cada pintado; aquí no se cuenta nada.
export const useNow = (ticking: boolean) => {
  const [, setTick] = useState(0)
  useEffect(() => {
    if (!ticking) return
    const interval = window.setInterval(() => setTick((tick) => tick + 1), 250)
    return () => window.clearInterval(interval)
  }, [ticking])
  // Siempre el instante actual: nunca se pinta un «ahora» viejo.
  return Date.now()
}

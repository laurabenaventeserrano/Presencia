import { useEffect, useState } from 'react'

// Vuelve a pintar cada 250 ms solo mientras haga falta (un bloque corriendo).
// El tiempo restante se calcula con endsAt en cada pintado; aquí no se cuenta nada.
export const useNow = (ticking: boolean) => {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    setNow(Date.now())
    if (!ticking) return
    const interval = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(interval)
  }, [ticking])
  return now
}

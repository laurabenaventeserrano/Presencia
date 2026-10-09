// Avisos del navegador (E2). Solo se usan si la persona los activa y da permiso.
export const notificationsSupported = () => typeof window !== 'undefined' && 'Notification' in window

export const requestNotifications = async () => {
  if (!notificationsSupported()) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  return (await Notification.requestPermission()) === 'granted'
}

// Solo avisa si la pestaña no está a la vista: si la estás mirando, ya lo ves.
export const notifyIfHidden = (title: string, body: string) => {
  if (!notificationsSupported() || Notification.permission !== 'granted' || !document.hidden) return
  try {
    new Notification(title, { body, silent: true })
  } catch {
    // Algunos navegadores no permiten avisos fuera de un service worker.
  }
}

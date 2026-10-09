// Un tono suave al terminar (E1): una nota sinusoidal corta que entra y sale despacio. Nunca una alarma.
export const playSoftTone = () => {
  const AudioCtor = window.AudioContext
  if (!AudioCtor) return
  try {
    const audio = new AudioCtor()
    const oscillator = audio.createOscillator()
    const gain = audio.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = 528
    gain.gain.setValueAtTime(0, audio.currentTime)
    gain.gain.linearRampToValueAtTime(0.08, audio.currentTime + 0.3)
    gain.gain.linearRampToValueAtTime(0, audio.currentTime + 1.6)
    oscillator.connect(gain).connect(audio.destination)
    oscillator.start()
    oscillator.stop(audio.currentTime + 1.7)
    oscillator.onended = () => void audio.close()
  } catch {
    // Sin audio disponible: no pasa nada.
  }
}

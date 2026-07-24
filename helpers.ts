import { sourates } from '@/constants/sorats.list'

// Convertit un (numéro de sourate + n° de verset dans la sourate) en
// position ABSOLUE du verset dans le Coran (1..6236).
export function convertSelectVerset({
  surahNumber,
  selectedValue,
}: {
  surahNumber: number
  selectedValue: number
}): number {
  let total = 0
  for (const sourat of sourates) {
    if (sourat.numero === surahNumber) {
      break
    }
    total += sourat.versets
  }
  return total + selectedValue
}

// Millisecondes -> "m:ss".
export function formatTime(currentTimeMillis: number): string {
  if (isNaN(currentTimeMillis)) return '0:00'
  const currentTime = Math.floor(currentTimeMillis / 1000)
  const minutes = Math.floor(currentTime / 60)
  const seconds = Math.floor(currentTime % 60)
  const secondsString = seconds < 10 ? '0' + seconds : '' + seconds
  return minutes + ':' + secondsString
}

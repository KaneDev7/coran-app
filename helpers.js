import { sourates } from "@/constants/sorats.list";


export function convertSelectVerset({ surahNumber, selectedValue }) {
  let total = 0;
  for (let sourat of sourates) {
    if (sourat.numero === surahNumber) {
      break;
    }
    total += sourat.versets;
  }
  return total + selectedValue
}


export function formatTime(currentTimeMillis) {
  if (isNaN(currentTimeMillis)) return "0:00";
  var currentTime = Math.floor(currentTimeMillis / 1000); // Convertir les millisecondes en secondes
  var minutes = Math.floor(currentTime / 60);
  var seconds = Math.floor(currentTime % 60);
  var secondsString = seconds < 10 ? "0" + seconds : "" + seconds;
  return minutes + ":" + secondsString;
}
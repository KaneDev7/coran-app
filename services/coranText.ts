// Récupère le texte d'un verset du Coran depuis l'API.
export async function fetchCoranText(url: string): Promise<string> {
  let text = ''
  try {
    await fetch(url)
      .then(result => result.json())
      .then(data => {
        text = data.data.text
      })
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error))
  }
  return text
}

// get texte coran by fetvhing api
export async function getCoranText(n) {
    let text = ''
    try {
        await fetch(`http://api.alquran.cloud/v1/ayah/${n}`)
        .then((result) => result.json())
        .then((data) => {
            text = data.data.text
        });
    } catch (error) {
        console.log(error)
    }
   return text
  }
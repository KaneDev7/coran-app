// get texte coran by fetvhing api
export async function fetchCoranText(url) {
    let text = ''
    try {
        await fetch(url)
        .then((result) => result.json())
        .then((data) => {
            text = data.data.text
        });
    } catch (error) {
       throw new  Error(error.message)
    }
   return text
  }
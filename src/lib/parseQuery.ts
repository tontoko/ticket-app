import btoa from 'btoa'
import atob from 'atob'

const secret = btoa(encodeURIComponent('query_text'))

const regExp = new RegExp(`.{${Math.ceil(secret.length / 2)}}`, 'g')
const splitedSecret = secret.match(regExp)

export const encodeQuery = (v: string) => {
  const result = [...splitedSecret]
  result.splice(splitedSecret.length - 1, 0, btoa(encodeURIComponent(v)))
  return result.join('')
}

export const decodeQuery = (v: string) => {
  const matchTexts = [
    splitedSecret.slice(0, splitedSecret.length - 1).join(''),
    splitedSecret[splitedSecret.length - 1],
  ]
  const decodeRegExp = new RegExp(`^${matchTexts[0]}(.+)${matchTexts[1]}$`)
  return decodeURIComponent(atob(v.match(decodeRegExp)[1]))
}

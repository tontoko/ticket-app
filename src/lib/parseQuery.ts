import btoa from 'btoa'
import atob from 'atob'

export const encodeQuery = (v: string) => btoa(encodeURIComponent(`t${v}a`))

export const decodeQuery = (v: string) => decodeURIComponent(atob(v)).slice(1).slice(0, -1)
import btoa from 'btoa'
import atob from 'atob'

export const encodeQuery = (v: string) => btoa(encodeURIComponent(v))

export const decodeQuery = (v: string) => decodeURIComponent(atob(v))
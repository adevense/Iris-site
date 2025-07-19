import { writable } from "svelte/store"

export const theme = writable(localStorage.getItem('theme') || 'dark')
export const userStore = writable(undefined)
export const tab = writable(0)
export const chatIdOpen = writable(null)

export function setTheme(t){
    theme.update(v => v = t)
    localStorage.setItem('theme', t)
}
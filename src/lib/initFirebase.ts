import { dev, prod } from '@/ticket-app'
import firebase from "firebase/app";

const params = process.env.ENV === 'prod' ? prod : dev

if (!firebase.apps.length) {
    firebase.initializeApp(params);
}

export { firebase }

export const auth = async () => {
    await import("firebase/auth")
    return firebase.auth()
}

export const firestore = async () => {
    await import("firebase/firestore")
    return firebase.firestore()
}

export const storage = async () => {
    await import("firebase/storage")
    return firebase.storage()
}

export const functions = async () => {
    await import("firebase/functions")
    return firebase.functions()
}

export const analytics = async () => {
    await import("firebase/analytics")
    return firebase.analytics()
}
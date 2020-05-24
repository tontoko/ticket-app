import { dev, prod } from '@/ticket-app'

const initFirebase = async () => {
    const firebase = await import('firebase/app')
    await import('firebase/auth')
    await import('firebase/firestore')
    await import('firebase/storage')
    await import('firebase/functions')
    const params = process.env.GOOGLE_CLOUD_PROJECT === 'ticket-app-d3f5a' ? prod : dev
    if (!firebase.apps.length) {
        firebase.initializeApp(params)
    }
    const firestore = firebase.firestore()
    const storage = firebase.storage()
    const functions = firebase.functions()
    return { firebase, firestore, storage, functions}
}

export default initFirebase
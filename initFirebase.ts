import params from './ticket-app-dev'

const initFirebase = async () => {
    const firebase = await import('firebase/app')
    await import('firebase/auth')
    await import('firebase/firestore')
    await import('firebase/storage')
    if (!firebase.apps.length) {
        firebase.initializeApp(params)
    }
    const settings = { timestampsInSnapshots: true };
    const firestore = firebase.firestore()
    firestore.settings(settings)
    const storage = firebase.storage()
    return {firebase, firestore, storage}
}

export default initFirebase
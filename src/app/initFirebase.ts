import params from '../../ticket-app-dev'

const initFirebase = async () => {
    const firebase = await import('firebase/app')
    await import('firebase/auth')
    await import('firebase/firestore')
    if (!firebase.apps.length) {
        firebase.initializeApp(params)
    }
    return firebase
}

export default initFirebase
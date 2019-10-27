const initFirebase = async () => {
    const firebase = await import('firebase/app')
    await import('firebase/auth')
    await import('firebase/firestore')
    if (!firebase.apps.length) {
        const dev = process.env.NODE_ENV !== 'production'
        if (dev) {
            const params = require('../../ticket-app-dev')
            firebase.initializeApp(params)
        } else {
            await fetch('/__/firebase/init.json').then(async response => {
                firebase.initializeApp(await response.json());
            });
        }
    }
    return firebase
}

export default initFirebase
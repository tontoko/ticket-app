import { dev, prod } from '@/ticket-app'

const initFirebase = async () => {
    const firebase = await import('firebase/app')
    if (!firebase.apps.length) {
        await import('firebase/auth')
        await import('firebase/firestore')
        await import('firebase/storage')
        await import('firebase/functions')
        const params = process.env.VERCEL_GITHUB_COMMIT_REF === 'master' ? prod : dev
        firebase.initializeApp(params);
        const firestore = firebase.firestore()
        const storage = firebase.storage()
        const functions = firebase.functions()
        if (location.hostname === "localhost") {
          firestore.settings({
            host: "localhost:8080",
            ssl: false,
          });
          functions.useFunctionsEmulator("http://localhost:5002");
        }
        return {
          firebase,
          firestore,
          storage,
          functions,
        };
    }

    return {
      firebase,
      firestore: firebase.firestore(),
      storage: firebase.storage(),
      functions: firebase.functions(),
    };

}

export default initFirebase
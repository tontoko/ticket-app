

const initFirebaseAdmin = async () => {
    const admin = await import('firebase-admin')
    if (!admin.apps.length) {
        admin.initializeApp()
    }
    return admin
}

export default initFirebaseAdmin
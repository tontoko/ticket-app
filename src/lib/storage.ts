const storage = async () => {
    const firebase = await import("firebase/app");
    await import("firebase/storage");
    return firebase.storage()
}

export default storage
import * as functions from 'firebase-functions';
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)
const fireStore = admin.firestore()

exports.createUser = functions
.region('asia-northeast1')
.auth.user().onCreate((user) => {  
  const usersRef = fireStore.collection('users');
  usersRef.doc(user.uid).set({
    admin: false
  })
});
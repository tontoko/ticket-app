
type stripeEnv = {
  endpoint: {
    prod: string,
    dev: string
  }
}
const stripeEnv = functions.config().stripe as stripeEnv
const stripeSecret = process.env.GCLOUD_PROJECT === 'ticket-app-d3f5a' ? stripeEnv.endpoint.prod : stripeEnv.endpoint.dev
const stripe = require('stripe')(stripeSecret)

import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin' 
admin.initializeApp(functions.config().firebase)
const fireStore = admin.firestore()

exports.createUser = functions
.region('asia-northeast1')
.auth.user().onCreate((user) => {  
  const usersRef = fireStore.collection('users');
  usersRef.doc(user.uid).set({
    admin: false
  })
  const account = stripe.accounts.create({
    country: 'JP',
    type: 'custom',
    requested_capabilities: ['card_payments'],
  })
});

type stripeEnv = {
  endpoint: {
    prod: string,
    dev: string
  },
  apikey: {
    prod: string,
    dev : string
  }
}

import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin' 
admin.initializeApp(functions.config().firebase)
const fireStore = admin.firestore()

const stripeEnv = functions.config().stripe as stripeEnv
const stripeSecret = process.env.GCLOUD_PROJECT === 'ticket-app-d3f5a' ? stripeEnv.apikey.prod : stripeEnv.apikey.dev
const stripe = require('stripe')(stripeSecret)

exports.createUser = functions
.region('asia-northeast1')
.auth.user().onCreate(async (user) => {  
  const stripeAccount = await stripe.accounts.create({
    country: 'JP',
    type: 'custom',
    requested_capabilities: ['card_payments'],
  })
  const usersRef = fireStore.collection('users');
  await usersRef.doc(user.uid).set({
    admin: false,
    stripeAccount
  })
});
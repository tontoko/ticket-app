import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'
import { NextApiHandler } from 'next'
const { upload } = require('micro-upload')
import fs from 'fs'
import stripe, { Stripe } from '@/src/lib/stripe'

const endpoint: NextApiHandler = upload(async (req, res) => {
  try {

    const { token } = req.body
    if (!token) return res.status(500)
    const { firebase, firestore } = await initFirebaseAdmin()
    const decodedToken = await firebase.auth().verifyIdToken(token)

    const usersRef = firestore.collection('users').doc(decodedToken.uid)
    const { stripeId } = (await usersRef.get()).data()

    const { individual } = await stripe.accounts.retrieve(
      stripeId
    )
    const { id } = individual
    
    let document: Stripe.PersonUpdateParams.Verification.Document= {front: null}

    document.front = (await stripe.files.create({
      purpose: 'identity_document',
      file: {
        data: req.files.file1.data,
        name: 'identification1.jpg',
        type: 'application/octet-stream',
      },
    }, {
      stripeAccount: stripeId,
    })).id

    if (req.files.file2) document.back = (await stripe.files.create({
      purpose: 'identity_document',
      file: {
        data: req.files.file2.data,
        name: 'identification2.jpg',
        type: 'application/octet-stream',
      },
    }, {
      stripeAccount: stripeId,
    })).id

    const person = await stripe.accounts.updatePerson(
      stripeId,
      id,
      {
        verification: {
          document,
        },
      }
    );

    return res.json({ status: true })

  } catch (error) {
    console.log(error)
    res.status(400).json({ error })
  }
})

export default endpoint

export const config = {
  api: {
    bodyParser: false,
  },
}
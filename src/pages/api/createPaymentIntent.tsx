import getImg from '@/src/lib/getImgSSR'
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'
import stripe from '@/src/lib/stripe'
import { category, event } from 'app'
import { NextApiHandler } from 'next'

const createPaymentIntent: NextApiHandler = async (req, res) => {
  const { eventId, categoryId, token } = req.body
  const { firebase, firestore } = await initFirebaseAdmin()
  const decodedToken = await firebase.auth().verifyIdToken(token)
  const { uid } = decodedToken

  const eventData = (await firestore.collection('events').doc(eventId).get()).data() as event
  const { createdUser } = eventData

  const { stripeId } = (await firestore.collection('users').doc(createdUser).get()).data()

  const photos: undefined | string[] = eventData.photos
  const photoUrls = photos.length
    ? await Promise.all(photos.map(async (photo) => getImg(photo, createdUser)))
    : ['/images/event_default_360x360.jpg']
  const startDate = eventData.startDate.seconds
  const endDate = eventData.endDate.seconds
  const event = { ...eventData, startDate, endDate }

  const categoryData = (
    await firestore.collection('events').doc(eventId).collection('categories').doc(categoryId).get()
  ).data() as category

  const paymentIntent = await stripe.paymentIntents.create({
    amount: categoryData.price,
    currency: 'jpy',
    transfer_data: {
      amount: categoryData.price - Math.floor(categoryData.price * 0.1),
      destination: stripeId,
    },
    payment_method_types: ['card'],
    on_behalf_of: stripeId,
    metadata: {
      event: eventId,
      category: categoryId,
      seller: createdUser,
      buyer: uid,
    },
  })
  const { client_secret } = paymentIntent
  res.status(200).json({ clientSecret: client_secret, photoUrls, event })
}

export default createPaymentIntent

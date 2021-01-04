import { NextApiHandler } from 'next'
import { stripeAccounts } from '@/src/lib/stripeRetrieve'

const stripeAccountsRetrieve: NextApiHandler = async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { individual, tos_acceptance } = await stripeAccounts(req.body.uid)
  res.status(200).json({ individual, tos_acceptance })
}

export default stripeAccountsRetrieve

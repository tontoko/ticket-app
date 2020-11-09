declare module 'app' {
  export type event = {
    startDate: FirebaseFirestore.Timestamp
    endDate: FirebaseFirestore.Timestamp
    photos: string[]
    id: string
    placeName: string
    name: string
    eventDetail: string
    createdUser: string
    id?: string
    categories?: categories
  }

  export type categories = category[]

  export type category = {
    name: string
    price: number
    createdUser: string
    stock: number
    sold: number
    public: boolean
    index: number
    id?: string
  }

  export type payment = {
    category: category.id
    event: event.id
    accepted: boolean
    error: string
    buyer: string
    seller: string
    refund?: {
      detailText: string
      reason: string
      reasonText: string
      refunded?: boolean
      rejected?: boolean
    }
    createdAt: firebase.firestore.Timestamp
    stripe: string
    id?: string
    errorInfo?: string
  }

  export type manualPayment = {
    id?: string
    name: string
    paid: boolean
    category: category.id
  }

  export type notify = {
    read: boolean
    text: string
    url: string
    createdAt: firebase.firestore.Timestamp
  }

  export type ticket = {
    category: category
    payment: {
      id: string
      category: any
      event: any
      accepted: boolean
      error: string
      buyer: string
      seller: string
      refund: {
        detailText: string
        reason: string
        reasonText: string
        refunded?: boolean
        rejected?: boolean
      }
      createdAt: firebase.firestore.Timestamp
      stripe: string
    }
  }
}

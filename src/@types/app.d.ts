declare module 'app' {
  export type Event = {
    startDate: FirebaseFirestore.Timestamp
    endDate: FirebaseFirestore.Timestamp
    photos: string[]
    id: string
    placeName: string
    name: string
    eventDetail: string
    createdUser: string
    id?: string
    categories?: Category[]
  }

  export type Category = {
    name: string
    price: number
    createdUser: string
    stock: number
    sold: number
    public: boolean
    index: number
    id?: string
  }

  export type Payment = {
    category: Category.id
    event: Event.id
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

  export type ManualPayment = {
    id?: string
    name: string
    paid: boolean
    category: category.id
  }

  export type Notify = {
    read: boolean
    text: string
    url: string
    createdAt: firebase.firestore.Timestamp
  }

  export type Ticket = {
    category: Category
    payment: {
      id: string
      category: Category
      event: Event
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

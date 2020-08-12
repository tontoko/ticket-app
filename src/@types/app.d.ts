declare module 'app' {
  export type events = event[]
  
  export type event = {
    startDate: FirebaseFirestore.Timestamp;
    endDate: FirebaseFirestore.Timestamp;
    photos: string[];
    id: string;
    placeName: string;
    time: string;
    name: string;
    eventDetails: string;
    categories: categories;
    createdUser: string;
    id?: string;
  };

  export type categories = category[];
  
  export type category = {
    name: string,
    price: number,
    createdUser: string,
    stock: number,
    sold: number,
    public: boolean,
    index: number,
    id?: string
  }

  export type payments = payment[]

  export type payment = {
    category: category.id,
    event: event.id,
    accepted: boolean,
    error: string,
    buyer: string,
    seller: string,
    refund: {
      detailText: string,
      reason: string,
      event: event.id
    },
    createdAt: firebase.firestore.Timestamp
    id?: string,
  };

  export type notifies = notify[]

  export type notify = {
    read: boolean,
    text: string,
    url: string,
  }
}
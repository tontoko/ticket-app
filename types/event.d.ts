declare module 'events' {
  export type events = event[]
  
  export type event = {
    createdAt: FirebaseFirestore.Timestamp,
    updatedAt: FirebaseFirestore.Timestamp,
    startDate: FirebaseFirestore.Timestamp,
    endDate: FirebaseFirestore.Timestamp,
    photos: string[],
    id: string,
    placeName: string,
    time: string,
    name: string,
    eventDetails: string,
    categories: categories,
    createdUser: string
  }
  
  export type categories = {
    name: string,
    price: number,
    createdUser: string,
    stock: number,
    sold: number
  }
}
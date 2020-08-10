declare module 'event' {
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
  
  export type categories = {
    name: string,
    price: number,
    createdUser: string,
    stock: number,
    sold: number,
    public: boolean,
    index: number,
    id?: string
  }
}
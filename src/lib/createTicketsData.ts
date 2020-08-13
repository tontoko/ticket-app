import { fuego } from "@nandorojo/swr-firestore";
import getImg from "./getImg";
import { events, payments, ticket } from "app";

const createTicketsData = async (events: events, payments: payments) => {
    return await Promise.all(
      events.map(async (event) => {
        const tickets = await Promise.all(
          payments
            .filter((payment) => payment.event === event.id)
            .map(async (payment) => {
              const categorySnapShot = await fuego.db
                .collection("events")
                .doc(event.id)
                .collection("categories")
                .doc(payment.category)
                .get();
              return {
                category: {
                  ...categorySnapShot.data(),
                  id: categorySnapShot.id,
                },
                payment: { ...payment, id: payment.id }
              } as ticket;
            })
        );
        const photos =
          event.photos.length > 0
            ? await getImg(event.photos[0], event.createdUser, "360")
            : await getImg(null, event.createdUser, "360");
        return {
          event: { ...event, id: event.id },
          tickets,
          photos,
        };
      })
    );
}

export default createTicketsData
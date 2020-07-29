import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'
import getImg from '@/src/lib/getImgSSR'
import EventForm from '@/src/components/eventForm';
import { GetStaticPaths, GetStaticProps } from 'next';
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin';
import withAuth from '@/src/lib/withAuth';

const Edit = ({ user, event, photoUrls, setModal, setModalInner }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter()

  return (
    <EventForm
      {...{
        setModal,
        setModalInner,
        photoUrls,
        loading,
        setLoading,
        mode: 'edit',
        user,
        event,
      }}
    />
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const { firestore } = await initFirebaseAdmin();
  const paths = (await firestore.collection("events").get()).docs.map(
    (doc) => `/events/${doc.id}/edit`
  );

  return { paths, fallback: true };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { firestore } = await initFirebaseAdmin();
  const { id } = params;
  const snapshot = firestore.collection("events").doc(id as string).get();
  const data = (await snapshot).data()
  const startDate = data.startDate.seconds;
  const endDate = data.endDate.seconds;
  const event = { ...data, startDate, endDate };
  const photoUrls: string[] =
    data.photos.length > 0
      ? await Promise.all(
          data.photos.map(
            async (photo) => await getImg(photo, data.createdUser, "800")
          )
        )
      : [await getImg(null, data.createdUser)];

  return {
    props: { event, photoUrls },
    revalidate: 1,
  };
};

export default withAuth(Edit)
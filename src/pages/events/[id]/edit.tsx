import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'
import getImg from '@/src/lib/getImg'
import EventForm from '@/src/components/eventForm';
import { useDocument } from 'react-firebase-hooks/firestore';
import { firestore } from '@/src/lib/initFirebase';

export default ({ user, setModal, setModalInner }) => {
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState("");
  const [photoUrls, setPhotoUrls] = useState([]);
  const router = useRouter()
  const [snapshot, dataLoading, error] = useDocument(
    firestore.collection("events").doc(id as string)
  );

  useEffect(() => {
    if (error) return;
    if (dataLoading) return  
    (async() => {
      const { photos } = snapshot.data();
      setPhotoUrls(photos
        ? await Promise.all(
            snapshot.data().photos.map(async (photo) => getImg(photo, user.user_id))
          )
        : undefined)
      setLoading(false);
    })()
  }, [snapshot]);

  useEffect(() => {
    if (!router) return
    setId(router.query.id as string)
  }, [router])

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

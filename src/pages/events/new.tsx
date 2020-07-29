import React, {useState, useEffect} from 'react';
import {useRouter} from 'next/router'
import {GetServerSideProps, GetStaticPaths, GetStaticProps} from 'next'
import isLogin from '@/src/lib/isLogin'
import { registerLocale } from "react-datepicker"
import ja from 'date-fns/locale/ja'
registerLocale('ja', ja)
import stripe from '@/src/lib/stripe';
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin';
import EventForm from '@/src/components/eventForm';
import { firestore } from '@/src/lib/initFirebase';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import withAuth from '@/src/lib/withAuth';

const New = ({ setModal, setModalInner, user }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData] = useDocumentData(firestore.collection('users').doc(user.uid));

  useEffect(() => {
    if (!userData) return
    (async() => {
      const { stripeId } = userData as { stripeId: string|undefined }
      const res = await fetch('/api/stripeAccountsRetrieve', { body: JSON.stringify({ stripeId }) })
      const individual = await res.json();
      const requirements = individual ? individual.requirements : null;
      if (
        requirements &&
          (requirements.currently_due.length ||
          requirements.errors.length ||
          requirements.eventually_due.length ||
          requirements.past_due.length)
      ) {
        router.push(`/users/${user.uid}/edit`);
      } else {
        setLoading(false);
      }
    })()
  }, [userData]);
        
  return (
    <EventForm
      setModal={setModal}
      setModalInner={setModalInner}
      photoUrls={null}
      loading={loading}
      setLoading={setLoading}
      mode="new"
      user={user}
      event={null}
    />
  );

};

export default withAuth(New)
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

export default ({ userData, setModal, setModalInner, user }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData) return
    (async() => {
      const { stripeId } = userData
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
        router.push("/user/edit");
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
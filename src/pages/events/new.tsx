import React, {useState, useEffect} from 'react';
import {useRouter} from 'next/router'
import { registerLocale } from "react-datepicker"
import ja from 'date-fns/locale/ja'
registerLocale('ja', ja)
import EventForm from '@/src/components/eventForm';
import withAuth from '@/src/lib/withAuth';

const New = ({ setModal, setModalInner, user }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return
    (async() => {
      const res = await fetch("/api/stripeAccountsRetrieve", {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ uid: user.uid }),
      });
      const { individual } = await res.json();
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
  }, [user]);
        
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
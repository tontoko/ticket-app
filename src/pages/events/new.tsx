import React, {useState, useEffect} from 'react';
import {
    Button, Col, Row, Form, Input, FormGroup, Label, Spinner
} from 'reactstrap';
import {useRouter} from 'next/router'
import {GetServerSideProps} from 'next'
import isLogin from '@/src/lib/isLogin'
import DatePicker, { registerLocale } from "react-datepicker"
import ja from 'date-fns/locale/ja'
registerLocale('ja', ja)
import moment from 'moment'
import { toUtcIso8601str } from '@/src/lib/time'
import { useAlert } from 'react-alert';
import initFirebase from '@/src/lib/initFirebase';
import stripe from '@/src/lib/stripe';
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin';
import previewEvent from '@/src/lib/previewEvent';
import EventForm from '@/src/components/eventForm';

export default ({ requirements, setModal, setModalInner, user }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

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

export const getServerSideProps: GetServerSideProps = async ctx => {
    const {user} = await isLogin(ctx, 'redirect')
    const { firestore } = await initFirebaseAdmin();
    const { stripeId } = (
      await firestore.collection("users").doc(user.uid).get()
    ).data();
    const { individual } = await stripe.accounts.retrieve(stripeId);
    const requirements = individual ? individual.requirements : null;
    return { props: { user, requirements } };
}
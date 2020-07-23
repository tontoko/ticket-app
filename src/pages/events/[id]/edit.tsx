import React, { useState,useEffect } from 'react';
import {
    Button, Container, Col, Row, Form, Input, FormGroup, Label, Spinner
} from 'reactstrap';
import Link from 'next/link'
import { useRouter } from 'next/router'
import initFirebase from '@/src/lib/initFirebase'
import initFirebaseAdmin from '@/src/lib/initFirebaseAdmin'
import Loading from '@/src/components/loading'
import getImg from '@/src/lib/getImgSSR'
import isLogin from '@/src/lib/isLogin'
import { GetServerSideProps } from 'next'
import {event} from 'events'
import DatePicker, { registerLocale } from "react-datepicker"
import ja from 'date-fns/locale/ja'
registerLocale('ja', ja)
import moment from 'moment'
import { toUtcIso8601str } from '@/src/lib/time'
import { useAlert } from 'react-alert';
import errorMsg from '@/src/lib/errorMsg';
import { encodeQuery } from '@/src/lib/parseQuery';
import EventForm from '@/src/components/eventForm';

export default ({ user, event, photoUrls, setModal, setModalInner }) => {
  const router = useRouter();
  const alert = useAlert();
  const [files, setFiles] = useState(["", "", ""]);
  const [eventName, setEventName] = useState(event.name);
  const [placeName, setPlaceName] = useState(event.placeName);
  const [eventDetail, setEventDetail] = useState(event.eventDetail);
  const [startDate, setStartDate] = useState(
    toUtcIso8601str(moment(event.startDate * 1000))
  );
  const [endDate, setEndDate] = useState(
    toUtcIso8601str(moment(event.endDate * 1000))
  );
  const [loading, setLoading] = useState(false);

  return (
    <EventForm
      setModal={setModal}
      setModalInner={setModalInner}
      photoUrls={photoUrls}
      loading={loading}
      setLoading={setLoading}
      mode="edit"
      user={user}
      event={event}
    />
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
    const {user} = await isLogin(ctx, 'redirect')
    const {firestore} = await initFirebaseAdmin()

    const {query} = ctx
    const data = (await firestore.collection('events').doc(query.id as string).get()).data() as event
    const photos: undefined | string[] = data.photos
    const photoUrls = photos ? await Promise.all(photos.map(async photo => getImg(photo, user.user_id))) : undefined
    const startDate = data.startDate.seconds
    const endDate = data.endDate.seconds

    return { props: { user, event: { ...data, startDate, endDate }, photoUrls } }
}
import {
    Button, Row, Form, Input, FormGroup, Label, CarouselItem, Carousel, CarouselIndicators, CarouselControl, Spinner
} from 'reactstrap';
import moment from 'moment'
export default ({
  setModal,
  setModalInner,
  submitEvent,
  loading,
  params,
  photos,
}) => {
  const { eventName, placeName, eventDetail, startDate, endDate } = params;

  setModalInner(
    <Form style={{ margin: "2em" }} onSubmit={submitEvent}>
      <h4 style={{ marginBottom: "1em" }}>この内容で送信しますか？</h4>
      <FormGroup style={{ textAlign: "center" }}>
        <img src={photos[0]} height="360em" />
      </FormGroup>
      <FormGroup>
        <Label className="mr-2">イベント名</Label>
        <p>{eventName}</p>
      </FormGroup>
      <FormGroup>
        <Label className="mr-2">会場名</Label>
        <p>{placeName}</p>
      </FormGroup>
      <FormGroup>
        <Label>開始</Label>
        <Input
          value={moment(startDate).format("YYYY年 M月d日 H:mm")}
          disabled
        />
      </FormGroup>
      <FormGroup>
        <Label>終了</Label>
        <Input value={moment(endDate).format("YYYY年 M月d日 H:mm")} disabled />
      </FormGroup>
      <FormGroup>
        <Label for="describe">イベント詳細</Label>
        <Input
          disabled
          style={{ height: "40em" }}
          type="textarea"
          name="text"
          id="describe"
          value={eventDetail}
        />
      </FormGroup>
      <FormGroup>
        <Row style={{ margin: 0, marginTop: "0.5em" }}>
          <Button
            type="button"
            className="ml-auto"
            style={{ marginRight: '0.5em' }}
            onClick={() => setModal(false)}
          >
            キャンセル
          </Button>
          <Button disabled={loading}>{loading ? <Spinner /> : "送信"}</Button>
        </Row>
      </FormGroup>
    </Form>
  );
  setModal(true);
};
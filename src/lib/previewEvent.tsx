import {
    Button, Row, Form, Input, FormGroup, Label, CarouselItem, Carousel, CarouselIndicators, CarouselControl, Spinner, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import moment from 'moment'
import { useState, useEffect } from 'react';
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
    <PreviewModal
      setModal={setModal}
      submitEvent={submitEvent}
      loading={loading}
      photos={photos}
      eventName={eventName}
      placeName={placeName}
      eventDetail={eventDetail}
      startDate={startDate}
      endDate={endDate}
    />
  );
  setModal(true);
};

// モーダル内用React Component
const PreviewModal = ({
  setModal,
  submitEvent,
  loading,
  photos,
  eventName,
  placeName,
  eventDetail,
  startDate,
  endDate,
}) => {

  const items = photos
    .filter((v) => v)
    .map((photo) => {
      return {
        src: photo,
      };
    });
  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [thisLoading, setThisLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setThisLoading(true);
    const success = await submitEvent();
    !success && setThisLoading(false);
  }

  const next = () => {
    if (animating) return;
    const nextIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1;
    setActiveIndex(nextIndex);
  };

  const previous = () => {
    if (animating) return;
    const nextIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
    setActiveIndex(nextIndex);
  };

  const goToIndex = (newIndex) => {
    if (animating) return;
    setActiveIndex(newIndex);
  };

  const slides = items.map((item, i) => {
    return (
      <CarouselItem
        key={i}
        onExiting={() => setAnimating(true)}
        onExited={() => setAnimating(false)}
      >
        <img src={item.src} height="360em" />
      </CarouselItem>
    );
  });

  return (
    <Form style={{ margin: "2em" }} onSubmit={submit}>
      <ModalHeader>
        <h4 style={{ marginBottom: "1em" }}>この内容で送信しますか？</h4>
      </ModalHeader>
      <ModalBody>
        <FormGroup style={{ textAlign: "center" }}>
          <Carousel
            activeIndex={activeIndex}
            next={next}
            previous={previous}
            className="carousel-fade"
            interval="20000"
          >
            <CarouselIndicators
              items={items}
              activeIndex={activeIndex}
              onClickHandler={goToIndex}
            />
            {slides}
            <CarouselControl
              direction="prev"
              directionText="Previous"
              onClickHandler={previous}
            />
            <CarouselControl
              direction="next"
              directionText="Next"
              onClickHandler={next}
            />
          </Carousel>
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
          <Input
            value={moment(endDate).format("YYYY年 M月d日 H:mm")}
            disabled
          />
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
      </ModalBody>
      <ModalFooter>
        <Button
          type="button"
          style={{ marginRight: "0.5em" }}
          onClick={() => setModal(false)}
        >
          キャンセル
        </Button>
        <Button disabled={thisLoading}>
          {thisLoading ? <Spinner /> : "送信"}
        </Button>
      </ModalFooter>
    </Form>
  );
};
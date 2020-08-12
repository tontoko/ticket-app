import { Card, CardBody, Row, Col, Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckSquare, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { encodeQuery } from "@/src/lib/parseQuery";

const Tickets = ({ user, ticket, event: event }) => {
    return (
      <Card style={{ marginBottom: "0.5em" }}>
        <CardBody>
          <p>
            {ticket.name}: {ticket.price}円
          </p>
          {ticket.accepted ? (
            <p>
              <FontAwesomeIcon
                icon={faCheckSquare}
                style={{ color: "#00DD00" }}
              />{" "}
              受付済み
            </p>
          ) : (
            <p>
              <FontAwesomeIcon
                icon={faExclamationCircle}
                style={{ color: "orange" }}
              />{" "}
              未受付
            </p>
          )}
          <Row>
            {(() => {
              if (ticket.error) {
                return (
                  <Col>
                    <p>購入失敗 ({ticket.error})</p>
                  </Col>
                );
              } else if (ticket.refund) {
                return (
                  <Col>
                    <p>返金処理が行われました</p>
                  </Col>
                );
              } else {
                return (
                  <>
                    {!ticket.accepted && (
                      <Col xs="12" style={{ marginBottom: "0.2em" }}>
                        <Link
                          href={{
                            pathname: `/events/${event.id}/reception/show`,
                            query: {
                              ticket: encodeQuery(JSON.stringify(ticket)),
                            },
                          }}
                        >
                          <Button color="success">受付用QRコードを表示</Button>
                        </Link>
                      </Col>
                    )}
                    <Col xs="12">
                      <Link href={`/users/${user.uid}/payments/${ticket.paymentId}/refund`}>
                        <Button color="danger">返金申請</Button>
                      </Link>
                    </Col>
                  </>
                );
              }
            })()}
          </Row>
        </CardBody>
      </Card>
    );
}

export default Tickets;
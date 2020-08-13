import { Card, CardBody, Row, Col, Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckSquare, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { encodeQuery } from "@/src/lib/parseQuery";
import { ticket, event } from "app";

const Tickets = ({ user, ticket, event }: {user:firebase.User, ticket: ticket, event: event}) => {
    return (
      <Card style={{ marginBottom: "0.5em" }}>
        <CardBody>
          <p>
            {ticket.category.name}: {ticket.category.price}円
          </p>
          {ticket.payment.accepted ? (
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
              if (ticket.payment.error) {
                return (
                  <Col>
                    <p>購入失敗 ({ticket.payment.error})</p>
                  </Col>
                );
              } else if (ticket.payment.refund) {
                return (
                  <Col>
                    <p>返金処理が行われました</p>
                  </Col>
                );
              } else {
                return (
                  <>
                    {!ticket.payment.accepted && (
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
                      <Link
                        href={`/users/${user.uid}/payments/${ticket.payment.id}`}
                      >
                        <Button color="secondary">詳細</Button>
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
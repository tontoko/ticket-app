import { NextPage } from "next";
import { FormGroup, Form, Label, Input, Button } from "reactstrap";
import { fuego } from "@nandorojo/swr-firestore";
import { useRef, useCallback } from "react";
import { useAlert } from "react-alert";
import { useRouter } from "next/router";
import { encodeQuery } from "../lib/parseQuery";

const Contact: NextPage = () => {
    const alert = useAlert()
    const router = useRouter()

    const emailRef = useRef(null)
    const textRef = useRef(null);
    
    const submit = useCallback(
      async (e) => {
        e.preventDefault();
        try {
          await fuego.db.collection("contacts").add({
            category: "contact",
            info: {
              email: emailRef.current.value,
            },
            text: textRef.current.value,
          });
          router.push({
            pathname: "/login",
            query: { msg: encodeQuery("お問い合わせを送信しました。") },
          });
        } catch (e) {
          console.error(e.message);
          alert.error("エラーが発生しました。しばらくしてお試しください。");
        }
      },
      [emailRef.current, textRef.current]
    );

    return (
        <>
        <Form onSubmit={submit}>
            <h4>お問い合わせ</h4>
            <FormGroup>
                <Label>メールアドレス</Label>
                <Input type="email" innerRef={emailRef} />
            </FormGroup>
            <FormGroup>
                <Label>お問い合わせ内容</Label>
                <Input type="textarea" innerRef={textRef} />
            </FormGroup>
            <FormGroup>
                <Button>送信</Button>
            </FormGroup>
        </Form>
        </>
    )
}

export default Contact
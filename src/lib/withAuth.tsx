import Loading from "../components/loading";
import React from "react";
import Router from "next/router";
import { encodeQuery } from "./parseQuery";


const withAuth = Component => {
    return class withAuthHOC extends React.Component<{user: string}> {
      constructor(props) {
        super(props);
      }

        componentDidMount() {
            if (
            window.location.pathname !== "/" &&
            window.location.pathname !== "/login" &&
            window.location.pathname !== "/register" &&
            window.location.pathname !== "/termsOfUse" &&
            window.location.pathname !== "/forgetPassword" &&
            !window.location.pathname.match(/^\/__\/auth\/action/) &&
            !window.location.pathname.match(/^\/events\/[^\/]+\/*/) &&
            !this.props.user
            ) {
                Router.push({
                    pathname: "/login",
                    query: { msg: encodeQuery("ログアウトしました") },
                });
            }
        }

      render() {
        if (!this.props.user) return <Loading />;
        return <Component {...this.props} />;
      }
    };
}

export default withAuth;
import Loading from "../components/loading";
import React from "react";
import Router from "next/router";
import { encodeQuery } from "./parseQuery";
import checkAllowNoLoginUrlList from "./checkAllowNoLoginUrlList";


const withAuth = Component => {
    return class withAuthHOC extends React.Component<{ user: string, userLoading: boolean }> {
      constructor(props) {
        super(props);
      }

      render() {
        if (!this.props.user) return <Loading />;
        return <Component {...this.props} />;
      }
    };
}

export default withAuth;
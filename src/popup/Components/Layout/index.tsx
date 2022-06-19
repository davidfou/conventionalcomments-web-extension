import * as React from "react";
import LayoutComponent from "./Layout";
import Intro from "../Intro";
import ConfigureDomains from "../ConfigureDomains";

function Layout(): JSX.Element {
  return (
    <LayoutComponent>
      <Intro />
      <ConfigureDomains />
    </LayoutComponent>
  );
}

export default Layout;

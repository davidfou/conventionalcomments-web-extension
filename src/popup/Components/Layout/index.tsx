import * as React from "react";
import LayoutComponent from "./Layout";
import ConfigureDomains from "../ConfigureDomains";

function Layout(): JSX.Element {
  return (
    <LayoutComponent>
      <ConfigureDomains />
    </LayoutComponent>
  );
}

export default Layout;

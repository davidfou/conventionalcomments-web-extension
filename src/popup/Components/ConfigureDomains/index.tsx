import * as React from "react";

import ConfigureDomainsComponent from "./ConfigureDomains";
import useProps from "./useProps";

function ConfigureDomains(): JSX.Element {
  const props = useProps();
  return <ConfigureDomainsComponent {...props} />;
}
export default ConfigureDomains;

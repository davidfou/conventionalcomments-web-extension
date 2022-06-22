import * as React from "react";
import * as ReactDOM from "react-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import Layout from "./Components/Layout";
import ApplicationError from "../ApplicationError";

const container = document.getElementById("app");
if (container === null) {
  throw ApplicationError.unexpectedError("DOM element with id app not found");
}

const theme = createTheme();

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout />
    </ThemeProvider>
  </React.StrictMode>,
  container
);

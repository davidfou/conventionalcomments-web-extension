import * as React from "react";
import Container from "@mui/material/Container";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import Logo from "../Logo";
import type { LayoutProps } from "./types";

function App({ children }: LayoutProps): JSX.Element {
  return (
    <Box
      sx={{
        width: 600,
        height: 600,
        backgroundColor: (theme) => theme.palette.grey[100],
      }}
    >
      <AppBar position="static">
        <Container maxWidth={false}>
          <Toolbar disableGutters>
            <Logo sx={{ mr: 1 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              conventional: comments
            </Typography>
          </Toolbar>
        </Container>
      </AppBar>
      <Box sx={{ py: 3 }}>
        <Container maxWidth={false}>{children}</Container>
      </Box>
    </Box>
  );
}

export default App;

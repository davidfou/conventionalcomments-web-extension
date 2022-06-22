import * as React from "react";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";

import { reportBug } from "../helpers";

type AddFailureReportProps = {
  url: string;
  message: string;
  onClose: () => void;
};

function AddFailureReport({ url, message, onClose }: AddFailureReportProps) {
  return (
    <Alert severity="error" onClose={onClose}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <AlertTitle>An error occurred while registering {url}</AlertTitle>
          {message}
        </Grid>
        <Grid item xs={12} textAlign="right">
          <Button
            variant="outlined"
            startIcon={<BugReportOutlinedIcon />}
            onClick={reportBug}
            color="error"
          >
            Report a bug
          </Button>
        </Grid>
      </Grid>
    </Alert>
  );
}

export default AddFailureReport;

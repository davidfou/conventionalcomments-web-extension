import * as React from "react";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";

import { reportFeature } from "../helpers";

type RemoveSuccessfulReportProps = {
  url: string;
  onClose: () => void;
};

function RemoveSuccessfulReport({ url, onClose }: RemoveSuccessfulReportProps) {
  return (
    <Alert severity="info" onClose={onClose}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <AlertTitle>The extension is unregistered</AlertTitle>
          The plugin will no longer be loaded for pages on{" "}
          <Typography variant="body2" component="span" fontStyle="oblique">
            {url}
          </Typography>
          . Is there a particular reason to stop using it? Feedback would be
          appreciated to understand how to improve the extension.
        </Grid>
        <Grid item xs={12} textAlign="right">
          <Button
            variant="outlined"
            startIcon={<RateReviewOutlinedIcon />}
            onClick={reportFeature}
            color="primary"
          >
            Feedback
          </Button>
        </Grid>
      </Grid>
    </Alert>
  );
}

export default RemoveSuccessfulReport;

import * as React from "react";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Typography from "@mui/material/Typography";

type AddSuccessfulReportProps = {
  url: string;
  onClose: () => void;
};

function AddSuccessfulReport({ url, onClose }: AddSuccessfulReportProps) {
  return (
    <Alert severity="success" onClose={onClose}>
      <AlertTitle>The extension is registered successfully!</AlertTitle>
      The plugin will be loaded automatically for new pages on{" "}
      <Typography variant="body2" component="span" fontStyle="oblique">
        {url}
      </Typography>
      . A reload is necessary for pages already on that url.
    </Alert>
  );
}

export default AddSuccessfulReport;

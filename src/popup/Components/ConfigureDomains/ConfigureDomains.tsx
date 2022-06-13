import * as React from "react";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import AddCircleIcon from "@mui/icons-material/AddCircle";

import type { ConfigureDomainsProps } from "./types";
import AddSuccessfulReport from "./AddSuccessfulReport";
import RemoveSuccessfulReport from "./RemoveSuccessfulReport";
import AddFailureReport from "./AddFailureReport";
import RemoveFailureReport from "./RemoveFailureReport";

function ConfigureDomains({
  urls,
  onUnregisterDomain,
  onRegisterDomain,
  onCloseReport,
  isLoading,
}: ConfigureDomainsProps): JSX.Element | null {
  if (isLoading) {
    return null;
  }
  return (
    <Card>
      <CardContent>
        <Typography color="text.secondary" sx={{ pb: 2 }}>
          Configure domains
        </Typography>
        <Grid container spacing={1}>
          {urls.map(({ url, status }) => {
            if (status === "removed") {
              return false;
            }
            return (
              <Grid key={url} item xs="auto">
                <Chip
                  label={url}
                  variant={
                    ["registered", "isRemoving"].includes(status)
                      ? "filled"
                      : "outlined"
                  }
                  disabled={["isRemoving", "isAdding"].includes(status)}
                  deleteIcon={
                    ["new", "isAdding"].includes(status) ? (
                      <AddCircleIcon />
                    ) : undefined
                  }
                  onDelete={
                    ["registered", "isRemoving"].includes(status)
                      ? () => onUnregisterDomain(url)
                      : () => onRegisterDomain()
                  }
                  sx={{ borderStyle: "dashed" }}
                />
              </Grid>
            );
          })}
        </Grid>
        <Grid container spacing={1} sx={{ mt: 1 }}>
          {urls.map(({ url, report }) => {
            if (report === undefined) {
              return null;
            }
            return (
              <Grid key={url} item xs={12}>
                <Collapse in={report.isOpen} appear>
                  {report.action === "add" && report.status === "success" && (
                    <AddSuccessfulReport
                      url={url}
                      onClose={() => onCloseReport(url)}
                    />
                  )}
                  {report.action === "add" && report.status === "error" && (
                    <AddFailureReport
                      url={url}
                      onClose={() => onCloseReport(url)}
                      message={report.message}
                    />
                  )}
                  {report.action === "remove" &&
                    report.status === "success" && (
                      <RemoveSuccessfulReport
                        url={url}
                        onClose={() => onCloseReport(url)}
                      />
                    )}
                  {report.action === "remove" && report.status === "error" && (
                    <RemoveFailureReport
                      url={url}
                      onClose={() => onCloseReport(url)}
                      message={report.message}
                    />
                  )}
                </Collapse>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
}

export default ConfigureDomains;

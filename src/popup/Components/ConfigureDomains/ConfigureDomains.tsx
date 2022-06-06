import * as React from "react";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import AddCircleIcon from "@mui/icons-material/AddCircle";

import type { ConfigureDomainsProps } from "./types";

function ConfigureDomains({
  urls,
  onUnregisterDomain,
  onRegisterDomain,
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
          {urls.map(({ url, status }) => (
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
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}

export default ConfigureDomains;

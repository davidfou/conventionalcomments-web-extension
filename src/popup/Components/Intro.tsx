import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";

import { reportFeature, reportBug } from "./helpers";

const openLink = (url: string) => () => {
  window.open(url);
  window.close();
};

/* eslint-disable jsx-a11y/anchor-is-valid */
function Intro() {
  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography color="text.secondary" sx={{ pb: 2 }}>
          Comments that are easy to{" "}
          <Link
            href="#"
            onClick={openLink(
              "https://en.wikipedia.org/wiki/Grok#In_computer_programmer_culture"
            )}
          >
            grok
          </Link>{" "}
          and{" "}
          <Link
            href="#"
            onClick={openLink("https://en.wikipedia.org/wiki/Grep")}
          >
            grep
          </Link>
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            Preformat comments on GitLab and GitHub by respecting{" "}
            <Link
              href="#"
              onClick={openLink("https://conventionalcomments.org/")}
            >
              conventional: comments
            </Link>
            . This extension is under development. Feedback is welcome and would
            help its development.
          </Grid>
          <Grid item xs={12} textAlign="right">
            <Button
              variant="outlined"
              startIcon={<BugReportOutlinedIcon />}
              onClick={reportBug}
              color="error"
              size="small"
            >
              Report a bug
            </Button>{" "}
            <Button
              variant="outlined"
              startIcon={<RateReviewOutlinedIcon />}
              onClick={reportFeature}
              color="primary"
              size="small"
            >
              Feedback
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default Intro;

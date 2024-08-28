const reportBug = () => {
  window.open(
    "https://github.com/davidfou/conventionalcomments-web-extension/issues/new?template=bug_report.md",
    "_blank"
  );
  window.close();
};

const reportFeature = () => {
  window.open(
    "https://github.com/davidfou/conventionalcomments-web-extension/issues/new?template=feature_request.md",
    "_blank"
  );
  window.close();
};

export { reportBug, reportFeature };

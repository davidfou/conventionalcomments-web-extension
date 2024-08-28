const reportBug = () => {
  window.open(
    "https://github.com/davidfou/conventionalcomments-web-extension/issues/new?assignees=&labels=bug&projects=&template=bug_report.md&title=",
    "_blank"
  );
  window.close();
};

const reportFeature = () => {
  window.open(
    "https://github.com/davidfou/conventionalcomments-web-extension/issues/new?assignees=&labels=enhancement&projects=&template=feature_request.md&title=",
    "_blank"
  );
  window.close();
};

export { reportBug, reportFeature };

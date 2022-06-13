const reportBug = () => {
  window.open(
    "https://gitlab.com/davidfou/conventionalcomments-web-extension/-/issues/new?issuable_template=Bug",
    "_blank"
  );
  window.close();
};

const reportFeature = () => {
  window.open(
    "https://gitlab.com/davidfou/conventionalcomments-web-extension/-/issues/new?issuable_template=Feature",
    "_blank"
  );
  window.close();
};

export { reportBug, reportFeature };

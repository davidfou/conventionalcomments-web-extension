import poly from "webextension-polyfill";

const registerContentScript = (url: string) =>
  poly.contentScripts.register({
    matches: [url],
    js: [{ file: "/build/contentScript.js" }],
    css: [{ file: "/build/contentScript.css" }],
  });

export default registerContentScript;

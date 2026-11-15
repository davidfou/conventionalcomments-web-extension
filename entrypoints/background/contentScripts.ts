import { browser, type PublicPath } from "wxt/browser";
import getRandomId from "~/lib/getRandomId";
import logger from "./logger";

const CONTENT_SCRIPT: PublicPath = "/content-scripts/content.js";
const CONTENT_CSS = "/content-scripts/content.css";

type ContentScriptRegistration = { id: string; url: string };

async function registerContentScripts(
  urls: readonly string[],
): Promise<ContentScriptRegistration[]> {
  logger("Register %d scripts: %o", urls.length, urls);
  const registrations = urls.map((url) => ({ id: getRandomId(), url }));
  if (registrations.length === 0) {
    return registrations;
  }
  await browser.scripting.registerContentScripts(
    registrations.map(({ id, url }) => ({
      id,
      matches: [url],
      js: [CONTENT_SCRIPT],
      css: [CONTENT_CSS],
    })),
  );
  logger("Scripts registered");
  return registrations;
}

export { CONTENT_SCRIPT, CONTENT_CSS, registerContentScripts };
export type { ContentScriptRegistration };

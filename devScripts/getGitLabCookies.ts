import timers from "node:timers/promises";
import fs from "node:fs/promises";
import path from "node:path";
import CDP from "chrome-remote-interface";
import { authenticator } from "otplib";
import * as ChromeLauncher from "chrome-launcher";

function getEnvValue(key: string): string {
  const envKey = `E2E_GITLAB_V1_${key}`;
  const value = process.env[envKey];
  if (value === undefined || value === "") {
    throw new Error(`Environment variable ${envKey} is not set`);
  }
  return value;
}

async function click(client: CDP.Client, nodeId: number): Promise<void> {
  const box = await client.DOM.getBoxModel({ nodeId });
  const coordinates = {
    x: box.model.content[0],
    y: box.model.content[1],
  };
  await client.Input.dispatchMouseEvent({
    type: "mousePressed",
    button: "left",
    clickCount: 1,
    ...coordinates,
  });
  await timers.setTimeout(100);
  await client.Input.dispatchMouseEvent({
    type: "mouseReleased",
    button: "left",
    ...coordinates,
  });
}

async function acceptCookies(client: CDP.Client): Promise<boolean> {
  console.log("Running acceptCookies...");
  await timers.setTimeout(2000); // allow some time for the cookies to appear
  const { root } = await client.DOM.getDocument();
  let selector = await client.DOM.querySelector({
    nodeId: root.nodeId,
    selector: "#onetrust-accept-btn-handler",
  });
  if (selector.nodeId === 0) {
    console.log("skipped - no accept button found\n");
    return false;
  }
  await timers.setTimeout(2000); // wait for animation
  selector = await client.DOM.querySelector({
    nodeId: root.nodeId,
    selector: "#onetrust-accept-btn-handler",
  });
  await click(client, selector.nodeId);
  console.log("Passed!\n");
  return true;
}

async function doSignin(client: CDP.Client): Promise<boolean> {
  console.log("Running doSignin...");
  const { root } = await client.DOM.getDocument();
  const selectors = await Promise.all(
    [
      "#user_login",
      "#user_password",
      "#user_remember_me",
      "*[data-testid='sign-in-button']",
    ].map((selector) =>
      client.DOM.querySelector({ nodeId: root.nodeId, selector }),
    ),
  );
  if (selectors.some(({ nodeId }) => nodeId === 0)) {
    console.log("skipped - some selectors not found\n");
    return false;
  }

  const buttonBox = await client.DOM.getBoxModel({
    nodeId: selectors[3].nodeId,
  });
  const nodeAtButtonLocation = await client.DOM.getNodeForLocation({
    x: Math.ceil(buttonBox.model.content[0]),
    y: Math.ceil(buttonBox.model.content[1]),
  });
  if (nodeAtButtonLocation.nodeId !== selectors[3].nodeId) {
    console.log("skipped - button not visible\n");
    return false;
  }

  await client.DOM.setAttributeValue({
    nodeId: selectors[0].nodeId,
    name: "value",
    value: getEnvValue("USERNAME"),
  });
  await client.DOM.setAttributeValue({
    nodeId: selectors[1].nodeId,
    name: "value",
    value: getEnvValue("PASSWORD"),
  });
  await client.DOM.setAttributeValue({
    nodeId: selectors[2].nodeId,
    name: "checked",
    value: "true",
  });
  await click(client, selectors[3].nodeId);
  await client.Page.loadEventFired();
  console.log("Passed!\n");
  return true;
}

async function doTwoFactorAuthentication(client: CDP.Client): Promise<boolean> {
  console.log("Running doTwoFactorAuthentication...");
  const { root } = await client.DOM.getDocument();
  const selectors = await Promise.all([
    client.DOM.querySelector({
      nodeId: root.nodeId,
      selector: "#user_otp_attempt",
    }),
    client.DOM.querySelector({
      nodeId: root.nodeId,
      selector: "*[data-testid='verify-code-button']",
    }),
  ]);
  if (selectors.some(({ nodeId }) => nodeId === 0)) {
    console.log("skipped - some selectors not found\n");
    return false;
  }
  await client.DOM.setAttributeValue({
    nodeId: selectors[0].nodeId,
    name: "value",
    value: authenticator.generate(getEnvValue("TWO_FACTOR_SECRET")),
  });
  await click(client, selectors[1].nodeId);
  await client.Page.loadEventFired();
  console.log("Passed!\n");
  return true;
}

async function isOnExpectedPage(client: CDP.Client): Promise<boolean> {
  const { targetInfos } = await client.Target.getTargets();
  return targetInfos.some(
    (target) => target.type === "page" && target.url === "https://gitlab.com/",
  );
}

let client;
let chrome;

try {
  chrome = await ChromeLauncher.launch();
  // await waitOn({ resources: ["tcp:9222"] });
  client = await CDP({ port: chrome.port });
  const { Network, Page } = client;
  await Page.enable();
  await Network.clearBrowserCache();
  await Network.clearBrowserCookies();
  await Page.navigate({
    url: "https://gitlab.com/users/sign_in",
  });
  await Page.loadEventFired();

  let isDone = false;
  let didAcceptCookies = false;
  let didSignin = false;
  let didTwoFactorAuthentication = false;
  while (!isDone) {
    if (!didAcceptCookies) {
      didAcceptCookies = await acceptCookies(client).catch(() => {
        console.log("something went wrong!\n");
        return false;
      });
    }
    if (!didSignin) {
      didSignin = await doSignin(client).catch(() => {
        console.log("something went wrong!\n");
        return false;
      });
    }
    if (!didTwoFactorAuthentication) {
      didTwoFactorAuthentication = await doTwoFactorAuthentication(
        client,
      ).catch(() => {
        console.log("something went wrong!\n");
        return false;
      });
    }
    isDone = await isOnExpectedPage(client);
    await timers.setTimeout(1000);
  }

  const { cookies } = await Network.getCookies();
  await fs.writeFile(
    path.join(
      import.meta.dirname,
      "../tests/e2e/playwright/.auth/user-gitlab-v1.json",
    ),
    JSON.stringify({ cookies }, null, 2),
  );
} catch (error) {
  process.exitCode = 1;
  console.error(error);
} finally {
  await client?.close();
  chrome?.kill();
}

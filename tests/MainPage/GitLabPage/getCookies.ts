import timers from "node:timers/promises";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import config from "config";
import CDP from "chrome-remote-interface";
import waitOn from "wait-on";
import { authenticator } from "otplib";

function log(message: string) {
  if (!config.get<boolean>("playwright.debugGitLabGetCookies")) {
    return;
  }
  console.log(message); // eslint-disable-line no-console
}

async function click(client: CDP.Client, nodeId: number) {
  const box = await client.DOM.getBoxModel({ nodeId });
  log(JSON.stringify(box.model));
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

async function acceptCookies(client: CDP.Client) {
  log("Running acceptCookies...");
  await timers.setTimeout(2000); // allow some time for the cookies to appear
  const { root } = await client.DOM.getDocument();
  let selector = await client.DOM.querySelector({
    nodeId: root.nodeId,
    selector: "#onetrust-accept-btn-handler",
  });
  if (selector.nodeId === 0) {
    log("skipped - no accept button found\n");
    return false;
  }
  await timers.setTimeout(2000); // wait for animation
  selector = await client.DOM.querySelector({
    nodeId: root.nodeId,
    selector: "#onetrust-accept-btn-handler",
  });
  await click(client, selector.nodeId);
  log("Passed!\n");
  return true;
}

async function doSignin(client: CDP.Client) {
  log("Running doSignin...");
  const { root } = await client.DOM.getDocument();
  const selectors = await Promise.all([
    client.DOM.querySelector({
      nodeId: root.nodeId,
      selector: "#user_login",
    }),
    client.DOM.querySelector({
      nodeId: root.nodeId,
      selector: "#user_password",
    }),
    client.DOM.querySelector({
      nodeId: root.nodeId,
      selector: "#user_remember_me",
    }),
    client.DOM.querySelector({
      nodeId: root.nodeId,
      selector: "*[data-testid='sign-in-button']",
    }),
  ]);
  if (selectors.some(({ nodeId }) => nodeId === 0)) {
    log("skipped - some selectors not found\n");
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
    log("skipped - button not visible\n");
    return false;
  }

  await client.DOM.setAttributeValue({
    nodeId: selectors[0].nodeId,
    name: "value",
    value: config.get("e2e.gitlab.username"),
  });
  await client.DOM.setAttributeValue({
    nodeId: selectors[1].nodeId,
    name: "value",
    value: config.get("e2e.gitlab.password"),
  });
  await client.DOM.setAttributeValue({
    nodeId: selectors[2].nodeId,
    name: "checked",
    value: "true",
  });
  await click(client, selectors[3].nodeId);
  await client.Page.loadEventFired();
  log("Passed!\n");
  return true;
}

async function doTwoFactorAuthentication(client: CDP.Client) {
  log("Running doTwoFactorAuthentication...");
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
    log("skipped - some selectors not found\n");
    return false;
  }
  await client.DOM.setAttributeValue({
    nodeId: selectors[0].nodeId,
    name: "value",
    value: authenticator.generate(config.get("e2e.gitlab.twoFactorSecret")),
  });
  await click(client, selectors[1].nodeId);
  await client.Page.loadEventFired();
  log("Passed!\n");
  return true;
}

async function isOnExpectedPage(client: CDP.Client) {
  const { targetInfos } = await client.Target.getTargets();
  return targetInfos.some(
    (target) => target.type === "page" && target.url === "https://gitlab.com/"
  );
}

function takeScreenshots(client: CDP.Client): () => void {
  if (!config.get<boolean>("playwright.debugGitLabGetCookies")) {
    return () => {};
  }
  let count = 0;
  const interval = setInterval(async () => {
    count += 1;
    try {
      const screenshotName = `screenshot-${count}.png`;
      const { data } = await client.Page.captureScreenshot();
      await fs
        .writeFile(
          path.join(__dirname, `../../../playwright-videos/${screenshotName}`),
          Buffer.from(data, "base64")
        )
        .catch(() => {});
    } catch (error) {
      // noop
    }
  }, 1000);
  return () => {
    clearInterval(interval);
  };
}

async function getCookies() {
  let client;
  let process;
  let teardown = () => {};

  try {
    process = spawn(config.get("playwright.googleBin"), [
      "--remote-debugging-port=9222",
    ]);
    await waitOn({ resources: ["tcp:9222"] });
    client = await CDP();
    const { Network, Page } = client;
    await Page.enable();
    await Network.clearBrowserCache();
    await Network.clearBrowserCookies();
    await Page.navigate({
      url: "https://gitlab.com/users/sign_in",
    });
    teardown = takeScreenshots(client);
    await Page.loadEventFired();

    let isDone = false;
    let didAcceptCookies = false;
    let didSignin = false;
    let didTwoFactorAuthentication = false;
    while (!isDone) {
      if (!didAcceptCookies) {
        didAcceptCookies = await acceptCookies(client).catch(() => {
          log("something went wrong!\n");
          return false;
        });
      }
      if (!didSignin) {
        didSignin = await doSignin(client).catch(() => {
          log("something went wrong!\n");
          return false;
        });
      }
      if (!didTwoFactorAuthentication) {
        didTwoFactorAuthentication = await doTwoFactorAuthentication(
          client
        ).catch(() => {
          log("something went wrong!\n");
          return false;
        });
      }
      isDone = await isOnExpectedPage(client);
      await timers.setTimeout(1000);
    }

    const { cookies } = await Network.getCookies();

    return cookies;
  } finally {
    teardown();
    process?.kill();
    await client?.close();
  }
}

export default getCookies;

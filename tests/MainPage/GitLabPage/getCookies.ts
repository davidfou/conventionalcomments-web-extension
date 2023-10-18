import timers from "node:timers/promises";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import config from "config";
import CDP from "chrome-remote-interface";
import waitOn from "wait-on";
import { authenticator } from "otplib";

async function click(client: CDP.Client, nodeId: number) {
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

async function passHumanCheck(parentClient: CDP.Client) {
  const { targetInfos } = await parentClient.Target.getTargets().catch(() => ({
    targetInfos: [],
  }));
  const iframeContext = targetInfos.find(
    (target) =>
      target.type === "iframe" &&
      target.url.startsWith("https://challenges.cloudflare.com")
  );
  if (iframeContext === undefined) {
    return false;
  }
  let client;
  try {
    client = await CDP({ target: iframeContext.targetId });
    const { root } = await client.DOM.getDocument();
    let selector = await client.DOM.querySelector({
      nodeId: root.nodeId,
      selector: "input[type='checkbox']",
    });
    if (selector.nodeId === 0) {
      return false;
    }
    await timers.setTimeout(2000);
    selector = await client.DOM.querySelector({
      nodeId: root.nodeId,
      selector: "input[type='checkbox']",
    });
    if (selector.nodeId === 0) {
      return false;
    }
    await click(client, selector.nodeId);
    await parentClient.Page.loadEventFired();
    return true;
  } finally {
    await client?.close();
  }
}

async function acceptCookies(client: CDP.Client) {
  const { root } = await client.DOM.getDocument();
  let selector = await client.DOM.querySelector({
    nodeId: root.nodeId,
    selector: "#onetrust-accept-btn-handler",
  });
  if (selector.nodeId === 0) {
    return false;
  }
  await timers.setTimeout(2000); // wait for animation
  selector = await client.DOM.querySelector({
    nodeId: root.nodeId,
    selector: "#onetrust-accept-btn-handler",
  });
  await click(client, selector.nodeId);
  return true;
}

async function doSignin(client: CDP.Client) {
  const { root } = await client.DOM.getDocument();
  const selectors = await Promise.all([
    client.DOM.querySelector({
      nodeId: root.nodeId,
      selector: "*[data-qa-selector='login_field']",
    }),
    client.DOM.querySelector({
      nodeId: root.nodeId,
      selector: "*[data-qa-selector='password_field']",
    }),
    client.DOM.querySelector({
      nodeId: root.nodeId,
      selector: "#user_remember_me",
    }),
    client.DOM.querySelector({
      nodeId: root.nodeId,
      selector: "*[data-qa-selector='sign_in_button']",
    }),
  ]);
  if (selectors.some(({ nodeId }) => nodeId === 0)) {
    return false;
  }
  await client.DOM.setAttributeValue({
    nodeId: selectors[0].nodeId,
    name: "value",
    value: config.get("codeceptjs.gitlab.username"),
  });
  await client.DOM.setAttributeValue({
    nodeId: selectors[1].nodeId,
    name: "value",
    value: config.get("codeceptjs.gitlab.password"),
  });
  await client.DOM.setAttributeValue({
    nodeId: selectors[2].nodeId,
    name: "checked",
    value: "true",
  });
  await click(client, selectors[3].nodeId);
  await client.Page.loadEventFired();
  return true;
}

async function doTwoFactorAuthentication(client: CDP.Client) {
  const { root } = await client.DOM.getDocument();
  const selectors = await Promise.all([
    client.DOM.querySelector({
      nodeId: root.nodeId,
      selector: "*[data-qa-selector='two_fa_code_field']",
    }),
    client.DOM.querySelector({
      nodeId: root.nodeId,
      selector: "*[data-qa-selector='verify_code_button']",
    }),
  ]);
  if (selectors.some(({ nodeId }) => nodeId === 0)) {
    return false;
  }
  await client.DOM.setAttributeValue({
    nodeId: selectors[0].nodeId,
    name: "value",
    value: authenticator.generate(
      config.get("codeceptjs.gitlab.twoFactorSecret")
    ),
  });
  await click(client, selectors[1].nodeId);
  await client.Page.loadEventFired();
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
    let passedHumanCheck = false;
    let didAcceptCookies = false;
    let didSignin = false;
    let didTwoFactorAuthentication = false;
    /* eslint-disable no-await-in-loop */
    while (!isDone) {
      if (!passedHumanCheck) {
        passedHumanCheck = await passHumanCheck(client).catch(() => false);
      }
      if (!didAcceptCookies) {
        didAcceptCookies = await acceptCookies(client).catch(() => false);
      }
      if (!didSignin) {
        didSignin = await doSignin(client).catch(() => false);
      }
      if (!didTwoFactorAuthentication) {
        didTwoFactorAuthentication = await doTwoFactorAuthentication(
          client
        ).catch(() => false);
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

import timers from "node:timers/promises";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import config from "config";
import CDP from "chrome-remote-interface";
import waitOn from "wait-on";
import { authenticator } from "otplib";

async function click(client, nodeId) {
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

async function passHumanCheck(parentClient) {
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

async function acceptCookies(client) {
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

async function doSignin(client) {
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

async function doTwoFactorAuthentication(client) {
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

async function isOnExpectedPage(client) {
  const { targetInfos } = await client.Target.getTargets();
  console.log(targetInfos);
  return targetInfos.some(
    (target) => target.type === "page" && target.url === "https://gitlab.com/"
  );
}

async function getCookies() {
  let client;
  let process;

  try {
    console.log("- start chrome");
    process = spawn(config.get("playwright.googleBin"), [
      "--remote-debugging-port=9222",
    ]);
    console.log("- wait for port 9222");
    await waitOn({ resources: ["tcp:9222"] });
    console.log("- create client");
    client = await CDP();
    const { Network, Page } = client;
    console.log("- setup");
    await Page.enable();
    await Network.clearBrowserCache();
    await Network.clearBrowserCookies();
    console.log("- navigate");
    await Page.navigate({
      url: "https://gitlab.com/users/sign_in",
    });
    await Page.loadEventFired();
    let count = 0;
    const interval = setInterval(async () => {
      count += 1;
      try {
        console.log(`- take screenshot ${count}`);
        const screenshotName = `screenshot-${count}.png`;
        const { data } = await Page.captureScreenshot().catch(() => {
          console.log("failed to take screenshot");
        });
        await fs
          .writeFile(
            path.join(
              __dirname,
              `../../../playwright-videos/${screenshotName}`
            ),
            Buffer.from(data, "base64")
          )
          .catch(() => {
            console.log("failed to write screenshot");
          });
        console.log(`- took screenshot ${count}`);
      } catch (error) {}
    }, 1000);
    console.log("- wait....");

    let isDone = false;
    let passedHumanCheck = false;
    let didAcceptCookies = false;
    let didSignin = false;
    let didTwoFactorAuthentication = false;
    let secondCount = 0;
    while (!isDone) {
      secondCount += 1;
      console.log(`- try ${secondCount}`);
      if (!passedHumanCheck) {
        console.log("- pass human check...");
        passedHumanCheck = await passHumanCheck(client).catch(() => false);
        console.log(`${passedHumanCheck}`);
      }
      if (!didAcceptCookies) {
        console.log("- accept cookies...");
        didAcceptCookies = await acceptCookies(client).catch(() => false);
        console.log(`${didAcceptCookies}`);
      }
      if (!didSignin) {
        console.log("- sign in...");
        didSignin = await doSignin(client).catch(() => false);
        console.log(`${didSignin}`);
      }
      if (!didTwoFactorAuthentication) {
        console.log("- two factor authentication...");
        didTwoFactorAuthentication = await doTwoFactorAuthentication(
          client
        ).catch(() => false);
        console.log(`${didTwoFactorAuthentication}`);
      }
      isDone = await isOnExpectedPage(client);
      await timers.setTimeout(1000);
    }

    clearInterval(interval);
    const { cookies } = await Network.getCookies();
    console.log(cookies);

    return cookies;
  } finally {
    process?.kill();
    await client?.close();
  }
}

export default getCookies;

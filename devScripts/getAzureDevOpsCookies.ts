import timers from "node:timers/promises";
import fs from "node:fs/promises";
import path from "node:path";
import CDP from "chrome-remote-interface";
import { authenticator } from "otplib";
import * as ChromeLauncher from "chrome-launcher";

const version = "v1";

function getEnvValue(key: string): string {
  const envKey = `E2E_AZURE_DEVOPS_${version.toUpperCase()}_${key}`;
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

async function typeInto(
  client: CDP.Client,
  nodeId: number,
  text: string,
): Promise<void> {
  await client.DOM.focus({ nodeId });
  await client.Input.insertText({ text });
}

async function setField(
  name: string,
  fieldId: string,
  value: string,
  client: CDP.Client,
): Promise<boolean> {
  console.log(`Running setField for ${name}...`);
  const { root } = await client.DOM.getDocument();
  const selectors = await Promise.all(
    [`#${fieldId}`, "*[data-testid='primaryButton']"].map((selector) =>
      client.DOM.querySelector({ nodeId: root.nodeId, selector }),
    ),
  );
  if (selectors.some(({ nodeId }) => nodeId === 0)) {
    console.log("skipped - some selectors not found\n");
    return false;
  }

  const buttonBox = await client.DOM.getBoxModel({
    nodeId: selectors[1].nodeId,
  });
  const nodeAtButtonLocation = await client.DOM.getNodeForLocation({
    x: Math.ceil(buttonBox.model.content[0]),
    y: Math.ceil(buttonBox.model.content[1]),
  });
  if (nodeAtButtonLocation.nodeId !== selectors[1].nodeId) {
    console.log("skipped - button not visible\n");
    return false;
  }

  await typeInto(client, selectors[0].nodeId, value);
  await click(client, selectors[1].nodeId);
  console.log("Passed!\n");
  return true;
}

async function confirmSignIn(client: CDP.Client): Promise<boolean> {
  console.log("Runnning confirmSignIn...");
  const { root } = await client.DOM.getDocument();
  const selectors = await Promise.all(
    ["*[data-testid='title']", "*[data-testid='primaryButton']"].map(
      (selector) => client.DOM.querySelector({ nodeId: root.nodeId, selector }),
    ),
  );
  if (selectors.some(({ nodeId }) => nodeId === 0)) {
    console.log("skipped - some selectors not found\n");
    return false;
  }

  const buttonBox = await client.DOM.getBoxModel({
    nodeId: selectors[1].nodeId,
  });
  const nodeAtButtonLocation = await client.DOM.getNodeForLocation({
    x: Math.ceil(buttonBox.model.content[0]),
    y: Math.ceil(buttonBox.model.content[1]),
  });
  if (nodeAtButtonLocation.nodeId !== selectors[1].nodeId) {
    console.log("skipped - button not visible\n");
    return false;
  }

  const title = await client.DOM.getOuterHTML({ nodeId: selectors[0].nodeId });
  if (!title.outerHTML.includes("Stay signed in?")) {
    console.log("skipped - not on the right page\n");
    return false;
  }

  await click(client, selectors[1].nodeId);
  console.log("Passed!\n");
  return true;
}

async function isOnExpectedPage(client: CDP.Client): Promise<boolean> {
  const { targetInfos } = await client.Target.getTargets();
  return targetInfos.some(
    (target) =>
      target.type === "page" &&
      target.url.startsWith("https://account.microsoft.com/"),
  );
}

let client;
let chrome;

try {
  chrome = await ChromeLauncher.launch();
  client = await CDP({ port: chrome.port });
  const { Network, Page } = client;
  await Page.enable();
  await Network.clearBrowserCache();
  await Network.clearBrowserCookies();
  await Page.navigate({ url: "https://login.live.com" });
  await Page.loadEventFired();

  let isDone = false;
  let isEmailSet = false;
  let isPasswordSet = false;
  let isCodeSet = false;
  let isConfirmed = false;
  while (!isDone) {
    if (!isEmailSet) {
      isEmailSet = await setField(
        "email",
        "usernameEntry",
        getEnvValue("USERNAME"),
        client,
      ).catch(() => {
        console.log("something went wrong!\n");
        return false;
      });
    }
    if (!isPasswordSet) {
      isPasswordSet = await setField(
        "password",
        "passwordEntry",
        getEnvValue("PASSWORD"),
        client,
      ).catch(() => {
        console.log("something went wrong!\n");
        return false;
      });
    }
    if (!isCodeSet) {
      const code = authenticator.generate(getEnvValue("TWO_FACTOR_SECRET"));
      isCodeSet = await setField(
        "code",
        "floatingLabelInput5",
        code,
        client,
      ).catch(() => {
        console.log("something went wrong!\n");
        return false;
      });
    }

    if (!isConfirmed) {
      isConfirmed = await confirmSignIn(client).catch((error) => {
        console.error(error);
        console.log("something went wrong!\n");
        return false;
      });
    }
    isDone = await isOnExpectedPage(client);
    await timers.setTimeout(1000);
  }

  const { cookies } = await Network.getAllCookies();
  await fs.writeFile(
    path.join(
      import.meta.dirname,
      `../tests/e2e/playwright/.auth/user-azure-devops-${version}.json`,
    ),
    JSON.stringify({ cookies }, null, 2),
  );
} catch (error) {
  process.exitCode = 1;
  console.error(error);
} finally {
  await Promise.allSettled([client?.Browser.close(), client?.close()]);
  chrome?.kill();
}

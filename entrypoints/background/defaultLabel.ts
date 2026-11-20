import invariant from "tiny-invariant";
import { storage } from "#imports";

const KEY = "local:defaultLabel" as const;

async function getDefaultLabel(): Promise<string> {
  const label = await storage.getItem<string>(KEY);
  invariant(label !== null, "defaultLabel should never be null");
  return label;
}

async function setDefaultLabel(label: string): Promise<void> {
  await storage.setItem(KEY, label);
}

export { getDefaultLabel, setDefaultLabel };

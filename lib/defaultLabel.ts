import { storage } from "#imports";
import {
  DEFAULT_LABEL,
  LABELS,
  type Label,
} from "~/entrypoints/content/constants";

const defaultLabelItem = storage.defineItem<string>("local:defaultLabel", {
  fallback: DEFAULT_LABEL,
});

function isKnownLabel(label: string): label is Label {
  return LABELS.some((item) => item.label === label);
}

async function getDefaultLabel(): Promise<Label> {
  const label = await defaultLabelItem.getValue();
  return isKnownLabel(label) ? label : DEFAULT_LABEL;
}

async function setDefaultLabel(label: Label): Promise<void> {
  await defaultLabelItem.setValue(label);
}

function watchDefaultLabel(callback: (label: Label) => void): () => void {
  return defaultLabelItem.watch((label) => {
    callback(isKnownLabel(label) ? label : DEFAULT_LABEL);
  });
}

export { getDefaultLabel, setDefaultLabel, watchDefaultLabel };

import { useCallback, useEffect, useState } from "react";
import type { DefaultLabelState } from "~/components/custom/PopupDefaultLabel";
import { DEFAULT_LABEL, type Label } from "~/entrypoints/content/constants";
import { getDefaultLabel, setDefaultLabel } from "~/lib/defaultLabel";

export default function useDefaultLabel(): [
  DefaultLabelState,
  (label: Label) => Promise<void>,
] {
  const [defaultLabelState, setDefaultLabelState] = useState<DefaultLabelState>(
    { label: DEFAULT_LABEL, status: "loading", error: null },
  );

  useEffect(() => {
    getDefaultLabel()
      .then((label) =>
        setDefaultLabelState({ label, status: "loaded", error: null }),
      )
      .catch(() =>
        setDefaultLabelState({
          label: DEFAULT_LABEL,
          status: "loaded",
          error:
            "Something went wrong when retrieving the default label. Please, report a bug if the problem persists.",
        }),
      );
  }, []);

  const previousLabel = defaultLabelState.label;
  const onDefaultLabelChange = useCallback(
    async (label: Label): Promise<void> => {
      setDefaultLabelState({ label, status: "loading", error: null });
      try {
        await setDefaultLabel(label);
        setDefaultLabelState({ label, status: "loaded", error: null });
      } catch {
        setDefaultLabelState({
          label: previousLabel,
          status: "loaded",
          error:
            "Something went wrong when saving the default label. Please, report a bug if the problem persists.",
        });
      }
    },
    [previousLabel],
  );

  return [defaultLabelState, onDefaultLabelChange];
}

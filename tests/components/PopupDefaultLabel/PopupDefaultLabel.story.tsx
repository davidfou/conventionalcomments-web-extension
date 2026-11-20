import type { ReactElement } from "react";
import { useCallback, useState } from "react";
import PopupDefaultLabel, {
  type DefaultLabelState,
} from "~/components/custom/PopupDefaultLabel";

const LABELS = ["none", "praise", "question", "todo"];

export function WrappedPopupDefaultLabel(
  defaultLabelState: DefaultLabelState,
): ReactElement {
  const [changes, setChanges] = useState<string[]>([]);
  const onChange = useCallback((label: string): void => {
    setChanges((previous) => [...previous, label]);
  }, []);

  return (
    <>
      <PopupDefaultLabel
        labels={LABELS}
        defaultLabelState={defaultLabelState}
        onChange={onChange}
      />
      <output data-testid="changes">{changes.join(",")}</output>
    </>
  );
}

import type { ReactElement } from "react";
import { useCallback, useState } from "react";
import PopupDefaultLabel, {
  type DefaultLabelState,
} from "~/components/custom/PopupDefaultLabel";
import type { Label } from "~/entrypoints/content/constants";

export function WrappedPopupDefaultLabel(
  defaultLabelState: DefaultLabelState,
): ReactElement {
  const [changes, setChanges] = useState<Label[]>([]);
  const onChange = useCallback((label: Label): void => {
    setChanges((previous) => [...previous, label]);
  }, []);

  return (
    <>
      <PopupDefaultLabel
        defaultLabelState={defaultLabelState}
        onChange={onChange}
      />
      <output data-testid="changes">{changes.join(",")}</output>
    </>
  );
}

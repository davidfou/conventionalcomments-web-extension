import type { ReactElement } from "react";
import { useState, useCallback, useRef } from "react";
import invariant from "tiny-invariant";
import { ComboboxPortalContainerContext } from "~/components/custom/Combobox";
import App from "~/entrypoints/content/App";
import "~/entrypoints/content/global.css";

interface WrappedAppProps {
  isMainComment: boolean;
  defaultTextareaValue: string;
}

export function WrappedApp({
  isMainComment,
  defaultTextareaValue,
}: WrappedAppProps): ReactElement {
  const container = useRef<HTMLElement | null>(null);
  if (container.current === null) {
    container.current = document.querySelector("#root");
    invariant(
      container.current instanceof HTMLElement,
      "Container #root not found",
    );
  }
  const [textarea, setTextarea] = useState<HTMLTextAreaElement | null>(null);
  const handleRef = useCallback((node: HTMLTextAreaElement | null): void => {
    if (node !== null) {
      setTextarea(node);
    }
  }, []);

  return (
    <>
      {textarea !== null && (
        <ComboboxPortalContainerContext.Provider value={container.current}>
          <App
            productType="github-v1"
            isMainComment={isMainComment}
            textarea={textarea}
          />
        </ComboboxPortalContainerContext.Provider>
      )}
      <textarea
        ref={handleRef}
        data-testid="textarea"
        defaultValue={defaultTextareaValue}
        autoFocus
      />
    </>
  );
}

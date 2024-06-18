import { useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";
import App from "../App";

interface WrappedAppProps {
  initialContent: string;
  isMainComment?: boolean;
}

type State =
  | { isReady: false }
  | {
      isReady: true;
      textarea: HTMLTextAreaElement;
    };

function WrappedApp({
  initialContent,
  isMainComment = false,
}: WrappedAppProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  let state: State = { isReady: false };
  if (isMounted) {
    invariant(textareaRef.current, "Textarea ref must be set");
    state = {
      isReady: true,
      textarea: textareaRef.current,
    };
  }

  return (
    <>
      {state.isReady ? (
        <App
          productType="github-v1"
          textarea={state.textarea}
          isMainComment={isMainComment}
        />
      ) : null}
      <textarea
        data-testid="textarea"
        ref={textareaRef}
        defaultValue={initialContent}
      />
    </>
  );
}

export default WrappedApp;

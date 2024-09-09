import { useState, useEffect } from "react";

import ApplicationError from "../../../../ApplicationError";
import getDomainFromUrl from "../../../../helper/getDomainFromUrl";

type State =
  | { status: "isLoading" }
  | { status: "loaded"; value: null | string }
  | { status: "error"; error: string };

const useCurrentUrl = (): State => {
  const [state, setState] = useState<State>({ status: "isLoading" });

  useEffect(() => {
    let isSubscribed = true;
    Promise.resolve()
      .then(async () => {
        const [tab] = await chrome.tabs.query({ active: true });
        if (!isSubscribed) {
          return;
        }
        if (tab === undefined) {
          throw ApplicationError.unexpectedError(
            "Impossible to retrieve the active tab"
          );
        }
        if (tab.url === undefined) {
          throw ApplicationError.unexpectedError("The active tab as no url");
        }

        setState({ status: "loaded", value: getDomainFromUrl(tab.url) });
      })
      .catch((err) => {
        if (!isSubscribed) {
          return;
        }
        if (err instanceof ApplicationError) {
          setState({ status: "error", error: err.message });
        } else {
          setState({ status: "error", error: "An unexpected error occurred" });
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, []);

  return state;
};

export default useCurrentUrl;

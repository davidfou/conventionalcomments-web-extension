import { useState, useEffect } from "react";

import ApplicationError from "../../../../ApplicationError";
import { getRegisteredUrls } from "../../../requests";

type State =
  | { status: "isLoading" }
  | { status: "loaded"; value: string[] }
  | { status: "error"; error: string };

const useRegisteredUrls = (): State => {
  const [state, setState] = useState<State>({ status: "isLoading" });

  useEffect(() => {
    let isSubscribed = true;
    Promise.resolve()
      .then(async () => {
        const { urls } = await getRegisteredUrls();
        if (!isSubscribed) {
          return;
        }
        setState({ status: "loaded", value: urls });
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

export default useRegisteredUrls;

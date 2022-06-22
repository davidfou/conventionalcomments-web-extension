import { useReducer } from "react";

import useCurrentUrl from "./useCurrentUrl";
import useRegisteredUrls from "./useRegisteredUrls";
import ApplicationError from "../../../../ApplicationError";
import { registerUrl, unregisterUrl } from "../../../requests";
import type { ConfigureDomainsProps, UrlStatus } from "../types";

const INITIAL_STATE: Omit<
  ConfigureDomainsProps,
  "onRegisterDomain" | "onUnregisterDomain" | "onCloseReport"
> = {
  isLoading: true,
  urls: [],
};

type Action =
  | { type: "init"; urls: UrlStatus[] }
  | { type: "register" }
  | { type: "register-success" }
  | { type: "register-failure"; error: string }
  | { type: "unregister"; url: string }
  | { type: "unregister-success"; url: string }
  | { type: "unregister-failure"; url: string; error: string }
  | { type: "close-report"; url: string };

const reducer = (
  state: typeof INITIAL_STATE,
  action: Action
): typeof INITIAL_STATE => {
  switch (action.type) {
    case "init":
      return { isLoading: false, urls: action.urls };
    case "register":
      return {
        ...state,
        urls: state.urls.map((url) => {
          if (url.status !== "new") {
            return url;
          }
          return {
            url: url.url,
            status: "isAdding",
          };
        }),
      };
    case "register-success":
      return {
        ...state,
        urls: state.urls.map((url) => {
          if (url.status !== "isAdding") {
            return url;
          }
          return {
            ...url,
            status: "registered",
            report: {
              status: "success",
              action: "add",
              isOpen: true,
            },
          };
        }),
      };
    case "register-failure":
      return {
        ...state,
        urls: state.urls.map((url) => {
          if (url.status !== "isAdding") {
            return url;
          }
          return {
            ...url,
            status: "new",
            report: {
              status: "error",
              action: "add",
              isOpen: true,
              message: action.error,
            },
          };
        }),
      };
    case "unregister":
      return {
        ...state,
        urls: state.urls.map((url) => {
          if (url.status !== "registered" || url.url !== action.url) {
            return url;
          }
          return {
            url: url.url,
            status: "isRemoving",
          };
        }),
      };
    case "unregister-success":
      return {
        ...state,
        urls: state.urls.map((url) => {
          if (url.status !== "isRemoving" || url.url !== action.url) {
            return url;
          }
          return {
            url: url.url,
            status: "removed",
            report: {
              status: "success",
              action: "remove",
              isOpen: true,
            },
          };
        }),
      };
    case "unregister-failure":
      return {
        ...state,
        urls: state.urls.map((url) => {
          if (url.status !== "isRemoving" || url.url !== action.url) {
            return url;
          }
          return {
            url: url.url,
            status: "registered",
            report: {
              status: "error",
              action: "remove",
              isOpen: true,
              message: action.error,
            },
          };
        }),
      };
    case "close-report":
      return {
        ...state,
        urls: state.urls.map((url) => {
          if (url.url !== action.url || url.report === undefined) {
            return url;
          }
          return {
            ...url,
            report: {
              ...url.report,
              isOpen: false,
            },
          };
        }),
      };
    default:
      return state;
  }
};

const useProps = (): ConfigureDomainsProps => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const registeredUrls = useRegisteredUrls();
  const currentUrl = useCurrentUrl();

  if (
    registeredUrls.status === "loaded" &&
    currentUrl.status === "loaded" &&
    state.isLoading
  ) {
    const newDomain: UrlStatus | null =
      currentUrl.value !== null &&
      registeredUrls.value.every((url) => url !== currentUrl.value)
        ? {
            url: currentUrl.value,
            status: "new",
          }
        : null;
    dispatch({
      type: "init",
      urls: [
        ...registeredUrls.value.map(
          (url): UrlStatus => ({
            url,
            status: "registered",
          })
        ),
        ...(newDomain === null ? [] : [newDomain]),
      ],
    });
  }
  return {
    ...state,
    onRegisterDomain: async () => {
      if (state.isLoading) {
        throw ApplicationError.unexpectedError(
          "Impossible to register a domain while loading"
        );
      }
      if (currentUrl.status !== "loaded" || currentUrl.value === null) {
        throw ApplicationError.unexpectedError(
          "Impossible to register a domain on the current page"
        );
      }
      dispatch({ type: "register" });
      await registerUrl(currentUrl.value)
        .then(() => {
          dispatch({ type: "register-success" });
        })
        .catch((err) => {
          if (err instanceof ApplicationError) {
            dispatch({ type: "register-failure", error: err.message });
          } else {
            dispatch({
              type: "register-failure",
              error: "An unexpected error occurred",
            });
          }
        });
    },
    onUnregisterDomain: async (url) => {
      if (state.isLoading) {
        throw ApplicationError.unexpectedError(
          "Impossible to unregister a domain while loading"
        );
      }
      dispatch({ type: "unregister", url });
      await unregisterUrl(url)
        .then(() => {
          dispatch({ type: "unregister-success", url });
        })
        .catch((err) => {
          if (err instanceof ApplicationError) {
            dispatch({ type: "unregister-failure", url, error: err.message });
          } else {
            dispatch({
              type: "unregister-failure",
              url,
              error: "An unexpected error occurred",
            });
          }
        });
    },
    onCloseReport: (url) => {
      dispatch({ type: "close-report", url });
    },
  };
};

export default useProps;

import { ReactElement, useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";
import { browser } from "wxt/browser";
import PopupDomains from "~/components/custom/PopupDomains";
import PopupIntro from "~/components/custom/PopupIntro";
import PopupLayout from "~/components/custom/PopupLayout";
import { sendMessage } from "~/lib/messaging";
import getDomainFromUrl from "./getDomainFromUrl";
import { useCallback } from "#imports";

async function getRegisteredUrls(): Promise<
  { isSuccess: true; urls: string[] } | { isSuccess: false; error: string }
> {
  try {
    const urls = await sendMessage("getRegisteredUrls");
    return { isSuccess: true, urls };
  } catch (error) {
    return {
      isSuccess: false,
      error:
        "Something went wrong when retrieving registered URLs. Please, report a bug if the problem persists.",
    };
  }
}

async function getActiveUrl(): Promise<
  { isSuccess: true; url: string } | { isSuccess: false; error: string }
> {
  try {
    const tabs = await browser.tabs.query({ active: true });
    const tab = tabs.at(0);
    if (tab === undefined) {
      return {
        isSuccess: false,
        error:
          "Impossible to retrieve the active tab. Please, report a bug if the problem persists.",
      };
    }
    const url = tab.url;
    if (url === undefined) {
      return {
        isSuccess: false,
        error:
          "The active tab does not have a URL. Please, report a bug if the problem persists.",
      };
    }
    return { isSuccess: true, url };
  } catch (error) {
    return {
      isSuccess: false,
      error:
        "Something went wrong when retrieving the active tab. Please, report a bug if the problem persists.",
    };
  }
}

type Domain = {
  url: string;
  isAdded: boolean;
  isUpdating: boolean;
};

type DomainsState =
  | { status: "loading" }
  | { status: "error"; error: string }
  | {
      status: "loaded";
      domains: Domain[];
      newDomainResult: null | { isSuccess: boolean; newDomain: Domain };
    };

export default function App(): ReactElement {
  const isMounted = useRef(true);

  const [domainState, setDomainState] = useState<DomainsState>({
    status: "loading",
  });

  useEffect(() => {
    isMounted.current = true;
    Promise.all([getRegisteredUrls(), getActiveUrl()])
      .then(([registeredUrlsResult, activeUrlResult]) => {
        if (!isMounted.current) {
          return;
        }

        if (!registeredUrlsResult.isSuccess) {
          setDomainState({
            status: "error",
            error: registeredUrlsResult.error,
          });
          return;
        }
        if (!activeUrlResult.isSuccess) {
          setDomainState({ status: "error", error: activeUrlResult.error });
          return;
        }

        const currentUrl = getDomainFromUrl(activeUrlResult.url);
        setDomainState({
          status: "loaded",
          domains: [
            ...registeredUrlsResult.urls.map((url) => ({
              url,
              isAdded: true,
              isUpdating: false,
            })),
            ...(currentUrl !== null &&
            !registeredUrlsResult.urls.includes(currentUrl)
              ? [{ url: currentUrl, isAdded: false, isUpdating: false }]
              : []),
          ],
          newDomainResult: null,
        });
        return;
      })
      .catch(() => {
        if (!isMounted.current) {
          return;
        }

        setDomainState({
          status: "error",
          error:
            "Something went wrong when retrieving domains. Please, report a bug if the problem persists.",
        });
      });

    return (): void => {
      isMounted.current = false;
    };
  }, []);

  const onAction = useCallback(async (currentDomain: Domain): Promise<void> => {
    const newDomain: Domain = {
      url: currentDomain.url,
      isAdded: !currentDomain.isAdded,
      isUpdating: false,
    };
    setDomainState((prev) => {
      invariant(prev.status === "loaded");
      return {
        ...prev,

        domains: prev.domains.map((domain) =>
          domain.url === currentDomain.url
            ? { ...domain, isUpdating: true }
            : domain,
        ),
      };
    });
    const action = currentDomain.isAdded ? "unregisterUrl" : "registerUrl";
    try {
      await sendMessage(action, currentDomain.url);
      if (!isMounted.current) {
        return;
      }
      setDomainState((prev) => {
        invariant(prev.status === "loaded");
        return {
          ...prev,
          domains: prev.domains.map((domain) =>
            domain.url === currentDomain.url ? newDomain : domain,
          ),
          newDomainResult: {
            isSuccess: true,
            newDomain,
          },
        };
      });
    } catch (error) {
      setDomainState((prev) => {
        invariant(prev.status === "loaded");
        return {
          ...prev,
          domains: prev.domains.map((domain) =>
            domain.url === currentDomain.url
              ? { ...domain, isUpdating: false }
              : domain,
          ),
          newDomainResult: {
            isSuccess: false,
            newDomain,
          },
        };
      });
    }
  }, []);

  return (
    <PopupLayout>
      <PopupIntro />
      <PopupDomains domainState={domainState} onAction={onAction} />
    </PopupLayout>
  );
}

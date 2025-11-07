import type { ReactElement } from "react";
import { CircleAlert, CircleCheckBig, XCircleIcon } from "lucide-react";
import Badge from "~/components/custom/Badge";

export type Domain = {
  url: string;
  isAdded: boolean;
  isUpdating: boolean;
};

export type DomainState =
  | { status: "loading" }
  | { status: "error"; error: string }
  | {
      status: "loaded";
      domains: Domain[];
      newDomainResult: null | { isSuccess: boolean; newDomain: Domain };
    };

interface NewDomainAlertProps {
  isSuccess: boolean;
  newDomain: Domain;
}

function NewDomainAlert({
  isSuccess,
  newDomain,
}: NewDomainAlertProps): ReactElement {
  if (!isSuccess) {
    return (
      <div className="rounded-md bg-red-50 p-4 mt-3">
        <div className="flex">
          <div className="shrink-0">
            <XCircleIcon aria-hidden="true" className="size-5 text-red-400" />
          </div>
          <div className="ml-3 text-sm text-red-700">
            Something went wrong while{" "}
            {newDomain.isAdded ? "adding" : "removing"} the domain{" "}
            <pre className="inline">{newDomain.url}</pre>. Please, report a bug
            if the problem persists.
          </div>
        </div>
      </div>
    );
  }

  if (newDomain.isAdded) {
    return (
      <div className="rounded-md bg-green-50 p-4 mt-3">
        <div className="flex">
          <div className="shrink-0">
            <CircleCheckBig
              aria-hidden="true"
              className="size-5 text-green-400"
            />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              The extension is registered successfully!
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <p>
                The extension will be loaded automatically for new pages on{" "}
                <pre className="inline">{newDomain.url}</pre>. A reload is
                necessary for pages already on that url.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md bg-blue-50 p-4 mt-3">
      <div className="flex">
        <div className="shrink-0">
          <CircleAlert aria-hidden="true" className="size-5 text-blue-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">
            The extension is unregistered
          </h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>
              The extension will no longer be loaded for pages on{" "}
              <pre className="inline">{newDomain.url}</pre>. Is there a
              particular reason to stop using it? Feedback would be appreciated
              to understand how to improve the extension.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PopupDomainsProps {
  domainState: DomainState;
  onAction: (domain: Domain) => void;
}

export default function PopupDomains({
  domainState,
  onAction,
}: PopupDomainsProps): ReactElement {
  const onDomainAction = (domain: Domain) => (): void => {
    onAction(domain);
  };

  return (
    <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow-sm m-4">
      <div className="px-4 py-5">
        <h3 className="text-base font-semibold text-gray-900">
          Configure domains
        </h3>
      </div>
      <div className="px-4 py-5">
        {domainState.status === "loading" && (
          <div className="flex flex-wrap gap-x-2 gap-y-4">
            <Badge variant="loading">https://github.com/*</Badge>
            <Badge variant="loading">https://gitlab.com/*</Badge>
          </div>
        )}
        {domainState.status === "error" && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="shrink-0">
                <XCircleIcon
                  aria-hidden="true"
                  className="size-5 text-red-400"
                />
              </div>
              <div className="ml-3 text-sm text-red-700">
                {domainState.error}
              </div>
            </div>
          </div>
        )}
        {domainState.status === "loaded" && (
          <>
            <div className="flex flex-wrap gap-x-3 gap-y-2">
              {domainState.domains.map((domain) => (
                <Badge
                  key={domain.url}
                  variant={domain.isAdded ? "primary" : "secondary"}
                  action={domain.isAdded ? "remove" : "add"}
                  onAction={onDomainAction(domain)}
                  disabled={domain.isUpdating}
                >
                  {domain.url}
                </Badge>
              ))}
            </div>
            {domainState.newDomainResult !== null && (
              <NewDomainAlert
                isSuccess={domainState.newDomainResult.isSuccess}
                newDomain={domainState.newDomainResult.newDomain}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

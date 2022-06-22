export type Report = {
  action: "add" | "remove";
  isOpen: boolean;
} & ({ status: "success" } | { status: "error"; message: string });

export type UrlStatus = {
  url: string;
  status: "registered" | "isAdding" | "isRemoving" | "removed" | "new";
  report?: Report;
};

export type ConfigureDomainsProps = {
  urls: UrlStatus[];
  onRegisterDomain: () => void;
  onUnregisterDomain: (url: string) => void;
  onCloseReport: (url: string) => void;
  isLoading: boolean;
};

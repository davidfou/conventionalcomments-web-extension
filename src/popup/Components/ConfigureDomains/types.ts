export type UrlStatus = {
  url: string;
  status: "registered" | "isAdding" | "isRemoving" | "new";
  error?: string;
};

export type ConfigureDomainsProps = {
  urls: UrlStatus[];
  onRegisterDomain: () => void;
  onUnregisterDomain: (url: string) => void;
  isLoading: boolean;
};
